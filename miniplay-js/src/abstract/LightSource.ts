import { config } from '../../config';
import { Decorate } from './Decorate';
import { Scene } from './Scene';
import { Point } from '../Point';
import { LeanPoint } from '../collider/BoxCollider';

export abstract class LightSource extends Decorate {
	public static sources: Map<string, LightSource> = new Map();
	public offSet: LeanPoint;
	public color: number[];
	public range: number;
	protected tick: number = 0;
	protected static lightFlickerRate: number = config.graphics.targetScreenRefreshRate / config.graphics.targetAnimationFrameRate;

	constructor(scene: Scene, point: Point, color: number[] = [255, 255, 255], range: number = 1, offSet?: LeanPoint) {
		super(scene, point);
		this.offSet = offSet || { x: 0, y: 0 };
		this.color = color;
		this.range = range;
		LightSource.sources.set(this.objectId, this);
	}
	protected updateFrameClock() {
		if (this.tick > LightSource.lightFlickerRate) {
			this.tick = 0;
		} else {
			this.tick++;
		}
	}

	public static clear() {
		LightSource.sources.clear();
		LightSource.lightFlickerRate = config.graphics.targetScreenRefreshRate / config.graphics.targetAnimationFrameRate;
	}
}
