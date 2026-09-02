import { GameAssetLoader } from '../../src/js/assets/GameAssetLoader';

describe('GameAssetLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new GameAssetLoader();
        loader.manifest = {
            characters: [
                { id: 'char1', path: 'path/to/char1.png' },
                { id: 'char2', path: 'path/to/char2.png' }
            ],
            locations: [
                { id: 'loc1', backdrop: 'path/to/loc1.png' },
                { id: 'loc2', backdrop: 'path/to/loc2.png' }
            ],
            icons: {
                items: [
                    { id: 'item1', path: 'path/to/item1.png' },
                    { id: 'item2', path: 'path/to/item2.png' }
                ],
                features: [
                    { id: 'feature1', path: 'path/to/feature1.png' },
                    { id: 'feature2', path: 'path/to/feature2.png' }
                ]
            },
            ui: [
                { id: 'ui1', path: 'path/to/ui1.png' },
                { id: 'ui2', path: 'path/to/ui2.png' }
            ],
            particles: [
                { id: 'particle1', path: 'path/to/particle1.png' },
                { id: 'particle2', path: 'path/to/particle2.png' }
            ],
            maps: [
                { name: 'map1', path: 'path/to/map1.png' },
                { name: 'map2', path: 'path/to/map2.png' }
            ],
            vehicles: [
                { id: 'vehicle1', path: 'path/to/vehicle1.png' },
                { id: 'vehicle2', path: 'path/to/vehicle2.png' }
            ]
        };
    });

    describe('getRandomCharacter', () => {
        it('returns a random character path', () => {
            const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
            expect(loader.getRandomCharacter()).toBe('path/to/char1.png');
            randomSpy.mockRestore();
        });

        it('returns null if characters is absent', () => {
            delete loader.manifest.characters;
            expect(loader.getRandomCharacter()).toBe(null);
        });

        it('returns null if characters is empty', () => {
            loader.manifest.characters = [];
            expect(loader.getRandomCharacter()).toBe(null);
        });
    });

    describe('getCharacter', () => {
        it('returns character path by index', () => {
            expect(loader.getCharacter(0)).toBe('path/to/char1.png');
        });

        it('returns null for out-of-range index', () => {
            expect(loader.getCharacter(2)).toBe(null);
        });
    });

    describe('getLocationBackdrop', () => {
        it('returns a random location backdrop path', () => {
            const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
            expect(loader.getLocationBackdrop('loc1')).toBe('path/to/loc1.png');
            randomSpy.mockRestore();
        });

        it('returns null for unknown location', () => {
            expect(loader.getLocationBackdrop('loc3')).toBe(null);
        });

        it('returns null if locations is empty', () => {
            loader.manifest.locations = [];
            expect(loader.getLocationBackdrop('loc1')).toBe(null);
        });
    });

    describe('getRandomIcon', () => {
        it('returns a random item icon path', () => {
            const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
            expect(loader.getRandomIcon('items')).toBe('path/to/item1.png');
            randomSpy.mockRestore();
        });

        it('returns a random feature icon path', () => {
            const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
            expect(loader.getRandomIcon('features')).toBe('path/to/feature1.png');
            randomSpy.mockRestore();
        });

        it('returns null for unknown type', () => {
            expect(loader.getRandomIcon('unknown')).toBe(null);
        });

        it('returns null if icons is empty', () => {
            loader.manifest.icons.items = [];
            expect(loader.getRandomIcon('items')).toBe(null);
        });
    });

    describe('getIcon', () => {
        it('returns item icon path by index', () => {
            expect(loader.getIcon(0, 'items')).toBe('path/to/item1.png');
        });

        it('returns feature icon path by index', () => {
            expect(loader.getIcon(0, 'features')).toBe('path/to/feature1.png');
        });

        it('returns null for out-of-range index', () => {
            expect(loader.getIcon(2, 'items')).toBe(null);
        });
    });

    describe('getRandomUIElement', () => {
        it('returns a random UI element path', () => {
            const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
            expect(loader.getRandomUIElement()).toBe('path/to/ui1.png');
            randomSpy.mockRestore();
        });

        it('returns null if UI is empty', () => {
            loader.manifest.ui = [];
            expect(loader.getRandomUIElement()).toBe(null);
        });
    });

    describe('getRandomParticle', () => {
        it('returns a random particle path', () => {
            const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
            expect(loader.getRandomParticle()).toBe('path/to/particle1.png');
            randomSpy.mockRestore();
        });

        it('returns null if particles is empty', () => {
            loader.manifest.particles = [];
            expect(loader.getRandomParticle()).toBe(null);
        });
    });

    describe('getMapAsset', () => {
        it('returns map asset path by name', () => {
            expect(loader.getMapAsset('map1')).toBe('path/to/map1.png');
        });

        it('returns null for unknown map', () => {
            expect(loader.getMapAsset('map3')).toBe(null);
        });

        it('returns null if maps is empty', () => {
            loader.manifest.maps = [];
            expect(loader.getMapAsset('map1')).toBe(null);
        });
    });

    describe('getVehicle', () => {
        it('returns vehicle path by index', () => {
            expect(loader.getVehicle(0)).toBe('path/to/vehicle1.png');
        });

        it('returns null for out-of-range index', () => {
            expect(loader.getVehicle(2)).toBe(null);
        });
    });

    describe('loadImage', () => {
        it('resolves to image on load', (done) => {
            const src = 'path/to/image.png';
            const img = {
                onload: null,
                onerror: null,
                src: ''
            };
            global.Image = jest.fn(() => img);

            loader.loadImage(src).then((result) => {
                expect(result).toBe(img);
                done();
            });

            img.onload();
        });

        it('resolves to null on error', (done) => {
            const src = 'path/to/image.png';
            const img = {
                onload: null,
                onerror: null,
                src: ''
            };
            global.Image = jest.fn(() => img);

            loader.loadImage(src).then((result) => {
                expect(result).toBe(null);
                done();
            });

            img.onerror();
        });
    });

    describe('preloadAssets', () => {
        it('crops character preload to 20', () => {
            const origChars = loader.manifest.characters;
            loader.manifest.characters = Array(25).fill({ id: 'char', path: 'path/to/char.png' });
            loader.preloadAssets(30);
            expect(loader.preloadedChars.length).toBe(20);
            loader.manifest.characters = origChars;
        });

        it('crops icon preload to 10', () => {
            const origIcons = loader.manifest.icons.items;
            loader.manifest.icons.items = Array(15).fill({ id: 'icon', path: 'path/to/icon.png' });
            loader.preloadAssets(30);
            expect(loader.preloadedIcons.length).toBe(10);
            loader.manifest.icons.items = origIcons;
        });
    });
});