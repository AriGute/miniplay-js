import { AnimationFrames } from './AnimationFrames.js';

export interface FrameRelativePosition {
	sourceX: number;
	sourceY: number;
}

export interface FrameCut extends FrameRelativePosition {
	sourceX: number;
	sourceY: number;
	width: number;
	height: number;
}

export interface Frame {
	img: ImageBitmap;
	frameCut: FrameCut;
	frameIndex: number;
	options: AnimationOptions;
}

export interface StateConnection {
	to: string;
	condition: () => boolean;
}

export interface CurrentState {
	name: string;
	anim: AnimationFrames;
}

export interface AnimationOptions {
	scale?: { width: number; height: number };
	frameOffSet?: { x: number; y: number };
	frameRate?: number;
	selectedFrames?: { startAt?: number; from?: number; to?: number };
	loop?: boolean;
	reverse?: boolean;
}
