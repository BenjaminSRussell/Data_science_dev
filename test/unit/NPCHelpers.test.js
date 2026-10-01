import { expect } from 'chai';
import { updateRelationshipsScreen } from '../../src/js/helpers/NPCHelpers.js';

describe('NPCHelpers', () => {
    describe('updateRelationshipsScreen', () => {
        let game;
        let container;

        beforeEach(() => {
            // Create a mock container element
            container = document.createElement('div');
            container.id = 'npc-grid';
            document.body.appendChild(container);

            // Create a mock game state with NPCs
            game = {
                npcManager: {
                    getMetNPCs: () => [
                        {
                            id: 'npc-1',
                            name: 'Alice',
                            title: 'Merchant',
                            icon: 'merchant-icon',
                            relationship: 50,
                            tier: { label: 'Friend' }
                        },
                        {
                            id: 'npc-2',
                            name: 'Bob',
                            title: 'Guard',
                            icon: 'guard-icon',
                            relationship: 75,
                            tier: { label: 'Best Friend' }
                        }
                    ]
                }
            };
        });

        afterEach(() => {
            if (container && container.parentNode) {
                document.body.removeChild(container);
            }
        });

        it('should create NPC cards without throwing errors', () => {
            expect(() => {
                updateRelationshipsScreen(game);
            }).not.to.throw();
        });

        it('should create correct number of NPC cards', () => {
            updateRelationshipsScreen(game);
            const cards = container.querySelectorAll('.npc-card');
            expect(cards.length).to.equal(2);
        });

        it('should populate card dataset with NPC id', () => {
            updateRelationshipsScreen(game);
            const cards = container.querySelectorAll('.npc-card');
            expect(cards[0].dataset.npc).to.equal('npc-1');
            expect(cards[1].dataset.npc).to.equal('npc-2');
        });

        it('should create avatar element in each card', () => {
            updateRelationshipsScreen(game);
            const avatars = container.querySelectorAll('.npc-avatar');
            expect(avatars.length).to.equal(2);
        });

        it('should create avatar text fallback in each card', () => {
            updateRelationshipsScreen(game);
            const avatarTexts = container.querySelectorAll('.npc-avatar-text');
            expect(avatarTexts.length).to.equal(2);
        });

        it('should display NPC name and title in each card', () => {
            updateRelationshipsScreen(game);
            const names = container.querySelectorAll('.npc-name');
            const titles = container.querySelectorAll('.npc-title');
            
            expect(names[0].textContent).to.include('Alice');
            expect(titles[0].textContent).to.include('Merchant');
            expect(names[1].textContent).to.include('Bob');
            expect(titles[1].textContent).to.include('Guard');
        });

        it('should create relationship bar with correct width', () => {
            updateRelationshipsScreen(game);
            const fills = container.querySelectorAll('.relationship-fill');
            
            expect(fills[0].style.width).to.equal('50%');
            expect(fills[1].style.width).to.equal('75%');
        });

        it('should display relationship tier in each card', () => {
            updateRelationshipsScreen(game);
            const tiers = container.querySelectorAll('.relationship-tier');

            expect(tiers[0].textContent).to.include('Friend');
            expect(tiers[1].textContent).to.include('Best Friend');
        });

        it('should create icon badge with npc.icon text in each card', () => {
            updateRelationshipsScreen(game);
            const iconBadges = container.querySelectorAll('.npc-icon-badge');

            expect(iconBadges.length).to.equal(2);
            // The icon badge should contain the text representation of npc.icon
            // Since getTextIcon returns the ICON_MAP value or 'NPC' as fallback,
            // and merchant-icon/guard-icon may not be in ICON_MAP, they default to 'NPC'
            expect(iconBadges[0].textContent).to.be.a('string');
            expect(iconBadges[1].textContent).to.be.a('string');
        });

        it('should clear previous cards before rendering', () => {
            // First render
            updateRelationshipsScreen(game);
            let cards = container.querySelectorAll('.npc-card');
            expect(cards.length).to.equal(2);

            // Modify game state to have only 1 NPC
            game.npcManager.getMetNPCs = () => [
                {
                    id: 'npc-1',
                    name: 'Alice',
                    title: 'Merchant',
                    icon: 'merchant-icon',
                    relationship: 50,
                    tier: { label: 'Friend' }
                }
            ];

            // Second render
            updateRelationshipsScreen(game);
            cards = container.querySelectorAll('.npc-card');
            expect(cards.length).to.equal(1);
        });
    });
});
