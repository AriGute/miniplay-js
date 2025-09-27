import { config } from '../config';
import { Camera } from './Camera';
import { LeanPoint } from './collider/BoxCollider';

export interface NormalizedDirection {
	dirX: number;
	dirY: number;
}

export class Point {
	private static get offset(): { x: number; y: number } {
		return {
			x: Camera.position.x,
			y: Camera.position.y,
		};
	}

	private _x: number;

	public get x(): number {
		return this._x - Point.offset.x;
	}

	/**
	 * real X position (without offset)
	 */
	public get relativeX(): number {
		return this._x;
	}

	private _y: number;

	public get y(): number {
		return this._y - Point.offset.y;
	}

	/**
	 * real Y position (without offset)
	 */
	public get relativeY(): number {
		return this._y;
	}

	/**
	 * @param pure ignore Point offset.
	 * @param round round x and y (true by default).
	 */
	constructor(x: number, y: number, pure?: boolean, round: boolean = true) {
		if (pure) {
			this._x = x;
			this._y = y;
		} else {
			this._x = x + Point.offset.x;
			this._y = y + Point.offset.y;
		}
	}

	public static getRandomPoint() {
		return new Point(
			Math.random() * (config.graphics.scaledResolution.width - 50) + 50,
			Math.random() * (config.graphics.scaledResolution.height - 50) + 50,
			true,
		);
	}

	public toJSON() {
		return { x: this.relativeX, y: this.relativeY };
	}

	public distance(other: Point): number {
		return Math.sqrt((this._x - other._x) ** 2 + (this._y - other._y) ** 2);
	}

	public static distance(point1: Point | LeanPoint, point2: Point | LeanPoint): number {
		return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
	}

	/**
	 * give the angle between two points in degrees (0=>180=>-180)
	 */
	public static angle(point1: Point | LeanPoint, point2: Point | LeanPoint) {
		return (Math.atan2(point1.y - point2.y, point1.x - point2.x) * 180) / Math.PI;
	}

	/**
	 * give the angle between two points in degrees, circulate between 0 to 180 (0=>180=>0)
	 */
	public static circularAngle(point1: Point | LeanPoint, point2: Point | LeanPoint) {
		let angle360 = 180 + Point.angle(point1, point2);
		if (angle360 < 180) {
			return angle360;
		} else {
			return 360 - angle360;
		}
	}

	/**
	 * @param p1 shared point for the center of the circle and a straight line
	 * @param p2 second point for the straight line
	 * @param r circle radius
	 * @returns the intersection points for the line with the circle
	 */
	public static getLineAndCircleIntersection(p1: LeanPoint | Point, p2: LeanPoint | Point, r: number): [LeanPoint, LeanPoint] {
		// Line equation: (x2 - x1)t + x1, (y2 - y1)t + y1
		const dx = p2.x - p1.x;
		const dy = p2.y - p1.y;

		// Quadratic coefficients
		const a = dx * dx + dy * dy;
		const b = 2 * (dx * (p1.x - p1.x) + dy * (p1.y - p1.y));
		const c = (p1.x - p1.x) * (p1.x - p1.x) + (p1.y - p1.y) * (p1.y - p1.y) - r * r;

		// Discriminant
		const discriminant = b * b - 4 * a * c;

		if (discriminant < 0) {
			return null; // No intersection
		}

		// Compute t for intersection points
		const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
		const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

		// Intersection points
		const x1 = { x: (dx * t1 + p1.x) | 0, y: (dy * t1 + p1.y) | 0 };
		const x2 = { x: (dx * t2 + p1.x) | 0, y: (dy * t2 + p1.y) | 0 };

		return [x1, x2];
	}

	/**
	 * @sameStraightLineCheck check that p1,p2,p3 are on the same straight line
	 * @returns if p2 is between p1 and p3 (assuming all points are in a straight line)
	 */
	public static isBetweenTwoPoints(p1: LeanPoint | Point, p2: LeanPoint | Point, p3: LeanPoint | Point, sameStraightLineCheck?: boolean): boolean {
		// Check if p2 lies between p1 and p3 in both x and y coordinates
		const isXBetween = (p1.x <= p2.x && p2.x <= p3.x) || (p3.x <= p2.x && p2.x <= p1.x);
		const isYBetween = (p1.y <= p2.y && p2.y <= p3.y) || (p3.y <= p2.y && p2.y <= p1.y);

		if (sameStraightLineCheck) {
			// Check if p1, p2, p3 are collinear using slope comparison
			const collinear = (p3.y - p1.y) * (p2.x - p1.x) === (p2.y - p1.y) * (p3.x - p1.x);
			return isXBetween && isYBetween && collinear;
		} else {
			return isXBetween && isYBetween;
		}
	}

	/**
	 * @param point1 start position
	 * @param point2 target position
	 * @param speed movement speed
	 * @returns next point  point1 toward point2
	 */
	public static moveToward(p1: Point | LeanPoint, p2: Point | LeanPoint, speed): LeanPoint {
		const point1 = p1 instanceof Point ? { x: p1.x, y: p1.y } : p1;
		const point2 = p2 instanceof Point ? { x: p2.x, y: p2.y } : p2;

		// Calculate direction vector
		const dx = point2.x - point1.x;
		const dy = point2.y - point1.y;

		// Calculate magnitude of the direction vector
		const magnitude = Math.sqrt(dx * dx + dy * dy);

		// If point1 is already at point2, return point1
		if (magnitude === 0) {
			return p1;
		}

		// Normalize direction vector
		const normalizedDx = dx / magnitude;
		const normalizedDy = dy / magnitude;

		// Scale by speed
		const scaledDx = normalizedDx * speed;
		const scaledDy = normalizedDy * speed;

		// Update point1's position
		const newX = point1.x + scaledDx;
		const newY = point1.y + scaledDy;

		return { x: newX, y: newY };
	}

	public static getNormalizedDirection(p1: Point | LeanPoint, p2: Point | LeanPoint): NormalizedDirection {
		const point1 = p1 instanceof Point ? { x: p1.x, y: p1.y } : p1;
		const point2 = p2 instanceof Point ? { x: p2.x, y: p2.y } : p2;

		// Calculate direction vector
		const dx = point2.x - point1.x;
		const dy = point2.y - point1.y;

		// Calculate magnitude of the direction vector
		const magnitude = Math.sqrt(dx * dx + dy * dy);

		// Normalize direction vector
		const normalizedDx = dx / magnitude;
		const normalizedDy = dy / magnitude;

		return { dirX: normalizedDx, dirY: normalizedDy };
	}
}
