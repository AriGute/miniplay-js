import { config } from '../../config';
import { GameObject } from '../../modules/abstract/GameObject';
import { Point } from '../Point';
import { Player } from '../../Scenes/Game/GameObjects/Player';
import { TileBaseType } from '../../modules/tileMap/TileSet';

type BoxProps = { x: number; y: number; height: number; width: number };

export type LeanPoint = { x: number; y: number };
export type Size = { width: number; height: number };

export class BoxCollider {
	private owner: GameObject;
	private isCollide: GameObject | boolean = null;
	private active: boolean;
	private _enable: boolean = true;
	private offSetPos: Point;

	public set enable(value: boolean) {
		if (value) {
			if (this.active) {
				BoxCollider.colliders.add(this);
			} else {
				BoxCollider.hitBoxColliders.add(this);
			}
		} else {
			if (this.active) {
				BoxCollider.colliders.delete(this);
			} else {
				BoxCollider.hitBoxColliders.delete(this);
			}
		}
		this._enable = value;
	}

	public get enable(): boolean {
		return this._enable;
	}

	public set isActive(isActive: boolean) {
		if (isActive) {
			BoxCollider.colliders.delete(this);
			BoxCollider.hitBoxColliders.add(this);
		} else {
			BoxCollider.hitBoxColliders.delete(this);
			BoxCollider.colliders.add(this);
		}
		this.active = isActive;
	}

	private static tileMapCollideFunction: (position: LeanPoint, size: Size, customTileFilter?: TileBaseType[]) => boolean = null;

	private _height: number;
	public get height(): number {
		return this._height;
	}

	private _width: number;
	public get width(): number {
		return this._width;
	}

	private static colliders: Set<BoxCollider> = new Set();
	private static hitBoxColliders: Set<BoxCollider> = new Set();

	/**
	 * @param active - active: colliding hit box, non-active: target passive hit boxes (non-colliding borders)
	 */
	constructor(owner: GameObject, width: number, height: number, offSetPos?: Point, active: boolean = true) {
		this.owner = owner;
		this._height = height;
		this._width = width;
		this.offSetPos = new Point(offSetPos.x, offSetPos.y, true);
		this.active = active;
		if (active) {
			BoxCollider.colliders.add(this);
		} else {
			BoxCollider.hitBoxColliders.add(this);
		}
	}

	public get x(): number {
		return this.owner.position.x + this.offSetPos.relativeX;
	}

	public get y(): number {
		return this.owner.position.y + this.offSetPos.relativeY;
	}

	public get relativeX(): number {
		return this.owner.position.relativeX + this.offSetPos.relativeY;
	}

	public get relativeY(): number {
		return this.owner.position.relativeY + this.offSetPos.relativeY;
	}

	protected getBoxProps(): BoxProps {
		return {
			x: this.x,
			y: this.y,
			height: this.height,
			width: this.width,
		};
	}

	public static debugMod(context2d: CanvasRenderingContext2D) {
		const colliders = [...BoxCollider.colliders, ...BoxCollider.hitBoxColliders];
		for (const collider of colliders) {
			if (collider.enable && collider.owner.enable) {
				context2d.lineWidth = 0.5;
				if (!collider.isCollide) {
					if (collider.active === true) {
						context2d.strokeStyle = 'green';
					} else {
						context2d.strokeStyle = 'lightgreen';
					}
				} else {
					if (collider.active === true) {
						context2d.strokeStyle = 'red';
					} else {
						context2d.strokeStyle = 'orange';
					}
				}

				if (!collider.active) {
					context2d.font = 'bold 5px Arial';
					if (collider.owner.remoteController) {
						context2d.fillStyle = 'gray';
						context2d.fillText(collider.owner.remoteController.nId, collider.x, collider.y - 7);
					}
					context2d.fillStyle = 'black';
					context2d.fillText(collider.owner.objectId, collider.x, collider.y - 2);
					context2d.fillText(`x : ${Math.round(collider.owner.position.relativeX)}`, collider.x, collider.y + collider.height + 5);
					context2d.fillText(`y : ${Math.round(collider.owner.position.relativeY)}`, collider.x, collider.y + collider.height + 10);
					context2d.strokeRect(collider.x, collider.y, collider.width, collider.height);
				} else {
					context2d.strokeRect(collider.x, collider.y, collider.width, collider.height);
				}
			}
		}
	}

	/**
	 * @param pointToTest check if given point in space is hitting any collider
	 * @param colliders the object that is checking the point (e.g. player next move need a point and collider hight and width)
	 * @param targetHitBox target passive hit boxes (non-colliding borders)
	 * @param ignoreTags ignore colliders that have SOME of the ignoreTags items.
	 * @returns if the point + collider hight and width is hitting other collider then return other collider.owner references,
	 *  		if hitting a wall on the tile map then return true,
	 *  		else return false.
	 */
	public static checkGlobalBoxCollision(
		pointToTest: Point,
		colliders: BoxCollider[],
		targetBoxCollider: boolean = false,
		ignoreTags?: string[],
	): GameObject | boolean {
		if (config.debugMode.ignoreCollision) return null;
		for (const otherGameObjectCollider of !targetBoxCollider ? BoxCollider.colliders : BoxCollider.hitBoxColliders) {
			for (let i = 0; i < colliders.length; i++) {
				const collider = colliders[i];
				if (collider.active) {
					const positionToCheck = pointToTest
						? {
								x: pointToTest.x + collider.offSetPos.relativeX,
								y: pointToTest.y + collider.offSetPos.relativeY,
						  }
						: { x: collider.x, y: collider.y };

					collider.isCollide = collider.checkCollision(otherGameObjectCollider, positionToCheck);
					if (collider.isCollide && !ignoreTags.some((tag) => otherGameObjectCollider.owner.hasTag(tag))) return collider.isCollide;

					collider.isCollide = BoxCollider.tileMapCollideFunction(
						{ x: pointToTest.relativeX, y: pointToTest.relativeY },
						{ width: collider.width, height: collider.height },
					);
					if (collider.isCollide) return collider.isCollide;
				} else {
					continue;
				}
			}
		}
		return false;
	}

	/**
	 * @param point center of the circle
	 * @param radius radius of the circle
	 * @param targetHitBox target passive hit boxes (non-colliding borders)
	 * @returns if circle is collide with any box collider
	 */
	public static checkGlobalCircleCollision(point: Point | LeanPoint, radius: number, targetHitBox: boolean = false): GameObject[] {
		const hits = [];
		for (const otherGameObjectCollider of !targetHitBox ? BoxCollider.colliders : BoxCollider.hitBoxColliders) {
			if (otherGameObjectCollider.owner instanceof Player) continue;
			if (!otherGameObjectCollider.owner.enable) continue;
			const otherCollider = otherGameObjectCollider.getBoxProps();
			const colliderPos = {
				x: (otherCollider.x + otherCollider.width / 2) | 0,
				y: (otherCollider.y + otherCollider.height / 2) | 0,
			};

			const intersectionPoints = Point.getLineAndCircleIntersection(point, colliderPos, radius);
			let hit;
			if (intersectionPoints) {
				const pointToTest = intersectionPoints[0];
				if (otherGameObjectCollider.checkPointHit(pointToTest)) {
					hits.push(otherGameObjectCollider.owner);
					continue;
				}
				if (Point.isBetweenTwoPoints(point, colliderPos, pointToTest)) {
					hits.push(otherGameObjectCollider.owner);
					continue;
				}
			}
		}
		return hits;
	}

	/**
	 * @param pointToTest check if given point in space is hitting any collider.
	 * @param targetHitBoxColliders target passive hit boxes (non-colliding borders)
	 * @param targetActiveBoxCollider target active hit boxes (colliding borders)
	 * @param tileMapHitTest check if point hit a wall on the tile map (false by default)
	 * @returns if point is in the boundaries of any collider then return the collider.owner reference, else return null.
	 */
	public static checkGlobalPointCollision(
		pointToTest: Point,
		targetHitBoxColliders: boolean = true,
		targetActiveBoxCollider: boolean = false,
		tileMapHitTest: boolean = false,
		tileMapFilter?: TileBaseType[],
	): GameObject | boolean {
		let hit = null;
		if (targetActiveBoxCollider) {
			for (const otherGameObjectCollider of BoxCollider.colliders) {
				hit = otherGameObjectCollider.checkPointHit(pointToTest);
				if (hit) return hit;
			}
		}

		if (targetHitBoxColliders) {
			for (const otherGameObjectCollider of BoxCollider.hitBoxColliders) {
				hit = otherGameObjectCollider.checkPointHit(pointToTest);
				if (hit) return hit;
			}
		}

		if (tileMapHitTest) {
			hit = BoxCollider.tileMapCollideFunction(
				{
					x: pointToTest.relativeX + config.graphics.tileMap.tileSize / 2,
					y: pointToTest.relativeY - config.graphics.tileMap.tileSize / 3,
				},
				{ width: config.graphics.tileMap.tileSize, height: config.graphics.tileMap.tileSize },
				tileMapFilter,
			);
		}
		return hit;
	}

	public static setTileMapCollideFunction(collideFunction: (PointToTest, Size) => boolean) {
		BoxCollider.tileMapCollideFunction = collideFunction;
	}

	public checkCollision(other: BoxCollider, positionToCheck?: LeanPoint): GameObject | boolean {
		if (other === this) return null;
		if (!other.owner.enable) return null;
		const otherBox = other.getBoxProps();
		if (
			positionToCheck.x <= otherBox.x + otherBox.width &&
			positionToCheck.x + this.width >= otherBox.x &&
			positionToCheck.y <= otherBox.y + otherBox.height &&
			positionToCheck.y + this.height >= otherBox.y
		) {
			// Collision detected!
			return other.owner;
		} else {
			// No collision
			return false;
		}
	}

	private checkPointHit(pointToTest: LeanPoint) {
		if (!this.owner.enable) return null;
		const otherBox = this.getBoxProps();
		if (
			pointToTest.x <= otherBox.x + otherBox.width &&
			pointToTest.x >= otherBox.x &&
			pointToTest.y <= otherBox.y + otherBox.height &&
			pointToTest.y >= otherBox.y
		) {
			// Collision detected!
			return this.owner;
		} else {
			// No collision
			return false;
		}
	}

	/**
	 * suppose to make this gameObject eligible for garbage collecting.
	 */
	public destroy() {
		BoxCollider.colliders.delete(this);
		BoxCollider.hitBoxColliders.delete(this);
		Object.keys(this).forEach((prop) => (this[prop] = undefined));
	}

	public static clear() {
		BoxCollider.tileMapCollideFunction = null;
		BoxCollider.colliders.clear();
		BoxCollider.hitBoxColliders.clear();
	}
}
