import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';
import { ClientManager } from '../../src/js/game/ClientManager.js';
import { OfficeManager } from '../../src/js/game/OfficeManager.js';
import { MARKETING_CHANNELS } from '../../src/js/data/tycoonData.js';

describe('Marketing Channel Consistency', () => {
    let gameState;
    let clientManager;
    let officeManager;

    beforeEach(() => {
        gameState = new GameState();
        clientManager = new ClientManager(gameState);
        officeManager = new OfficeManager(gameState);
    });

    it('should have a single source of truth for active marketing channels in GameState', () => {
        expect(gameState.activeMarketingChannels).toBeDefined();
        expect(Array.isArray(gameState.activeMarketingChannels)).toBe(true);
        expect(gameState.activeMarketingChannels).toContain('word_of_mouth');
    });

    it('ClientManager should not have its own marketingActive property', () => {
        expect(clientManager.marketingActive).toBeUndefined();
    });

    it('OfficeManager should not have its own activeMarketing property', () => {
        expect(officeManager.activeMarketing).toBeUndefined();
    });

    it('toggling marketing in OfficeManager should affect ClientManager cost calculation', () => {
        const linkedChannelId = 'linkedin';
        const linkedChannel = MARKETING_CHANNELS.find(c => c.id === linkedChannelId);

        // Initial state - should only have word_of_mouth
        const initialClientCost = clientManager.getDailyMarketingCost();
        const initialOfficeCost = officeManager.getDailyMarketingCost();
        expect(initialClientCost).toBe(initialOfficeCost);

        // Toggle linkedin on via OfficeManager
        officeManager.toggleMarketing(linkedChannelId);

        // Both should now include linkedin cost
        const clientCostWithLinkedin = clientManager.getDailyMarketingCost();
        const officeCostWithLinkedin = officeManager.getDailyMarketingCost();
        expect(clientCostWithLinkedin).toBe(officeCostWithLinkedin);
        expect(clientCostWithLinkedin - initialClientCost).toBe(linkedChannel.costPerDay);

        // Toggle linkedin off via OfficeManager
        officeManager.toggleMarketing(linkedChannelId);

        // Both should be back to original cost
        const clientCostAfter = clientManager.getDailyMarketingCost();
        const officeCostAfter = officeManager.getDailyMarketingCost();
        expect(clientCostAfter).toBe(officeCostAfter);
        expect(clientCostAfter).toBe(initialClientCost);
    });

    it('activating marketing in ClientManager should affect OfficeManager cost calculation', () => {
        const websiteChannelId = 'website';
        const websiteChannel = MARKETING_CHANNELS.find(c => c.id === websiteChannelId);

        const initialCost = officeManager.getDailyMarketingCost();

        // Activate website via ClientManager
        clientManager.activateMarketing(websiteChannelId);

        // OfficeManager should see the increased cost
        const newCost = officeManager.getDailyMarketingCost();
        expect(newCost).toBeGreaterThan(initialCost);
        expect(newCost - initialCost).toBe(websiteChannel.costPerDay);
    });

    it('deactivating marketing in ClientManager should affect OfficeManager cost calculation', () => {
        // Activate a channel first
        clientManager.activateMarketing('linkedin');

        const costWithLinkedin = officeManager.getDailyMarketingCost();

        // Deactivate via ClientManager
        clientManager.deactivateMarketing('linkedin');

        const costWithoutLinkedin = officeManager.getDailyMarketingCost();
        expect(costWithLinkedin).toBeGreaterThan(costWithoutLinkedin);
    });

    it('getDailyMarketingCost should calculate the same for both managers', () => {
        // Activate multiple channels
        clientManager.activateMarketing('linkedin');
        clientManager.activateMarketing('website');

        const clientCost = clientManager.getDailyMarketingCost();
        const officeCost = officeManager.getDailyMarketingCost();

        expect(clientCost).toBe(officeCost);
    });

    it('isMarketingActive should return consistent state between managers', () => {
        const channelId = 'linkedin';

        expect(gameState.isMarketingChannelActive(channelId)).toBe(false);

        // Toggle via OfficeManager
        officeManager.toggleMarketing(channelId);

        expect(gameState.isMarketingChannelActive(channelId)).toBe(true);
        expect(officeManager.isMarketingActive(channelId)).toBe(true);

        // Deactivate via ClientManager
        clientManager.deactivateMarketing(channelId);

        expect(gameState.isMarketingChannelActive(channelId)).toBe(false);
        expect(officeManager.isMarketingActive(channelId)).toBe(false);
    });

    it('generateLeads should use activeMarketingChannels from GameState', () => {
        // Initially, word_of_mouth gives 0.5 leads per day
        const initialLeads = clientManager.generateLeads();

        // Clear active channels
        gameState.activeMarketingChannels = [];

        // With no marketing, should generate 0 leads
        const noMarketingLeads = clientManager.generateLeads();
        expect(noMarketingLeads).toBe(0);

        // Activate a high-value channel
        gameState.activeMarketingChannels = ['conference']; // 6 leads per day

        const conferenceLeads = clientManager.generateLeads();
        expect(conferenceLeads).toBeGreaterThan(0);
    });

    it('serialization should not duplicate activeMarketing in OfficeManager', () => {
        clientManager.activateMarketing('linkedin');
        clientManager.activateMarketing('website');

        const officeJSON = officeManager.toJSON();

        // activeMarketing should not be in OfficeManager's JSON
        expect(officeJSON.activeMarketing).toBeUndefined();

        // GameState should have the active channels
        const gameStateJSON = gameState.toJSON();
        expect(gameStateJSON.activeMarketingChannels).toContain('linkedin');
        expect(gameStateJSON.activeMarketingChannels).toContain('website');
    });

    it('gameState.toggleMarketingChannel should work as expected', () => {
        const channelId = 'ads';

        // Initially not active
        expect(gameState.activeMarketingChannels).not.toContain(channelId);

        // Toggle on
        const result1 = gameState.toggleMarketingChannel(channelId);
        expect(result1.active).toBe(true);
        expect(gameState.activeMarketingChannels).toContain(channelId);

        // Toggle off
        const result2 = gameState.toggleMarketingChannel(channelId);
        expect(result2.active).toBe(false);
        expect(gameState.activeMarketingChannels).not.toContain(channelId);
    });

    it('gameState.activateMarketingChannel should not duplicate entries', () => {
        const channelId = 'linkedin';

        gameState.activateMarketingChannel(channelId);
        const count1 = gameState.activeMarketingChannels.filter(c => c === channelId).length;

        gameState.activateMarketingChannel(channelId);
        const count2 = gameState.activeMarketingChannels.filter(c => c === channelId).length;

        expect(count1).toBe(1);
        expect(count2).toBe(1);
    });

    it('gameState.deactivateMarketingChannel should work correctly', () => {
        const channelId = 'linkedin';

        gameState.activeMarketingChannels.push(channelId);
        expect(gameState.activeMarketingChannels).toContain(channelId);

        gameState.deactivateMarketingChannel(channelId);
        expect(gameState.activeMarketingChannels).not.toContain(channelId);
    });

    it('should maintain consistency across GameState serialization/deserialization', () => {
        // Set up initial state
        clientManager.activateMarketing('linkedin');
        clientManager.activateMarketing('website');

        const json = gameState.toJSON();
        const newGameState = new GameState();
        newGameState.fromJSON(json);

        const newOfficeManager = new OfficeManager(newGameState);

        expect(newOfficeManager.getDailyMarketingCost()).toBe(
            officeManager.getDailyMarketingCost()
        );
        expect(newGameState.activeMarketingChannels).toEqual(
            gameState.activeMarketingChannels
        );
    });
});
