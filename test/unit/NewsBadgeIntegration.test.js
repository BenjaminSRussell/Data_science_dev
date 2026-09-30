import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NewsManager } from '../../src/js/game/NewsManager.js';

describe('News Badge Integration', () => {
    let newsManager;
    let mockGameState;
    let mockGame;
    let badge;
    let button;

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

        // Mock DOM elements for badge
        badge = document.createElement('span');
        badge.id = 'news-unread-badge';
        badge.classList.add('hidden');

        button = document.createElement('button');
        button.id = 'btn-nav-newspaper';
        button.classList.add('btn-grey');
        button.appendChild(badge);
        document.body.appendChild(button);
    });

    afterEach(() => {
        if (button && button.parentNode === document.body) {
            document.body.removeChild(button);
        }
    });

    describe('Badge update', () => {
        it('should display badge with unread count', () => {
            newsManager.generateDailyNews();

            const unreadCount = newsManager.getUnreadCount();

            // Simulate updateNewsBadge() logic
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.classList.remove('hidden');
                button.classList.add('has-unread');
            }

            expect(badge.textContent).toBe(String(unreadCount));
            expect(badge.classList.contains('hidden')).toBe(false);
            expect(button.classList.contains('has-unread')).toBe(true);
        });

        it('should hide badge when all news is read', () => {
            newsManager.generateDailyNews();
            const paper = newsManager.getDailyPaper();

            // Mark all news as read
            if (paper.headline) {
                newsManager.markAsRead(paper.headline.id);
            }
            paper.articles.forEach(article => {
                newsManager.markAsRead(article.id);
            });

            const unreadCount = newsManager.getUnreadCount();

            // Simulate updateNewsBadge() logic
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.classList.remove('hidden');
                button.classList.add('has-unread');
            } else {
                badge.classList.add('hidden');
                button.classList.remove('has-unread');
            }

            expect(unreadCount).toBe(0);
            expect(badge.classList.contains('hidden')).toBe(true);
            expect(button.classList.contains('has-unread')).toBe(false);
        });

        it('should handle badge count > 99 as "99+"', () => {
            // Create many news items
            for (let i = 0; i < 100; i++) {
                newsManager.newsHistory.push({
                    id: `news_${i}`,
                    category: 'test',
                    text: `Test news ${i}`,
                    timestamp: '2024-01-01',
                    effects: {},
                    read: false
                });
            }

            const unreadCount = newsManager.getUnreadCount();

            // Simulate updateNewsBadge() logic
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.classList.remove('hidden');
                button.classList.add('has-unread');
            }

            expect(badge.textContent).toBe('99+');
        });
    });

    describe('News display and mark as read', () => {
        it('should mark news as read when ticker displays it', () => {
            newsManager.generateDailyNews();

            const latestNews = newsManager.getRecentNews(5);
            const initialUnreadCount = newsManager.getUnreadCount();

            // Simulate updateNewsTicker() logic
            latestNews.forEach(n => newsManager.markAsRead(n.id));

            const newUnreadCount = newsManager.getUnreadCount();

            expect(newUnreadCount).toBe(initialUnreadCount - latestNews.length);
        });

        it('should mark newspaper articles as read when displayed', () => {
            newsManager.generateDailyNews();
            const paper = newsManager.getDailyPaper();

            const initialUnreadCount = newsManager.getUnreadCount();

            // Simulate updateNewspaperScreen() logic
            if (paper.headline) {
                newsManager.markAsRead(paper.headline.id);
            }
            paper?.articles?.forEach(article => {
                newsManager.markAsRead(article.id);
            });

            const newUnreadCount = newsManager.getUnreadCount();
            const articlesCount = (paper.headline ? 1 : 0) + (paper.articles ? paper.articles.length : 0);

            expect(newUnreadCount).toBe(initialUnreadCount - articlesCount);
        });
    });
});
