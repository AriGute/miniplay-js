"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameObject = void 0;
const utils_1 = require("../utils");
const Point_1 = require("../Point");
const Scene_1 = require("./Scene");
const Connection_1 = require("../networking/Connection");
const config_1 = require("../../config");
const Particle_1 = require("../particleSystem/Particle");
class GameObject {
    _enable = true;
    get enable() {
        return this._enable;
    }
    set enable(v) {
        Object.keys(this).forEach((prop) => {
            if (this[prop] instanceof Particle_1.Particles) {
                this[prop].enable = v;
            }
        });
        if (v) {
            if (this._collider) {
                GameObject._gameObjectSequence[this.sequenceIndex].add(this);
            }
            else {
                GameObject._gameObjectNonSequence.add(this);
            }
        }
        else {
            if (this._collider) {
                GameObject._gameObjectSequence[this.sequenceIndex].delete(this);
            }
            else {
                GameObject._gameObjectNonSequence.delete(this);
            }
        }
        this._enable = v;
    }
    static _gameObjectSequence = [];
    SEQUENCE_SCALE = (config_1.config.graphics.scaledResolution.height / config_1.config.graphics.targetResolution.height) * 2;
    static get gameObjectSequence() {
        return this._gameObjectSequence;
    }
    static _gameObjectNonSequence = new Set();
    static get gameObjectNonSequence() {
        return this._gameObjectNonSequence;
    }
    sequenceIndex = 0;
    scene = null;
    _collider = null;
    _hitBoxCollider = null;
    _isIdle = false;
    get isIdle() {
        return this._isIdle;
    }
    get colliders() {
        return this._collider;
    }
    get hitBoxColliders() {
        return this._hitBoxCollider;
    }
    addCollider(collider, isMainCollider = false) {
        if (!this._collider) {
            this._collider = [];
            this._collider.push(collider);
            GameObject._gameObjectNonSequence.delete(this);
            this.updateObjectSequencePosition(this.position.relativeY);
        }
        else {
            if (isMainCollider) {
                this._collider = [collider, ...this._collider];
            }
            else {
                this._collider.push(collider);
            }
        }
    }
    clearColliders() {
        [...(this._collider || []), ...(this._hitBoxCollider || [])].forEach((collider) => {
            this.removeCollider(collider);
            collider.enable = false;
        });
    }
    removeCollider(colliderToRemove) {
        if (this._collider) {
            this._collider = this._collider.filter((collider) => collider != colliderToRemove);
            if (this._collider?.length === 0) {
                GameObject._gameObjectSequence[this.sequenceIndex].delete(this);
                GameObject._gameObjectNonSequence.add(this);
            }
        }
    }
    _objectId;
    get objectId() {
        return this._objectId;
    }
    remoteController = null;
    _position = new Point_1.Point(0, 0);
    get position() {
        return this._position;
    }
    set position(point) {
        this.updateObjectSequencePosition(point.relativeY);
        this._position = new Point_1.Point(point.x, point.y, false, false);
    }
    get relativePosition() {
        return { x: this._position.relativeX, y: this._position.relativeY };
    }
    get centerPosition() {
        if (this.colliders[0]) {
            return {
                x: (this.colliders[0].x + this.colliders[0].width / 2) | 0,
                y: (this.colliders[0].y + this.colliders[0].height / 2) | 0,
            };
        }
        else {
            return null;
        }
    }
    static gameObjectMap = new Map();
    tags = new Set();
    constructor(scene, point = new Point_1.Point(0, 0), remoteController = null, gameObjectId = (0, utils_1.generateId)()) {
        this.remoteController = remoteController || null;
        this._objectId = gameObjectId;
        this.scene = scene;
        this._position = new Point_1.Point(point.relativeX, point.relativeY, true);
        GameObject._gameObjectNonSequence.add(this);
    }
    updateObjectSequencePosition(relativeY) {
        let sequenceIndex = this.sequenceIndex;
        if (this?._collider) {
            sequenceIndex = this.normalizeObjectSequencePosition(relativeY);
            let sequenceSet = GameObject._gameObjectSequence[sequenceIndex];
            if (!sequenceSet) {
                sequenceSet = GameObject._gameObjectSequence[sequenceIndex] = new Set();
            }
            if (sequenceSet.has(this))
                return;
            GameObject._gameObjectSequence[this.sequenceIndex]?.delete(this);
            this.sequenceIndex = sequenceIndex;
            sequenceSet.add(this);
        }
    }
    normalizeObjectSequencePosition(y) {
        const centerOffSet = this._collider[0].relativeY + this._collider[0].height;
        return (centerOffSet / this.SEQUENCE_SCALE) | 0;
    }
    findPath(target) {
        if (this.scene.tileMap) {
            return this.scene.tileMap.findPath(this.position, target);
        }
        else {
            console.warn("can't use path finder if the scene don't have tile map.");
        }
        return [];
    }
    isMe(objectId, nId) {
        return objectId === this.objectId && this.remoteController && this.remoteController.nId === nId;
    }
    draw(context2d) {
        if (this._enable) {
            const frame = this.nextDraw(context2d);
            if (frame) {
                context2d.drawImage(frame.img, frame.frameCut.sourceX, frame.frameCut.sourceY, frame.frameCut.width, frame.frameCut.height, this.position.x - frame.frameCut.width / 2, this.position.y - frame.frameCut.height / 2, frame.frameCut.width, frame.frameCut.height);
            }
        }
    }
    getTags() {
        return [...this.tags];
    }
    getDataToSync() {
        const data = {
            objectId: this.objectId,
            nId: (this.remoteController && this.remoteController.nId) || Connection_1.Connection.nId,
            position: {
                x: this.position.relativeX,
                y: this.position.relativeY,
            },
            tags: this.getTags(),
        };
        return data;
    }
    addTag(tag) {
        if (!GameObject.gameObjectMap.has(tag))
            GameObject.gameObjectMap.set(tag, []);
        GameObject.gameObjectMap.get(tag).push(this);
        this.tags.add(tag);
    }
    hasTag(tag) {
        return this.tags.has(tag);
    }
    static getGameObjectByTag(tag) {
        return GameObject.gameObjectMap.get(tag) || [];
    }
    static getGameObjectById(id) {
        return Scene_1.Scene.getGameObjectById(id);
    }
    destroy() {
        if (this?.scene?.removeObject(this) || this?.scene?.removeDetachedObject(this)) {
            this?.scene?.removeDetachedObject(this);
            this.colliders && this.colliders.forEach((collider) => collider.destroy());
            this.hitBoxColliders && this.hitBoxColliders.forEach((hitBoxCollider) => hitBoxCollider.destroy());
            GameObject._gameObjectSequence[this.sequenceIndex] && GameObject._gameObjectSequence[this.sequenceIndex].delete(this);
            Object.keys(this).forEach((prop) => {
                if (this[prop] instanceof Particle_1.Particles) {
                    this[prop].remove();
                }
                this[prop] = undefined;
            });
        }
    }
    static clear() {
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
exports.GameObject = GameObject;
//# sourceMappingURL=GameObject.js.map