import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
        expect(component).toBeInstanceOf(BaseComponent);
        expect(component.game).toBeNull();
    });

    it('should format money correctly', () => {
        expect(component.formatMoney(1234567)).toBe('$1,234,567');
        expect(component.formatMoney(0)).toBe('$0');
        expect(component.formatMoney(undefined)).toBe('$0');
        expect(component.formatMoney(null)).toBe('$0');
    });

    it('should format number correctly', () => {
        expect(component.formatNumber(9876)).toBe('9,876');
        expect(component.formatNumber(undefined)).toBe('0');
    });

    it('should dispatch game event correctly', () => {
        const received = [];

        component.addEventListener('probe-event', (event) => {
            received.push(event);
        });

        component.dispatchGameEvent('probe-event', { value: 42 });

        expect(received).toHaveLength(1);
        expect(received[0]).toBeInstanceOf(CustomEvent);
        expect(received[0].type).toBe('probe-event');
        expect(received[0].detail.value).toBe(42);
        expect(received[0].bubbles).toBe(true);
        expect(received[0].composed).toBe(true);
    });
});
