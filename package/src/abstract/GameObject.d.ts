import { Point } from '../Point.js';
import { Scene } from './Scene.js';
import { BoxCollider, LeanPoint } from '../collider/BoxCollider.js';
import { RemoteController } from '../networking/RemoteController.js';
import { Frame } from '../animations/AnimationInterfaces.js';
import { Path } from '../tileMap/PathFinding.js';
export interface DataToSend {
    objectId: string;
    nId?: string;
    tags: string[];
    position: {
        x: number;
        y: number;
    };
    [key: string]: any;
}
export interface DrawProps {
    image: HTMLImageElement;
    sx: number;
    sy: number;
    sWidth?: number;
    sHeight?: number;
    dx?: number;
    dy?: number;
    dWidth?: number;
    dHeight?: number;
}
export declare abstract class GameObject {
    protected _enable: boolean;
    get enable(): boolean;
    set enable(v: boolean);
    private static _gameObjectSequence;
    private readonly SEQUENCE_SCALE;
    static get gameObjectSequence(): Set<GameObject>[];
    private static _gameObjectNonSequence;
    static get gameObjectNonSequence(): Set<GameObject>;
    private sequenceIndex;
    protected scene: Scene;
    protected _collider: BoxCollider[];
    protected _hitBoxCollider: BoxCollider[];
    protected _isIdle: boolean;
    get isIdle(): boolean;
    get colliders(): BoxCollider[];
    get hitBoxColliders(): BoxCollider[];
    protected addCollider(collider: BoxCollider, isMainCollider?: boolean): void;
    protected clearColliders(): void;
    protected removeCollider(colliderToRemove: BoxCollider): void;
    protected _objectId: string;
    get objectId(): string;
    readonly remoteController: RemoteController;
    private _position;
    get position(): Point;
    set position(point: Point);
    get relativePosition(): LeanPoint;
    get centerPosition(): LeanPoint;
    private static gameObjectMap;
    private tags;
    constructor(scene: Scene, point?: Point, remoteController?: RemoteController, gameObjectId?: string);
    private updateObjectSequencePosition;
    private normalizeObjectSequencePosition;
    protected findPath(target: Point | LeanPoint): Path;
    isMe(objectId: string, nId: string): boolean;
    draw(context2d: CanvasRenderingContext2D): void;
    getTags(): string[];
    getDataToSync(): DataToSend;
    protected addTag(tag: string): void;
    hasTag(tag: string): boolean;
    static getGameObjectByTag(tag: string): GameObject[];
    static getGameObjectById(id: string): GameObject;
    abstract update(): any;
    protected abstract nextDraw(context2d: CanvasRenderingContext2D): Frame;
    destroy(): void;
    static clear(): void;
}
//# sourceMappingURL=GameObject.d.ts.map