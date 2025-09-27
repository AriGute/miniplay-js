import { LeanPoint } from './collider/BoxCollider';
import { Point } from './Point';
interface UiImgComponents {
    img: ImageBitmap;
    position: LeanPoint;
    index: number;
}
export declare class UI {
    private static _canvas;
    static get canvas(): OffscreenCanvas;
    private static context2d;
    private static uiImgComponents;
    private static drawImgOrder;
    private static maxIndex;
    private static uiTextsComponents;
    private static uiRectComponents;
    private static tempShapes;
    private static size;
    private static flipSize;
    private static _font;
    static get font(): string;
    static update(): void;
    private static drawUIComponents;
    private static drawShapes;
    static drawImg(uniqueIdentifier: string, toDraw: ImageBitmap, pos: LeanPoint, drawOrderIndex?: number): void;
    static updateImagePosition(uniqueIdentifier: string, pos: LeanPoint): void;
    static getImageData(uniqueIdentifier: string): UiImgComponents;
    static drawPoint(pos: LeanPoint | Point, color?: string, size?: number, fill?: boolean): void;
    static drawText(uniqueIdentifier: string, text: string, position: LeanPoint | Point, maxWidth?: number, color?: string): void;
    static updateTextPosition(uniqueIdentifier: string, pos: LeanPoint): void;
    static drawRect(uniqueIdentifier: string, position: LeanPoint | Point, width: number, height: number, color?: string): void;
    static unDrawRect(uniqueIdentifier: string): void;
    static unDrawImg(uniqueIdentifier: string): void;
    static unDrawText(uniqueIdentifier: string): void;
    static init(): void;
    static setFont(fontName: string): void;
    static clear(): void;
    static clearUi(): void;
}
export {};
