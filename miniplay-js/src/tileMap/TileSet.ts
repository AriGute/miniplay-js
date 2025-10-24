import { AnimationFrames } from '../animations/AnimationFrames.js';

export const enum TileBaseType {
	default = -1,
	ground = -2,
	wall = -3,
	water = -4,
	hole = -5,
}

export type tileVariantCondition = [number, number, number, number] | [number];

export class TileSet {
	private imgSet: AnimationFrames = null;
	private tileSet: Map<TileBaseType, Map<string, number>>;
	protected tileTypes: number[] = [];
	constructor(imgSet: AnimationFrames, tileTypes: number[]) {
		this.imgSet = imgSet;
		this.tileTypes = tileTypes;
		this.tileSet = new Map([
			[TileBaseType.default, new Map()],
			[TileBaseType.ground, new Map()],
			[TileBaseType.wall, new Map()],
			[TileBaseType.water, new Map()],
			[TileBaseType.hole, new Map()],
		]);
		this.tileTypes.forEach((type) => this.tileSet.set(type, new Map()));
	}

	public addTileVariant(tileType: number, frameIndex: number, condition: tileVariantCondition) {
		const tileTypeSet: Map<string, number> = this.tileSet.get(tileType);
		const conditionKey = condition.join();
		tileTypeSet.set(conditionKey, frameIndex);
	}

	public getTileFrame(tileType: number, condition: string) {
		const defaultTileIndex = this.tileSet.get(tileType).get([TileBaseType.default].join());
		this.imgSet.setFrameIndex(this.tileSet.get(tileType).get(condition) ?? defaultTileIndex);
		return this.imgSet.getNextFrame();
	}
}
