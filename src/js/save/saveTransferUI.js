/**
 * Settings export/import of a save slot as JSON (#2714).
 * The file is the same record SaveManager stores (version, metadata, state).
 */

export function downloadSaveJson(saveManager, slotIndex = 0) {
    if (!saveManager || typeof saveManager.exportSaveJSON !== 'function') return false;
    const json = saveManager.exportSaveJSON(slotIndex);
    if (!json) return false;
    try {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `data_science_tycoon_slot_${Number(slotIndex) + 1}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return true;
    } catch (err) {
        console.error('Failed to download save:', err);
        return false;
    }
}

/**
 * Pick a JSON (or legacy base64) file and import it into preferredSlot.
 * Pass gameState so rank, money, and task progress load immediately.
 */
export function promptImportSaveJson(saveManager, { gameState = null, preferredSlot = 0, notify } = {}) {
    if (!saveManager || typeof saveManager.importSave !== 'function') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json,.txt,text/plain';
    input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) return;
        file.text().then((text) => {
            const slot = Number.isInteger(preferredSlot) ? preferredSlot : 0;
            const ok = saveManager.importSave(String(text || '').trim(), gameState, slot);
            if (!ok) notify?.('That file is not a valid save.', 'error');
            else notify?.('Save imported. Rank, money, and task progress were restored.', 'success');
        }).catch(() => notify?.('Could not read that file.', 'error'));
    });
    input.click();
}
