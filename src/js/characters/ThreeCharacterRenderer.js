/**
 * ThreeCharacterRenderer.js
 * Renders NPC 3D models (FBX) into small canvases for LocationView and
 * ConversationScreen. three.js and the FBX loader are imported lazily so the
 * main bundle does not pay for them until a 3D NPC is actually shown.
 *
 * create3DCharacter() always returns a container element synchronously. If the
 * model cannot be loaded (missing asset, WebGL unavailable) the container gets
 * the `three-character--failed` class so callers/CSS can show a 2D fallback.
 */

export class ThreeCharacterRenderer {
    constructor() {
        /** @type {Map<string, object>} */
        this.instances = new Map();
    }

    /**
     * @param {string} id - NPC id (one live render per id)
     * @param {{path: string, width?: number, height?: number}} options
     * @returns {HTMLDivElement}
     */
    create3DCharacter(id, { path, width = 200, height = 300 } = {}) {
        this.dispose(id);

        const container = document.createElement('div');
        container.className = 'three-character';
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        container.setAttribute('role', 'img');
        container.setAttribute('aria-label', `3D model of ${id}`);

        const state = { container, disposed: false, frame: null, renderer: null, scene: null, mixer: null };
        this.instances.set(id, state);

        if (!path) {
            this._markFailed(state, 'no-model-path');
            return container;
        }

        Promise.all([
            import('three'),
            import('three/examples/jsm/loaders/FBXLoader.js'),
        ])
            .then(([THREE, { FBXLoader }]) => {
                if (state.disposed) return;
                this._setupScene(THREE, FBXLoader, state, path, width, height);
            })
            .catch((error) => {
                console.warn('[ThreeCharacterRenderer] three.js unavailable:', error);
                this._markFailed(state, 'three-unavailable');
            });

        return container;
    }

    _setupScene(THREE, FBXLoader, state, path, width, height) {
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch (error) {
            console.warn('[ThreeCharacterRenderer] WebGL unavailable:', error);
            this._markFailed(state, 'webgl-unavailable');
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        state.renderer = renderer;
        state.container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        state.scene = scene;
        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
        const key = new THREE.DirectionalLight(0xffffff, 1.0);
        key.position.set(2, 4, 3);
        scene.add(key);

        const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        const clock = new THREE.Clock();

        new FBXLoader().load(
            path,
            (object) => {
                if (state.disposed) return;
                // Frame the model: center it and fit its height in view.
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                object.position.sub(center);
                const fitHeight = size.y || 1;
                const distance = fitHeight / (2 * Math.tan((camera.fov * Math.PI) / 360)) * 1.15;
                camera.position.set(0, 0, distance);
                camera.near = distance / 100;
                camera.far = distance * 100;
                camera.updateProjectionMatrix();
                scene.add(object);

                if (object.animations && object.animations.length) {
                    state.mixer = new THREE.AnimationMixer(object);
                    state.mixer.clipAction(object.animations[0]).play();
                }
            },
            undefined,
            (error) => {
                console.warn(`[ThreeCharacterRenderer] Failed to load ${path}:`, error);
                this._markFailed(state, 'load-failed');
            }
        );

        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const tick = () => {
            if (state.disposed) return;
            if (state.mixer && !reduceMotion) state.mixer.update(clock.getDelta());
            renderer.render(scene, camera);
            state.frame = requestAnimationFrame(tick);
        };
        tick();
    }

    _markFailed(state, reason) {
        state.container.classList.add('three-character--failed');
        state.container.dataset.error = reason;
    }

    /** Stop rendering and free GPU resources for one NPC. */
    dispose(id) {
        const state = this.instances.get(id);
        if (!state) return;
        state.disposed = true;
        if (state.frame) cancelAnimationFrame(state.frame);
        state.scene?.traverse((node) => {
            node.geometry?.dispose?.();
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach((m) => m?.dispose?.());
        });
        if (state.renderer) {
            state.renderer.dispose();
            state.renderer.domElement.remove();
        }
        this.instances.delete(id);
    }

    disposeAll() {
        [...this.instances.keys()].forEach((id) => this.dispose(id));
    }
}
