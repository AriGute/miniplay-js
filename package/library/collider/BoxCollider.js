"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxCollider = void 0;
const config_1 = require("../../config");
const Point_1 = require("../Point");
const Player_1 = require("../../Scenes/Game/GameObjects/Player");
class BoxCollider {
    owner;
    isCollide = null;
    active;
    _enable = true;
    offSetPos;
    set enable(value) {
        if (value) {
            if (this.active) {
                BoxCollider.colliders.add(this);
            }
            else {
                BoxCollider.hitBoxColliders.add(this);
            }
        }
        else {
            if (this.active) {
                BoxCollider.colliders.delete(this);
            }
            else {
                BoxCollider.hitBoxColliders.delete(this);
            }
        }
        this._enable = value;
    }
    get enable() {
        return this._enable;
    }
    set isActive(isActive) {
        if (isActive) {
            BoxCollider.colliders.delete(this);
            BoxCollider.hitBoxColliders.add(this);
        }
        else {
            BoxCollider.hitBoxColliders.delete(this);
            BoxCollider.colliders.add(this);
        }
        this.active = isActive;
    }
    static tileMapCollideFunction = null;
    _height;
    get height() {
        return this._height;
    }
    _width;
    get width() {
        return this._width;
    }
    static colliders = new Set();
    static hitBoxColliders = new Set();
    constructor(owner, width, height, offSetPos, active = true) {
        this.owner = owner;
        this._height = height;
        this._width = width;
        this.offSetPos = new Point_1.Point(offSetPos.x, offSetPos.y, true);
        this.active = active;
        if (active) {
            BoxCollider.colliders.add(this);
        }
        else {
            BoxCollider.hitBoxColliders.add(this);
        }
    }
    get x() {
        return this.owner.position.x + this.offSetPos.relativeX;
    }
    get y() {
        return this.owner.position.y + this.offSetPos.relativeY;
    }
    get relativeX() {
        return this.owner.position.relativeX + this.offSetPos.relativeY;
    }
    get relativeY() {
        return this.owner.position.relativeY + this.offSetPos.relativeY;
    }
    getBoxProps() {
        return {
            x: this.x,
            y: this.y,
            height: this.height,
            width: this.width,
        };
    }
    static debugMod(context2d) {
        const colliders = [...BoxCollider.colliders, ...BoxCollider.hitBoxColliders];
        for (const collider of colliders) {
            if (collider.enable && collider.owner.enable) {
                context2d.lineWidth = 0.5;
                if (!collider.isCollide) {
                    if (collider.active === true) {
                        context2d.strokeStyle = 'green';
                    }
                    else {
                        context2d.strokeStyle = 'lightgreen';
                    }
                }
                else {
                    if (collider.active === true) {
                        context2d.strokeStyle = 'red';
                    }
                    else {
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
                }
                else {
                    context2d.strokeRect(collider.x, collider.y, collider.width, collider.height);
                }
            }
        }
    }
    static checkGlobalBoxCollision(pointToTest, colliders, targetBoxCollider = false, ignoreTags) {
        if (config_1.config.debugMode.ignoreCollision)
            return null;
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
                    if (collider.isCollide && !ignoreTags.some((tag) => otherGameObjectCollider.owner.hasTag(tag)))
                        return collider.isCollide;
                    collider.isCollide = BoxCollider.tileMapCollideFunction({ x: pointToTest.relativeX, y: pointToTest.relativeY }, { width: collider.width, height: collider.height });
                    if (collider.isCollide)
                        return collider.isCollide;
                }
                else {
                    continue;
                }
            }
        }
        return false;
    }
    static checkGlobalCircleCollision(point, radius, targetHitBox = false) {
        const hits = [];
        for (const otherGameObjectCollider of !targetHitBox ? BoxCollider.colliders : BoxCollider.hitBoxColliders) {
            if (otherGameObjectCollider.owner instanceof Player_1.Player)
                continue;
            if (!otherGameObjectCollider.owner.enable)
                continue;
            const otherCollider = otherGameObjectCollider.getBoxProps();
            const colliderPos = {
                x: (otherCollider.x + otherCollider.width / 2) | 0,
                y: (otherCollider.y + otherCollider.height / 2) | 0,
            };
            const intersectionPoints = Point_1.Point.getLineAndCircleIntersection(point, colliderPos, radius);
            let hit;
            if (intersectionPoints) {
                const pointToTest = intersectionPoints[0];
                if (otherGameObjectCollider.checkPointHit(pointToTest)) {
                    hits.push(otherGameObjectCollider.owner);
                    continue;
                }
                if (Point_1.Point.isBetweenTwoPoints(point, colliderPos, pointToTest)) {
                    hits.push(otherGameObjectCollider.owner);
                    continue;
                }
            }
        }
        return hits;
    }
    static checkGlobalPointCollision(pointToTest, targetHitBoxColliders = true, targetActiveBoxCollider = false, tileMapHitTest = false, tileMapFilter) {
        let hit = null;
        if (targetActiveBoxCollider) {
            for (const otherGameObjectCollider of BoxCollider.colliders) {
                hit = otherGameObjectCollider.checkPointHit(pointToTest);
                if (hit)
                    return hit;
            }
        }
        if (targetHitBoxColliders) {
            for (const otherGameObjectCollider of BoxCollider.hitBoxColliders) {
                hit = otherGameObjectCollider.checkPointHit(pointToTest);
                if (hit)
                    return hit;
            }
        }
        if (tileMapHitTest) {
            hit = BoxCollider.tileMapCollideFunction({
                x: pointToTest.relativeX + config_1.config.graphics.tileMap.tileSize / 2,
                y: pointToTest.relativeY - config_1.config.graphics.tileMap.tileSize / 3,
            }, { width: config_1.config.graphics.tileMap.tileSize, height: config_1.config.graphics.tileMap.tileSize }, tileMapFilter);
        }
        return hit;
    }
    static setTileMapCollideFunction(collideFunction) {
        BoxCollider.tileMapCollideFunction = collideFunction;
    }
    checkCollision(other, positionToCheck) {
        if (other === this)
            return null;
        if (!other.owner.enable)
            return null;
        const otherBox = other.getBoxProps();
        if (positionToCheck.x <= otherBox.x + otherBox.width &&
            positionToCheck.x + this.width >= otherBox.x &&
            positionToCheck.y <= otherBox.y + otherBox.height &&
            positionToCheck.y + this.height >= otherBox.y) {
            return other.owner;
        }
        else {
            return false;
        }
    }
    checkPointHit(pointToTest) {
        if (!this.owner.enable)
            return null;
        const otherBox = this.getBoxProps();
        if (pointToTest.x <= otherBox.x + otherBox.width &&
            pointToTest.x >= otherBox.x &&
            pointToTest.y <= otherBox.y + otherBox.height &&
            pointToTest.y >= otherBox.y) {
            return this.owner;
        }
        else {
            return false;
        }
    }
    destroy() {
        BoxCollider.colliders.delete(this);
        BoxCollider.hitBoxColliders.delete(this);
        Object.keys(this).forEach((prop) => (this[prop] = undefined));
    }
    static clear() {
        BoxCollider.tileMapCollideFunction = null;
        BoxCollider.colliders.clear();
        BoxCollider.hitBoxColliders.clear();
    }
}
exports.BoxCollider = BoxCollider;
//# sourceMappingURL=BoxCollider.js.map