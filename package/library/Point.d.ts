import { LeanPoint } from './collider/BoxCollider';
export interface NormalizedDirection {
    dirX: number;
    dirY: number;
}
export declare class Point {
    private static get offset();
    private _x;
    get x(): number;
    get relativeX(): number;
    private _y;
    get y(): number;
    get relativeY(): number;
    constructor(x: number, y: number, pure?: boolean, round?: boolean);
    static getRandomPoint(): Point;
    toJSON(): {
        x: number;
        y: number;
    };
    distance(other: Point): number;
    static distance(point1: Point | LeanPoint, point2: Point | LeanPoint): number;
    static angle(point1: Point | LeanPoint, point2: Point | LeanPoint): number;
    static circularAngle(point1: Point | LeanPoint, point2: Point | LeanPoint): number;
    static getLineAndCircleIntersection(p1: LeanPoint | Point, p2: LeanPoint | Point, r: number): [LeanPoint, LeanPoint];
    static isBetweenTwoPoints(p1: LeanPoint | Point, p2: LeanPoint | Point, p3: LeanPoint | Point, sameStraightLineCheck?: boolean): boolean;
    static moveToward(p1: Point | LeanPoint, p2: Point | LeanPoint, speed: any): LeanPoint;
    static getNormalizedDirection(p1: Point | LeanPoint, p2: Point | LeanPoint): NormalizedDirection;
}
