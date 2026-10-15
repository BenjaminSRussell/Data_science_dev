/**
 * DOMUtils.js
 * Centralized DOM manipulation utilities
 * Replaces 464 instances of direct DOM manipulation across 41 files
 */

export class DOMUtils {
    /**
     * Create element with attributes
     */
    static createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.id) {
            element.id = options.id;
        }
        
        if (options.textContent) {
            element.textContent = options.textContent;
        }
        
        if (options.innerHTML) {
            element.innerHTML = options.innerHTML;
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.style) {
            Object.assign(element.style, options.style);
        }
        
        if (options.dataset) {
            Object.entries(options.dataset).forEach(([key, value]) => {
                element.dataset[key] = value;
            });
        }
        
        if (options.listeners) {
            Object.entries(options.listeners).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }

        // Child nodes/strings, so callers passing `children` aren't silently dropped (#2462)
        if (Array.isArray(options.children)) {
            options.children.forEach(child => {
                if (child === null || child === undefined || child === false) return;
                element.appendChild(typeof child === 'string' || typeof child === 'number'
                    ? document.createTextNode(String(child))
                    : child);
            });
        }
        
        return element;
    }

    /**
     * Create container with children
     */
    static createContainer(options = {}, ...children) {
        const container = this.createElement('div', options);
        children.forEach(child => {
            if (child) {
                container.appendChild(typeof child === 'string' 
                    ? document.createTextNode(child) 
                    : child
                );
            }
        });
        return container;
    }

    /**
     * Query selector with caching
     */
    static queryCache = new Map();
    
    static query(selector, cache = true) {
        if (cache && this.queryCache.has(selector)) {
            return this.queryCache.get(selector);
        }
        
        const element = document.querySelector(selector);
        if (cache && element) {
            this.queryCache.set(selector, element);
        }
        return element;
    }

    /**
     * Query all elements matching selector
     */
    static queryAll(selector) {
        return Array.from(document.querySelectorAll(selector));
    }

    /**
     * Update element content
     */
    static updateElement(element, updates = {}) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (!element) return;

        if (updates.textContent !== undefined) {
            element.textContent = updates.textContent;
        }
        
        if (updates.innerHTML !== undefined) {
            element.innerHTML = updates.innerHTML;
        }
        
        if (updates.className !== undefined) {
            element.className = updates.className;
        }
        
        if (updates.style) {
            Object.assign(element.style, updates.style);
        }
        
        if (updates.attributes) {
            Object.entries(updates.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (updates.dataset) {
            Object.entries(updates.dataset).forEach(([key, value]) => {
                element.dataset[key] = value;
            });
        }
    }

    /**
     * Clear container
     */
    static clear(container) {
        if (typeof container === 'string') {
            container = this.query(container);
        }
        if (container) {
            container.innerHTML = '';
        }
    }

    /**
     * Toggle classes
     */
    static toggleClass(element, className, force) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.classList.toggle(className, force);
        }
    }

    /**
     * Batch DOM operations
     */
    static batch(operations) {
        const fragment = document.createDocumentFragment();
        operations.forEach(op => {
            if (typeof op === 'function') {
                const element = op();
                if (element) fragment.appendChild(element);
            } else if (op instanceof Node) {
                fragment.appendChild(op);
            }
        });
        return fragment;
    }
}



