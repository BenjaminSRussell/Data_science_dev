import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NewsManager } from '../../src/js/game/NewsManager.js';

describe('NewsManager', () => {
    let newsManager;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            timeManager: {
                getDateString: () => '2024-01-01',
                energy: 100,
                maxEnergy: 100
            },
            characterStats: {
                getStat: () => 10,
                addExperience: vi.fn()
            },
            completedJobs: 0,
            reputation: 0,
            worldMap: {
                currentVehicle: 'car'
            }
        };

        newsManager = new NewsManager(mockGameState);
    });

    describe('getUnreadCount', () => {
        it('should return 0 when no news exists', () => {
            expect(newsManager.getUnreadCount()).toBe(0);
        });

        it('should return correct count of unread news items', () => {
            // Generate some news
            newsManager.generateDailyNews();

            // Initially all news should be unread
            const unreadCount = newsManager.getUnreadCount();
            expect(unreadCount).toBeGreaterThan(0);
        });

        it('should return total news count initially since all are unread', () => {
            newsManager.generateDailyNews();

            const paper = newsManager.getDailyPaper();
            const expectedCount = (paper.headline ? 1 : 0) + (paper.articles ? paper.articles.length : 0);

            expect(newsManager.getUnreadCount()).toBe(expectedCount);
        });
    });

    describe('markAsRead', () => {
        it('should mark a news item as read', () => {
            newsManager.generateDailyNews();
            const paper = newsManager.getDailyPaper();

            if (!paper.headline) throw new Error('No headline generated');

            const initialUnreadCount = newsManager.getUnreadCount();

            // Mark headline as read
            newsManager.markAsRead(paper.headline.id);

            const newUnreadCount = newsManager.getUnreadCount();
            expect(newUnreadCount).toBe(initialUnreadCount - 1);
        });

        it('should not throw when marking non-existent news as read', () => {
            expect(() => {
                newsManager.markAsRead('non-existent-id');
            }).not.toThrow();
        });

        it('should update the read flag on the news item', () => {
            newsManager.generateDailyNews();
            const paper = newsManager.getDailyPaper();
            const newsItem = paper.headline;

            expect(newsItem.read).toBe(false);

            newsManager.markAsRead(newsItem.id);

            expect(newsItem.read).toBe(true);
        });

        it('should mark all news items from daily paper as read', () => {
            newsManager.generateDailyNews();
            const paper = newsManager.getDailyPaper();

            const initialUnreadCount = newsManager.getUnreadCount();

            // Mark all headline and articles as read
            if (paper.headline) {
                newsManager.markAsRead(paper.headline.id);
            }
            paper.articles.forEach(article => {
                newsManager.markAsRead(article.id);
            });

            expect(newsManager.getUnreadCount()).toBe(0);
        });
    });

    describe('generateDailyNews', () => {
        it('should create news items with read flag set to false', () => {
            newsManager.generateDailyNews();
            const paper = newsManager.getDailyPaper();

            expect(paper.headline.read).toBe(false);
            paper.articles.forEach(article => {
                expect(article.read).toBe(false);
            });
        });

        it('should add news to history', () => {
            const initialHistoryLength = newsManager.newsHistory.length;

            newsManager.generateDailyNews();

            expect(newsManager.newsHistory.length).toBeGreaterThan(initialHistoryLength);
        });
    });

    describe('serialization', () => {
        it('should serialize and deserialize including read status', () => {
            newsManager.generateDailyNews();
            const paper = newsManager.getDailyPaper();

            // Mark some news as read
            if (paper.headline) {
                newsManager.markAsRead(paper.headline.id);
            }

            const json = newsManager.toJSON();
            const newManager = new NewsManager(mockGameState);
            newManager.fromJSON(json);

            // Verify the read status is preserved
            const restoredUnreadCount = newManager.getUnreadCount();
            const originalUnreadCount = newsManager.getUnreadCount();

            expect(restoredUnreadCount).toBe(originalUnreadCount);
        });
    });
});
