"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickAble = void 0;
const GameObject_1 = require("../abstract/GameObject");
const config_1 = require("../../config");
class ClickAble extends GameObject_1.GameObject {
    height;
    width;
    owner = null;
    constructor(scene, owner, height, width) {
        super(scene);
        this.owner = owner;
        this.width = width;
        this.height = height;
        this.addTag('clickAble');
    }
    getArea() {
        return {
            x: this.position.relativeX,
            y: this.position.relativeY,
            width: this.width,
            height: this.height,
        };
    }
    update() {
    }
    nextDraw(context2d) {
        if (config_1.config.debugMode.drawClickAbles) {
            context2d.lineWidth = 0.5;
            context2d.strokeStyle = 'gray';
            context2d.strokeRect(this.position.relativeX, this.position.relativeY, this.width, this.height);
        }
        return null;
    }
}
exports.ClickAble = ClickAble;
//# sourceMappingURL=ClickAble.js.map