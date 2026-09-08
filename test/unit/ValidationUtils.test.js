/**
 * Unit tests for ValidationUtils
 */

import { describe, it, expect } from 'vitest';
import { ValidationUtils } from '../../src/js/utils/ValidationUtils.js';

describe('ValidationUtils', () => {
    describe('isValidEmail', () => {
        it('should return true for a valid email', () => {
            expect(ValidationUtils.isValidEmail('user@example.com')).toBe(true);
        });

        it('should return false for email without @ sign', () => {
            expect(ValidationUtils.isValidEmail('no-at-sign.com')).toBe(false);
        });

        it('should return false for email missing domain', () => {
            expect(ValidationUtils.isValidEmail('missing-domain@')).toBe(false);
        });

        it('should return false for email missing local part', () => {
            expect(ValidationUtils.isValidEmail('@missing-local.com')).toBe(false);
        });

        it('should return false for email with internal space', () => {
            expect(ValidationUtils.isValidEmail('a b@example.com')).toBe(false);
        });

        it('should return true for single-character TLD (permissive regex)', () => {
            expect(ValidationUtils.isValidEmail('a@b.c')).toBe(true);
        });
    });

    describe('isValidUrl', () => {
        it('should return true for https URL', () => {
            expect(ValidationUtils.isValidUrl('https://example.com')).toBe(true);
        });

        it('should return true for ftp URL with path', () => {
            expect(ValidationUtils.isValidUrl('ftp://example.com/path')).toBe(true);
        });

        it('should return false for plain text', () => {
            expect(ValidationUtils.isValidUrl('not a url')).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(ValidationUtils.isValidUrl('')).toBe(false);
        });
    });

    describe('isNumber', () => {
        it('should return true for integer', () => {
            expect(ValidationUtils.isNumber(42)).toBe(true);
        });

        it('should return true for float', () => {
            expect(ValidationUtils.isNumber(3.14)).toBe(true);
        });

        it('should return false for NaN', () => {
            expect(ValidationUtils.isNumber(NaN)).toBe(false);
        });

        it('should return false for numeric string', () => {
            expect(ValidationUtils.isNumber('42')).toBe(false);
        });
    });

    describe('isInteger', () => {
        it('should return true for integer', () => {
            expect(ValidationUtils.isInteger(5)).toBe(true);
        });

        it('should return false for float', () => {
            expect(ValidationUtils.isInteger(5.5)).toBe(false);
        });

        it('should return false for numeric string', () => {
            expect(ValidationUtils.isInteger('5')).toBe(false);
        });
    });

    describe('isPositive', () => {
        it('should return false for zero', () => {
            expect(ValidationUtils.isPositive(0)).toBe(false);
        });

        it('should return true for small positive number', () => {
            expect(ValidationUtils.isPositive(0.001)).toBe(true);
        });

        it('should return false for negative number', () => {
            expect(ValidationUtils.isPositive(-1)).toBe(false);
        });

        it('should return false for non-number', () => {
            expect(ValidationUtils.isPositive('1')).toBe(false);
        });
    });

    describe('isNonNegative', () => {
        it('should return true for zero', () => {
            expect(ValidationUtils.isNonNegative(0)).toBe(true);
        });

        it('should return true for positive number', () => {
            expect(ValidationUtils.isNonNegative(1)).toBe(true);
        });

        it('should return false for negative number', () => {
            expect(ValidationUtils.isNonNegative(-0.5)).toBe(false);
        });

        it('should return false for non-number', () => {
            expect(ValidationUtils.isNonNegative('0')).toBe(false);
        });
    });

    describe('isString', () => {
        it('should return true for string', () => {
            expect(ValidationUtils.isString('hello')).toBe(true);
        });

        it('should return true for whitespace-only string', () => {
            expect(ValidationUtils.isString('   ')).toBe(true);
        });

        it('should return false for number', () => {
            expect(ValidationUtils.isString(42)).toBe(false);
        });
    });

    describe('isNonEmptyString', () => {
        it('should return true for non-empty string', () => {
            expect(ValidationUtils.isNonEmptyString('hello')).toBe(true);
        });

        it('should return false for whitespace-only string', () => {
            expect(ValidationUtils.isNonEmptyString('   ')).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(ValidationUtils.isNonEmptyString('')).toBe(false);
        });

        it('should return false for non-string', () => {
            expect(ValidationUtils.isNonEmptyString(123)).toBe(false);
        });
    });

    describe('isArray', () => {
        it('should return true for array', () => {
            expect(ValidationUtils.isArray([1, 2, 3])).toBe(true);
        });

        it('should return true for empty array', () => {
            expect(ValidationUtils.isArray([])).toBe(true);
        });

        it('should return false for object', () => {
            expect(ValidationUtils.isArray({ a: 1 })).toBe(false);
        });
    });

    describe('isObject', () => {
        it('should return true for plain object', () => {
            expect(ValidationUtils.isObject({ a: 1 })).toBe(true);
        });

        it('should return false for array', () => {
            expect(ValidationUtils.isObject([1, 2, 3])).toBe(false);
        });

        it('should return false for null', () => {
            expect(ValidationUtils.isObject(null)).toBe(false);
        });

        it('should return false for string', () => {
            expect(ValidationUtils.isObject('str')).toBe(false);
        });
    });

    describe('isFunction', () => {
        it('should return true for arrow function', () => {
            expect(ValidationUtils.isFunction(() => {})).toBe(true);
        });

        it('should return true for named function', () => {
            function named() {}
            expect(ValidationUtils.isFunction(named)).toBe(true);
        });

        it('should return false for plain object', () => {
            expect(ValidationUtils.isFunction({})).toBe(false);
        });
    });

    describe('isInRange', () => {
        it('should return true when value equals min (inclusive)', () => {
            expect(ValidationUtils.isInRange(1, 1, 10)).toBe(true);
        });

        it('should return true when value equals max (inclusive)', () => {
            expect(ValidationUtils.isInRange(10, 1, 10)).toBe(true);
        });

        it('should return true when value is within range', () => {
            expect(ValidationUtils.isInRange(5, 1, 10)).toBe(true);
        });

        it('should return false when value is just below min', () => {
            expect(ValidationUtils.isInRange(0.999, 1, 10)).toBe(false);
        });

        it('should return false when value is just above max', () => {
            expect(ValidationUtils.isInRange(10.001, 1, 10)).toBe(false);
        });
    });

    describe('isRequired', () => {
        it('should return false for null', () => {
            expect(ValidationUtils.isRequired(null)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(ValidationUtils.isRequired(undefined)).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(ValidationUtils.isRequired('')).toBe(false);
        });

        it('should return true for zero', () => {
            expect(ValidationUtils.isRequired(0)).toBe(true);
        });

        it('should return true for false', () => {
            expect(ValidationUtils.isRequired(false)).toBe(true);
        });

        it('should return true for non-empty string', () => {
            expect(ValidationUtils.isRequired('x')).toBe(true);
        });
    });
});
