import { Decorate } from './Decorate';
import { Scene } from './Scene';
import { Point } from '../Point';
import { LeanPoint } from '../../modules/collider/BoxCollider';
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
