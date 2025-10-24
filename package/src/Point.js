import { config } from '../config.js';
import { Camera } from './Camera.js';
export class Point {
    static get offset() {
        return {
            x: Camera.position.x,
            y: Camera.position.y,
        };
    }
    _x;
    get x() {
        return this._x - Point.offset.x;
    }
    get relativeX() {
        return this._x;
    }
    _y;
    get y() {
        return this._y - Point.offset.y;
    }
    get relativeY() {
        return this._y;
    }
    constructor(x, y, pure, round = true) {
        if (pure) {
            this._x = x;
            this._y = y;
        }
        else {
            this._x = x + Point.offset.x;
            this._y = y + Point.offset.y;
        }
    }
    static getRandomPoint() {
        return new Point(Math.random() * (config.graphics.scaledResolution.width - 50) + 50, Math.random() * (config.graphics.scaledResolution.height - 50) + 50, true);
    }
    toJSON() {
        return { x: this.relativeX, y: this.relativeY };
    }
    distance(other) {
        return Math.sqrt((this._x - other._x) ** 2 + (this._y - other._y) ** 2);
    }
    static distance(point1, point2) {
        return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
    }
    static angle(point1, point2) {
        return (Math.atan2(point1.y - point2.y, point1.x - point2.x) * 180) / Math.PI;
    }
    static circularAngle(point1, point2) {
        let angle360 = 180 + Point.angle(point1, point2);
        if (angle360 < 180) {
            return angle360;
        }
        else {
            return 360 - angle360;
        }
    }
    static getLineAndCircleIntersection(p1, p2, r) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const a = dx * dx + dy * dy;
        const b = 2 * (dx * (p1.x - p1.x) + dy * (p1.y - p1.y));
        const c = (p1.x - p1.x) * (p1.x - p1.x) + (p1.y - p1.y) * (p1.y - p1.y) - r * r;
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            return null;
        }
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const x1 = { x: (dx * t1 + p1.x) | 0, y: (dy * t1 + p1.y) | 0 };
        const x2 = { x: (dx * t2 + p1.x) | 0, y: (dy * t2 + p1.y) | 0 };
        return [x1, x2];
    }
    static isBetweenTwoPoints(p1, p2, p3, sameStraightLineCheck) {
        const isXBetween = (p1.x <= p2.x && p2.x <= p3.x) || (p3.x <= p2.x && p2.x <= p1.x);
        const isYBetween = (p1.y <= p2.y && p2.y <= p3.y) || (p3.y <= p2.y && p2.y <= p1.y);
        if (sameStraightLineCheck) {
            const collinear = (p3.y - p1.y) * (p2.x - p1.x) === (p2.y - p1.y) * (p3.x - p1.x);
            return isXBetween && isYBetween && collinear;
        }
        else {
            return isXBetween && isYBetween;
        }
    }
    static moveToward(p1, p2, speed) {
        const point1 = p1 instanceof Point ? { x: p1.x, y: p1.y } : p1;
        const point2 = p2 instanceof Point ? { x: p2.x, y: p2.y } : p2;
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude === 0) {
            return p1;
        }
        const normalizedDx = dx / magnitude;
        const normalizedDy = dy / magnitude;
        const scaledDx = normalizedDx * speed;
        const scaledDy = normalizedDy * speed;
        const newX = point1.x + scaledDx;
        const newY = point1.y + scaledDy;
        return { x: Math.round(newX), y: Math.round(newY) };
    }
    static getNormalizedDirection(p1, p2) {
        const point1 = p1 instanceof Point ? { x: p1.x, y: p1.y } : p1;
        const point2 = p2 instanceof Point ? { x: p2.x, y: p2.y } : p2;
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        const normalizedDx = dx / magnitude;
        const normalizedDy = dy / magnitude;
        return { dirX: normalizedDx, dirY: normalizedDy };
    }
}
