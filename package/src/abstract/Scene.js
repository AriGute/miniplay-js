import { AnimationFrames, BoxCollider, config, Connection, drawLight, drawShadow, GameObject, generateId, HostGameUpdateType, Input, Inspector, LightSource, NetworkGameObject, ParticleHandler, Particles, PathFinding, UI, } from '../../index.js';
export var SceneStates;
(function (SceneStates) {
    SceneStates["initiate"] = "initiate";
    SceneStates["loading"] = "loading";
    SceneStates["start"] = "start";
    SceneStates["running"] = "running";
    SceneStates["destroying"] = "destroying";
})(SceneStates || (SceneStates = {}));
export class Scene {
    _pause = false;
    set pause(v) {
        this._pause = v;
        if (v) {
            this.stopDrawing();
            this.stopUpdating();
        }
        else {
            this.startUpdating();
            this.startDrawing();
        }
    }
    get pause() {
        return this._pause;
    }
    _onstatechange = [];
    nextFrame = 0;
    set onstatechange(func) {
        this._onstatechange.push(func);
    }
    _state = SceneStates.initiate;
    get state() {
        return this._state;
    }
    set state(state) {
        this._state = state;
        this._onstatechange.forEach((f) => f());
    }
    id = generateId();
    doc;
    sceneElements = [];
    static sceneObjectsSet = new Map();
    static detachedGameObjects = new Map();
    drawIntervalId = null;
    skipDelayedFrame = false;
    updateIntervalId = null;
    setTimeoutList = [];
    setIntervalList = [];
    eventListenerList = [];
    _tileMap = null;
    get tileMap() {
        return this._tileMap;
    }
    context2d;
    canvas;
    input;
    root;
    nextScene;
    static canvasOffSet = null;
    deltaTimeAnchor = 0;
    static _deltaTime = 1;
    static get deltaTime() {
        return Scene._deltaTime;
    }
    handleWindowFocus() {
        this.addEventListener('focus', () => {
            if (config.debugMode.logs.tabFocus)
                console.log('Tab is focused!');
            this.startUpdating();
            this.startDrawing();
        });
        this.addEventListener('blur', () => {
            if (config.debugMode.logs.tabFocus)
                console.log('Tab is unfocused!');
            this.stopDrawing();
            this.stopUpdating();
        });
    }
    start(doc, nextScene, point) {
        this.subscribeOnClose();
        if (config.debugMode) {
            window['scene'] = this;
        }
        this.nextScene = nextScene;
        this.doc = doc || document;
        this.handleWindowFocus();
        this.root = this.element({ type: 'div' });
        this.doc.body.appendChild(this.root);
        this.input = new Input(this);
        Scene.canvasOffSet = point ? { x: point.relativeX, y: point.relativeY } : { x: 0, y: 0 };
        this.addEventListener('resize', (event) => {
            Scene.canvasOffSet = this.canvas && {
                x: this.canvas.getBoundingClientRect().left,
                y: this.canvas.getBoundingClientRect().top,
            };
        });
        const style = this.element({ type: 'style' });
        style.innerHTML = `
			.prevent-select {
				-webkit-user-select: none; 
				-ms-user-select: none; 
				user-select: none;
			}
			canvas.pixelArtStyle {
				image-rendering: -moz-crisp-edges;
				image-rendering: -o-crisp-edges;
				image-rendering: -webkit-optimize-contrast;
				-ms-interpolation-mode: nearest-neighbor;
			}
				`;
        this.addElement(style);
        this.state = SceneStates.loading;
        this.onLoad();
        setTimeout(() => {
            if (document.readyState === 'complete') {
                runScene();
            }
            else {
                document.onreadystatechange = () => {
                    if (document.readyState === 'complete')
                        runScene();
                };
            }
        });
        UI.init();
        const runScene = function () {
            Scene.canvasOffSet = this.canvas && {
                x: this.canvas.getBoundingClientRect().left,
                y: this.canvas.getBoundingClientRect().top,
            };
            this.startUpdating();
            this.startDrawing();
            this.state = SceneStates.start;
            this.onStart();
            this.state = SceneStates.running;
        }.bind(this);
    }
    clear() {
        this.doc.defaultView.cancelAnimationFrame(this.nextFrame);
        this.skipDelayedFrame = true;
        this.stopDrawing();
        this.stopUpdating();
        UI.clear();
        Input.clear();
        ParticleHandler.clear();
        Particles.clear();
        BoxCollider.clear();
        LightSource.clear();
        AnimationFrames.clear();
        PathFinding.clear();
        GameObject.clear();
        Scene.sceneObjectsSet.clear();
        Scene.detachedGameObjects.clear();
        this.state = SceneStates.destroying;
        this._onstatechange = [];
        this.sceneElements.forEach((element) => element.remove());
        this.sceneElements = [];
        this.setTimeoutList.forEach((id) => this.doc.defaultView.clearTimeout(id));
        this.setIntervalList.forEach((id) => this.doc.defaultView.clearInterval(id));
        this.eventListenerList.forEach(({ eventName, callback, options }) => this.doc.defaultView.removeEventListener(eventName, callback, options));
        this.canvas?.remove();
        this.canvas = null;
        this.context2d = null;
    }
    element(elementOptions) {
        const { type, style, styleClass, attributes, props, child } = elementOptions;
        if (!type)
            return;
        const element = this.doc.createElement(type);
        style &&
            Object.entries(style).forEach((prop) => {
                element.style[prop[0]] = prop[1];
            });
        styleClass &&
            styleClass.forEach((style) => {
                element.classList.add(style);
            });
        attributes &&
            Object.entries(attributes).forEach((att) => {
                element.setAttribute(att[0], att[1]);
            });
        props &&
            Object.entries(props).forEach((prop) => {
                element[prop[0]] = prop[1];
            });
        child && element.append(...child.filter((child) => child));
        this.sceneElements.push(element);
        return element;
    }
    addObject(gameObject) {
        Scene.detachedGameObjects.delete(gameObject.objectId);
        Scene.sceneObjectsSet.set(gameObject.objectId, gameObject);
    }
    removeTileMap() {
        if (this._tileMap) {
            this._tileMap.enable = false;
            this._tileMap = null;
            return true;
        }
        else {
            return false;
        }
    }
    removeObject(gameObject) {
        Scene.detachedGameObjects.set(gameObject.objectId, gameObject);
        return Scene.sceneObjectsSet.delete(gameObject.objectId);
    }
    removeDetachedObject(gameObject) {
        return Scene.detachedGameObjects.delete(gameObject.objectId);
    }
    clearDetachedObject() {
        Scene.detachedGameObjects.clear();
    }
    addElement(element) {
        try {
            if (element instanceof Array) {
                if (![...element].every((object) => object ?? false)) {
                    throw Error(`one of the gameObjects is nullish.`);
                }
                this.root.append(...element);
            }
            else if (element instanceof HTMLElement) {
                this.root.appendChild(element);
            }
            else {
                if (element ?? true) {
                    throw Error(`gameObject is nullish.`);
                }
                else {
                    throw Error(`unknown gameObject type.`);
                }
            }
        }
        catch (error) {
            const msg = `Can't add non-GameObject to a scene.`;
            throw Error(msg + '\n' + error.message);
        }
    }
    addEventListener(event, callback, options) {
        this.eventListenerList.push({ eventName: event, callback: callback, options: options });
        this.doc.defaultView.addEventListener(event, callback, options);
    }
    setTimeout(callback, timeout) {
        const setTimeoutId = this.doc.defaultView.setTimeout(callback, timeout);
        this.setTimeoutList.push(setTimeoutId);
        return setTimeoutId;
    }
    setInterval(callback, timeout) {
        const setIntervalId = this.doc.defaultView.setInterval(callback, timeout);
        this.setIntervalList.push(setIntervalId);
        return setIntervalId;
    }
    clearTimeout(id) {
        this.doc.defaultView.clearTimeout(id);
    }
    clearInterval(id) {
        this.doc.defaultView.clearInterval(id);
    }
    draw() {
        if (!this.skipDelayedFrame) {
            this.skipDelayedFrame = true;
            this.nextFrame = requestAnimationFrame(() => {
                this.skipDelayedFrame = false;
                this.context2d.fillStyle = config.graphics.backGroundColor;
                this.context2d.fillRect(0, 0, config.graphics.scaledResolution.width, config.graphics.scaledResolution.height);
                this.context2d.globalCompositeOperation = 'source-over';
                this._tileMap && this._tileMap.prepareNextDraw(this.context2d);
                this._tileMap &&
                    this.context2d.drawImage(this._tileMap.backGroundCanvas, 0, 0, config.graphics.targetResolution.width, config.graphics.targetResolution.height, 0, 0, config.graphics.targetResolution.width, config.graphics.targetResolution.height);
                GameObject.gameObjectNonSequence?.forEach((object) => {
                    if (object.enable) {
                        object.draw(this.context2d);
                    }
                });
                for (let index = 0; index < GameObject.gameObjectSequence.length; index++) {
                    GameObject.gameObjectSequence[index]?.forEach((object) => {
                        if (object.enable) {
                            if (object instanceof NetworkGameObject) {
                                object.colliders && drawShadow(this.context2d, object.colliders[0]);
                            }
                            object.draw(this.context2d);
                        }
                    });
                }
                ParticleHandler.drawParticles(this.context2d);
                if (config.debugMode.drawCollider) {
                    BoxCollider.debugMod(this.context2d);
                }
                drawLight(this.context2d);
                this.context2d.drawImage(UI.canvas, 0, 0, config.graphics.targetResolution.width, config.graphics.targetResolution.height);
                config.debugMode.Inspector && Inspector.draw(this.context2d);
            });
        }
    }
    update() {
        if (Input.getKeyDown('f', this.id)) {
            try {
                this.canvas.requestFullscreen();
            }
            catch (error) { }
        }
        this.calcDeltaTime();
        UI.update();
        Scene.sceneObjectsSet.forEach((gameObject) => gameObject.enable && gameObject.update());
    }
    startDrawing() {
        this.drawIntervalId && this.doc.defaultView.clearInterval(this.drawIntervalId);
        this.drawIntervalId = this.setInterval(() => {
            this.context2d && this.draw();
        }, 1000 / config.graphics.targetScreenRefreshRate);
    }
    stopDrawing() {
        this.clearInterval(this.drawIntervalId);
    }
    startUpdating() {
        this.updateIntervalId && this.doc.defaultView.clearInterval(this.updateIntervalId);
        this.deltaTimeAnchor = performance.now();
        this.updateIntervalId = this.setInterval(() => {
            this.update();
        }, 1000 / config.targetUpdateTicks);
    }
    stopUpdating() {
        this.deltaTimeAnchor = 0;
        Scene._deltaTime = 1;
        this.clearInterval(this.updateIntervalId);
    }
    subscribeOnClose() {
        Connection.subscribeHostGameUpdate(HostGameUpdateType.stop, this.onConnectionLost.bind(this));
    }
    calcDeltaTime() {
        Scene._deltaTime = (performance.now() - this.deltaTimeAnchor) / (60 / config.targetUpdateTicks) / 10;
        this.deltaTimeAnchor = performance.now();
    }
    static getGameObjectById(id) {
        return Scene.sceneObjectsSet.get(id);
    }
    compareCanvas(target) {
        return this.canvas === target;
    }
    setTileMap(tileMap) {
        if (this._tileMap === tileMap)
            return;
        if (this._tileMap) {
            this._tileMap.enable = false;
        }
        this._tileMap = tileMap;
        BoxCollider.setTileMapCollideFunction(this._tileMap.checkTileMapCollision.bind(this._tileMap));
        this._tileMap.enable = true;
    }
    async loadFont(fontName, path) {
        try {
            const font = new FontFace(fontName, window.location.href + path);
            await font.load();
            this.doc.fonts.add(font);
            console.log('Font loaded');
        }
        catch (error) {
            console.error('Font loading failed:', error);
        }
    }
    setFont(fontName) {
        UI.setFont(fontName);
    }
    createGameCanvas() {
        this.canvas = this.element({
            type: 'canvas',
            styleClass: ['prevent-select', 'pixelArtStyle'],
        });
        this.canvas.height = config.graphics.scaledResolution.height;
        this.canvas.width = config.graphics.scaledResolution.width;
        this.context2d = this.canvas.getContext('2d', {
            alpha: true,
            desynchronized: true,
        });
        this.context2d.fillStyle = config.graphics.backGroundColor;
        this.context2d.fillRect(0, 0, config.graphics.scaledResolution.width, config.graphics.scaledResolution.height);
        this.context2d.imageSmoothingEnabled = config.graphics.imageSmoothing;
        this.context2d.imageSmoothingQuality = config.graphics.imageSmoothingQuality;
        this.context2d.globalCompositeOperation = 'source-over';
        this.context2d.scale(config.graphics.scaledResolution.width / config.graphics.targetResolution.width, config.graphics.scaledResolution.height / config.graphics.targetResolution.height);
        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
        return this.canvas;
    }
}
