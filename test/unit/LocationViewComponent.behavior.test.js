/**
 * Behavior tests for LocationViewComponent
 * Covers updateLocation() and feature-click event dispatch.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocationViewComponent } from '../../src/js/ui/components/LocationViewComponent.js';

describe('LocationViewComponent behavior', () => {
    let component;

    beforeEach(async () => {
        component = document.createElement('location-view-component');
        document.body.appendChild(component);
        await component.updateComplete;
    });

    afterEach(() => {
        document.body.removeChild(component);
    });

    describe('updateLocation()', () => {
        it('should update all 4 properties and reflect them in the next render', async () => {
            const details = { name: 'Office', description: 'Desks.' };
            component.updateLocation('office', details, '/bg/office.png', 'morning');

            expect(component.locationId).toBe('office');
            expect(component.locationDetails).toBe(details);
            expect(component.backgroundImage).toBe('/bg/office.png');
            expect(component.timeOfDay).toBe('morning');

            await component.updateComplete;

            const bg = component.shadowRoot.querySelector('.location-background');
            expect(bg).not.toBeNull();
            expect(bg.classList.contains('office')).toBe(true);
            expect(bg.classList.contains('time-morning')).toBe(true);
            expect(bg.style.backgroundImage).toBe("url('/bg/office.png')");

            const title = component.shadowRoot.querySelector('.location-title');
            const description = component.shadowRoot.querySelector('.location-description');
            expect(title.textContent).toBe('Office');
            expect(description.textContent).toBe('Desks.');
        });

        it('should default backgroundImage to empty string and timeOfDay to noon when omitted', () => {
            component.updateLocation('office', { name: 'Office', description: 'Desks.' });

            expect(component.locationId).toBe('office');
            expect(component.backgroundImage).toBe('');
            expect(component.timeOfDay).toBe('noon');
        });
    });

    describe('feature-click events', () => {
        it('should dispatch a feature-click CustomEvent with detail.feature reference-equal to the originating feature', async () => {
            const feature = { name: 'Coffee Machine', icon: '☕' };
            component.updateLocation('office', {
                name: 'Office',
                description: 'Desks.',
                features: [feature]
            });
            await component.updateComplete;

            let received = null;
            component.addEventListener('feature-click', (event) => {
                received = event;
            });

            const featureEl = component.shadowRoot.querySelector('.location-feature');
            expect(featureEl).not.toBeNull();
            featureEl.click();

            expect(received).not.toBeNull();
            expect(received.type).toBe('feature-click');
            expect(received.detail.feature).toBe(feature);
        });

        it('should dispatch feature-click with bubbles:true and composed:true', async () => {
            const feature = { name: 'Desk Plant', icon: '🌿' };
            component.updateLocation('office', {
                name: 'Office',
                description: 'Desks.',
                features: [feature]
            });
            await component.updateComplete;

            let received = null;
            component.addEventListener('feature-click', (event) => {
                received = event;
            });

            component.shadowRoot.querySelector('.location-feature').click();

            expect(received).not.toBeNull();
            expect(received.bubbles).toBe(true);
            expect(received.composed).toBe(true);
        });
    });
});
