import { Point } from '../Point.js';
import { Camera } from '../Camera.js';
import { config } from '../../config.js';
import { PathFinding } from './PathFinding.js';
import { generateId, manhattanDistance } from '../utils.js';
import { Connection } from '../networking/Connection.js';
export class TileMap {
    _objectId;
    get objectId() {
        return this._objectId;
    }
    get relatedObjects() {
        return this._relatedObjects;
    }
    _enable = false;
    set enable(v) {
        if (this._relatedObjects) {
            if (v === true) {
                this._relatedObjects = this._relatedObjects.filter((object) => {
                    if (object.objectId === undefined) {
                        return false;
                    }
                    else {
                        return true;
                    }
                });
                this._relatedObjects.forEach((object) => (object.enable = true));
            }
            else if (v === false) {
                this._relatedObjects.forEach((object) => (object.enable = false));
            }
        }
        else {
            this._relatedObjects = [];
        }
        this._enable = v;
    }
    get enable() {
        return this._enable;
    }
    _startPoint = null;
    get startPoint() {
        return new Point(this._startPoint.x * config.graphics.tileMap.tileSize, this._startPoint.y * config.graphics.tileMap.tileSize, true);
    }
    _spawnPoint = null;
    get spawnPoint() {
        return this._spawnPoint.next().value || this.startPoint;
    }
    _endPoint = null;
    get endPoint() {
        return new Point(this._endPoint.x * config.graphics.tileMap.tileSize, this._endPoint.y * config.graphics.tileMap.tileSize);
    }
    rooms = [];
    backGroundCanvas = null;
    backGroundContext2d = null;
    _tileMap = [];
    get tileMap() {
        return this._tileMap;
    }
    _maxX;
    get maxX() {
        return this._maxX;
    }
    _maxY;
    get maxY() {
        return this._maxY;
    }
    TILE_SIZE = config.graphics.tileMap.tileSize;
    scene;
    SCALED_TILE_SIZE_X = Math.round(config.graphics.tileMap.tileSize);
    SCALED_TILE_SIZE_Y = Math.round(config.graphics.tileMap.tileSize);
    constructor(scene, maxX, maxY, objectId = generateId(), initiateData) {
        this.scene = scene;
        this._objectId = objectId;
        this._maxX = maxX;
        this._maxY = maxY;
        this._spawnPoint = this.spawnPointGenerator();
        this.createTileMapCanvas();
        if (config.debugMode.tileMap) {
            this.scene.setTimeout(() => {
                if (this._tileMap && this._tileMap[0] && this._tileMap[0][0]) {
                    console.table(this._tileMap);
                }
            });
        }
        if (initiateData) {
            this._startPoint = initiateData._startPoint;
            this._endPoint = initiateData._endPoint;
            this._tileMap = initiateData.tileMap;
            this.rooms = initiateData.rooms;
        }
    }
    setTileMapCollideFunction() { }
    placeTile(tileType, x, y) {
        if (y < this._maxY && x < this._maxX) {
            if (!this._tileMap[y])
                this._tileMap[y] = [];
            this._tileMap[y][x] = tileType;
        }
        else {
            console.error('TileMap->placeTile: attempting to place tile outside of tileMap bounds');
        }
    }
    prepareNextDraw(context2d) {
        const minX = Math.floor(Camera.position.x / this.SCALED_TILE_SIZE_X);
        const minY = Math.floor(Camera.position.y / this.SCALED_TILE_SIZE_Y);
        const maxX = Math.ceil((Camera.position.x + config.graphics.targetResolution.width) / this.SCALED_TILE_SIZE_X);
        const maxY = Math.ceil((Camera.position.y + config.graphics.targetResolution.height) / this.SCALED_TILE_SIZE_Y);
        const relativeMinX = minX > 0 ? minX : 0;
        const relativeMinY = minY > 0 ? minY : 0;
        const relativeMaxX = maxX < this._maxX ? maxX : this._maxX;
        const relativeMaxY = maxY < this._maxY ? maxY : this._maxY;
        this.backGroundContext2d.fillStyle = config.graphics.backGroundColor;
        this.backGroundContext2d.fillRect(0, 0, config.graphics.targetResolution.width, config.graphics.targetResolution.height);
        for (let y = relativeMinY; y < relativeMaxY; y++) {
            for (let x = relativeMinX; x < relativeMaxX; x++) {
                const { img, frameCut } = this.getTile(x, y) || { img: null, frameCut: null };
                if (img) {
                    const position = new Point(x * frameCut.width, y * frameCut.height, true);
                    this.backGroundContext2d.drawImage(img, frameCut.sourceX, frameCut.sourceY, frameCut.width, frameCut.height, position.x, position.y, this.SCALED_TILE_SIZE_X, this.SCALED_TILE_SIZE_Y);
                }
                else {
                    this.getTile(x, y);
                    return;
                }
            }
        }
    }
    generateRandomMap(mapConfig) {
        for (let y = 0; y < this._maxY; y++) {
            for (let x = 0; x < this._maxX; x++) {
                this.placeTile(-1, x, y);
            }
        }
        const fullRooms = [];
        for (let i = 0; i < mapConfig.numOfRooms; i++) {
            for (let j = 0; j < 5; j++) {
                const randX = Math.floor(Math.random() * this._maxX);
                const randY = Math.floor(Math.random() * this._maxY);
                if (!this.rooms.some((r) => manhattanDistance(r.pos, { x: randX, y: randY }) < (mapConfig.maxRoomsSize - j) * (mapConfig.maxRoomsSize - j) + 1)) {
                    this.rooms.push({
                        paths: [],
                        pos: {
                            x: randX,
                            y: randY,
                        },
                        size: 1,
                    });
                }
            }
        }
        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i];
            const numOfPaths = Math.floor(Math.random() * mapConfig.maxPaths);
            for (let j = 0; j < numOfPaths; j++) {
                const randomIndex = Math.floor(Math.random() * this.rooms.length);
                const pickRandomRoom = this.rooms[randomIndex];
                if (room === pickRandomRoom)
                    continue;
                const path = PathFinding.a_star(this._tileMap, [-1], room.pos, pickRandomRoom.pos).map((step) => this.normalizePosition(step));
                room.paths.push(path);
                pickRandomRoom.paths.push(path);
                if (room.paths.length === mapConfig.maxPaths) {
                    fullRooms.push(this.rooms.splice(i, 1).shift());
                    i--;
                }
                if (pickRandomRoom.paths.length === mapConfig.maxPaths) {
                    fullRooms.push(this.rooms.splice(randomIndex, 1).shift());
                    i--;
                }
            }
        }
        this.rooms = [...this.rooms, ...fullRooms].filter((r) => r && r.paths.length > 0);
        this.rooms.forEach((room) => {
            let typeOfTile = -2;
            room.paths.forEach((path) => {
                for (let i = 0; i < path.length; i++) {
                    const tile = path[i];
                    this._tileMap[tile.y][tile.x] = typeOfTile;
                    if (i < path.length) {
                        const nextTile = path[i + 1];
                        if (nextTile) {
                            if (nextTile.x === tile.x - 1 && nextTile.y === tile.y - 1) {
                                this._tileMap[tile.y][tile.x - 1] = typeOfTile;
                                this._tileMap[tile.y - 1][tile.x] = typeOfTile;
                            }
                            if (nextTile.x === tile.x + 1 && nextTile.y === tile.y - 1) {
                                this._tileMap[tile.y][tile.x + 1] = typeOfTile;
                                this._tileMap[tile.y - 1][tile.x] = typeOfTile;
                            }
                            if (nextTile.x === tile.x - 1 && nextTile.y === tile.y + 1) {
                                this._tileMap[tile.y][tile.x - 1] = typeOfTile;
                                this._tileMap[tile.y + 1][tile.x] = typeOfTile;
                            }
                            if (nextTile.x === tile.x + 1 && nextTile.y === tile.y + 1) {
                                this._tileMap[tile.y][tile.x + 1] = typeOfTile;
                                this._tileMap[tile.y + 1][tile.x] = typeOfTile;
                            }
                        }
                    }
                }
            });
            room.paths.forEach((path) => {
                path.forEach((tile) => {
                    this._tileMap[tile.y][tile.x] = -2;
                });
            });
            room.size = Math.floor(Math.random() * mapConfig.maxRoomsSize) + mapConfig.minRoomSize;
            for (let y = -room.size; y < room.size; y++) {
                if (room.pos.y + y < 0 || room.pos.y + y > this._maxY - 1)
                    continue;
                for (let x = -room.size; x < room.size; x++) {
                    if (room.pos.x + x < 0 || room.pos.x + x > this._maxX - 1)
                        continue;
                    if (this._tileMap[room.pos.y + y][room.pos.x + x] === -1) {
                        this._tileMap[room.pos.y + y][room.pos.x + x] = -2;
                    }
                }
            }
        });
        let shouldReplace = [];
        for (let y = 0; y < this._maxY; y++) {
            for (let x = 0; x < this._maxX; x++) {
                if (this._tileMap[y][x] === -1) {
                    this._tileMap[y][x] = -3;
                }
            }
        }
        if (mapConfig.fillVoid) {
            for (let y = 0; y < this._maxY; y++) {
                for (let x = 0; x < this._maxX; x++) {
                    if (this._tileMap[y][x] === -3) {
                        if (y < 1 || y > this._maxY - 2)
                            continue;
                        if (x < 1 || x > this._maxX - 2)
                            continue;
                        if (this._tileMap[y][x + 1] === -3 &&
                            this._tileMap[y - 1][x] === -3 &&
                            this._tileMap[y][x - 1] === -3 &&
                            this._tileMap[y + 1][x] === -3) {
                            shouldReplace.push({ x, y });
                        }
                    }
                }
            }
            shouldReplace.forEach((pos) => {
                this._tileMap[pos.y][pos.x] = -1;
            });
        }
        shouldReplace = [];
        for (let y = 0; y < this._maxY; y++) {
            for (let x = 0; x < this._maxX; x++) {
                if (this._tileMap[y][x] === -1) {
                    if (y < 1 || y > this._maxY - 2)
                        continue;
                    if (x < 1 || x > this._maxX - 2)
                        continue;
                    if (this._tileMap[y + 1][x] === -3 &&
                        this._tileMap[y + 1][x + 1] === -2 &&
                        this._tileMap[y][x + 1] === -3) {
                        shouldReplace.push({ x, y });
                    }
                    else if (this._tileMap[y][x + 1] === -3 &&
                        this._tileMap[y - 1][x + 1] === -2 &&
                        this._tileMap[y - 1][x] === -3) {
                        shouldReplace.push({ x, y });
                    }
                    else if (this._tileMap[y][x - 1] === -3 &&
                        this._tileMap[y - 1][x - 1] === -2 &&
                        this._tileMap[y - 1][x] === -3) {
                        shouldReplace.push({ x, y });
                    }
                    else if (this._tileMap[y][x - 1] === -3 &&
                        this._tileMap[y + 1][x - 1] === -2 &&
                        this._tileMap[y + 1][x] === -3) {
                        shouldReplace.push({ x, y });
                    }
                }
            }
        }
        shouldReplace.forEach((pos) => {
            this._tileMap[pos.y][pos.x] = -3;
        });
        let pickRandomStartRoom;
        for (let i = 0; i < this.rooms.length; i++) {
            const pickRandomStartRoom = this.rooms[i];
            const randomPosition = {
                x: pickRandomStartRoom.pos.x,
                y: pickRandomStartRoom.pos.y,
            };
            if (randomPosition.x > pickRandomStartRoom.size &&
                randomPosition.x < this._maxX - pickRandomStartRoom.size &&
                randomPosition.y > pickRandomStartRoom.size &&
                randomPosition.y < this._maxY - pickRandomStartRoom.size) {
                if (this.isTileOnMap(randomPosition) && this._tileMap[randomPosition.y][randomPosition.x] === -2) {
                    this._startPoint = randomPosition;
                    break;
                }
            }
        }
        let pickRandomEndRoom;
        while (!this._endPoint) {
            pickRandomEndRoom = this.rooms[Math.floor(Math.random() * this.rooms.length)];
            if (pickRandomStartRoom !== pickRandomEndRoom) {
                const randomPosition = {
                    x: pickRandomEndRoom.pos.x,
                    y: pickRandomEndRoom.pos.y,
                };
                if (this.isTileOnMap(randomPosition) && this._tileMap[randomPosition.y][randomPosition.x] === -2) {
                    this._endPoint = randomPosition;
                }
            }
        }
        for (let x = 0; x < this._maxX; x++) {
            this.placeTile(-3, x, 0);
        }
        for (let x = 0; x < this._maxX; x++) {
            this.placeTile(-3, x, this._maxY - 1);
        }
        for (let y = 0; y < this._maxY; y++) {
            this.placeTile(-3, 0, y);
        }
        for (let y = 0; y < this._maxY; y++) {
            this.placeTile(-3, this._maxX - 1, y);
        }
        if (mapConfig.river) {
            const distList = Math.random() > 0.5 ? this.rooms.toSorted((a, b) => (a.pos.x < b.pos.x ? 1 : -1)) : this.rooms.toSorted((a, b) => (a.pos.y < b.pos.y ? 1 : -1));
            const riverPath = PathFinding.a_star(this._tileMap, [-2, -3, -1], distList[0].pos, distList.at(-1).pos).map((step) => this.normalizePosition(step));
            riverPath.forEach((step) => {
                let sideStep = { x: step.x, y: step.y };
                if (this.isTileOnMap(sideStep)) {
                    this.tileMap[sideStep.y][sideStep.x] = -4;
                }
                sideStep = { x: step.x - 1, y: step.y };
                if (this.isTileOnMap(sideStep)) {
                    this.tileMap[sideStep.y][sideStep.x] = -4;
                }
                sideStep = { x: step.x, y: step.y + 1 };
                if (this.isTileOnMap(sideStep)) {
                    this.tileMap[sideStep.y][sideStep.x] = -4;
                }
            });
        }
        if (!mapConfig.islands) {
            for (let y = 0; y < this._maxY; y++) {
                for (let x = 0; x < this._maxX; x++) {
                    if (this._tileMap[y][x] === -3) {
                        if (y < 1 || y > this._maxY - 2)
                            continue;
                        if (x < 1 || x > this._maxX - 2)
                            continue;
                        if (this._tileMap[y][x + 1] === -2 &&
                            this._tileMap[y - 1][x] === -2 &&
                            this._tileMap[y][x - 1] === -2 &&
                            this._tileMap[y + 1][x] === -2) {
                            this._tileMap[y][x] = -2;
                        }
                    }
                }
            }
        }
        if (config.debugMode.tileMap) {
            console.table(this._tileMap);
            console.log(this._startPoint);
            console.log(this._endPoint);
        }
    }
    getTile(x, y) {
        if (y < this._maxY && x < this._maxX) {
            if (!this._tileMap[y])
                this._tileMap[y] = [];
            const tileType = this._tileMap[y][x];
            let condition = [
                y > 0 ? this._tileMap[y - 1][x] : -2,
                x < this._maxX - 1 ? this._tileMap[y][x + 1] : -2,
                y < this._maxY - 1 ? this._tileMap[y + 1][x] : -2,
                x > 0 ? this._tileMap[y][x - 1] : -2,
            ];
            const frame = this.tileSet.getTileFrame(tileType, condition.join());
            return frame;
        }
    }
    checkTileMapCollision(position, size, customTileFilter) {
        const normalizedPosition = this.normalizePosition(position, size);
        if (!this._tileMap)
            return false;
        if (!this.isTileOnMap(normalizedPosition))
            return true;
        if (this._tileMap[normalizedPosition.y]) {
            const tile = this._tileMap[normalizedPosition.y][normalizedPosition.x];
            if (this.walkableTiles.includes(tile) || (customTileFilter && !customTileFilter.includes(tile))) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }
    *spawnPointGenerator() {
        yield this.startPoint;
    }
    findPath(startPosition, targetPosition) {
        let normalizedCurrentPosition = startPosition instanceof Point
            ? this.normalizePosition({
                x: startPosition.relativeX,
                y: startPosition.relativeY,
            })
            : this.normalizePosition(startPosition);
        let normalizedTargetPosition = this.normalizePosition(targetPosition);
        const startDirectionHint = {
            x: Math.round(normalizedCurrentPosition.x) >= normalizedCurrentPosition.x ? 1 : -1,
            y: Math.round(normalizedCurrentPosition.y) >= normalizedCurrentPosition.y ? 1 : -1,
        };
        const endDirectionHint = {
            x: Math.round(normalizedTargetPosition.x) >= normalizedTargetPosition.x ? 1 : -1,
            y: Math.round(normalizedTargetPosition.y) >= normalizedTargetPosition.y ? 1 : -1,
        };
        normalizedCurrentPosition = {
            x: Math.round(normalizedCurrentPosition.x),
            y: Math.round(normalizedCurrentPosition.y),
        };
        normalizedTargetPosition = {
            x: Math.round(normalizedTargetPosition.x),
            y: Math.round(normalizedTargetPosition.y),
        };
        if (!this.walkableTiles.includes(this._tileMap[normalizedCurrentPosition.y][normalizedCurrentPosition.x])) {
            normalizedCurrentPosition = this.findSuitableWalkableTile(normalizedCurrentPosition, startDirectionHint);
        }
        if (!this.walkableTiles.includes(this._tileMap[normalizedTargetPosition.y][normalizedTargetPosition.x])) {
            normalizedTargetPosition = this.findSuitableWalkableTile(normalizedTargetPosition, endDirectionHint);
        }
        if (config.debugMode.logs.tileMap) {
            console.clear();
            console.group();
            console.log('start: ', startPosition);
            console.log('end: ', targetPosition);
            console.log('normalizedCurrentPosition: ', normalizedCurrentPosition);
            console.log('normalizedTargetPosition: ', normalizedTargetPosition);
            console.groupEnd();
        }
        return PathFinding.a_star(this._tileMap, this.walkableTiles, normalizedCurrentPosition, normalizedTargetPosition);
    }
    findSuitableWalkableTile(pos, directionHint = { x: 0, y: 0 }) {
        if (directionHint.x === -1 && this.walkableTiles.includes(this._tileMap[pos.y][pos.x + 1])) {
            return { x: pos.x + 1, y: pos.y };
        }
        if (directionHint.x === 1 && this.walkableTiles.includes(this._tileMap[pos.y][pos.x - 1])) {
            return { x: pos.x - 1, y: pos.y };
        }
        if (directionHint.y === -1 && this.walkableTiles.includes(this._tileMap[pos.y + 1][pos.x])) {
            return { x: pos.x, y: pos.y + 1 };
        }
        if (directionHint.y === 1 && this.walkableTiles.includes(this._tileMap[pos.y - 1][pos.x])) {
            return { x: pos.x, y: pos.y - 1 };
        }
        if (directionHint.y === 1 && directionHint.x === -1 && this.walkableTiles.includes(this._tileMap[pos.y - 1][pos.x + 1])) {
            return { x: pos.x + 1, y: pos.y - 1 };
        }
        if (directionHint.y === 1 && directionHint.x === 1 && this.walkableTiles.includes(this._tileMap[pos.y - 1][pos.x - 1])) {
            return { x: pos.x - 1, y: pos.y - 1 };
        }
        if (directionHint.y === -1 && directionHint.x === -1 && this.walkableTiles.includes(this._tileMap[pos.y + 1][pos.x + 1])) {
            return { x: pos.x + 1, y: pos.y + 1 };
        }
        if (directionHint.y === -1 && directionHint.x === 1 && this.walkableTiles.includes(this._tileMap[pos.y + 1][pos.x - 1])) {
            return { x: pos.x - 1, y: pos.y - 1 };
        }
        return pos;
    }
    normalizePosition(position, offsetSize, roundResults = true) {
        let results = { x: 0, y: 0 };
        if (offsetSize) {
            results = {
                x: (position.x - offsetSize.width) / this.SCALED_TILE_SIZE_X,
                y: (position.y - offsetSize.height / 4) / this.SCALED_TILE_SIZE_Y,
            };
        }
        else {
            results = {
                x: position.x / this.SCALED_TILE_SIZE_X,
                y: position.y / this.SCALED_TILE_SIZE_Y,
            };
        }
        if (roundResults) {
            return { x: Math.round(results.x), y: Math.round(results.y) };
        }
        else {
            return results;
        }
    }
    isTileOnMap(position) {
        if (position.x < 0.1)
            return false;
        if (position.y < 0.1)
            return false;
        if (position.x > this._maxX - 1.1)
            return false;
        if (position.y > this._maxY - 1.1)
            return false;
        return true;
    }
    static isTileOnMap(position, tileMap) {
        if (position.x < 0)
            return false;
        if (position.y < 0)
            return false;
        if (position.x > tileMap._maxX - 1)
            return false;
        if (position.y > tileMap._maxY - 1)
            return false;
        return true;
    }
    createTileMapCanvas() {
        this.backGroundCanvas = new OffscreenCanvas(config.graphics.targetResolution.width, config.graphics.targetResolution.height);
        this.backGroundContext2d = this.backGroundCanvas.getContext('2d', {
            alpha: false,
            desynchronized: true,
        });
        this.backGroundContext2d.imageSmoothingEnabled = config.graphics.imageSmoothing;
    }
    getDataToSync() {
        const tileMapData = {
            _startPoint: this._startPoint,
            _endPoint: this._endPoint,
            rooms: this.rooms,
            tileMap: this._tileMap,
            maxX: this._maxX,
            maxY: this._maxY,
        };
        const data = {
            nId: Connection.nId,
            objectId: this._objectId,
            name: this.constructor.name,
            tileMapData: tileMapData,
        };
        return data;
    }
    debugTile(pos) {
        let test = [];
        for (let i = -5; i < 5; i++) {
            test.push([]);
            for (let j = -5; j < 5; j++) {
                if (this.isTileOnMap({ x: pos.y + i, y: pos.x + j })) {
                    if (i === 0 && j === 0) {
                        test.at(-1).push('@');
                    }
                    else {
                        test.at(-1).push(this.tileMap[pos.y + i][pos.x + j].toString());
                    }
                }
                else {
                    test.at(-1).push('#');
                }
            }
        }
        console.group();
        console.log(`Tile position: ${JSON.stringify(pos)}`);
        test.forEach((col) => console.log(col));
        console.groupEnd();
    }
    destroy() {
        if (this?.scene?.tileMap === this)
            this?.scene?.removeTileMap();
        this._relatedObjects.forEach((object) => object.destroy());
        Object.keys(this).forEach((prop) => (this[prop] = undefined));
    }
}
