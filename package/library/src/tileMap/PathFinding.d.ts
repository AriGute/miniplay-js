import { LeanPoint } from '../collider/BoxCollider';
import { TileBaseType } from './TileSet';
import { Scene } from '../abstract/Scene';
export interface TileScore {
    x: number;
    y: number;
    score: number;
    prevTile: TileScore;
}
export type Path = LeanPoint[];
export declare class PathFinding {
    private static tileMap;
    private static start;
    private static target;
    private static MAX_SIZE_X;
    private static MAX_SIZE_Y;
    private static walkableTiles;
    static a_star(tileMap: TileBaseType[][], walkableTiles: TileBaseType[], normalizedStartPosition: LeanPoint, normalizedTargetPosition: LeanPoint, diagonalPathFinding?: boolean): Path;
    static clearLine(scene: Scene, p1: LeanPoint, p2: LeanPoint, walkableTiles?: TileBaseType[]): boolean;
    private static unNormalizePosition;
    private static isTileOnMap;
    private static isTileWalkable;
    private static calcTileValue;
    static clear(): void;
}
