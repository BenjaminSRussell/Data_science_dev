/**
 * Unit tests for NewsManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NewsManager, NEWS_CATEGORIES, NEWS_TEMPLATES } from '../../src/js/game/NewsManager.js';

describe('NewsManager', () => {
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

    describe('generateNewsItem', () => {
        it('should attach color and icon from NEWS_CATEGORIES based on category', () => {
            const newsItem = newsManager.generateNewsItem();

            // The newsItem should have a category
            expect(newsItem.category).toBeDefined();

            // The newsItem should have color and icon from NEWS_CATEGORIES
            expect(newsItem.color).toBeDefined();
            expect(newsItem.icon).toBeDefined();

            // Verify the color and icon match the category from NEWS_CATEGORIES
            const categoryData = NEWS_CATEGORIES[newsItem.category];
            expect(categoryData).toBeDefined();
            expect(newsItem.color).toBe(categoryData.color);
            expect(newsItem.icon).toBe(categoryData.icon);
        });

        it('should generate news items with valid categories from NEWS_TEMPLATES', () => {
            for (let i = 0; i < 10; i++) {
                const newsItem = newsManager.generateNewsItem();

                // Category must be in NEWS_CATEGORIES
                expect(NEWS_CATEGORIES[newsItem.category]).toBeDefined();

                // Color and icon must match NEWS_CATEGORIES
                const categoryData = NEWS_CATEGORIES[newsItem.category];
                expect(newsItem.color).toBe(categoryData.color);
                expect(newsItem.icon).toBe(categoryData.icon);
            }
        });

        it('should not use the personal category since it is not in NEWS_TEMPLATES', () => {
            // Generate many news items and verify none use 'personal' category
            const categories = new Set();
            for (let i = 0; i < 50; i++) {
                const newsItem = newsManager.generateNewsItem();
                categories.add(newsItem.category);
            }

            // personal should not appear in generated items
            expect(categories.has('personal')).toBe(false);
        });

        it('should only use categories that are in both NEWS_TEMPLATES and NEWS_CATEGORIES', () => {
            // Get all categories used in NEWS_TEMPLATES
            const templateCategories = new Set(NEWS_TEMPLATES.map(t => t.category));

            // Verify that personal category is not in NEWS_TEMPLATES
            expect(templateCategories.has('personal')).toBe(false);

            // The personal category should be removed from NEWS_CATEGORIES
            // since it's unreachable
            expect(NEWS_CATEGORIES.personal).toBeUndefined();
        });
    });

    describe('getDailyPaper', () => {
        it('should include color and icon information in articles', () => {
            newsManager.generateDailyNews();
            const paper = newsManager.getDailyPaper();

            // Check headline has color and icon
            expect(paper.headline.color).toBeDefined();
            expect(paper.headline.icon).toBeDefined();

            // Check articles have color and icon
            paper.articles.forEach(article => {
                expect(article.color).toBeDefined();
                expect(article.icon).toBeDefined();
            });
        });
    });
});
