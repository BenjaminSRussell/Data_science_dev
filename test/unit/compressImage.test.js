/**
 * Unit tests for compressImage function
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules before importing the function under test
vi.mock('fs');
vi.mock('sharp');
vi.mock('url', () => ({
    fileURLToPath: vi.fn(() => '/test/scripts/compress-assets-for-git.js')
}));

import { compressImage } from '../../scripts/compress-assets-for-git.js';

import fs from 'fs';
import sharp from 'sharp';

describe('compressImage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should skip files under 100KB without touching sharp', async () => {
        const inputPath = '/test/image.png';
        const smallSize = 50 * 1024; // 50KB

        fs.statSync.mockReturnValue({ size: smallSize });

        const result = await compressImage(inputPath);

        expect(result).toEqual({
            skipped: true,
            reason: 'already small'
        });
        expect(sharp).not.toHaveBeenCalled();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should compress PNG files with successful size reduction', async () => {
        const inputPath = '/test/image.png';
        const originalSize = 200 * 1024; // 200KB
        const compressedSize = 150 * 1024; // 150KB

        fs.statSync.mockReturnValue({ size: originalSize });

        const mockPipelineBuilder = {
            png: vi.fn().mockReturnThis(),
            toBuffer: vi.fn().mockResolvedValue(Buffer.alloc(compressedSize))
        };
        sharp.mockReturnValue(mockPipelineBuilder);

        const result = await compressImage(inputPath);

        expect(result).toEqual({
            success: true,
            original: (originalSize / 1024 / 1024).toFixed(2) + 'MB',
            compressed: (compressedSize / 1024 / 1024).toFixed(2) + 'MB',
            savings: ((originalSize - compressedSize) / originalSize * 100).toFixed(1) + '%'
        });
        expect(sharp).toHaveBeenCalledWith(inputPath);
        expect(mockPipelineBuilder.png).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalledWith(inputPath, Buffer.alloc(compressedSize));
    });

    it('should compress JPEG files with successful size reduction', async () => {
        const inputPath = '/test/image.jpg';
        const originalSize = 300 * 1024; // 300KB
        const compressedSize = 200 * 1024; // 200KB

        fs.statSync.mockReturnValue({ size: originalSize });

        const mockPipelineBuilder = {
            jpeg: vi.fn().mockReturnThis(),
            toBuffer: vi.fn().mockResolvedValue(Buffer.alloc(compressedSize))
        };
        sharp.mockReturnValue(mockPipelineBuilder);

        const result = await compressImage(inputPath);

        expect(result).toEqual({
            success: true,
            original: (originalSize / 1024 / 1024).toFixed(2) + 'MB',
            compressed: (compressedSize / 1024 / 1024).toFixed(2) + 'MB',
            savings: ((originalSize - compressedSize) / originalSize * 100).toFixed(1) + '%'
        });
        expect(sharp).toHaveBeenCalledWith(inputPath);
        expect(mockPipelineBuilder.jpeg).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalledWith(inputPath, Buffer.alloc(compressedSize));
    });

    it('should skip unsupported file formats', async () => {
        const inputPath = '/test/image.gif';
        const originalSize = 200 * 1024; // 200KB

        fs.statSync.mockReturnValue({ size: originalSize });

        const result = await compressImage(inputPath);

        expect(result).toEqual({
            skipped: true,
            reason: 'unsupported format'
        });
        expect(sharp).not.toHaveBeenCalled();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should report error when compressed file exceeds 50MB', async () => {
        const inputPath = '/test/image.png';
        const originalSize = 100 * 1024 * 1024; // 100MB
        const compressedSize = 51 * 1024 * 1024; // 51MB (exceeds limit)

        fs.statSync.mockReturnValue({ size: originalSize });

        const mockPipelineBuilder = {
            png: vi.fn().mockReturnThis(),
            toBuffer: vi.fn().mockResolvedValue(Buffer.alloc(compressedSize))
        };
        sharp.mockReturnValue(mockPipelineBuilder);

        const result = await compressImage(inputPath);

        expect(result).toEqual({
            error: true,
            message: `Compressed file would be ${(compressedSize / 1024 / 1024).toFixed(2)}MB (exceeds 50MB limit)`
        });
        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should skip files when compression does not reduce size', async () => {
        const inputPath = '/test/image.png';
        const originalSize = 200 * 1024; // 200KB
        const compressedSize = 250 * 1024; // 250KB (larger than original)

        fs.statSync.mockReturnValue({ size: originalSize });

        const mockPipelineBuilder = {
            png: vi.fn().mockReturnThis(),
            toBuffer: vi.fn().mockResolvedValue(Buffer.alloc(compressedSize))
        };
        sharp.mockReturnValue(mockPipelineBuilder);

        const result = await compressImage(inputPath);

        expect(result).toEqual({
            skipped: true,
            reason: 'compression did not reduce size'
        });
        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should handle errors thrown by sharp', async () => {
        const inputPath = '/test/image.png';
        const originalSize = 200 * 1024; // 200KB
        const errorMessage = 'Input file is not a valid image';

        fs.statSync.mockReturnValue({ size: originalSize });

        const mockPipelineBuilder = {
            png: vi.fn().mockReturnThis(),
            toBuffer: vi.fn().mockRejectedValue(new Error(errorMessage))
        };
        sharp.mockReturnValue(mockPipelineBuilder);

        const result = await compressImage(inputPath);

        expect(result).toEqual({
            error: true,
            message: errorMessage
        });
        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should support custom output path', async () => {
        const inputPath = '/test/image.png';
        const outputPath = '/output/image.png';
        const originalSize = 200 * 1024; // 200KB
        const compressedSize = 150 * 1024; // 150KB

        fs.statSync.mockReturnValue({ size: originalSize });

        const mockPipelineBuilder = {
            png: vi.fn().mockReturnThis(),
            toBuffer: vi.fn().mockResolvedValue(Buffer.alloc(compressedSize))
        };
        sharp.mockReturnValue(mockPipelineBuilder);

        const result = await compressImage(inputPath, outputPath);

        expect(result.success).toBe(true);
        expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, Buffer.alloc(compressedSize));
    });

    it('should return formatted size and percentage strings for successful compression', async () => {
        const inputPath = '/test/image.png';
        const originalSize = 1024 * 1024; // 1MB
        const compressedSize = 512 * 1024; // 512KB

        fs.statSync.mockReturnValue({ size: originalSize });

        const mockPipelineBuilder = {
            png: vi.fn().mockReturnThis(),
            toBuffer: vi.fn().mockResolvedValue(Buffer.alloc(compressedSize))
        };
        sharp.mockReturnValue(mockPipelineBuilder);

        const result = await compressImage(inputPath);

        expect(result.original).toMatch(/^\d+\.\d{2}MB$/);
        expect(result.compressed).toMatch(/^\d+\.\d{2}MB$/);
        expect(result.savings).toMatch(/^\d+\.\d{1}%$/);
    });
});
