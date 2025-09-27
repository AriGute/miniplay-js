import { Scene } from '../abstract/Scene';
import { Frame } from '../animations/AnimationInterfaces';
import { Point } from '../Point';
import { LeanPoint, Size } from '../../modules/collider/BoxCollider';
import { Path } from './PathFinding';
import { TileSet, TileBaseType } from './TileSet';
import { GameObject } from '../../modules/abstract/GameObject';
export interface TileMapData {
    _startPoint: LeanPoint;
    _endPoint: LeanPoint;
    rooms: Room[];
    tileMap: TileBaseType[][];
    maxX: number;
    maxY: number;
}
export interface RandomTileMapConfig {
    maxPaths: number;
    minRoomSize: number;
    maxRoomsSize: number;
    numOfRooms: number;
    roomsBorder: boolean;
    islands: boolean;
    islandsSize: number;
    fillVoid: boolean;
    river: boolean;
}
export interface Room {
    paths: Path[];
    pos: LeanPoint;
    size: number;
}
export declare abstract class TileMap {
    protected _objectId: string;
    get objectId(): string;
    protected abstract _relatedObjects: GameObject[];
    get relatedObjects(): GameObject[];
    private _enable;
    set enable(v: boolean);
    get enable(): boolean;
    protected _startPoint: LeanPoint;
    get startPoint(): Point;
    private _spawnPoint;
    get spawnPoint(): Point;
    protected _endPoint: LeanPoint;
    get endPoint(): Point;
    protected rooms: Room[];
    protected abstract walkableTiles: TileBaseType[];
    protected abstract tileSet: TileSet;
    backGroundCanvas: OffscreenCanvas;
    backGroundContext2d: OffscreenCanvasRenderingContext2D;
    protected readonly _tileMap: TileBaseType[][];
    get tileMap(): TileBaseType[][];
    protected _maxX: number;
    get maxX(): number;
    protected _maxY: number;
    get maxY(): number;
    protected TILE_SIZE: number;
    protected scene: Scene;
    readonly SCALED_TILE_SIZE_X: number;
    private readonly SCALED_TILE_SIZE_Y;
    constructor(scene: Scene, maxX: number, maxY: number, objectId?: string, initiateData?: TileMapData);
    setTileMapCollideFunction(): void;
    protected placeTile(tileType: number, x: number, y: number): void;
    prepareNextDraw(context2d: CanvasRenderingContext2D): void;
    protected generateRandomMap(mapConfig: RandomTileMapConfig): void;
    protected getTile(x: number, y: number): Frame;
    checkTileMapCollision(position: LeanPoint, size: Size, customTileFilter?: TileBaseType[]): boolean;
    private spawnPointGenerator;
    findPath(startPosition: Point | LeanPoint, targetPosition: Point | LeanPoint): Path;
    private findSuitableWalkableTile;
    normalizePosition(position: LeanPoint, offsetSize?: Size, roundResults?: boolean): LeanPoint;
    isTileOnMap(position: LeanPoint): boolean;
    static isTileOnMap(position: LeanPoint, tileMap: TileMap): boolean;
    protected createTileMapCanvas(): void;
    getDataToSync(): {
        nId: string;
        objectId: string;
        name: string;
        tileMapData: TileMapData;
    };
    protected abstract loadTileSet(): any;
    debugTile(pos: LeanPoint): void;
    destroy(): void;
}
