import { config } from '../config.js';
import { Point } from './Point.js';
export class Camera {
    static get heigh() {
        return config.graphics.targetResolution.height;
    }
    static get width() {
        return config.graphics.targetResolution.width;
    }
    static _position = { x: 0, y: 0 };
    static get position() {
        return { x: this._position.x, y: this._position.y };
    }
    static follow(target, border) {
        const point1 = Camera._position;
        const point2 = {
            x: target.position.relativeX + target.colliders[0].height / 2 - config.graphics.targetResolution.width / 2,
            y: target.position.relativeY + target.colliders[0].width / 2 - config.graphics.targetResolution.height / 2,
        };
        const distance = Point.distance(point1, point2);
        const speed = distance > 1 ? distance / 10 : 0;
        const nextPos = Point.moveToward(point1, point2, speed);
        if (border) {
            if (nextPos.x > border.xMin && nextPos.x < border.xMax - config.graphics.targetResolution.width) {
                Camera._position.x = nextPos.x;
            }
            if (nextPos.y > border.yMin && nextPos.y < border.yMax - config.graphics.targetResolution.height) {
                Camera._position.y = nextPos.y;
            }
        }
        else {
            Camera._position.x = nextPos.x;
            Camera._position.y = nextPos.y;
        }
    }
}
