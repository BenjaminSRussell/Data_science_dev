/**
 * CityMapRenderer emits class names that had no stylesheet (#2020).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

const css = fs.readFileSync('src/styles/city-map.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');

const FAMILIES = [
    '.city-map-container',
    '.city-map-background',
    '.city-map-grid',
    '.city-zones-container',
    '.city-zone',
    '.city-zone-residential',
    '.city-zone-commercial',
    '.city-zone-industrial',
    '.city-zone-education',
    '.city-zone-finance',
    '.city-zone-government',
    '.city-zone-park',
    '.city-zone-mixed',
    '.city-roads-container',
    '.city-road',
    '.city-road-main',
    '.city-road-secondary',
    '.city-road-horizontal',
    '.city-road-vertical',
    '.city-buildings-container',
    '.city-building',
    '.city-building-residence',
    '.city-building-work',
    '.city-building-education',
    '.city-building-training',
    '.city-building-social',
    '.city-building-shop',
    '.city-building-finance',
    '.city-building-government',
    '.city-building-shopping',
    '.city-building-business',
    '.city-building-elite',
    '.city-building-investment',
    '.city-locations-container',
    '.city-location',
    '.city-location.current',
    '.city-location-icon',
    '.city-location-name',
    '.city-player-marker'
];

function ruleBody(sel) {
    const re = new RegExp(sel.replace(/\./g, '\\.') + '(?![A-Za-z0-9_-])');
    const match = re.exec(clean);
    expect(match, sel).not.toBeNull();
    const open = clean.indexOf('{', match.index);
    const close = clean.indexOf('}', open);
    return clean.slice(open + 1, close);
}

describe('CityMapRenderer stylesheet (#2020)', () => {
    it('is linked from index.html', () => {
        expect(html).toContain('href="/src/styles/city-map.css"');
    });

    it('styles every class the renderer emits', () => {
        for (const sel of FAMILIES) {
            expect(ruleBody(sel).trim().length, sel).toBeGreaterThan(0);
        }
    });

    it('positions the canvas and the overlay layers', () => {
        expect(ruleBody('.city-map-container')).toMatch(/position:\s*relative/);
        for (const sel of [
            '.city-map-background',
            '.city-zones-container',
            '.city-roads-container',
            '.city-buildings-container',
            '.city-locations-container'
        ]) {
            expect(ruleBody(sel), sel).toMatch(/position:\s*absolute/);
            expect(ruleBody(sel), sel).toMatch(/inset:\s*0/);
        }
    });

    it('paints background, zones, roads, buildings, and the player marker', () => {
        expect(ruleBody('.city-map-background')).toMatch(/background:/);
        expect(ruleBody('.city-zone')).toMatch(/border:/);
        expect(ruleBody('.city-zone-park')).toMatch(/background:/);
        expect(ruleBody('.city-road-main')).toMatch(/background:/);
        expect(ruleBody('.city-road-secondary')).toMatch(/background:/);
        expect(ruleBody('.city-building')).toMatch(/background:/);
        expect(ruleBody('.city-location-icon')).toMatch(/width:\s*28px/);
        expect(ruleBody('.city-player-marker')).toMatch(/border:/);
    });

    it('uses theme tokens, not literal colours', () => {
        expect(clean).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
        expect(clean).not.toMatch(/rgba?\(\s*\d/);
    });
});
