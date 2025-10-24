export class TileSet {
    imgSet = null;
    tileSet;
    tileTypes = [];
    constructor(imgSet, tileTypes) {
        this.imgSet = imgSet;
        this.tileTypes = tileTypes;
        this.tileSet = new Map([
            [-1, new Map()],
            [-2, new Map()],
            [-3, new Map()],
            [-4, new Map()],
            [-5, new Map()],
        ]);
        this.tileTypes.forEach((type) => this.tileSet.set(type, new Map()));
    }
    addTileVariant(tileType, frameIndex, condition) {
        const tileTypeSet = this.tileSet.get(tileType);
        const conditionKey = condition.join();
        tileTypeSet.set(conditionKey, frameIndex);
    }
    getTileFrame(tileType, condition) {
        const defaultTileIndex = this.tileSet.get(tileType).get([-1].join());
        this.imgSet.setFrameIndex(this.tileSet.get(tileType).get(condition) ?? defaultTileIndex);
        return this.imgSet.getNextFrame();
    }
}
