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

  it('update() re-renders only locations, keeping roads and buildings containers', () => {
    const location = {
      id: 'loc-2',
      name: 'Bank',
      icon: '🏦',
      type: 'bank',
      position: { x: 10, y: 10 },
    };
    game.worldMap.getAccessibleLocations = vi.fn(() => [location]);

    renderer.initialize();

    const roadsContainer = container.querySelector('.city-roads-container');
    const buildingsContainer = container.querySelector('.city-buildings-container');
    const firstLocationsContainer = container.querySelector('.city-locations-container');
    expect(firstLocationsContainer).not.toBeNull();

    renderer.update();

    // Roads and buildings containers are NOT re-created
    expect(container.querySelector('.city-roads-container')).toBe(roadsContainer);
    expect(container.querySelector('.city-buildings-container')).toBe(buildingsContainer);

    // Locations container is re-created
    const secondLocationsContainer = container.querySelector('.city-locations-container');
    expect(secondLocationsContainer).not.toBeNull();
    expect(secondLocationsContainer).not.toBe(firstLocationsContainer);
    expect(secondLocationsContainer.querySelector('.city-location[data-location="loc-2"]')).not.toBeNull();
  });

  function withLocation() {
    game.worldMap.getAccessibleLocations = vi.fn(() => [{
      id: 'loc-resize',
      name: 'Lab',
      icon: 'L',
      type: 'lab',
      position: { x: 4, y: 4 },
    }]);
  }

  function setContainerSize(width, height) {
    Object.defineProperty(container, 'offsetWidth', { configurable: true, value: width });
    Object.defineProperty(container, 'offsetHeight', { configurable: true, value: height });
  }

  it('recomputes tileSize from ResizeObserver and updates grid and building px', () => {
    const observers = [];
    class RecordingResizeObserver {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }
      observe(target) {
        this.target = target;
      }
      disconnect() {
        this.disconnected = true;
      }
    }
    vi.stubGlobal('ResizeObserver', RecordingResizeObserver);
    try {
      withLocation();
      setContainerSize(900, 600);
      renderer.initialize();

      expect(observers).toHaveLength(1);
      expect(observers[0].target).toBe(container);
      expect(renderer.tileSize).toBe(20);

      const grid = container.querySelector('.city-map-grid');
      const buildingsContainer = container.querySelector('.city-buildings-container');
      const roadsContainer = container.querySelector('.city-roads-container');
      const building = container.querySelector('.city-building');
      expect(building.style.width).toBe('40px');
      expect(building.style.height).toBe('40px');

      // Still hidden / zero: do not replace a real measurement with the 600 fallback.
      setContainerSize(0, 0);
      observers[0].callback();
      expect(renderer.tileSize).toBe(20);
      expect(building.style.width).toBe('40px');

      // 1200×900 -> min(40, 30) = 30; buildings are 2 tiles.
      setContainerSize(1200, 900);
      observers[0].callback();
      expect(renderer.tileSize).toBe(30);
      expect(grid.style.backgroundSize).toBe('30px 30px');
      expect(building.style.width).toBe('60px');
      expect(building.style.height).toBe('60px');
      expect(container.querySelector('.city-buildings-container')).toBe(buildingsContainer);
      expect(container.querySelector('.city-roads-container')).toBe(roadsContainer);
      expect(container.querySelector('.city-map-grid')).toBe(grid);

      renderer.destroy();
      expect(observers[0].disconnected).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('does not lock the 600 fallback when initialize runs while the container is hidden', () => {
    const observers = [];
    class RecordingResizeObserver {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', RecordingResizeObserver);
    try {
      withLocation();
      setContainerSize(0, 0);
      renderer.initialize();

      // First paint still uses 600/30 = 20, but the measurement is provisional.
      expect(renderer.tileSize).toBe(20);
      expect(container.querySelector('.city-building').style.width).toBe('40px');

      // Shown at 1500×900 -> min(50, 30) = 30, not the baked-in 20.
      setContainerSize(1500, 900);
      observers[0].callback();
      expect(renderer.tileSize).toBe(30);
      expect(container.querySelector('.city-map-grid').style.backgroundSize).toBe('30px 30px');
      expect(container.querySelector('.city-building').style.width).toBe('60px');
      expect(container.querySelector('.city-building').style.height).toBe('60px');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('updates tileSize on window resize when ResizeObserver is unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    try {
      withLocation();
      setContainerSize(600, 600);
      renderer.initialize();
      expect(renderer.tileSize).toBe(20);

      setContainerSize(300, 300);
      window.dispatchEvent(new Event('resize'));

      expect(renderer.tileSize).toBe(10);
      expect(container.querySelector('.city-building').style.width).toBe('20px');
      expect(container.querySelector('.city-map-grid').style.backgroundSize).toBe('10px 10px');

      renderer.destroy();
      setContainerSize(900, 900);
      window.dispatchEvent(new Event('resize'));
      expect(renderer.tileSize).toBe(10);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
