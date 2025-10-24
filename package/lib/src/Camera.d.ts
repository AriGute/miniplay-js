import { GameObject } from './abstract/GameObject.js';
export interface IBorder {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}
export declare class Camera {
    static get heigh(): number;
    static get width(): number;
    private static _position;
    static get position(): {
        x: number;
        y: number;
    };
    static follow(target: GameObject, border?: IBorder): void;
}
//# sourceMappingURL=Camera.d.ts.map