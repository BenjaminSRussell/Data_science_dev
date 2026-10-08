#!/usr/bin/env python3
"""Generate NPC dialogue files and CHARACTER_STORIES entries from story_line/*.txt.

The design docs in story_line/ share one markdown layout (Character Profile,
Key Narrative Dialogue, Standard Dialogue Progression, Actions & Gifts). This
turns a doc into:
  * src/js/game/dialogue/npcs/<roster_id>.js  (alex_rivera.js schema)
  * an entry in src/js/game/dialogue/StorylineCharacterStories.js
    (DeepCharacterStories schema), merged into CHARACTER_STORIES.

Usage: python3 scripts/generators/storyline_dialogue.py  (from the repo root)
Re-running it is safe; it overwrites only the generated files.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / 'story_line'
NPC_DIR = ROOT / 'src/js/game/dialogue/npcs'
STORIES_OUT = ROOT / 'src/js/game/dialogue/StorylineCharacterStories.js'

# doc file stem -> NPCManager roster id (only where they differ)
ROSTER_ID = {'tyler_brooks': 'tyler_rival', 'chloe_martinez': 'chloe_competitor'}

# Docs to generate. Characters with hand-written files are left alone.
TARGETS = [
    'agent_smith', 'bella_lux', 'carlos_tech', 'casey_lee', 'chloe_martinez',
    'coach_motivation', 'dr_amara_patel', 'dr_wellness', 'james_wilson', 'judge_roberts',
    'luna_bookstore', 'marcus_thompson', 'maya_engineer', 'noah_artist',
    'priya_sharma', 'rachel_green', 'robert_kim', 'sam_taylor', 'shadow_broker',
    'sophia_zhang', 'taylor_morgan', 'the_broker', 'tyler_brooks',
    'victoria_sterling', 'vinnie_shark', 'zero_cool',
]

STAGES = ['stranger', 'friendly', 'acquaintance', 'friend', 'close_friend']
STAGE_FLOOR = {'stranger': 0, 'friendly': 20, 'acquaintance': 40, 'friend': 60, 'close_friend': 80}
PROFILE = {
    'Background': 'background', 'Motivation': 'motivation', 'Secret': 'secret',
    'Dream': 'dream', 'Fear': 'fear', 'Relationship Status': 'relationship',
    'Turning Point': 'turningPoint', 'Philosophy': 'philosophy',
}


def slug(text):
    return re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')


def quoted(text):
    return re.findall(r'"([^"]+)"', text)


def section(doc, title):
    m = re.search(r'^## ' + re.escape(title) + r'.*?$(.*?)(?=^## |\Z)', doc, re.M | re.S)
    return m.group(1) if m else ''


def parse(doc):
    head = re.search(r'^# (.+?)\s+-\s+(.+)$', doc, re.M)
    out = {
        'name': head.group(1).strip(),
        'title': head.group(2).strip(),
        'personality': (re.search(r'\*\*Personality:\*\*\s*(.+)', doc) or [None, ''])[1].strip(),
        'profile': {},
        'reveals': [],
        'stages': {},
        'actions': {},
    }
    for label, key in PROFILE.items():
        m = re.search(r'^\*\*' + re.escape(label) + r':\*\*\s*(.+)$', doc, re.M)
        if m:
            out['profile'][key] = m.group(1).strip().strip('"')
    for m in re.finditer(r'\*\*Rel > (\d+) \(([^)]+)\):\*\*\s*"(.+)"\s*$', doc, re.M):
        out['reveals'].append({'relationshipLevel': int(m.group(1)), 'topic': slug(m.group(2)),
                               'dialogue': m.group(3).strip()})
    prog = section(doc, 'Standard Dialogue Progression')
    for m in re.finditer(r'^### (.+?)\s*$(.*?)(?=^### |\Z)', prog, re.M | re.S):
        stage = slug(m.group(1))
        body = m.group(2)
        greet = re.search(r'\*Greetings:\*\s*(.+)', body)
        topics = re.search(r'\*Topics:\*\s*(.+)', body)
        out['stages'][stage] = {
            'greeting': quoted(greet.group(1)) if greet else [],
            'topicHints': topics.group(1).strip() if topics else '',
        }
    # lines may carry a trailing note, e.g. "Fascinating. Thank you." (Loves)
    for m in re.finditer(r'^\*\s+\*\*(.+?):\*\*\s*"([^"]+)"', section(doc, 'Actions & Gifts'), re.M):
        label = m.group(1).strip()
        key = 'compliment' if label.lower().startswith('compliment') else 'gift_' + slug(label)
        out['actions'][key] = m.group(2).strip()
    return out


def stage_for_reveal(level):
    """Lowest stage that is never reached before the reveal's threshold."""
    for stage in STAGES:
        if STAGE_FLOOR[stage] >= level:
            return stage
    return 'close_friend'


def dialogue_file(npc_id, data):
    stages = {}
    for stage in STAGES:
        src = data['stages'].get(stage, {})
        stages[stage] = {'greeting': src.get('greeting') or ['Hello.'], 'topics': {}}
        if src.get('topicHints'):
            stages[stage]['topicHints'] = src['topicHints']
    # Reveals stay available once unlocked: every stage whose floor is at or
    # above the reveal threshold can talk about it
    for r in data['reveals']:
        first = STAGES.index(stage_for_reveal(r['relationshipLevel']))
        for stage in STAGES[first:]:
            stages[stage]['topics'][r['topic']] = [r['dialogue']]
    payload = {
        'npcId': npc_id,
        'personality': slug(data['personality'].split(',')[0]) if data['personality'] else 'friendly',
        'stages': stages,
        'breakdowns': {},
        'emotionalTriggers': [],
        'actions': data['actions'],
    }
    body = json.dumps(payload, indent=4, ensure_ascii=False)
    return (f"/**\n * {data['name']} ({data['title']}) dialogue\n"
            f" * Generated from story_line/{data['_doc']}.txt by scripts/generators/storyline_dialogue.py\n */\n\n"
            f"export default {body};\n")


def story_entry(data):
    return {'personalStory': data['profile'], 'storyReveals': data['reveals']}


def main():
    stories = {}
    for stem in TARGETS:
        doc = (DOCS / f'{stem}.txt').read_text(encoding='utf-8')
        data = parse(doc)
        data['_doc'] = stem
        npc_id = ROSTER_ID.get(stem, stem)
        assert len(data['reveals']) == 5 and len(data['profile']) == 8, stem
        assert len(data['actions']) == 3 and all(len(data['stages'].get(st, {}).get('greeting', [])) for st in STAGES), stem
        (NPC_DIR / f'{npc_id}.js').write_text(dialogue_file(npc_id, data), encoding='utf-8')
        stories[npc_id] = story_entry(data)
    STORIES_OUT.write_text(
        "/**\n * Character stories for NPCs whose design docs live in story_line/.\n"
        " * Generated by scripts/generators/storyline_dialogue.py; merged into\n"
        " * CHARACTER_STORIES by DeepCharacterStories.js (hand-written entries win).\n */\n\n"
        f"export const STORYLINE_CHARACTER_STORIES = {json.dumps(stories, indent=4, ensure_ascii=False)};\n",
        encoding='utf-8')
    print(f'generated {len(stories)} characters')


if __name__ == '__main__':
    main()
