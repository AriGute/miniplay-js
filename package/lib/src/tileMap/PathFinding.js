import { MinTileHeap } from './MinTileHeap.js';
import { config } from '../../config.js';
import { manhattanDistance } from '../utils.js';
export class PathFinding {
    static tileMap = null;
    static start = null;
    static target = null;
    static MAX_SIZE_X = 0;
    static MAX_SIZE_Y = 0;
    static walkableTiles = [-2];
    static a_star(tileMap, walkableTiles, normalizedStartPosition, normalizedTargetPosition, diagonalPathFinding) {
        PathFinding.tileMap = tileMap;
        PathFinding.walkableTiles = walkableTiles;
        PathFinding.start = normalizedStartPosition;
        PathFinding.target = normalizedTargetPosition;
        PathFinding.MAX_SIZE_X = tileMap[0].length;
        PathFinding.MAX_SIZE_Y = tileMap.length;
        const scoreMap = new MinTileHeap();
        const memoSet = new Set();
        memoSet.add(`${normalizedStartPosition.x},${normalizedStartPosition.y}`);
        memoSet.add(`${normalizedTargetPosition.x},${normalizedTargetPosition.y}`);
        let relativeTile = {
            x: normalizedStartPosition.x,
            y: normalizedStartPosition.y,
            score: 0,
            prevTile: null,
        };
        let currentTile = null;
        for (let counter = 0; counter < 150; counter++) {
            currentTile = null;
            for (let y = -1; y <= 1; y++) {
                for (let x = -1; x <= 1; x++) {
                    if (x === 0 && y === 0)
                        continue;
                    if ((diagonalPathFinding ?? config.graphics.tileMap.diagonalPathFinding) === false) {
                        if (x === -1 && y === -1)
                            continue;
                        if (x === -1 && y === 1)
                            continue;
                        if (x === 1 && y === 1)
                            continue;
                        if (x === 1 && y === -1)
                            continue;
                    }
                    if (relativeTile === null)
                        return [];
                    currentTile = {
                        x: relativeTile.x + x,
                        y: relativeTile.y + y,
                        score: 0,
                        prevTile: relativeTile,
                    };
                    if (currentTile.x === this.target.x && currentTile.y === this.target.y) {
                        const path = [];
                        const debugPath = [];
                        while (currentTile) {
                            path.push(PathFinding.unNormalizePosition({ x: currentTile.x, y: currentTile.y }));
                            if (config.debugMode.pathFinding)
                                debugPath.push({ x: currentTile.x, y: currentTile.y });
                            currentTile = currentTile.prevTile;
                        }
                        if (config.debugMode.pathFinding) {
                            let memo = [];
                            debugPath.forEach((t) => {
                                memo.push(PathFinding.tileMap[t.y][t.x]);
                                PathFinding.tileMap[t.y][t.x] = -1;
                            });
                            setTimeout(() => {
                                debugPath.forEach((t, i) => {
                                    PathFinding.tileMap[t.y][t.x] = memo[i];
                                });
                                memo = undefined;
                            }, 200);
                        }
                        return path;
                    }
                    if (!memoSet.has(`${currentTile.x},${currentTile.y}`)) {
                        if (PathFinding.isTileOnMap(currentTile) && PathFinding.isTileWalkable(currentTile)) {
                            currentTile.score = PathFinding.calcTileValue({ x: currentTile.x, y: currentTile.y });
                            scoreMap.insert(currentTile);
                        }
                    }
                    memoSet.add(`${currentTile.x},${currentTile.y}`);
                }
            }
            relativeTile = scoreMap.extractMin();
        }
        return [];
    }
    static clearLine(scene, p1, p2, walkableTiles) {
        const map = scene.tileMap;
        const currentPos = p1.x < p2.x ? map.normalizePosition(p1) : map.normalizePosition(p2);
        const targetPos = p1.x < p2.x ? map.normalizePosition(p2) : map.normalizePosition(p1);
        const dist = { x: p2.x - p1.x, y: p2.y - p1.y };
        const ratio = Math.round(dist.x === 0 || dist.y === 0 ? 0 : dist.x < dist.y ? dist.x / dist.y : dist.y / dist.x);
        if (dist.x < dist.y) {
            let ratioCycle = 0;
            while (currentPos.x < targetPos.x) {
                currentPos.x++;
                ratioCycle++;
                if (ratioCycle === ratio) {
                    ratioCycle = 0;
                    currentPos.y !== targetPos.y && currentPos.y++;
                }
                if (!(walkableTiles || this.walkableTiles).includes(map.tileMap[currentPos.y][currentPos.x]))
                    return false;
            }
        }
        else {
            let ratioCycle = 0;
            while (currentPos.y < targetPos.y) {
                currentPos.y++;
                ratioCycle++;
                if (ratioCycle === ratio) {
                    ratioCycle = 0;
                    currentPos.x !== targetPos.x && currentPos.x++;
                }
            }
            if (scene.tileMap.isTileOnMap(currentPos) && !(walkableTiles || this.walkableTiles).includes(map.tileMap[currentPos.y][currentPos.x]))
                return false;
        }
        return true;
    }
    static unNormalizePosition(position) {
        return {
            x: Math.round(position.x * config.graphics.tileMap.tileSize + config.graphics.tileMap.tileSize / 3),
            y: Math.round(position.y * config.graphics.tileMap.tileSize + config.graphics.tileMap.tileSize / 3),
        };
    }
    static isTileOnMap(tile) {
        if (tile.x < 0)
            return false;
        if (tile.y < 0)
            return false;
        if (tile.x > PathFinding.MAX_SIZE_X - 1)
            return false;
        if (tile.y > PathFinding.MAX_SIZE_Y - 1)
            return false;
        return true;
    }
    static isTileWalkable(tile) {
        return PathFinding.walkableTiles.includes(PathFinding.tileMap[tile.y][tile.x]);
    }
    static calcTileValue(toCalc) {
        return manhattanDistance(toCalc, this.start) + manhattanDistance(toCalc, this.target) * 1.5 + manhattanDistance(toCalc, toCalc);
    }
    static clear() {
        PathFinding.tileMap = null;
        PathFinding.start = null;
        PathFinding.target = null;
        PathFinding.MAX_SIZE_X = 0;
        PathFinding.MAX_SIZE_Y = 0;
        PathFinding.walkableTiles = [-2];
    }
}
