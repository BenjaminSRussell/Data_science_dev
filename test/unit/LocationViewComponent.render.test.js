import { expect } from 'chai';
import '../../src/js/ui/components/LocationViewComponent.js';

describe('LocationViewComponent render', () => {
    let component;

    beforeEach(async () => {
        component = document.createElement('location-view-component');
        document.body.appendChild(component);
        await component.updateComplete;
    });

    afterEach(() => {
        document.body.removeChild(component);
    });

    it('renders loading state when locationDetails is null', async () => {
        component.locationDetails = null;
        await component.updateComplete;

        expect(component.shadowRoot.textContent).to.include('Loading location...');
        expect(component.shadowRoot.querySelector('.location-background')).to.be.null;
    });

    it('renders background classes, title and description from locationDetails', async () => {
        component.locationId = 'lab';
        component.timeOfDay = 'night';
        component.locationDetails = { name: 'The Lab', description: 'Where it happens' };
        await component.updateComplete;

        const background = component.shadowRoot.querySelector('.location-background');
        expect(background).to.not.be.null;
        expect(background.classList.contains('lab')).to.be.true;
        expect(background.classList.contains('time-night')).to.be.true;

        expect(component.shadowRoot.querySelector('.location-title').textContent).to.equal('The Lab');
        expect(component.shadowRoot.querySelector('.location-description').textContent).to.equal('Where it happens');
    });

    it('applies backgroundImage to style and empty string yields empty style', async () => {
        component.locationId = 'lab';
        component.locationDetails = { name: 'The Lab', description: 'Where it happens' };
        component.backgroundImage = '/img/lab.png';
        await component.updateComplete;

        let background = component.shadowRoot.querySelector('.location-background');
        expect(background.getAttribute('style')).to.include("background-image: url('/img/lab.png');");

        component.backgroundImage = '';
        await component.updateComplete;

        background = component.shadowRoot.querySelector('.location-background');
        expect(background.getAttribute('style')).to.equal('');
    });

    it('renders one .location-feature per feature with row-wrap positioning', async () => {
        component.locationId = 'lab';
        component.locationDetails = {
            name: 'The Lab',
            description: 'Where it happens',
            features: [
                { name: 'f0', icon: '🔬' },
                { name: 'f1', icon: '🔬' },
                { name: 'f2', icon: '🔬' },
                { name: 'f3', icon: '🔬' },
                { name: 'f4', icon: '🔬' },
                { name: 'f5', icon: '🔬' }
            ]
        };
        await component.updateComplete;

        const features = component.shadowRoot.querySelectorAll('.location-feature');
        expect(features.length).to.equal(6);

        expect(features[0].getAttribute('style')).to.include('left: 20%; top: 30%;');
        expect(features[5].getAttribute('style')).to.include('left: 20%; top: 50%;');
    });

    it('renders img for path icons and span for emoji icons', async () => {
        component.locationId = 'lab';
        component.locationDetails = {
            name: 'The Lab',
            description: 'Where it happens',
            features: [
                { name: 'Desk', icon: '/icons/desk.png' },
                { name: 'Microscope', icon: '🔬' }
            ]
        };
        await component.updateComplete;

        const features = component.shadowRoot.querySelectorAll('.location-feature');
        expect(features.length).to.equal(2);

        const img = features[0].querySelector('img');
        expect(img).to.not.be.null;
        expect(img.getAttribute('src')).to.equal('/icons/desk.png');
        expect(features[0].querySelector('span')).to.be.null;

        const span = features[1].querySelector('span');
        expect(span).to.not.be.null;
        expect(span.textContent).to.equal('🔬');
        expect(features[1].querySelector('img')).to.be.null;
    });

    it('has an empty character-container that this component never populates', async () => {
        component.locationId = 'lab';
        component.locationDetails = { name: 'The Lab', description: 'Where it happens' };
        await component.updateComplete;

        const container = component.shadowRoot.querySelector('#location-characters');
        expect(container).to.not.be.null;
        expect(container.classList.contains('character-container')).to.be.true;
        expect(container.children.length).to.equal(0);
    });
});
