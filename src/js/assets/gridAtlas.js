/**
 * gridAtlas.js
 * PixiJS Spritesheet JSON for a uniform grid PNG.
 *
 * Frame index matches SpriteSheetManager: (row * columns) + startFrame,
 * then left to right, top to bottom. The committed LPC atlas
 * `assets/characters/sprites/lpc_grid.atlas.json` is this function applied
 * to LPC_SHEET_GRID / LPC_SHEET_ANIMATIONS (#1841). Regenerate that file
 * when the grid changes; the sprite-registration test fails if they drift.
 */

function frameRect(x, y, w, h) {
    return {
        frame: { x, y, w, h },
        spriteSourceSize: { x: 0, y: 0, w, h },
        sourceSize: { w, h }
    };
}

/**
 * @param {object} config
 * @param {number} [config.frameWidth]
 * @param {number} [config.frameHeight]
 * @param {number} [config.columns]
 * @param {number} [config.rows]
 * @param {object|null} [config.animations] name -> { row?, startFrame?, frameCount }
 * @param {string} [config.image] filename recorded in meta (not fetched; the caller passes the image URL)
 * @returns {object} PixiJS Spritesheet data
 */
export function gridAtlas({
    frameWidth = 64,
    frameHeight = 64,
    columns = 1,
    rows = 1,
    animations = null,
    image = ''
} = {}) {
    const frames = {};
    const anims = {};
    const fw = Number(frameWidth) || 64;
    const fh = Number(frameHeight) || 64;
    const cols = Math.max(1, Number(columns) || 1);
    const rowCount = Math.max(1, Number(rows) || 1);
    const defs = (animations && Object.keys(animations).length > 0) ? animations : null;

    if (defs) {
        for (const [name, def] of Object.entries(defs)) {
            const base = (Number.isInteger(def.row) ? def.row * cols : 0) + (def.startFrame || 0);
            const names = [];
            const count = def.frameCount || 0;
            for (let i = 0; i < count; i++) {
                const frameIndex = base + i;
                const col = frameIndex % cols;
                const row = Math.floor(frameIndex / cols);
                const frameName = `${name}_${i}`;
                frames[frameName] = frameRect(col * fw, row * fh, fw, fh);
                names.push(frameName);
            }
            if (names.length) anims[name] = names;
        }
    } else {
        for (let row = 0; row < rowCount; row++) {
            for (let col = 0; col < cols; col++) {
                frames[`f_${row}_${col}`] = frameRect(col * fw, row * fh, fw, fh);
            }
        }
    }

    return {
        frames,
        animations: anims,
        meta: {
            image,
            format: 'RGBA8888',
            size: { w: cols * fw, h: rowCount * fh },
            scale: 1
        }
    };
}
