import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CityMapRenderer } from '../../src/js/game/CityMapRenderer.js';

describe('CityMapRenderer', () => {
  let container;
  let game;
  let renderer;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    game = {
      worldMap: {
        getAccessibleLocations: vi.fn(() => []),
        getCurrentLocation: vi.fn(() => null),
        currentLocation: null,
      },
      handleTravel: vi.fn(),
    };
    renderer = new CityMapRenderer(container, game);
  });

  it('initialize() is idempotent: second call is guarded by this.rendered', () => {
    renderer.initialize();
    const childCount = container.children.length;
    const innerHTML = container.innerHTML;

    renderer.initialize();

    expect(renderer.rendered).toBe(true);
    expect(container.children.length).toBe(childCount);
    expect(container.innerHTML).toBe(innerHTML);
  });

  it('computes tileSize as Math.min(containerWidth/30, containerHeight/30)', () => {
    Object.defineProperty(container, 'offsetWidth', { value: 900, configurable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 600, configurable: true });

    renderer.initialize();

    // min(900/30, 600/30) = min(30, 20) = 20
    expect(renderer.tileSize).toBe(20);
  });

  it('renders the exact road hierarchy with correct classes and heights', () => {
    renderer.initialize();

    const roadsContainer = container.querySelector('.city-roads-container');
    expect(roadsContainer).not.toBeNull();

    // Main horizontal: y = 6, 12, 18, 24 -> 4
    const mainHorizontal = roadsContainer.querySelectorAll('.city-road-main.city-road-horizontal');
    expect(mainHorizontal.length).toBe(4);

    // Main vertical: x = 6, 12, 18, 24 -> 4
    const mainVertical = roadsContainer.querySelectorAll('.city-road-main.city-road-vertical');
    expect(mainVertical.length).toBe(4);

    // Secondary horizontal: y = 3, 9, 15, 21, 27 -> 5
    const secondaryHorizontal = roadsContainer.querySelectorAll('.city-road-secondary.city-road-horizontal');
    expect(secondaryHorizontal.length).toBe(5);

    // Secondary vertical: x = 3, 9, 15, 21, 27 -> 5
    const secondaryVertical = roadsContainer.querySelectorAll('.city-road-secondary.city-road-vertical');
    expect(secondaryVertical.length).toBe(5);

    // renderRoad: main horizontal at position 6 -> height 3.5%
    const mainRoad = roadsContainer.querySelector('.city-road-main.city-road-horizontal');
    expect(mainRoad.style.height).toBe('3.5%');
    expect(mainRoad.style.top).toBe(`${(6 / 30) * 100}%`);

    // renderRoad: secondary horizontal at position 3 -> height 2%
    const secondaryRoad = roadsContainer.querySelector('.city-road-secondary.city-road-horizontal');
    expect(secondaryRoad.style.height).toBe('2%');
    expect(secondaryRoad.style.top).toBe(`${(3 / 30) * 100}%`);
  });

  it('renderBuildings() and renderLocations() return early when game.worldMap is undefined', () => {
    const noWorldGame = { handleTravel: vi.fn() };
    const noWorldRenderer = new CityMapRenderer(container, noWorldGame);

    noWorldRenderer.renderBuildings();
    noWorldRenderer.renderLocations();

    expect(container.querySelector('.city-buildings-container')).toBeNull();
    expect(container.querySelector('.city-locations-container')).toBeNull();
    expect(container.children.length).toBe(0);
  });

  it('clicking a location marker calls game.handleTravel with the id and stops propagation', () => {
    const location = {
      id: 'loc-1',
      name: 'Coffee Shop',
      icon: '☕',
      type: 'coffee_shop',
      position: { x: 5, y: 7 },
    };
    game.worldMap.getAccessibleLocations = vi.fn(() => [location]);

    renderer.initialize();

    const marker = container.querySelector('.city-location[data-location="loc-1"]');
    expect(marker).not.toBeNull();

    const event = new MouseEvent('click', { bubbles: true });
    marker.dispatchEvent(event);

    expect(game.handleTravel).toHaveBeenCalledTimes(1);
    expect(game.handleTravel).toHaveBeenCalledWith('loc-1');
    expect(event.defaultPrevented).toBe(false); // stopPropagation, not preventDefault
  });

  it('update() initializes when not rendered', () => {
    expect(renderer.rendered).toBe(false);

    renderer.update();

    expect(renderer.rendered).toBe(true);
    expect(container.querySelector('.city-roads-container')).not.toBeNull();
    expect(container.querySelector('.city-buildings-container')).not.toBeNull();
  });

  it('update() rebuilds zones, roads, buildings, and location markers', async () => {
    const { ZONE_DEFINITIONS } = await import('../../src/js/data/mapZones.js');
    const location = {
      id: 'loc-2',
      name: 'Bank',
      icon: '🏦',
      type: 'bank',
      position: { x: 10, y: 10 },
    };
    game.worldMap.getAccessibleLocations = vi.fn(() => [location]);

    renderer.initialize();
    await vi.waitFor(() => {
      expect(container.querySelectorAll('.city-zone').length).toBe(ZONE_DEFINITIONS.length);
    });

    const zonesContainer = container.querySelector('.city-zones-container');
    const roadsContainer = container.querySelector('.city-roads-container');
    const buildingsContainer = container.querySelector('.city-buildings-container');
    const firstLocationsContainer = container.querySelector('.city-locations-container');
    const background = container.querySelector('.city-map-background');
    const grid = container.querySelector('.city-map-grid');
    expect(zonesContainer).not.toBeNull();
    expect(roadsContainer).not.toBeNull();
    expect(buildingsContainer).not.toBeNull();
    expect(firstLocationsContainer).not.toBeNull();
    expect(buildingsContainer.querySelectorAll('.city-building').length).toBe(1);

    const unlocked = {
      id: 'loc-3',
      name: 'Lab',
      icon: '🧪',
      type: 'lab',
      position: { x: 12, y: 8 },
    };
    game.worldMap.getAccessibleLocations = vi.fn(() => [location, unlocked]);

    renderer.update();
    await vi.waitFor(() => {
      const zones = container.querySelector('.city-zones-container');
      expect(zones).not.toBe(zonesContainer);
      expect(zones.querySelectorAll('.city-zone').length).toBe(ZONE_DEFINITIONS.length);
    });

    const nextZones = container.querySelector('.city-zones-container');
    const nextRoads = container.querySelector('.city-roads-container');
    const nextBuildings = container.querySelector('.city-buildings-container');
    const secondLocationsContainer = container.querySelector('.city-locations-container');

    expect(container.querySelectorAll('.city-zones-container').length).toBe(1);
    expect(container.querySelectorAll('.city-roads-container').length).toBe(1);
    expect(container.querySelectorAll('.city-buildings-container').length).toBe(1);
    expect(container.querySelectorAll('.city-locations-container').length).toBe(1);

    expect(nextZones).not.toBe(zonesContainer);
    expect(nextRoads).not.toBe(roadsContainer);
    expect(nextBuildings).not.toBe(buildingsContainer);
    expect(secondLocationsContainer).not.toBe(firstLocationsContainer);

    // Static chrome is not part of the dynamic layer set.
    expect(container.querySelector('.city-map-background')).toBe(background);
    expect(container.querySelector('.city-map-grid')).toBe(grid);

    expect(nextZones.querySelectorAll('.city-zone').length).toBe(ZONE_DEFINITIONS.length);
    expect(nextRoads.querySelectorAll('.city-road').length).toBe(18);
    expect(nextBuildings.querySelectorAll('.city-building').length).toBe(2);
    expect(nextBuildings.querySelector('.city-building-lab')).not.toBeNull();
    expect(nextBuildings.querySelector('.city-building-bank')).not.toBeNull();
    expect(secondLocationsContainer.querySelector('.city-location[data-location="loc-2"]')).not.toBeNull();
    expect(secondLocationsContainer.querySelector('.city-location[data-location="loc-3"]')).not.toBeNull();
  });
});
