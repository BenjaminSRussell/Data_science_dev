```javascript
import { html, render, fixture, expect } from '@open-wc/testing';
import { DialogueComponent } from '../../src/js/ui/components/DialogueComponent.js';

describe('DialogueComponent', () => {
  let component;

  beforeEach(async () => {
    component = await fixture(html`
      <dialogue-component></dialogue-component>
    `);
  });

  it('should not render .dialogue-container when isOpen is false', async () => {
    await component.updateComplete;
    expect(component.shadowRoot.querySelector('.dialogue-container')).to.equal(null);
  });

  it('should not render .dialogue-container when isOpen is true but npc is null', async () => {
    component.isOpen = true;
    await component.updateComplete;
    expect(component.shadowRoot.querySelector('.dialogue-container')).to.equal(null);
  });

  it('should render .dialogue-npc-name, .dialogue-npc-title, and .char-avatar when isOpen is true and npc is provided', async () => {
    component.isOpen = true;
    component.npc = { name: 'Dr. Ada Lovelace', title: 'Chief Scientist' };
    await component.updateComplete;

    const dialogueName = component.shadowRoot.querySelector('.dialogue-npc-name');
    const dialogueTitle = component.shadowRoot.querySelector('.dialogue-npc-title');
    const charAvatar = component.shadowRoot.querySelector('.char-avatar');

    expect(dialogueName).to.have.text('Dr. Ada Lovelace');
    expect(dialogueTitle).to.have.text('Chief Scientist');
    expect(charAvatar).to.have.text('D');
  });

  it('should fall back to "?" for avatar and "Unknown" for name when npc is empty object', async () => {
    component.isOpen = true;
    component.npc = {};
    await component.updateComplete;

    const charAvatar = component.shadowRoot.querySelector('.char-avatar');
    const dialogueName = component.shadowRoot.querySelector('.dialogue-npc-name');

    expect(charAvatar).to.have.text('?');
    expect(dialogueName).to.have.text('Unknown');
  });

  it('should render .dialogue-npc-title as "Assistant" when type is provided but no title', async () => {
    component.isOpen = true;
    component.npc = { name: 'Bot', type: 'Assistant' };
    await component.updateComplete;

    const dialogueTitle = component.shadowRoot.querySelector('.dialogue-npc-title');

    expect(dialogueTitle).to.have.text('Assistant');
  });

  it('should fall back to "???" for .dialogue-npc-title when neither title nor type is provided', async () => {
    component.isOpen = true;
    component.npc = { name: 'Bot' };
    await component.updateComplete;

    const dialogueTitle = component.shadowRoot.querySelector('.dialogue-npc-title');

    expect(dialogueTitle).to.have.text('???');
  });

  it('should render .dialogue-text with typing class when isTyping is true', async () => {
    component.typingText = 'Hello';
    component.isTyping = true;
    await component.updateComplete;

    const dialogueText = component.shadowRoot.querySelector('.dialogue-text');

    expect(dialogueText).to.have.text('Hello');
    expect(dialogueText.classList).to.contain('typing');
  });

  it('should remove typing class from .dialogue-text when isTyping is false', async () => {
    component.typingText = 'Hello';
    component.isTyping = true;
    await component.updateComplete;

    component.isTyping = false;
    await component.updateComplete;

    const dialogueText = component.shadowRoot.querySelector('.dialogue-text');

    expect(dialogueText.classList).to.not.contain('typing');
  });
});