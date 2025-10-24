import { Scene } from '../abstract/Scene.js';
import { InputSpecialKeys, MouseClickEvent } from './InputInterfaces.js';
export declare class Input {
    private static scene;
    private static keyDownValues;
    private static keyUpValues;
    private static keyDownMap;
    private static keyUpMap;
    private static mouseOver;
    constructor(scene: Scene);
    private addMouseInputListener;
    private addBlurListener;
    static addInputListener(key: string): void;
    private createMouseClickEvent;
    static getKey(key: string | InputSpecialKeys): boolean | MouseClickEvent;
    static getKeyDown(key: string | InputSpecialKeys, id: string): boolean | MouseClickEvent;
    static getKeyUp(key: string | InputSpecialKeys, id: string): boolean | MouseClickEvent;
    static clear(): void;
}
//# sourceMappingURL=Input.d.ts.map