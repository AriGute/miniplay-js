import { config } from '../config.js';
import { GameObject } from './abstract/GameObject.js';
import { Point } from './Point.js';

export class Camera {
	public static get heigh(): number {
		return config.graphics.targetResolution.height;
	}

	public static get width(): number {
		return config.graphics.targetResolution.width;
	}

	private static _position: { x: number; y: number } = { x: 0, y: 0 };

	public static get position() {
		return { x: this._position.x, y: this._position.y };
	}

	public static follow(target: GameObject) {
		const point1 = Camera._position;
		const point2 = {
			x: target.position.relativeX + target.colliders[0].height / 2 - config.graphics.targetResolution.width / 2,
			y: target.position.relativeY + target.colliders[0].width / 2 - config.graphics.targetResolution.height / 2,
		};
		const distance = Point.distance(point1, point2);
		const speed = distance > 1 ? distance / 10 : 0;
		const nextPos = Point.moveToward(point1, point2, speed);
		Camera._position.x = nextPos.x;
		Camera._position.y = nextPos.y;
	}
}
