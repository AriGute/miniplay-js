import { Frame, FrameCut } from '../animations/AnimationInterfaces';
import { config } from '../../config';
import { Scene } from '../abstract/Scene';
import { AnimationFrames } from '../animations/AnimationFrames';
import { Point } from '../Point';
import { Inspector } from '../Inspector';
import { generateId } from '../utils';

interface Piece {
	position: Point;
	scale: number;
	frameIndex: number;
	timeToLive: number;
}

interface ParticleOptions {
	position: Point;
	timer?: number;
	delay?: number;
	maxCount?: number;
	randomRangeX?: number;
	randomRangeY?: number;
	randomRangeScale?: number;
	scaleWidth?: number;
	scaleHeight?: number;
	timeToLive?: number;
	forceX?: number;
	forceY?: number;
	preCycle?: boolean;
}

export class Particles {
	protected static particlesMap: Map<string, Particles> = new Map();
	private id: string = '';
	private _enable: boolean = true;

	public set enable(v: boolean) {
		if (v) {
			Particles.particlesMap.set(this.id, this);
		} else {
			Particles.particlesMap.delete(this.id);
		}
		this._enable = v;
	}

	private pieces: Piece[] = [];
	private particle: AnimationFrames = null;
	private count: number = 0;
	private frameDeltaTime = 0;
	private forceX: number = 0;
	private forceY: number = 0;
	private _isAlive: boolean = true;
	public get isAlive(): boolean {
		return this._isAlive;
	}
	// ParticleOptions
	public timer = 0;
	public delay = 1;
	public position: Point = new Point(0, 0);
	public maxCount: number = 1;
	public randomRangeX: number = 0;
	public randomRangeY: number = 0;
	public randomRangeScale: number = 0;
	public timeToLive: number = 5;
	public scaleWidth?: number = 1;
	public scaleHeight?: number = 1;
	public preCycle?: boolean = false;

	constructor(img: string, width: number, height: number, options?: ParticleOptions) {
		this.particle = new AnimationFrames('particle', img, width, height, { loop: true });
		this.id = generateId();
		options &&
			Object.keys(options).forEach((key) => {
				if (key === 'position') {
					this[key] = new Point(options[key].x, options[key].y);
				} else if (key === 'forceX') {
					this[key] = options[key];
				} else if (key === 'forceY') {
					this[key] = options[key];
				} else if (key === 'randomRangeX') {
					this[key] = options[key];
				} else if (key === 'randomRangeY') {
					this[key] = options[key];
				} else {
					this[key] = options[key];
				}
			});
		Particles.particlesMap.set(this.id, this);

		if (this.preCycle) {
			this.particle.onload = () => this.invokePreCycle();
		}
	}
	private invokePreCycle() {
		for (let i = 0; i < this.maxCount / 3; i++) {
			const piece = this.createPiece();
			const timeToLive = Math.random() * this.timeToLive;
			const y = piece.position.relativeY + this.forceY * timeToLive - this.forceY * 10;
			const x = piece.position.relativeX + this.forceX * timeToLive - this.forceY;
			piece.position = new Point(x, y, true);
			piece.timeToLive = timeToLive;
			this.pieces.push(piece);
			this.count++;
		}
		this.timer = this.delay;
		this.delay = this.delay / 3;
	}

	public drawParticles(context2d: CanvasRenderingContext2D) {
		this.beforeDrawUpdate();
		if (this.timer < 0 && this.count < this.maxCount) {
			this.pieces.push(this.createPiece());
			this.count++;
			this.timer = this.delay;
		}
		this.drawPieces(context2d);
	}

	private beforeDrawUpdate() {
		this.frameDeltaTime = Scene.deltaTime / config.graphics.targetScreenRefreshRate;
		this.timer -= this.frameDeltaTime;
	}

	private drawPieces(context2d: CanvasRenderingContext2D) {
		let piece = null;
		let frame: Frame = null;
		let list = [];
		for (let i = 0; i < this.pieces.length; i++) {
			piece = this.pieces[i];
			frame = this.getPieceFrame(piece);
			if (piece.timeToLive > 0 && frame) {
				this.draw(context2d, frame.img, frame.frameCut, piece);
				piece.position = new Point(piece.position.x + this.forceX * this.frameDeltaTime, piece.position.y + this.forceY * this.frameDeltaTime, false, false);
				piece.frameIndex = frame.frameIndex;
				piece.timeToLive -= this.frameDeltaTime;
				list.push(piece);
			}
		}
		this.pieces = list;
		this.count = list.length;
	}

	private draw(context2d: CanvasRenderingContext2D, img: ImageBitmap, frameCut: FrameCut, piece: Piece) {
		context2d.drawImage(
			img,
			frameCut.sourceX,
			frameCut.sourceY,
			frameCut.width,
			frameCut.height,
			piece.position.x,
			piece.position.y,
			(frameCut.width + piece.scale) * this.scaleWidth,
			(frameCut.height + piece.scale) * this.scaleHeight,
		);
	}

	private getPieceFrame(piece: Piece): Frame {
		this.particle.setFrameIndex(piece.frameIndex);
		return this.particle.getNextFrame();
	}

	private createPiece(): Piece {
		const frame = this.particle.getNextFrame();
		return {
			position: new Point(
				this.position.x + Math.random() * (this.randomRangeX * 2) - this.randomRangeX,
				this.position.y + Math.random() * (this.randomRangeY * 2) - this.randomRangeY,
			),
			scale: Math.random() * this.randomRangeScale,
			frameIndex: (frame && ((Math.random() * frame.img.width) / frame.img.height - 1) | 0) || 0,
			timeToLive: this.timeToLive,
		};
	}

	public clear() {
		this.particle = undefined;
		this.timer = undefined;
		this.delay = undefined;
		this.maxCount = undefined;
		this.maxCount = undefined;
		this.position = undefined;
		this._isAlive = false;
	}

	public remove() {
		Particles.particlesMap.delete(this.id);
		Object.keys(this).forEach((prop) => {
			this[prop] = undefined;
		});
	}

	protected static isAlive(particle: Particles): boolean {
		return particle._isAlive;
	}

	public static clear() {
		Particles.particlesMap.clear();
	}
}
