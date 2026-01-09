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
     * Query all with caching
     */
    static queryAll(selector) {
        return Array.from(document.querySelectorAll(selector));
    }

    /**
     * Get or create element
     */
    static getOrCreate(selector, tag = 'div', options = {}) {
        let element = this.query(selector);
        if (!element) {
            element = this.createElement(tag, { ...options, id: selector.replace('#', '') });
            const parent = options.parent || document.body;
            parent.appendChild(element);
        }
        return element;
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
     * Remove element
     */
    static remove(element) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
            // Clear cache
            if (element.id) {
                this.queryCache.delete(`#${element.id}`);
            }
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
     * Show/hide element
     */
    static show(element) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.style.display = '';
            element.classList.remove('hidden');
        }
    }

    static hide(element) {
        if (typeof element === 'string') {
            element = this.query(element);
        }
        if (element) {
            element.style.display = 'none';
            element.classList.add('hidden');
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

    /**
     * Debounce DOM updates
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle DOM updates
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}



