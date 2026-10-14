/**
 * Shared dataset catalog (#2716).
 * datasets/manifest.json is the source of truth. This module lists it in
 * the game and builds the export download. CI checks the file with
 * scripts/validate-dataset-manifest.js.
 */
import manifest from '../../../datasets/manifest.json';

export const DATASET_MANIFEST = manifest;

export function listDatasets(source = manifest) {
    const rows = source && Array.isArray(source.datasets) ? source.datasets : (Array.isArray(source) ? source : []);
    return rows;
}

export function exportManifestJSON(source = manifest) {
    return JSON.stringify(source, null, 2);
}

const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

function schemaText(entry) {
    const fields = entry?.schema?.fields;
    if (!Array.isArray(fields) || fields.length === 0) return '';
    return fields.map(field => `${field.name}: ${field.type}`).join(', ');
}

/** Cards for the Shared Datasets screen. */
export function renderDatasetListHTML(source = manifest) {
    const rows = listDatasets(source);
    if (rows.length === 0) {
        return '<p class="dataset-empty">No datasets in the manifest.</p>';
    }
    return rows.map(entry => `
        <article class="dataset-card" data-dataset="${escapeHTML(entry.name)}">
            <h3>${escapeHTML(entry.name)}</h3>
            <p>${escapeHTML(entry.description)}</p>
            <dl>
                <dt>Path</dt><dd><code>${escapeHTML(entry.path)}</code></dd>
                <dt>Lake</dt><dd><code>${escapeHTML(entry.lake_path)}</code></dd>
                <dt>Visualizer</dt><dd><code>${escapeHTML(entry.visualizer_path)}</code></dd>
                <dt>Schema</dt><dd>${escapeHTML(schemaText(entry))}</dd>
                <dt>Produced by</dt><dd><code>${escapeHTML(entry.produced_by)}</code></dd>
            </dl>
        </article>`).join('');
}

/** Download the manifest. Returns the JSON even when download is unavailable. */
export function downloadDatasetManifest(doc = globalThis.document, source = manifest) {
    const json = exportManifestJSON(source);
    const urlApi = globalThis.URL;
    if (!doc?.body || typeof Blob === 'undefined' || typeof urlApi?.createObjectURL !== 'function') return json;
    const url = urlApi.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = doc.createElement('a');
    link.href = url;
    link.download = 'dataset-manifest.json';
    doc.body.appendChild(link);
    link.click();
    link.remove();
    urlApi.revokeObjectURL(url);
    return json;
}
