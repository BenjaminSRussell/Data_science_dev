const EventSystem = require('../../src/js/game/events/EventSystem');
const GameState = require('../../src/js/game/GameState');
const sinon = require('sinon');

describe('EventSystem', () => {
    let eventSystem;
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
        eventSystem = new EventSystem(gameState);
        eventSystem.events = [
            { id: 'event1', name: 'Event 1', day: 1 },
            { id: 'event2', name: 'Event 2' },
            { id: 'networkingEvent', name: 'Networking Event', day: 15 }
        ];
    });

    describe('triggerEvent(eventId)', () => {
        it('should trigger a known event', () => {
            const stub = sinon.stub(eventSystem, 'handleEvent');
            eventSystem.triggerEvent('event1');
            sinon.assert.calledWith(stub, eventSystem.events[0]);
            stub.restore();
        });

        it('should do nothing for an unknown event', () => {
            const stub = sinon.stub(eventSystem, 'handleEvent');
            eventSystem.triggerEvent('unknownEvent');
            sinon.assert.notCalled(stub);
            stub.restore();
        });
    });

    describe('triggering the same event twice in a row', () => {
        it('should trigger the event again if not deduplicated', () => {
            const stub = sinon.stub(eventSystem, 'handleEvent');
            eventSystem.triggerEvent('event1');
            eventSystem.triggerEvent('event1');
            sinon.assert.calledTwice(stub);
            stub.restore();
        });
    });

    describe('bi-weekly networking-event day-matching logic', () => {
        it('should match on the correct day', () => {
            gameState.day = 15;
            const stub = sinon.stub(eventSystem, 'handleEvent');
            eventSystem.checkTodayEvents();
            sinon.assert.calledWith(stub, eventSystem.events[2]);
            stub.restore();
        });

        it('should not match on the wrong day', () => {
            gameState.day = 16;
            const stub = sinon.stub(eventSystem, 'handleEvent');
            eventSystem.checkTodayEvents();
            sinon.assert.notCalled(stub);
            stub.restore();
        });
    });

    describe('checkTodayEvents() filtering logic', () => {
        it('should check every day for an event with no day constraint', () => {
            gameState.day = 10;
            const stub = sinon.stub(eventSystem, 'handleEvent');
            eventSystem.checkTodayEvents();
            sinon.assert.calledWith(stub, eventSystem.events[1]);
            stub.restore();
        });

        it('should only match on the exact day for an event with a day constraint', () => {
            gameState.day = 1;
            const stub = sinon.stub(eventSystem, 'handleEvent');
            eventSystem.checkTodayEvents();
            sinon.assert.calledWith(stub, eventSystem.events[0]);
            stub.restore();
        });
    });
});