/**
 * Anchor ids for generate-file-inventory.js.
 * GitHub markdown ignores `{#id}` heading attributes, so the inventory emits
 * an explicit `<a id="...">` before each heading (#2321), and paths that
 * slugify the same (e.g. `a-b.js` vs `a_b.js`) get -1, -2 ... suffixes so
 * every link lands on its own file (#551).
 */
export function slugifyPath(filePath) {
    return String(filePath).replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

export function buildAnchorMap(paths) {
    const taken = new Set();
    const anchors = new Map();
    for (const p of paths) {
        if (anchors.has(p)) continue;
        const base = slugifyPath(p);
        let id = base;
        for (let n = 1; taken.has(id); n++) id = `${base}-${n}`;
        taken.add(id);
        anchors.set(p, id);
    }
    return anchors;
}
