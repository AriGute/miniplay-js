import { GameObject } from '../abstract/GameObject.js';
import { config } from '../../config.js';
export class ClickAble extends GameObject {
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
        if (config.debugMode.drawClickAbles) {
            context2d.lineWidth = 0.5;
            context2d.strokeStyle = 'gray';
            context2d.strokeRect(this.position.relativeX, this.position.relativeY, this.width, this.height);
        }
        return null;
    }
}
