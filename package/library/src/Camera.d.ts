import { GameObject } from './abstract/GameObject';
export declare class Camera {
    static get heigh(): number;
    static get width(): number;
    private static _position;
    static get position(): {
        x: number;
        y: number;
    };
    static follow(target: GameObject): void;
}
