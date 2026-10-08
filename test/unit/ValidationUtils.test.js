import { describe, it, expect } from 'vitest';
import { ValidationUtils as V } from '../../src/js/utils/ValidationUtils.js';

describe('ValidationUtils (#486)', () => {
    describe('isValidEmail', () => {
        it('accepts a normal address', () => expect(V.isValidEmail('user@example.com')).toBe(true));
        it('rejects a missing @', () => expect(V.isValidEmail('no-at-sign.com')).toBe(false));
        it('rejects a missing domain', () => expect(V.isValidEmail('missing-domain@')).toBe(false));
        it('rejects a missing local part', () => expect(V.isValidEmail('@missing-local.com')).toBe(false));
        it('rejects an internal space', () => expect(V.isValidEmail('a b@example.com')).toBe(false));
        it('is permissive about single-char TLDs', () => expect(V.isValidEmail('a@b.c')).toBe(true));
    });
    describe('isValidUrl', () => {
        it('accepts https', () => expect(V.isValidUrl('https://example.com')).toBe(true));
        it('accepts ftp with a path', () => expect(V.isValidUrl('ftp://example.com/path')).toBe(true));
        it('rejects plain words', () => expect(V.isValidUrl('not a url')).toBe(false));
        it('rejects empty string', () => expect(V.isValidUrl('')).toBe(false));
    });
    describe('isNumber / isInteger', () => {
        it('integers and floats are numbers', () => {
            expect(V.isNumber(42)).toBe(true);
            expect(V.isNumber(3.14)).toBe(true);
        });
        it('NaN is not a number', () => expect(V.isNumber(NaN)).toBe(false));
        it('numeric strings are not numbers', () => expect(V.isNumber('42')).toBe(false));
        it('isInteger', () => {
            expect(V.isInteger(5)).toBe(true);
            expect(V.isInteger(5.5)).toBe(false);
            expect(V.isInteger('5')).toBe(false);
        });
    });
    describe('isPositive / isNonNegative', () => {
        it('zero is not positive but is non-negative', () => {
            expect(V.isPositive(0)).toBe(false);
            expect(V.isNonNegative(0)).toBe(true);
        });
        it('small positive values are positive', () => expect(V.isPositive(0.001)).toBe(true));
        it('negatives and non-numbers fail both', () => {
            for (const v of [-1, '5', null, NaN]) {
                expect(V.isPositive(v)).toBe(false);
                expect(V.isNonNegative(v)).toBe(false);
            }
        });
    });
    describe('isString / isNonEmptyString', () => {
        it('whitespace is a string but not non-empty', () => {
            expect(V.isString('   ')).toBe(true);
            expect(V.isNonEmptyString('   ')).toBe(false);
        });
        it('non-strings', () => {
            expect(V.isString(1)).toBe(false);
            expect(V.isNonEmptyString('x')).toBe(true);
        });
    });
    describe('isArray / isObject / isFunction', () => {
        it('arrays are arrays, not objects', () => {
            expect(V.isArray([1, 2, 3])).toBe(true);
            expect(V.isObject([1, 2, 3])).toBe(false);
        });
        it('null is not an object', () => expect(V.isObject(null)).toBe(false));
        it('plain objects are objects', () => expect(V.isObject({})).toBe(true));
        it('functions', () => {
            expect(V.isFunction(() => {})).toBe(true);
            expect(V.isFunction(function named() {})).toBe(true);
            expect(V.isFunction({})).toBe(false);
        });
    });
    describe('isInRange', () => {
        it('is inclusive at both ends', () => {
            expect(V.isInRange(1, 1, 10)).toBe(true);
            expect(V.isInRange(10, 1, 10)).toBe(true);
        });
        it('rejects values just outside', () => {
            expect(V.isInRange(0.99, 1, 10)).toBe(false);
            expect(V.isInRange(10.01, 1, 10)).toBe(false);
        });
    });
    describe('isRequired', () => {
        it('null / undefined / empty string are missing', () => {
            expect(V.isRequired(null)).toBe(false);
            expect(V.isRequired(undefined)).toBe(false);
            expect(V.isRequired('')).toBe(false);
        });
        it('0 and false count as present', () => {
            expect(V.isRequired(0)).toBe(true);
            expect(V.isRequired(false)).toBe(true);
        });
    });
});
