import { AnimationOptions, Frame } from './AnimationInterfaces.js';
export declare class AnimationFrames {
    private static cachedImages;
    private animationName;
    get name(): string;
    onload: Function;
    private index;
    private img;
    private imgBitMap;
    private frameWidth;
    private frameHeight;
    private frames;
    private options;
    private static animationFrameRate;
    private tick;
    constructor(animName: string, imgUrl: string | null, width?: number, height?: number, options?: AnimationOptions, bitMap?: ImageBitmap);
    getNextFrame(): Frame;
    getFrame(index: number): Frame;
    private generateFrames;
    setFrameIndex(index: number): void;
    getFrameIndex(): number;
    private updateFrameClock;
    static combineFrames(animName: string, paths: string[], width: number, height: number, options: AnimationOptions): Promise<AnimationFrames>;
    static clear(): void;
}
//# sourceMappingURL=AnimationFrames.d.ts.map