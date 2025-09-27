import { LeanPoint } from './collider/BoxCollider';
import { Point } from './Point';
export declare function logger(msg: string, color1?: string, color2?: string): void;
export declare function generateId(): string;
export declare function isNullish(toCheck: any): boolean;
export declare function manhattanDistance(point1: Point | LeanPoint, point2: Point | LeanPoint): number;
