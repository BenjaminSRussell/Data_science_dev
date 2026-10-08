import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RoommateSystem } from '../../src/js/game/social/RoommateSystem.js';

describe('Roommate splits the rent (#2055, #1716)', () => {
    it('player pays half of the weekly rent by default', () => {
        const rs = new RoommateSystem({});
        expect(rs.playerRentShare(500)).toBe(250);
        expect(rs.roommate.rentContribution).toBe(250);
    });

    it('honours a custom split (clamped) and odd amounts add up', () => {
        const rs = new RoommateSystem({});
        rs.rentSplit = 0.7;
        expect(rs.playerRentShare(501)).toBe(351);
        expect(rs.roommate.rentContribution).toBe(150);
        rs.rentSplit = 3;
        expect(rs.playerRentShare(400)).toBe(400);
    });

    it('no roommate means full rent', () => {
        const rs = new RoommateSystem({});
        rs.roommate = null;
        expect(rs.playerRentShare(500)).toBe(500);
    });

    it('the weekly rent charge in main.js uses the roommate split', () => {
        const src = fs.readFileSync(path.resolve(__dirname, '../../src/js/main.js'), 'utf8');
        const block = src.slice(src.indexOf("event.type === 'new_week'"), src.indexOf("event.type === 'new_week'") + 800);
        expect(block).toMatch(/roommateSystem\?\.playerRentShare\?\.\(fullRent\)/);
        expect(block).toMatch(/this\.gameState\.money -= rent;/);
    });
});
