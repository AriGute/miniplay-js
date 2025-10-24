import { Decorate } from './Decorate.js';
import { Scene } from './Scene.js';
import { Point } from '../Point.js';
import { LeanPoint } from '../collider/BoxCollider.js';
export declare abstract class LightSource extends Decorate {
    static sources: Map<string, LightSource>;
    offSet: LeanPoint;
    color: number[];
    range: number;
    protected tick: number;
    protected static lightFlickerRate: number;
    constructor(scene: Scene, point: Point, color?: number[], range?: number, offSet?: LeanPoint);
    protected updateFrameClock(): void;
    static clear(): void;
}
//# sourceMappingURL=LightSource.d.ts.map