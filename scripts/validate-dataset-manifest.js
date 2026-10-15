/**
 * Validate datasets/manifest.json (#2716).
 * CI runs this file directly. Tests import validateDatasetManifest.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const LAKE_PREFIX = 'scrapy:Scraping_project/data/delta_lake/';
export const VISUALIZER_PREFIX = 'data-visualizer:/api/datasets/';

/** Delta tables in Scrapy's schema registry. */
export const LAKE_TABLES = new Set([
    'stage1_discovery',
    'stage2_queue',
    'stage2_page_analysis',
    'stage3_queue',
    'stage4_summaries',
    'stage4_large_docs',
    'stage4_large_doc_summaries',
    'seed_urls',
    'error_log',
    'metrics'
]);

/** Ids of Data-visualizer PREDEFINED_DATASETS. */
export const VISUALIZER_DATASETS = new Set([
    'urls_by_domain',
    'classifications_with_urls',
    'page_metadata_with_urls',
    'domain_statistics',
    'content_types_distribution',
    'status_codes_distribution'
]);

const FIELD_TYPES = new Set(['string', 'integer', 'number', 'boolean', 'timestamp']);
const NAME_RE = /^[a-z][a-z0-9_]*$/;

function readText(file) {
    return readFileSync(file, 'utf8');
}

/**
 * @param {unknown} manifest
 * @param {{ rootDir?: string|null, exists?: (path: string) => boolean, readText?: (path: string) => string }} [opts]
 * @returns {string[]} human-readable errors, empty when the manifest is valid
 */
export function validateDatasetManifest(manifest, opts = {}) {
    const exists = opts.exists || existsSync;
    const read = opts.readText || readText;
    const rootDir = opts.rootDir === undefined ? null : opts.rootDir;
    const errors = [];

    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
        return ['manifest must be an object'];
    }
    if (manifest.version !== 1) errors.push('version must be 1');
    if (!Array.isArray(manifest.datasets)) {
        errors.push('datasets must be an array');
        return errors;
    }
    if (manifest.datasets.length < 3) errors.push('datasets must contain at least 3 entries');

    const names = new Set();
    manifest.datasets.forEach((entry, index) => {
        const where = `datasets[${index}]`;
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            errors.push(`${where} must be an object`);
            return;
        }
        if (typeof entry.name !== 'string' || !NAME_RE.test(entry.name)) {
            errors.push(`${where}.name must be a snake_case id`);
        } else if (names.has(entry.name)) {
            errors.push(`${where}.name duplicates ${entry.name}`);
        } else {
            names.add(entry.name);
        }
        if (typeof entry.description !== 'string' || !entry.description.trim()) {
            errors.push(`${where}.description is required`);
        }
        if (typeof entry.path !== 'string' || !entry.path.startsWith('datasets/') || entry.path.includes('..')) {
            errors.push(`${where}.path must be a datasets/ file`);
        }
        if (typeof entry.produced_by !== 'string' || !entry.produced_by.startsWith('notebooks/') || !entry.produced_by.endsWith('.ipynb') || entry.produced_by.includes('..')) {
            errors.push(`${where}.produced_by must be a notebooks/*.ipynb file`);
        }
        if (typeof entry.lake_path !== 'string' || !entry.lake_path.startsWith(LAKE_PREFIX) || !LAKE_TABLES.has(entry.lake_path.slice(LAKE_PREFIX.length))) {
            errors.push(`${where}.lake_path must be a known Scrapy delta table`);
        }
        if (typeof entry.visualizer_path !== 'string' || !entry.visualizer_path.startsWith(VISUALIZER_PREFIX) || !VISUALIZER_DATASETS.has(entry.visualizer_path.slice(VISUALIZER_PREFIX.length))) {
            errors.push(`${where}.visualizer_path must be a known Data-visualizer dataset`);
        }

        const fields = entry.schema && Array.isArray(entry.schema.fields) ? entry.schema.fields : null;
        if (!fields || fields.length === 0) {
            errors.push(`${where}.schema.fields must be a non-empty array`);
        } else {
            const fieldNames = [];
            fields.forEach((field, fieldIndex) => {
                if (!field || typeof field.name !== 'string' || !NAME_RE.test(field.name)) {
                    errors.push(`${where}.schema.fields[${fieldIndex}].name must be snake_case`);
                } else {
                    fieldNames.push(field.name);
                }
                if (!field || typeof field.type !== 'string' || !FIELD_TYPES.has(field.type)) {
                    errors.push(`${where}.schema.fields[${fieldIndex}].type is not allowed`);
                }
            });
            if (rootDir && typeof entry.path === 'string' && entry.path.endsWith('.csv') && !entry.path.includes('..')) {
                const file = join(rootDir, entry.path);
                if (exists(file)) {
                    let text = '';
                    try {
                        text = read(file);
                    } catch (err) {
                        errors.push(`${where}.path unreadable: ${err.message}`);
                        text = '';
                    }
                    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.length > 0);
                    const expected = fieldNames.join(',');
                    if (lines.length < 2) {
                        errors.push(`${where}.path needs a header and one data row`);
                    } else if (lines[0] !== expected) {
                        errors.push(`${where}.path header must be ${expected}`);
                    }
                }
            }
        }

        if (rootDir && typeof entry.path === 'string' && entry.path.startsWith('datasets/') && !entry.path.includes('..')) {
            if (!exists(join(rootDir, entry.path))) errors.push(`${where}.path file missing: ${entry.path}`);
        }
        if (rootDir && typeof entry.produced_by === 'string' && entry.produced_by.startsWith('notebooks/') && !entry.produced_by.includes('..')) {
            if (!exists(join(rootDir, entry.produced_by))) errors.push(`${where}.produced_by file missing: ${entry.produced_by}`);
        }
    });

    return errors;
}

function isDirectRun() {
    const entry = process.argv[1];
    if (!entry) return false;
    return import.meta.url === pathToFileURL(entry).href;
}

if (isDirectRun()) {
    const file = join(root, 'datasets/manifest.json');
    let manifest;
    try {
        manifest = JSON.parse(readFileSync(file, 'utf8'));
    } catch (err) {
        console.error(`dataset manifest: cannot read ${file}: ${err.message}`);
        process.exit(1);
    }
    const errors = validateDatasetManifest(manifest, { rootDir: root });
    if (errors.length) {
        console.error('dataset manifest invalid:');
        for (const err of errors) console.error(`  - ${err}`);
        process.exit(1);
    }
    console.log(`dataset manifest ok (${manifest.datasets.length} datasets)`);
}
