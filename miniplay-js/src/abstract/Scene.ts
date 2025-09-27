import { config } from '../../config';
import { GameObject } from './GameObject';
import { Point } from '../Point';
import { BoxCollider } from '../collider/BoxCollider';
import { Input } from '../inputs/Input';
import { Connection } from '../networking/Connection';
import { HostGameUpdateType } from '../networking/ConnectionInterface';
import { TileMap } from '../tileMap/TileMap';
import { ParticleHandler } from '../particleSystem/ParticleHandler';
import { drawLight as drawLight, drawShadow, operationGenerator } from '../LightEffect';
import { UI } from '../UI';
import { Inspector } from '../Inspector';
import { generateId } from '../utils';
import { NetworkGameObject } from './NetworkGameObject';
import { Particles } from '../particleSystem/Particle';
import { LightSource } from './LightSource';
import { AnimationFrames } from './../animations/AnimationFrames';
import { PathFinding } from './../tileMap/PathFinding';

export type NextScene = (scene: Scene) => void;
export enum SceneStates {
	initiate = 'initiate',
	loading = 'loading',
	start = 'start',
	running = 'running',
	destroying = 'destroying',
}
export interface ElementOptions {
	type: string;
	style?: { [key: string]: string };
	styleClass?: string[];
	attributes?: { [key: string | symbol]: string };
	props?: { [key: string]: any };
	child?: Node[];
}

export abstract class Scene {
	private _onstatechange: Function[] = [];
	private nextFrame: number = 0;
	public set onstatechange(func: () => void) {
		this._onstatechange.push(func);
	}

	private _state: SceneStates = SceneStates.initiate;
	public get state(): string {
		return this._state;
	}
	private set state(state: SceneStates) {
		this._state = state;
		this._onstatechange.forEach((f) => f());
	}

	private id: string = generateId();
	private doc: Document;
	private sceneElements: HTMLElement[] = [];
	private static sceneObjectsSet: Map<string, GameObject> = new Map();
	private static detachedGameObjects: Map<string, GameObject> = new Map();
	private drawIntervalId: number = null;
	private skipDelayedFrame: boolean = false;
	private updateIntervalId: number = null;
	private setTimeoutList: number[] = [];
	private setIntervalList: number[] = [];
	private eventListenerList: {
		eventName: string;
		callback: EventListenerOrEventListenerObject;
		options?: boolean | AddEventListenerOptions;
	}[] = [];

	private _tileMap: TileMap = null;
	public get tileMap(): TileMap {
		return this._tileMap;
	}

	private context2d: CanvasRenderingContext2D;
	protected canvas: HTMLCanvasElement;
	protected input: Input;
	protected root: HTMLElement;
	public nextScene: NextScene;
	public static canvasOffSet: { x: number; y: number } = null;

	private deltaTimeAnchor = 0;
	private static _deltaTime = 1;
	public static get deltaTime(): number {
		return Scene._deltaTime;
	}

	abstract onLoad(): void;
	abstract onStart(): void;
	abstract onConnectionLost(): void;

	private handleWindowFocus() {
		this.addEventListener('focus', () => {
			if (config.debugMode.logs.tabFocus) console.log('Tab is focused!');
			this.startUpdating();
			this.startDrawing();
		});
		this.addEventListener('blur', () => {
			if (config.debugMode.logs.tabFocus) console.log('Tab is unfocused!');
			this.stopDrawing();
			this.stopUpdating();
		});
	}

	public start(doc?: Document, nextScene?: NextScene, point?: Point) {
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
		this.state = SceneStates.loading;
		this.onLoad();
		setTimeout(() => {
			if (document.readyState === 'complete') {
				runScene();
			} else {
				document.onreadystatechange = () => {
					if (document.readyState === 'complete') runScene();
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

	public clear(): void {
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

	public element(elementOptions: ElementOptions): HTMLElement {
		const { type, style, styleClass, attributes, props, child } = elementOptions;
		if (!type) return;

		const element: HTMLElement = this.doc.createElement(type);
		style &&
			Object.entries(style).forEach((prop: string[]) => {
				element.style[prop[0]] = prop[1];
			});
		styleClass &&
			styleClass.forEach((style) => {
				element.classList.add(style);
			});
		attributes &&
			Object.entries(attributes).forEach((att: string[]) => {
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

	public addObject(gameObject: GameObject) {
		Scene.detachedGameObjects.delete(gameObject.objectId);
		Scene.sceneObjectsSet.set(gameObject.objectId, gameObject);
	}

	public removeTileMap(): boolean {
		if (this._tileMap) {
			this._tileMap.enable = false;
			this._tileMap = null;
			return true;
		} else {
			return false;
		}
	}

	/**
	 * detach specific gameObjects from the scene logic (stop update function for this object)
	 * and keep a reference at DetachedObject.
	 */
	public removeObject(gameObject: GameObject): boolean {
		Scene.detachedGameObjects.set(gameObject.objectId, gameObject);
		return Scene.sceneObjectsSet.delete(gameObject.objectId);
	}

	/**
	 * remove specific Detached GameObjects from the scene
	 */
	public removeDetachedObject(gameObject: GameObject): boolean {
		return Scene.detachedGameObjects.delete(gameObject.objectId);
	}

	/**
	 * remove all Detached gameObjects from the scene
	 */
	public clearDetachedObject() {
		Scene.detachedGameObjects.clear();
	}

	public addElement(element: HTMLElement | HTMLElement[]) {
		try {
			if (element instanceof Array) {
				if (![...element].every((object) => object ?? false)) {
					throw Error(`one of the gameObjects is nullish.`);
				}
				this.root.append(...element);
			} else if (element instanceof HTMLElement) {
				this.root.appendChild(element);
			} else {
				if (element ?? true) {
					throw Error(`gameObject is nullish.`);
				} else {
					throw Error(`unknown gameObject type.`);
				}
			}
		} catch (error) {
			const msg = `Can't add non-GameObject to a scene.`;
			throw Error(msg + '\n' + error.message);
		}
	}

	public addEventListener(event: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
		this.eventListenerList.push({ eventName: event, callback: callback, options: options });
		this.doc.defaultView.addEventListener(event, callback, options);
	}

	public setTimeout(callback, timeout?): number {
		const setTimeoutId = this.doc.defaultView.setTimeout(callback, timeout);
		this.setTimeoutList.push(setTimeoutId);
		return setTimeoutId;
	}

	public setInterval(callback, timeout?): number {
		const setIntervalId = this.doc.defaultView.setInterval(callback, timeout);
		this.setIntervalList.push(setIntervalId);
		return setIntervalId;
	}

	public clearTimeout(id: number | undefined): void {
		this.doc.defaultView.clearTimeout(id);
	}
	public clearInterval(id: number | undefined): void {
		this.doc.defaultView.clearInterval(id);
	}

	public draw() {
		if (!this.skipDelayedFrame) {
			this.skipDelayedFrame = true;
			this.nextFrame = requestAnimationFrame(() => {
				this.skipDelayedFrame = false;
				this.context2d.fillStyle = config.graphics.backGroundColor;
				this.context2d.fillRect(0, 0, config.graphics.scaledResolution.width, config.graphics.scaledResolution.height);
				this.context2d.globalCompositeOperation = 'source-over';
				// TODO: prepareNextDraw decouple update and draw
				this._tileMap && this._tileMap.prepareNextDraw(this.context2d);
				// this._tileMap &&
				// 	this.context2d.drawImage(
				// 		this._tileMap.backGroundCanvas,
				// 		0,
				// 		0,
				// 		config.graphics.targetResolution.width,
				// 		config.graphics.targetResolution.height,
				// 		0,
				// 		0,
				// 		config.graphics.targetResolution.width,
				// 		config.graphics.targetResolution.height,
				// 	);
				// draw nonsequence gameObjects as background
				GameObject.gameObjectNonSequence?.forEach((object) => {
					if (object.enable) {
						object.draw(this.context2d);
					}
				});

				for (let index = 0; index < GameObject.gameObjectSequence.length; index++) {
					GameObject.gameObjectSequence[index]?.forEach((object) => {
						if (object.enable) {
							if (object instanceof NetworkGameObject) {
								// TODO: drawShadow decouple update and draw
								object.colliders && drawShadow(this.context2d, object.colliders[0]);
							}
							object.draw(this.context2d);
						}
					});
				}
				// TODO: ParticleHandler decouple update and draw
				ParticleHandler.drawParticles(this.context2d);
				if (config.debugMode.drawCollider) {
					BoxCollider.debugMod(this.context2d);
				}
				// TODO: drawLight decouple update and draw
				drawLight(this.context2d);
				this.context2d.drawImage(UI.canvas, 0, 0, config.graphics.targetResolution.width, config.graphics.targetResolution.height);
				config.debugMode.Inspector && Inspector.draw(this.context2d);
			});
		}
	}

	public update() {
		if (Input.getKeyDown('f', this.id)) {
			try {
				this.canvas.requestFullscreen();
			} catch (error) {}
		}
		this.calcDeltaTime();
		UI.update();
		Scene.sceneObjectsSet.forEach((gameObject) => gameObject.enable && gameObject.update());
	}

	protected startDrawing() {
		this.drawIntervalId && this.doc.defaultView.clearInterval(this.drawIntervalId);
		this.drawIntervalId = this.setInterval(() => {
			this.context2d && this.draw();
		}, 1000 / config.graphics.targetScreenRefreshRate);
	}

	protected stopDrawing() {
		this.clearInterval(this.drawIntervalId);
	}

	protected startUpdating() {
		this.updateIntervalId && this.doc.defaultView.clearInterval(this.updateIntervalId);
		this.deltaTimeAnchor = performance.now();
		this.updateIntervalId = this.setInterval(() => {
			this.update();
		}, 1000 / config.targetUpdateTicks);
	}

	protected stopUpdating() {
		this.deltaTimeAnchor = 0;
		Scene._deltaTime = 1;
		this.clearInterval(this.updateIntervalId);
	}

	private subscribeOnClose() {
		Connection.subscribeHostGameUpdate(HostGameUpdateType.stop, this.onConnectionLost.bind(this));
	}

	private calcDeltaTime() {
		Scene._deltaTime = (performance.now() - this.deltaTimeAnchor) / (60 / config.targetUpdateTicks) / 10;
		this.deltaTimeAnchor = performance.now();
	}

	public static getGameObjectById(id: string): GameObject {
		return Scene.sceneObjectsSet.get(id);
	}

	public compareCanvas(target: HTMLCanvasElement) {
		return this.canvas === target;
	}

	public setTileMap(tileMap: TileMap) {
		if (this._tileMap === tileMap) return;
		if (this._tileMap) {
			this._tileMap.enable = false;
		}
		this._tileMap = tileMap;
		BoxCollider.setTileMapCollideFunction(this._tileMap.checkTileMapCollision.bind(this._tileMap));
		this._tileMap.enable = true;
	}

	/**
	 * TODO: check if this work..
	 */
	protected async loadFont(fontName: string, path: string) {
		try {
			const font = new FontFace(fontName, window.location.href + path);
			await font.load();
			this.doc.fonts.add(font);
			console.log('Font loaded');
		} catch (error) {
			console.error('Font loading failed:', error);
		}
	}

	protected setFont(fontName) {
		UI.setFont(fontName);
	}

	protected createGameCanvas(): HTMLCanvasElement {
		this.canvas = this.element({
			type: 'canvas',
			styleClass: ['prevent-select', 'pixelArtStyle'],
		}) as HTMLCanvasElement;
		this.canvas.height = config.graphics.scaledResolution.height;
		this.canvas.width = config.graphics.scaledResolution.width;
		this.context2d = this.canvas.getContext('2d', {
			alpha: true,
			desynchronized: true,
		});
		this.context2d.fillStyle = config.graphics.backGroundColor;
		this.context2d.fillRect(0, 0, config.graphics.scaledResolution.width, config.graphics.scaledResolution.height);
		this.context2d.imageSmoothingEnabled = config.graphics.imageSmoothing;
		this.context2d.imageSmoothingQuality = <ImageSmoothingQuality>config.graphics.imageSmoothingQuality;
		this.context2d.globalCompositeOperation = 'source-over';
		this.context2d.scale(
			config.graphics.scaledResolution.width / config.graphics.targetResolution.width,
			config.graphics.scaledResolution.height / config.graphics.targetResolution.height,
		);
		this.canvas.addEventListener('contextmenu', (event) => {
			event.preventDefault();
		});

		return this.canvas;
	}
}
