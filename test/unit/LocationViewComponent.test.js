import { expect } from 'chai';
import { LocationViewComponent } from '../../src/js/ui/components/LocationViewComponent.js';

describe('LocationViewComponent', () => {
    let component;
    const mockLocationDetails = {
        name: 'Test Location',
        description: 'A test location',
        features: []
    };

    beforeEach(() => {
        component = document.createElement('location-view-component');
        document.body.appendChild(component);
    });

    afterEach(() => {
        document.body.removeChild(component);
    });

    it('should render the location background element', async () => {
        component.updateLocation('office', mockLocationDetails, 'test.jpg', 'morning');
        await component.updateComplete;

        const background = component.shadowRoot.querySelector('.location-background');
        expect(background).to.exist;
    });

    it('should not include unused time-of-day classes in the rendered element', async () => {
        component.updateLocation('office', mockLocationDetails, 'test.jpg', 'morning');
        await component.updateComplete;

        const background = component.shadowRoot.querySelector('.location-background');
        expect(background.className).to.not.include('time-morning');
        expect(background.className).to.not.include('time-noon');
        expect(background.className).to.not.include('time-afternoon');
        expect(background.className).to.not.include('time-evening');
        expect(background.className).to.not.include('time-night');
    });

    it('should not include unused location ID classes in the rendered element', async () => {
        component.updateLocation('office', mockLocationDetails, 'test.jpg', 'noon');
        await component.updateComplete;

        const background = component.shadowRoot.querySelector('.location-background');
        expect(background.className).to.not.include('office');
        expect(background.className).to.not.include('coffee_shop');
        expect(background.className).to.not.include('gym');
        expect(background.className).to.not.include('library');
        expect(background.className).to.not.include('park');
    });

    it('should apply background image style when provided', async () => {
        component.updateLocation('office', mockLocationDetails, 'test.jpg', 'morning');
        await component.updateComplete;

        const background = component.shadowRoot.querySelector('.location-background');
        expect(background.style.backgroundImage).to.include('test.jpg');
    });

    it('should have only the location-background class on the root element', async () => {
        component.updateLocation('office', mockLocationDetails, 'test.jpg', 'night');
        await component.updateComplete;

        const background = component.shadowRoot.querySelector('.location-background');
        expect(background.className).to.equal('location-background');
    });
});
