import { Frame } from '../animations/AnimationInterfaces';
import { GameObject } from '../abstract/GameObject';
export declare class ClickAble extends GameObject {
    height: number;
    width: number;
    readonly owner: GameObject;
    constructor(scene: any, owner: any, height: number, width: number);
    getArea(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    update(): void;
    protected nextDraw(context2d: CanvasRenderingContext2D): Frame;
}
