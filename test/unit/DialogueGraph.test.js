import { describe, it, expect, vi } from 'vitest';
import { DialogueTreeBuilder, DialogueTree, DialogueNode, SPECIAL_CHOICE_IDS, RESPONSE_LIBRARY } from '../../src/js/game/dialogue/DialogueTreeSystem.js';
import { CHARACTER_STORIES } from '../../src/js/game/dialogue/DeepCharacterStories.js';

const builder = new DialogueTreeBuilder();
const trees = [];
for (const p of ['friendly', 'professional', 'competitive', 'mysterious', 'grumpy', 'generous', 'something_else']) {
    trees.push([`personality:${p}`, builder.buildTreeForNPC({ id: `npc_${p}`, name: 'N', personality: p }, 0)]);
}
for (const id of Object.keys(CHARACTER_STORIES)) {
    for (const lvl of [0, 50, 100]) {
        trees.push([`${id}@${lvl}`, builder.buildTreeForNPC({ id, name: id, personality: 'friendly' }, lvl)]);
    }
}

describe('dialogue graph integrity', () => {
    it.each(trees)('%s: every choice leads to a real node (#1142 #1143 #1606 #2121 #2348 #2475)', (_, tree) => {
        for (const node of tree.nodes.values()) {
            for (const c of node.choices) {
                if (SPECIAL_CHOICE_IDS.has(c.id)) continue;
                expect(tree.hasNode(c.nextNode || c.id), `${node.id} -> ${c.id}`).toBe(true);
            }
        }
    });

    it.each(trees)('%s: no mid-conversation dead ends (#2123, #1918)', (_, tree) => {
        for (const node of tree.nodes.values()) {
            if (node.id === 'goodbye') continue;
            expect(node.choices.length > 0 || !!node.nextNode, node.id).toBe(true);
        }
    });

    it('compliment and story-reveal follow-ups have real text', () => {
        expect(RESPONSE_LIBRARY.compliment.text).toMatch(/thank/i);
        expect(RESPONSE_LIBRARY.empathize.text.length).toBeGreaterThan(10);
    });

    it('change_topic routes back to root', () => {
        const t = new DialogueTree('x', [
            new DialogueNode({ id: 'root', text: 'hi', choices: [{ id: 'a', text: 'a' }] }),
            new DialogueNode({ id: 'a', text: 'a', choices: [{ id: 'change_topic', text: 'Change topic' }] })
        ]);
        expect(t.nodes.get('a').choices[0].nextNode).toBe('root');
        expect(t.hasNode('change_topic')).toBe(false);
    });

    it('unknown lookups are logged once, not silently masked (#1149)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const t = new DialogueTree('x', [new DialogueNode({ id: 'root', text: 'hi' })]);
        expect(t.getNode('nope').id).toBe('root');
        t.getNode('nope');
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });
});

import { DialogueTreeSystem } from '../../src/js/game/dialogue/DialogueTreeSystem.js';
describe('DialogueTreeSystem cache (#913, #2122)', () => {
    it('caches personality trees once per NPC and stays bounded', () => {
        const sys = new DialogueTreeSystem();
        sys.setNPCManager({ getNPC: id => ({ id, name: id, personality: 'friendly' }) });
        for (let i = 0; i < 50; i++) sys.getTree('plain_npc', i + 0.37);
        expect(sys.treeCache.size).toBe(1);
        for (let i = 0; i < 300; i++) sys.getTree(`npc_${i}`, 0);
        expect(sys.treeCache.size).toBeLessThanOrEqual(DialogueTreeSystem.MAX_CACHE);
    });
});
