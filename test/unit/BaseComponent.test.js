import { expect } from 'chai';
import { html, render } from 'lit';
import { BaseComponent } from '../../src/js/ui/components/BaseComponent.js';

// Define a minimal concrete subclass and register it
class ProbeComponent extends BaseComponent {}
customElements.define('probe-base-component', ProbeComponent);

describe('BaseComponent', () => {
    let component;

    beforeEach(() => {
        component = document.createElement('probe-base-component');
        document.body.appendChild(component);
    });

    afterEach(() => {
        document.body.removeChild(component);
    });

    it('should have game property as null by default', () => {
        expect(component.game).to.be.null;
    });

    it('should format money correctly', () => {
        expect(component.formatMoney(1234567)).to.equal('$1,234,567');
        expect(component.formatMoney(0)).to.equal('$0');
        expect(component.formatMoney(undefined)).to.equal('$0');
        expect(component.formatMoney(null)).to.equal('$0');
    });

    it('should format number correctly', () => {
        expect(component.formatNumber(9876)).to.equal('9,876');
        expect(component.formatNumber(undefined)).to.equal('0');
    });

    it('should dispatch game event correctly', () => {
        let eventFired = false;
        let eventDetail;

        component.addEventListener('probe-event', (event) => {
            eventFired = true;
            eventDetail = event.detail;
        });

        component.dispatchGameEvent('probe-event', { value: 42 });

        expect(eventFired).to.be.true;
        expect(eventDetail.value).to.equal(42);
        expect(event.bubbles).to.be.true;
        expect(event.composed).to.be.true;
    });
});