/**
 * Unit tests for CommonUtils
 */

import { describe, it, expect } from 'vitest';
import { CommonUtils } from '../../src/js/utils/CommonUtils.js';

describe('CommonUtils', () => {
    describe('deepClone', () => {
        it('should deeply clone nested objects', () => {
            const original = { a: { b: 1, c: { d: 2 } } };
            const cloned = CommonUtils.deepClone(original);
            expect(cloned).toEqual(original);
            expect(cloned !== original).toBe(true);
            expect(cloned.a !== original.a).toBe(true);
            expect(cloned.a.c !== original.a.c).toBe(true);
        });

        it('should clone arrays', () => {
            const original = [1, [2, 3], { d: 4 }];
            const cloned = CommonUtils.deepClone(original);
            expect(cloned).toEqual(original);
            expect(cloned !== original).toBe(true);
            expect(cloned[1] !== original[1]).toBe(true);
            expect(cloned[2] !== original[2]).toBe(true);
        });

        it('should clone Date objects', () => {
            const original = new Date();
            const cloned = CommonUtils.deepClone(original);
            expect(cloned instanceof Date).toBe(true);
            expect(cloned.getTime()).toBe(original.getTime());
            expect(cloned !== original).toBe(true);
        });
    });

    describe('deepMerge', () => {
        it('should merge nested objects', () => {
            const target = { a: { b: 1, c: 2 } };
            const source = { a: { b: 99 } };
            const merged = CommonUtils.deepMerge(target, source);
            expect(merged).toEqual({ a: { b: 99, c: 2 } });
            expect(target === merged).toBe(true);
        });

        it('should replace arrays', () => {
            const target = { list: [1, 2, 3] };
            const source = { list: [9] };
            const merged = CommonUtils.deepMerge(target, source);
            expect(merged).toEqual({ list: [9] });
            expect(target === merged).toBe(true);
        });
    });

    describe('get and set', () => {
        it('should get value from nested object', () => {
            const obj = { a: { b: { c: 42 } } };
            const value = CommonUtils.get(obj, 'a.b.c');
            expect(value).toBe(42);
        });

        it('should return default value if path not found', () => {
            const obj = { a: 1 };
            const value = CommonUtils.get(obj, 'a.b.c', 'fallback');
            expect(value).toBe('fallback');
        });

        it('should set value in nested object', () => {
            const obj = {};
            CommonUtils.set(obj, 'x.y.z', 5);
            expect(obj).toEqual({ x: { y: { z: 5 } } });
        });
    });

    describe('groupBy', () => {
        it('should group by string property', () => {
            const array = [
                { id: 1, category: 'A' },
                { id: 2, category: 'B' },
                { id: 3, category: 'A' }
            ];
            const grouped = CommonUtils.groupBy(array, 'category');
            expect(grouped).toEqual({
                A: [{ id: 1, category: 'A' }, { id: 3, category: 'A' }],
                B: [{ id: 2, category: 'B' }]
            });
        });

        it('should group by function selector', () => {
            const array = [
                { id: 1, category: 'A' },
                { id: 2, category: 'B' },
                { id: 3, category: 'A' }
            ];
            const grouped = CommonUtils.groupBy(array, item => item.category);
            expect(grouped).toEqual({
                A: [{ id: 1, category: 'A' }, { id: 3, category: 'A' }],
                B: [{ id: 2, category: 'B' }]
            });
        });
    });

    describe('sortBy', () => {
        it('should sort by ascending order', () => {
            const array = [
                { name: 'Z', age: 25 },
                { name: 'A', age: 15 },
                { name: 'M', age: 20 }
            ];
            const sorted = CommonUtils.sortBy(array, 'age');
            expect(sorted).toEqual([
                { name: 'A', age: 15 },
                { name: 'M', age: 20 },
                { name: 'Z', age: 25 }
            ]);
        });

        it('should sort by descending order', () => {
            const array = [
                { name: 'Z', age: 25 },
                { name: 'A', age: 15 },
                { name: 'M', age: 20 }
            ];
            const sorted = CommonUtils.sortBy(array, 'age', 'desc');
            expect(sorted).toEqual([
                { name: 'Z', age: 25 },
                { name: 'M', age: 20 },
                { name: 'A', age: 15 }
            ]);
        });

        it('should sort by function selector', () => {
            const array = [
                { name: 'Z', age: 25 },
                { name: 'A', age: 15 },
                { name: 'M', age: 20 }
            ];
            const sorted = CommonUtils.sortBy(array, item => item.age);
            expect(sorted).toEqual([
                { name: 'A', age: 15 },
                { name: 'M', age: 20 },
                { name: 'Z', age: 25 }
            ]);
        });

        it('should not mutate original array', () => {
            const array = [
                { name: 'Z', age: 25 },
                { name: 'A', age: 15 },
                { name: 'M', age: 20 }
            ];
            const sorted = CommonUtils.sortBy(array, 'age');
            expect(array).toEqual([
                { name: 'Z', age: 25 },
                { name: 'A', age: 15 },
                { name: 'M', age: 20 }
            ]);
        });
    });

    describe('unique', () => {
        it('should remove duplicates from array of primitives', () => {
            const array = [1, 2, 2, 3, 4, 4, 5];
            const uniqueArray = CommonUtils.unique(array);
            expect(uniqueArray).toEqual([1, 2, 3, 4, 5]);
        });

        it('should remove duplicates from array of objects', () => {
            const array = [
                { id: 1, name: 'A' },
                { id: 2, name: 'B' },
                { id: 1, name: 'A' },
                { id: 3, name: 'C' }
            ];
            const uniqueArray = CommonUtils.unique(array, 'id');
            expect(uniqueArray).toEqual([
                { id: 1, name: 'A' },
                { id: 2, name: 'B' },
                { id: 3, name: 'C' }
            ]);
        });
    });

    describe('isEmpty', () => {
        it('should return true for null/undefined/empty string', () => {
            expect(CommonUtils.isEmpty(null)).toBe(true);
            expect(CommonUtils.isEmpty(undefined)).toBe(true);
            expect(CommonUtils.isEmpty('')).toBe(true);
            expect(CommonUtils.isEmpty(' ')).toBe(true);
        });

        it('should return false for non-empty string', () => {
            expect(CommonUtils.isEmpty('test')).toBe(false);
        });

        it('should return false for number 0', () => {
            expect(CommonUtils.isEmpty(0)).toBe(false);
        });

        it('should return false for boolean false', () => {
            expect(CommonUtils.isEmpty(false)).toBe(false);
        });
    });
});