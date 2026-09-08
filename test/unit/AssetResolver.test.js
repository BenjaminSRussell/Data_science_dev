import { expect } from 'chai';
import AssetResolver from '../../src/js/utils/AssetResolver';

describe('AssetResolver', () => {
    describe('resolve(assetPath)', () => {
        it('should return fallback path for null assetPath', () => {
            const resolver = new AssetResolver();
            expect(resolver.resolve(null)).to.equal('/assets/icons/ui/info.png');
        });

        it('should return fallback path for undefined assetPath', () => {
            const resolver = new AssetResolver();
            expect(resolver.resolve(undefined)).to.equal('/assets/icons/ui/info.png');
        });

        it('should return fallback path for empty string assetPath', () => {
            const resolver = new AssetResolver();
            expect(resolver.resolve('')).to.equal('/assets/icons/ui/info.png');
        });

        it('should return unchanged path for .svg assetPath', () => {
            const resolver = new AssetResolver();
            expect(resolver.resolve('/assets/icons/ui/info.svg')).to.equal('/assets/icons/ui/info.svg');
        });

        it('should return unchanged path for .png assetPath', () => {
            const resolver = new AssetResolver();
            expect(resolver.resolve('/assets/icons/ui/info.png')).to.equal('/assets/icons/ui/info.png');
        });

        it('should return unchanged path for other extensions', () => {
            const resolver = new AssetResolver();
            expect(resolver.resolve('/assets/icons/ui/info.jpg')).to.equal('/assets/icons/ui/info.jpg');
        });
    });

    describe('withSvgFallback(pngPath)', () => {
        it('should return fallback svg path for null pngPath', () => {
            const resolver = new AssetResolver();
            expect(resolver.withSvgFallback(null)).to.equal('/assets/icons/ui/info.svg');
        });

        it('should return fallback svg path for undefined pngPath', () => {
            const resolver = new AssetResolver();
            expect(resolver.withSvgFallback(undefined)).to.equal('/assets/icons/ui/info.svg');
        });

        it('should return unchanged path for .svg pngPath', () => {
            const resolver = new AssetResolver();
            expect(resolver.withSvgFallback('/assets/icons/ui/info.svg')).to.equal('/assets/icons/ui/info.svg');
        });

        it('should swap .png to .svg for pngPath', () => {
            const resolver = new AssetResolver();
            expect(resolver.withSvgFallback('/assets/icons/ui/info.png')).to.equal('/assets/icons/ui/info.svg');
        });

        it('should return unchanged path for non-.png/.svg extensions', () => {
            const resolver = new AssetResolver();
            expect(resolver.withSvgFallback('/assets/icons/ui/info.jpg')).to.equal('/assets/icons/ui/info.jpg');
        });
    });

    describe('assetExists(url)', () => {
        it('should return true for existing asset', (done) => {
            const resolver = new AssetResolver();
            global.Image = class {
                constructor() {
                    this.onload = () => {};
                    this.onerror = () => {};
                }
            };
            const img = new global.Image();
            img.onload = () => {
                expect(resolver.assetExists('/assets/icons/ui/info.png')).to.be.true;
                done();
            };
            img.onerror = () => {
                done(new Error('Image should have loaded'));
            };
            img.src = '/assets/icons/ui/info.png';
        });

        it('should return false for non-existing asset', (done) => {
            const resolver = new AssetResolver();
            global.Image = class {
                constructor() {
                    this.onload = () => {};
                    this.onerror = () => {};
                }
            };
            const img = new global.Image();
            img.onerror = () => {
                expect(resolver.assetExists('/non-existing-asset.png')).to.be.false;
                done();
            };
            img.onload = () => {
                done(new Error('Image should not have loaded'));
            };
            img.src = '/non-existing-asset.png';
        });
    });
});