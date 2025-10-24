import { AnimationFrames } from '../animations/AnimationFrames.js';
export declare const enum TileBaseType {
    default = -1,
    ground = -2,
    wall = -3,
    water = -4,
    hole = -5
}
export type tileVariantCondition = [number, number, number, number] | [number];
export declare class TileSet {
    private imgSet;
    private tileSet;
    protected tileTypes: number[];
    constructor(imgSet: AnimationFrames, tileTypes: number[]);
    addTileVariant(tileType: number, frameIndex: number, condition: tileVariantCondition): void;
    getTileFrame(tileType: number, condition: string): import("../animations/AnimationInterfaces.js").Frame;
}
//# sourceMappingURL=TileSet.d.ts.map