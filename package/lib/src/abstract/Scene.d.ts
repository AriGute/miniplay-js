import { GameObject, Input, Point, TileMap } from '../../index.js';
export type NextScene = (scene: Scene) => void;
export declare enum SceneStates {
    initiate = "initiate",
    loading = "loading",
    start = "start",
    running = "running",
    destroying = "destroying"
}
export interface ElementOptions {
    type: string;
    style?: {
        [key: string]: string;
    };
    styleClass?: string[];
    attributes?: {
        [key: string | symbol]: string;
    };
    props?: {
        [key: string]: any;
    };
    child?: Node[];
}
export declare abstract class Scene {
    private _pause;
    set pause(v: boolean);
    get pause(): boolean;
    private _onstatechange;
    private nextFrame;
    set onstatechange(func: () => void);
    private _state;
    get state(): string;
    private set state(value);
    private id;
    private doc;
    private sceneElements;
    private static sceneObjectsSet;
    private static detachedGameObjects;
    private drawIntervalId;
    private skipDelayedFrame;
    private updateIntervalId;
    private setTimeoutList;
    private setIntervalList;
    private eventListenerList;
    private _tileMap;
    get tileMap(): TileMap;
    private context2d;
    protected canvas: HTMLCanvasElement;
    protected input: Input;
    protected root: HTMLElement;
    nextScene: NextScene;
    static canvasOffSet: {
        x: number;
        y: number;
    };
    private deltaTimeAnchor;
    private static _deltaTime;
    static get deltaTime(): number;
    abstract onLoad(): void;
    abstract onStart(): void;
    abstract onConnectionLost(): void;
    private handleWindowFocus;
    start(doc?: Document, nextScene?: NextScene, point?: Point): void;
    clear(): void;
    element(elementOptions: ElementOptions): HTMLElement;
    addObject(gameObject: GameObject): void;
    removeTileMap(): boolean;
    removeObject(gameObject: GameObject): boolean;
    removeDetachedObject(gameObject: GameObject): boolean;
    clearDetachedObject(): void;
    addElement(element: HTMLElement | HTMLElement[]): void;
    addEventListener(event: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    setTimeout(callback: any, timeout?: any): number;
    setInterval(callback: any, timeout?: any): number;
    clearTimeout(id: number | undefined): void;
    clearInterval(id: number | undefined): void;
    draw(): void;
    update(): void;
    protected startDrawing(): void;
    protected stopDrawing(): void;
    protected startUpdating(): void;
    protected stopUpdating(): void;
    private subscribeOnClose;
    private calcDeltaTime;
    static getGameObjectById(id: string): GameObject;
    compareCanvas(target: HTMLCanvasElement): boolean;
    setTileMap(tileMap: TileMap): void;
    protected loadFont(fontName: string, path: string): Promise<void>;
    protected setFont(fontName: any): void;
    protected createGameCanvas(): HTMLCanvasElement;
}
//# sourceMappingURL=Scene.d.ts.map