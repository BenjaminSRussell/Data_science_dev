import { expect } from 'chai';
import { Button } from '../../src/js/ui/components/Button.js';

describe('Button', () => {
    let component;

    beforeEach(() => {
        component = document.createElement('game-button');
        document.body.appendChild(component);
    });

    afterEach(() => {
        document.body.removeChild(component);
    });

    it('should call onclick callback when clicked', async () => {
        let onclickCalled = false;
        let onclickEvent;

        component.label = 'Test Button';
        component.onclick = (e) => {
            onclickCalled = true;
            onclickEvent = e;
        };

        // Wait for Lit to update
        await component.updateComplete;

        const button = component.shadowRoot.querySelector('button');
        button.click();

        expect(onclickCalled).to.be.true;
        expect(onclickEvent).to.exist;
    });

    it('should not call onclick callback when disabled', async () => {
        let onclickCalled = false;

        component.label = 'Test Button';
        component.disabled = true;
        component.onclick = () => {
            onclickCalled = true;
        };

        await component.updateComplete;

        const button = component.shadowRoot.querySelector('button');
        button.click();

        expect(onclickCalled).to.be.false;
    });

    it('should not dispatch button-click event', async () => {
        let eventFired = false;

        component.label = 'Test Button';
        component.addEventListener('button-click', () => {
            eventFired = true;
        });

        await component.updateComplete;

        const button = component.shadowRoot.querySelector('button');
        button.click();

        expect(eventFired).to.be.false;
    });
});
