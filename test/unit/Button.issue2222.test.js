import { expect } from 'chai';
import { Button } from '../../src/js/ui/components/Button.js';

describe('Button', () => {
    let element;

    beforeEach(() => {
        element = document.createElement('game-button');
        document.body.appendChild(element);
    });

    afterEach(() => {
        if (element && element.parentNode) {
            document.body.removeChild(element);
        }
    });

    it('should invoke onClick handler when host element is clicked via .click()', async () => {
        let clickHandlerCalled = false;
        const clickHandler = () => {
            clickHandlerCalled = true;
        };

        element.onClick = clickHandler;
        await element.updateComplete;

        element.click();

        expect(clickHandlerCalled).to.be.true;
    });

    it('should allow native onclick property to work without being shadowed', async () => {
        // Verify that Button.prototype.onClick (not onclick) is the reactive property
        // This prevents shadowing the native inherited onclick accessor from HTMLElement
        await element.updateComplete;

        const prototypeChain = Object.getPrototypeOf(element);
        const onClickDescriptor = Object.getOwnPropertyDescriptor(prototypeChain, 'onClick');

        // Verify onClick exists as own property (the reactive property)
        expect(onClickDescriptor).to.exist;

        // Verify onclick is NOT an own property (so it remains inherited)
        const onclickDescriptor = Object.getOwnPropertyDescriptor(prototypeChain, 'onclick');
        expect(onclickDescriptor).to.not.exist;
    });

    it('should not dispatch the removed button-click event when clicked (#2132)', async () => {
        let eventFired = false;

        element.label = 'Test Button';
        element.addEventListener('button-click', () => {
            eventFired = true;
        });
        await element.updateComplete;

        element.click();

        expect(eventFired).to.be.false;
    });

    it('should not invoke onClick handler when disabled', async () => {
        let clickHandlerCalled = false;
        const clickHandler = () => {
            clickHandlerCalled = true;
        };

        element.disabled = true;
        element.onClick = clickHandler;
        await element.updateComplete;

        element.click();

        expect(clickHandlerCalled).to.be.false;
    });

    it('should have native onclick as inherited accessor, not overridden', async () => {
        await element.updateComplete;

        // Get the property descriptor for 'onclick' on the element's prototype chain
        let descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'onclick');

        // If not found on Button.prototype, it should be inherited from HTMLElement
        // The important thing is that Button.prototype.onClick (not onclick) is the own property
        const onClickDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'onClick');

        // Verify onClick is an own property on Button.prototype (the reactive property)
        expect(onClickDescriptor).to.exist;
        expect(onClickDescriptor.value === undefined).to.be.true; // Reactive property

        // Verify that onclick is not shadowed - if it's inherited from HTMLElement,
        // it won't be an own property on Button.prototype
        const hasOwnOnclick = Object.prototype.hasOwnProperty.call(Object.getPrototypeOf(element), 'onclick');
        expect(hasOwnOnclick).to.be.false;
    });
});
