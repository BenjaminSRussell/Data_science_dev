```javascript
import { expect } from 'chai';
import { Button } from '../../../src/js/ui/components/Button.js';

describe('Button', () => {
  let el;

  beforeEach(async () => {
    el = document.createElement('game-button');
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  it('should have default properties and classes', () => {
    const button = el.shadowRoot.querySelector('button');
    expect(button.className).to.equal('primary');
    expect(button.querySelector('span.icon')).to.be.null;
    expect(button.querySelector('span.label').textContent).to.equal('');
  });

  it('should set label and icon when properties are set', () => {
    el.label = 'Buy';
    el.icon = 'ðŸ’°';
    el.requestUpdate();
    return el.updateComplete.then(() => {
      const button = el.shadowRoot.querySelector('button');
      expect(button.querySelector('span.icon').textContent).to.equal('ðŸ’°');
      expect(button.querySelector('span.label').textContent).to.equal('Buy');
    });
  });

  it('should set the correct class for different variants', () => {
    const variants = ['primary', 'secondary', 'success', 'danger'];
    variants.forEach(variant => {
      el.variant = variant;
      el.requestUpdate();
      return el.updateComplete.then(() => {
        const button = el.shadowRoot.querySelector('button');
        expect(button.className).to.equal(variant);
      });
    });
  });

  it('should set the disabled attribute when disabled property is set', () => {
    el.disabled = true;
    el.requestUpdate();
    return el.updateComplete.then(() => {
      const button = el.shadowRoot.querySelector('button');
      expect(button.disabled).to.be.true;
    });
  });
});