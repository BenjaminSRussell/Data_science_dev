/**
 * Unit tests for NewsManager - verifies issue #2459 is fixed
 * The issue: NEWS_CATEGORIES was exported but never imported or consumed anywhere,
 * creating dead code. Solution: remove the dead export entirely.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as newsManagerModule from '../../src/js/game/NewsManager.js';
import { NewsManager, NEWS_TEMPLATES } from '../../src/js/game/NewsManager.js';

describe('NewsManager - Issue #2459 Fix', () => {
    let newsManager;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            timeManager: {
                getDateString: () => '2024-01-01'
            }
        };
        newsManager = new NewsManager(mockGameState);
    });

    describe('NEWS_CATEGORIES dead code removal', () => {
        it('should not export NEWS_CATEGORIES (issue is fixed)', () => {
            // NEWS_CATEGORIES should no longer be exported - it was dead code
            expect(newsManagerModule.NEWS_CATEGORIES).toBeUndefined();
        });

        it('should only export active symbols (NewsManager, NEWS_TEMPLATES, RANDOM_EVENTS)', () => {
            // Verify only the actively used exports are present
            expect(newsManagerModule.NewsManager).toBeDefined();
            expect(newsManagerModule.NEWS_TEMPLATES).toBeDefined();
            expect(newsManagerModule.RANDOM_EVENTS).toBeDefined();

            // NEWS_CATEGORIES should not exist
            expect(newsManagerModule.NEWS_CATEGORIES).toBeUndefined();
        });
    });

    describe('generateNewsItem', () => {
        it('should generate valid news items without color/icon dead fields', () => {
            const newsItem = newsManager.generateNewsItem();

            // Core fields should exist
            expect(newsItem.id).toBeDefined();
            expect(newsItem.category).toBeDefined();
            expect(newsItem.text).toBeDefined();
            expect(newsItem.timestamp).toBeDefined();
            expect(newsItem.effects).toBeDefined();
            expect(newsItem.read).toBe(false);

            // Dead fields should NOT exist (issue fix verification)
            expect(newsItem.color).toBeUndefined();
            expect(newsItem.icon).toBeUndefined();
        });

        it('should only generate items from valid NEWS_TEMPLATES categories', () => {
            // Collect categories used in NEWS_TEMPLATES
            const validCategories = new Set(NEWS_TEMPLATES.map(t => t.category));

            // Generate multiple items and verify all use valid categories
            for (let i = 0; i < 20; i++) {
                const newsItem = newsManager.generateNewsItem();
                expect(validCategories.has(newsItem.category)).toBe(true);
            }

            // Verify 'personal' category was never in NEWS_TEMPLATES (never reachable)
            expect(validCategories.has('personal')).toBe(false);
        });

        it('should maintain text and effects from templates', () => {
            const newsItem = newsManager.generateNewsItem();

            // Text should be a filled-in template (no {placeholders})
            expect(newsItem.text).not.toMatch(/{[^}]+}/);

            // Effects should be defined and be an object
            expect(typeof newsItem.effects).toBe('object');
        });
    });

    describe('generateDailyNews', () => {
        it('should generate daily paper with proper structure', () => {
            newsManager.generateDailyNews();
            const paper = newsManager.getDailyPaper();

            expect(paper.date).toBeDefined();
            expect(paper.headline).toBeDefined();
            expect(Array.isArray(paper.articles)).toBe(true);
            expect(paper.weather).toBeDefined();
            expect(paper.horoscope).toBeDefined();

            // Verify headline and articles don't have dead color/icon fields
            expect(paper.headline.color).toBeUndefined();
            expect(paper.headline.icon).toBeUndefined();

            paper.articles.forEach(article => {
                expect(article.color).toBeUndefined();
                expect(article.icon).toBeUndefined();
            });
        });
    });
});
