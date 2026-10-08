/**
 * restrict/snap go through interactjs modifiers; dropzone hover keys (#2442)
 */
import { describe, it, expect, vi } from 'vitest';
import realInteract from 'interactjs';
import { InteractionManager } from '../../src/js/interaction/InteractionManager.js';

function fakeLib() {
    let draggableCfg = null;
    let dropCfg = null;
    const lib = () => ({
        draggable: (cfg) => { draggableCfg = cfg; return {}; },
        dropzone: (cfg) => { dropCfg = cfg; return {}; }
    });
    lib.modifiers = {
        restrict: vi.fn(o => ({ kind: 'restrict', o })),
        snap: vi.fn(o => ({ kind: 'snap', o }))
    };
    return { lib, get draggableCfg() { return draggableCfg; }, get dropCfg() { return dropCfg; } };
}

describe('InteractionManager interactjs options', () => {
    it('builds restrict and snap modifiers and keeps inertia per-action', async () => {
        const f = fakeLib();
        const im = new InteractionManager();
        im.interact = f.lib;
        const restrict = { restriction: 'parent' };
        const snap = { targets: [{ x: 0, y: 0 }] };
        await im.makeDraggable('#x', { restrict, snap, inertia: true });
        expect(f.lib.modifiers.restrict).toHaveBeenCalledWith(restrict);
        expect(f.lib.modifiers.snap).toHaveBeenCalledWith(snap);
        expect(f.draggableCfg.modifiers.map(m => m.kind)).toEqual(['restrict', 'snap']);
        expect(f.draggableCfg.inertia).toBe(true);
        expect(f.draggableCfg).not.toHaveProperty('restrict');
        expect(f.draggableCfg).not.toHaveProperty('snap');
    });

    it('passes an empty modifiers list when nothing is requested', async () => {
        const f = fakeLib();
        const im = new InteractionManager();
        im.interact = f.lib;
        await im.makeDraggable('#x');
        expect(f.draggableCfg.modifiers).toEqual([]);
        expect(f.lib.modifiers.restrict).not.toHaveBeenCalled();
    });

    it('uses interactjs dragenter/dragleave keys on dropzones', async () => {
        const f = fakeLib();
        const im = new InteractionManager();
        im.interact = f.lib;
        const enter = () => {}; const leave = () => {}; const drop = () => {};
        await im.makeDropzone('#bin', { onDrop: drop, onDropEnter: enter, onDropLeave: leave });
        expect(f.dropCfg).toEqual({ ondrop: drop, ondragenter: enter, ondragleave: leave });
    });

    it('produces real modifier objects with the installed interactjs', () => {
        const mods = InteractionManager.buildModifiers(realInteract, {
            restrict: { restriction: 'parent' }, snap: { targets: [{ x: 0, y: 0 }] }
        });
        expect(mods).toHaveLength(2);
        mods.forEach(m => expect(typeof m).toBe('object'));
    });
});
