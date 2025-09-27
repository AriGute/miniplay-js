"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Camera = void 0;
const config_1 = require("../config");
const Point_1 = require("./Point");
class Camera {
    static get heigh() {
        return config_1.config.graphics.targetResolution.height;
    }
    static get width() {
        return config_1.config.graphics.targetResolution.width;
    }
    static _position = { x: 0, y: 0 };
    static get position() {
        return { x: this._position.x, y: this._position.y };
    }
    static follow(target) {
        const point1 = Camera._position;
        const point2 = {
            x: target.position.relativeX + target.colliders[0].height / 2 - config_1.config.graphics.targetResolution.width / 2,
            y: target.position.relativeY + target.colliders[0].width / 2 - config_1.config.graphics.targetResolution.height / 2,
        };
        const distance = Point_1.Point.distance(point1, point2);
        const speed = distance > 1 ? distance / 10 : 0;
        const nextPos = Point_1.Point.moveToward(point1, point2, speed);
        Camera._position.x = nextPos.x;
        Camera._position.y = nextPos.y;
    }
}
exports.Camera = Camera;
//# sourceMappingURL=Camera.js.map