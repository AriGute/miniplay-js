import { GameObject } from '../../modules/abstract/GameObject';
import { Point } from '../Point';
import { TileBaseType } from '../../modules/tileMap/TileSet';
type BoxProps = {
    x: number;
    y: number;
    height: number;
    width: number;
};
export type LeanPoint = {
    x: number;
    y: number;
};
export type Size = {
    width: number;
    height: number;
};
export declare class BoxCollider {
    private owner;
    private isCollide;
    private active;
    private _enable;
    private offSetPos;
    set enable(value: boolean);
    get enable(): boolean;
    set isActive(isActive: boolean);
    private static tileMapCollideFunction;
    private _height;
    get height(): number;
    private _width;
    get width(): number;
    private static colliders;
    private static hitBoxColliders;
    constructor(owner: GameObject, width: number, height: number, offSetPos?: Point, active?: boolean);
    get x(): number;
    get y(): number;
    get relativeX(): number;
    get relativeY(): number;
    protected getBoxProps(): BoxProps;
    static debugMod(context2d: CanvasRenderingContext2D): void;
    static checkGlobalBoxCollision(pointToTest: Point, colliders: BoxCollider[], targetBoxCollider?: boolean, ignoreTags?: string[]): GameObject | boolean;
    static checkGlobalCircleCollision(point: Point | LeanPoint, radius: number, targetHitBox?: boolean): GameObject[];
    static checkGlobalPointCollision(pointToTest: Point, targetHitBoxColliders?: boolean, targetActiveBoxCollider?: boolean, tileMapHitTest?: boolean, tileMapFilter?: TileBaseType[]): GameObject | boolean;
    static setTileMapCollideFunction(collideFunction: (PointToTest: any, Size: any) => boolean): void;
    checkCollision(other: BoxCollider, positionToCheck?: LeanPoint): GameObject | boolean;
    private checkPointHit;
    destroy(): void;
    static clear(): void;
}
export {};
