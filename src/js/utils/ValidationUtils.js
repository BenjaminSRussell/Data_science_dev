/**
 * ValidationUtils.js
 * Common validation functions
 */

export class ValidationUtils {
    /**
     * Validate email
     */
    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Validate URL
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate number
     */
    static isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }

    /**
     * Validate integer
     */
    static isInteger(value) {
        return Number.isInteger(value);
    }

    /**
     * Validate positive number
     */
    static isPositive(value) {
        return this.isNumber(value) && value > 0;
    }

    /**
     * Validate non-negative number
     */
    static isNonNegative(value) {
        return this.isNumber(value) && value >= 0;
    }

    /**
     * Validate string
     */
    static isString(value) {
        return typeof value === 'string';
    }

    /**
     * Validate non-empty string
     */
    static isNonEmptyString(value) {
        return this.isString(value) && value.trim().length > 0;
    }

    /**
     * Validate array
     */
    static isArray(value) {
        return Array.isArray(value);
    }

    /**
     * Validate object
     */
    static isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    /**
     * Validate function
     */
    static isFunction(value) {
        return typeof value === 'function';
    }

    /**
     * Validate in range
     */
    static isInRange(value, min, max) {
        return value >= min && value <= max;
    }

    /**
     * Validate required
     */
    static isRequired(value) {
        return value !== null && value !== undefined && value !== '';
    }
}


