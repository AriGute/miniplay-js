import { generateId } from '../utils.js';
import { Point } from '../Point.js';
import { Scene } from './Scene.js';
import { BoxCollider, LeanPoint } from '../collider/BoxCollider.js';
import { RemoteController } from '../networking/RemoteController.js';
import { Connection } from '../networking/Connection.js';
import { Frame } from '../animations/AnimationInterfaces.js';
import { config } from '../../config.js';
import { Path } from '../tileMap/PathFinding.js';
import { Particles } from '../particleSystem/Particle.js';
import { Inspector } from '../Inspector.js';

export interface DataToSend {
	// require
	objectId: string;
	nId?: string;
	tags: string[];
	position: { x: number; y: number };
	// require
	[key: string]: any; // extra data to send
}

export interface DrawProps {
	image: HTMLImageElement;
	sx: number;
	sy: number;
	sWidth?: number;
	sHeight?: number;
	dx?: number;
	dy?: number;
	dWidth?: number;
	dHeight?: number;
}

export abstract class GameObject {
	protected _enable = true;

	public get enable(): boolean {
		return this._enable;
	}

	public set enable(v: boolean) {
		Object.keys(this).forEach((prop) => {
			if (this[prop] instanceof Particles) {
				this[prop].enable = v;
			}
		});
		if (v) {
			if (this._collider) {
				GameObject._gameObjectSequence[this.sequenceIndex].add(this);
			} else {
				GameObject._gameObjectNonSequence.add(this);
			}
		} else {
			if (this._collider) {
				GameObject._gameObjectSequence[this.sequenceIndex].delete(this);
			} else {
				GameObject._gameObjectNonSequence.delete(this);
			}
		}
		this._enable = v;
	}

	// TODO: list of offscreen gameObject so we don't calculate colliders and draw them.
	// private static _offScreenGameObject: Set<GameObject> = new Set();
	private static _gameObjectSequence: Set<GameObject>[] = [];
	private readonly SEQUENCE_SCALE = (config.graphics.scaledResolution.height / config.graphics.targetResolution.height) * 2;
	public static get gameObjectSequence(): Set<GameObject>[] {
		return this._gameObjectSequence;
	}
	private static _gameObjectNonSequence: Set<GameObject> = new Set(); // draw background img (no y axis overlap)
	public static get gameObjectNonSequence(): Set<GameObject> {
		return this._gameObjectNonSequence;
	}

	private sequenceIndex = 0;
	protected scene: Scene = null;
	protected _collider: BoxCollider[] = null;
	protected _hitBoxCollider: BoxCollider[] = null;

	protected _isIdle: boolean = false;
	public get isIdle(): boolean {
		return this._isIdle;
	}

	public get colliders(): BoxCollider[] {
		return this._collider;
	}
	public get hitBoxColliders(): BoxCollider[] {
		return this._hitBoxCollider;
	}

	protected addCollider(collider: BoxCollider, isMainCollider = false) {
		if (!this._collider) {
			this._collider = [];
			this._collider.push(collider);
			GameObject._gameObjectNonSequence.delete(this);
			this.updateObjectSequencePosition(this.position.relativeY);
		} else {
			if (isMainCollider) {
				this._collider = [collider, ...this._collider];
			} else {
				this._collider.push(collider);
			}
		}
	}

	protected clearColliders() {
		[...(this._collider || []), ...(this._hitBoxCollider || [])].forEach((collider) => {
			this.removeCollider(collider);
			collider.enable = false;
		});
	}

	protected removeCollider(colliderToRemove: BoxCollider) {
		if (this._collider) {
			this._collider = this._collider.filter((collider) => collider != colliderToRemove);
			if (this._collider?.length === 0) {
				GameObject._gameObjectSequence[this.sequenceIndex].delete(this);
				GameObject._gameObjectNonSequence.add(this);
			}
		}
	}

	protected _objectId: string;
	public get objectId(): string {
		return this._objectId;
	}

	public readonly remoteController: RemoteController = null;
	private _position: Point = new Point(0, 0);
	public get position(): Point {
		return this._position;
	}

	public set position(point: Point) {
		this.updateObjectSequencePosition(point.relativeY);
		this._position = new Point(point.x, point.y, false, false);
	}

	/**
	 * real position in space (without offsets)
	 */
	public get relativePosition(): LeanPoint {
		return { x: this._position.relativeX, y: this._position.relativeY };
	}

	public get centerPosition(): LeanPoint {
		if (this.colliders[0]) {
			return {
				x: (this.colliders[0].x + this.colliders[0].width / 2) | 0,
				y: (this.colliders[0].y + this.colliders[0].height / 2) | 0,
			};
		} else {
			return null;
		}
	}

	private static gameObjectMap: Map<string, GameObject[]> = new Map();
	private tags: Set<string> = new Set();

	constructor(scene: Scene, point: Point = new Point(0, 0), remoteController: RemoteController = null, gameObjectId: string = generateId()) {
		this.remoteController = remoteController || null;
		this._objectId = gameObjectId;
		this.scene = scene;
		this._position = new Point(point.relativeX, point.relativeY, true);
		GameObject._gameObjectNonSequence.add(this);
	}

	private updateObjectSequencePosition(relativeY: number) {
		let sequenceIndex = this.sequenceIndex;
		if (this?._collider) {
			sequenceIndex = this.normalizeObjectSequencePosition(relativeY);
			let sequenceSet: Set<GameObject> = GameObject._gameObjectSequence[sequenceIndex];
			if (!sequenceSet) {
				sequenceSet = GameObject._gameObjectSequence[sequenceIndex] = new Set();
			}
			if (sequenceSet.has(this)) return;
			GameObject._gameObjectSequence[this.sequenceIndex]?.delete(this);
			this.sequenceIndex = sequenceIndex;
			sequenceSet.add(this);
		}
	}

	private normalizeObjectSequencePosition(y: number): number {
		const centerOffSet = this._collider[0].relativeY + this._collider[0].height;
		return (centerOffSet / this.SEQUENCE_SCALE) | 0;
	}

	protected findPath(target: Point | LeanPoint): Path {
		if (this.scene.tileMap) {
			return this.scene.tileMap.findPath(this.position, target);
		} else {
			console.warn("can't use path finder if the scene don't have tile map.");
		}
		return [];
	}

	public isMe(objectId: string, nId: string) {
		return objectId === this.objectId && this.remoteController && this.remoteController.nId === nId;
	}

	public draw(context2d: CanvasRenderingContext2D): void {
		if (this._enable) {
			const frame: Frame = this.nextDraw(context2d);
			if (frame) {
				context2d.drawImage(
					frame.img,
					frame.frameCut.sourceX,
					frame.frameCut.sourceY,
					frame.frameCut.width,
					frame.frameCut.height,
					this.position.x - frame.frameCut.width / 2,
					this.position.y - frame.frameCut.height / 2,
					frame.frameCut.width,
					frame.frameCut.height,
				);
			}
		}
	}

	public getTags(): string[] {
		return [...this.tags];
	}

	public getDataToSync(): DataToSend {
		const data: DataToSend = {
			objectId: this.objectId,
			nId: (this.remoteController && this.remoteController.nId) || Connection.nId,
			position: {
				x: this.position.relativeX,
				y: this.position.relativeY,
			},
			tags: this.getTags(),
		};
		return data;
	}

	protected addTag(tag: string) {
		if (!GameObject.gameObjectMap.has(tag)) GameObject.gameObjectMap.set(tag, []);
		GameObject.gameObjectMap.get(tag).push(this);
		this.tags.add(tag);
	}

	public hasTag(tag: string) {
		return this.tags.has(tag);
	}

	public static getGameObjectByTag(tag: string): GameObject[] {
		return GameObject.gameObjectMap.get(tag) || [];
	}
	public static getGameObjectById(id: string): GameObject {
		return Scene.getGameObjectById(id);
	}

	public abstract update();
	protected abstract nextDraw(context2d: CanvasRenderingContext2D): Frame;

	/**
	 * stop this.update and this.draw
	 * suppose to make this gameObject eligible for garbage collecting.
	 */
	public destroy() {
		if (this?.scene?.removeObject(this) || this?.scene?.removeDetachedObject(this)) {
			this?.scene?.removeDetachedObject(this);
			this.colliders && this.colliders.forEach((collider) => collider.destroy());
			this.hitBoxColliders && this.hitBoxColliders.forEach((hitBoxCollider) => hitBoxCollider.destroy());
			GameObject._gameObjectSequence[this.sequenceIndex] && GameObject._gameObjectSequence[this.sequenceIndex].delete(this);
			Object.keys(this).forEach((prop) => {
				if (this[prop] instanceof Particles) {
					this[prop].remove();
				}
				this[prop] = undefined;
			});
		}
	}

	public static clear() {
		GameObject._gameObjectNonSequence?.forEach((object) => {
			object.destroy();
		});
		GameObject._gameObjectNonSequence.clear();
		for (let index = 0; index < GameObject._gameObjectSequence.length; index++) {
			GameObject._gameObjectSequence[index]?.forEach((object) => {
				object.destroy();
			});
		}
		GameObject._gameObjectSequence = [];
	}
}
