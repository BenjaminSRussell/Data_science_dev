import { expect } from 'chai';
import { vi } from 'vitest';
import { Button } from '../../src/js/ui/components/Button.js';

describe('Button', () => {
    let button;

    beforeEach(() => {
        button = document.createElement('game-button');
        document.body.appendChild(button);
    });

    afterEach(() => {
        document.body.removeChild(button);
    });

    describe('disabled state', () => {
        it('should reflect disabled state on internal button element', async () => {
            button.disabled = true;
            await button.updateComplete;

            const internalButton = button.shadowRoot.querySelector('button');
            expect(internalButton.hasAttribute('disabled')).to.be.true;
        });

        it('should not have disabled attribute when disabled is false', async () => {
            button.disabled = false;
            await button.updateComplete;

            const internalButton = button.shadowRoot.querySelector('button');
            expect(internalButton.hasAttribute('disabled')).to.be.false;
        });

        it('should not fire onClick callback when disabled and clicked', async () => {
            let callbackFired = false;
            button.disabled = true;
            button.onClick = () => {
                callbackFired = true;
            };
            await button.updateComplete;

            const internalButton = button.shadowRoot.querySelector('button');
            internalButton.click();

            expect(callbackFired).to.be.false;
        });
    });

    describe('variant rendering', () => {
        it('should have default variant as "primary"', async () => {
            await button.updateComplete;

            expect(button.variant).to.equal('primary');
        });

        it('should apply variant class to internal button', async () => {
            button.variant = 'primary';
            await button.updateComplete;

            const internalButton = button.shadowRoot.querySelector('button');
            expect(internalButton.classList.contains('primary')).to.be.true;
        });

        it('should reflect different variants as classes', async () => {
            button.variant = 'secondary';
            await button.updateComplete;

            const internalButton = button.shadowRoot.querySelector('button');
            expect(internalButton.classList.contains('secondary')).to.be.true;
            expect(internalButton.classList.contains('primary')).to.be.false;
        });
    });

    describe('icon conditional rendering', () => {
        it('should not render icon span when icon is empty', async () => {
            button.icon = '';
            await button.updateComplete;

            const iconSpan = button.shadowRoot.querySelector('.icon');
            expect(iconSpan).to.be.null;
        });

        it('should render icon span when icon is provided', async () => {
            button.icon = '⭐';
            await button.updateComplete;

            const iconSpan = button.shadowRoot.querySelector('.icon');
            expect(iconSpan).to.not.be.null;
            expect(iconSpan.textContent).to.equal('⭐');
        });

        it('should update icon when property changes', async () => {
            button.icon = '✓';
            await button.updateComplete;

            let iconSpan = button.shadowRoot.querySelector('.icon');
            expect(iconSpan).to.not.be.null;
            expect(iconSpan.textContent).to.equal('✓');

            button.icon = '';
            await button.updateComplete;

            iconSpan = button.shadowRoot.querySelector('.icon');
            expect(iconSpan).to.be.null;
        });
    });

    describe('onClick callback', () => {
        it('should fire onClick callback on real click', async () => {
            let callbackFired = false;
            let eventPassed = null;
            button.onClick = (e) => {
                callbackFired = true;
                eventPassed = e;
            };
            button.label = 'Test';
            await button.updateComplete;

            const internalButton = button.shadowRoot.querySelector('button');
            internalButton.click();

            expect(callbackFired).to.be.true;
            expect(eventPassed).to.not.be.null;
        });

        it('should fire onClick callback when using host element click()', async () => {
            let callbackFired = false;
            button.onClick = () => {
                callbackFired = true;
            };
            button.label = 'Test';
            await button.updateComplete;

            button.click();

            expect(callbackFired).to.be.true;
        });

        it('should not fire onClick callback if callback is not set', async () => {
            button.onClick = null;
            button.label = 'Test';
            await button.updateComplete;

            const internalButton = button.shadowRoot.querySelector('button');
            // Should not throw
            internalButton.click();
        });
    });

    describe('button element attributes', () => {
        it('should have type="button" on internal button', async () => {
            button.label = 'Test';
            await button.updateComplete;

            const internalButton = button.shadowRoot.querySelector('button');
            expect(internalButton.getAttribute('type')).to.equal('button');
        });
    });

    describe('button-click event (removed in #2132)', () => {
        it('should call onClick but not dispatch the unused button-click event', async () => {
            let eventFired = false;
            const onclick = vi.fn();

            button.addEventListener('button-click', () => {
                eventFired = true;
            });

            button.label = 'Click Me';
            button.onClick = onclick;
            await button.updateComplete;

            const internalButton = button.shadowRoot.querySelector('button');
            internalButton.click();

            expect(onclick).toHaveBeenCalledOnce();
            expect(eventFired).to.be.false;
        });
    });

    describe('click() before first render', () => {
        it('should not throw when the element has no shadowRoot yet', () => {
            const detached = document.createElement('game-button');
            // Not connected, so Lit has not rendered and shadowRoot is null
            expect(detached.shadowRoot).to.equal(null);
            expect(() => detached.click()).not.to.throw();
        });
    });
});
