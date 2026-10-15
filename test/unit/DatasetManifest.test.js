/**
 * Shared dataset manifest linking notebooks to lake and visualizer paths (#2716).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDatasetManifest } from '../../scripts/validate-dataset-manifest.js';
import {
    listDatasets, renderDatasetListHTML, exportManifestJSON, downloadDatasetManifest
} from '../../src/js/data/DatasetCatalog.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(readFileSync(join(root, 'datasets/manifest.json'), 'utf8'));

describe('dataset manifest (#2716)', () => {
    it('documents at least three datasets and passes the CI checks', () => {
        expect(manifest.datasets.length).toBeGreaterThanOrEqual(3);
        expect(validateDatasetManifest(manifest, { rootDir: root })).toEqual([]);
        const names = listDatasets(manifest).map(entry => entry.name);
        expect(names).toEqual(['urls_by_domain', 'page_metadata', 'http_status_codes']);
    });

    it('rejects a catalog that drops the notebook or the lake link', () => {
        const broken = {
            version: 1,
            datasets: [
                { name: 'urls_by_domain', description: 'x', path: 'datasets/samples/urls_by_domain.csv', produced_by: 'notes/nope.txt', lake_path: 's3://other', visualizer_path: 'data-visualizer:/api/datasets/urls_by_domain', schema: { fields: [{ name: 'domain', type: 'string' }] } },
                { name: 'page_metadata', description: 'x', path: 'datasets/samples/page_metadata.csv', produced_by: 'notebooks/02_page_metadata.ipynb', lake_path: 'scrapy:Scraping_project/data/delta_lake/stage2_page_analysis', visualizer_path: 'data-visualizer:/api/datasets/page_metadata_with_urls', schema: { fields: [{ name: 'url', type: 'string' }] } },
                { name: 'http_status_codes', description: 'x', path: 'datasets/samples/http_status_codes.csv', produced_by: 'notebooks/03_http_status_codes.ipynb', lake_path: 'scrapy:Scraping_project/data/delta_lake/error_log', visualizer_path: 'data-visualizer:/api/datasets/status_codes_distribution', schema: { fields: [{ name: 'status_code', type: 'integer' }] } }
            ]
        };
        const errors = validateDatasetManifest(broken);
        expect(errors.some(err => err.includes('produced_by'))).toBe(true);
        expect(errors.some(err => err.includes('lake_path'))).toBe(true);
    });

    it('lists lake, visualizer, and notebook on each card and exports the manifest', () => {
        const html = renderDatasetListHTML(manifest);
        expect(html).toContain('data-dataset="urls_by_domain"');
        expect(html).toContain('scrapy:Scraping_project/data/delta_lake/stage1_discovery');
        expect(html).toContain('data-visualizer:/api/datasets/page_metadata_with_urls');
        expect(html).toContain('notebooks/03_http_status_codes.ipynb');
        expect(html).not.toContain('<script');

        const exported = JSON.parse(exportManifestJSON(manifest));
        expect(exported.datasets).toHaveLength(3);
        expect(exported.datasets[0].produced_by).toBe('notebooks/01_urls_by_domain.ipynb');

        const clicks = [];
        const doc = {
            body: {
                appendChild(node) { clicks.push(node.download); }
            },
            createElement() {
                return { click() {}, remove() {} };
            }
        };
        const previousURL = globalThis.URL;
        const previousBlob = globalThis.Blob;
        globalThis.URL = {
            createObjectURL() { return 'blob:manifest'; },
            revokeObjectURL() {}
        };
        globalThis.Blob = class Blob {
            constructor(parts, options) {
                this.parts = parts;
                this.type = options?.type;
            }
        };
        try {
            const json = downloadDatasetManifest(doc, manifest);
            expect(clicks).toEqual(['dataset-manifest.json']);
            expect(json).toContain('"http_status_codes"');
        } finally {
            globalThis.URL = previousURL;
            globalThis.Blob = previousBlob;
        }
    });
});
