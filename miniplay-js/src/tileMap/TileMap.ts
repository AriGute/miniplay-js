import { Scene } from '../abstract/Scene.js';
import { Frame } from '../animations/AnimationInterfaces.js';
import { Point } from '../Point.js';
import { Camera } from '../Camera.js';
import { config } from '../../config.js';
import { LeanPoint, Size } from '../collider/BoxCollider.js';
import { Path, PathFinding } from './PathFinding.js';
import { TileSet, TileBaseType } from './TileSet.js';
import { generateId, manhattanDistance } from '../utils.js';
import { Connection } from '../networking/Connection.js';
import { GameObject } from '../abstract/GameObject.js';

export interface TileMapData {
	_startPoint: LeanPoint;
	_endPoint: LeanPoint;
	rooms: Room[];
	tileMap: TileBaseType[][];
	maxX: number;
	maxY: number;
}

/**
 * @param maxPaths maximum roads from single room
 * @param minRoomSize minimum size for single room
 * @param maxRoomsSize	maximum size of single room
 * @param numOfRooms	maximum number of rooms (could be less)
 * @param roomsBorder	place border around rooms
 * @param islands	single non-ground tile surrounded by ground
 * @param islandsSize	if bigger then 0 then expend islands by that amount
 * @param fillVoid	non-walkable tile surrounded by non-walkable tiles.
 * @param numOfRivers	replace paths with rivers.
 */
export interface RandomTileMapConfig {
	maxPaths: number;
	minRoomSize: number;
	maxRoomsSize: number;
	numOfRooms: number;
	roomsBorder: boolean;
	islands: boolean;
	islandsSize: number;
	fillVoid: boolean;
	river: boolean;
}

export interface Room {
	paths: Path[];
	pos: LeanPoint;
	size: number;
}

export abstract class TileMap {
	protected _objectId: string;
	public get objectId(): string {
		return this._objectId;
	}

	// on destroying this tile map, destroy and remove every object on this list.
	protected abstract _relatedObjects: GameObject[];

	public get relatedObjects(): GameObject[] {
		return this._relatedObjects;
	}

	private _enable: boolean = false;
	public set enable(v: boolean) {
		if (this._relatedObjects) {
			if (v === true) {
				this._relatedObjects = this._relatedObjects.filter((object) => {
					if (object.objectId === undefined) {
						return false;
					} else {
						return true;
					}
				});
				this._relatedObjects.forEach((object) => (object.enable = true));
			} else if (v === false) {
				this._relatedObjects.forEach((object) => (object.enable = false));
			}
		} else {
			this._relatedObjects = [];
		}
		this._enable = v;
	}

	public get enable(): boolean {
		return this._enable;
	}

	protected _startPoint: LeanPoint = null;
	public get startPoint(): Point {
		return new Point(this._startPoint.x * config.graphics.tileMap.tileSize, this._startPoint.y * config.graphics.tileMap.tileSize, true);
	}
	private _spawnPoint: Generator<Point, void, unknown> = null;

	public get spawnPoint(): Point {
		return this._spawnPoint.next().value || this.startPoint;
	}

	protected _endPoint: LeanPoint = null;
	public get endPoint(): Point {
		return new Point(this._endPoint.x * config.graphics.tileMap.tileSize, this._endPoint.y * config.graphics.tileMap.tileSize);
	}

	protected rooms: Room[] = [];

	protected abstract walkableTiles: TileBaseType[];
	protected abstract tileSet: TileSet;

	public backGroundCanvas: OffscreenCanvas = null;
	public backGroundContext2d: OffscreenCanvasRenderingContext2D = null;

	protected readonly _tileMap: TileBaseType[][] = [];

	public get tileMap(): TileBaseType[][] {
		return this._tileMap;
	}

	protected _maxX: number;

	public get maxX(): number {
		return this._maxX;
	}

	protected _maxY: number;
	public get maxY(): number {
		return this._maxY;
	}

	protected TILE_SIZE: number = config.graphics.tileMap.tileSize;

	protected scene: Scene;
	public readonly SCALED_TILE_SIZE_X: number = Math.round(config.graphics.tileMap.tileSize);
	private readonly SCALED_TILE_SIZE_Y: number = Math.round(config.graphics.tileMap.tileSize);

	constructor(scene: Scene, maxX: number, maxY: number, objectId = generateId(), initiateData?: TileMapData) {
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

	public setTileMapCollideFunction() {}

	protected placeTile(tileType: number, x: number, y: number) {
		if (y < this._maxY && x < this._maxX) {
			if (!this._tileMap[y]) this._tileMap[y] = [];
			this._tileMap[y][x] = tileType;
		} else {
			console.error('TileMap->placeTile: attempting to place tile outside of tileMap bounds');
		}
	}

	public prepareNextDraw(context2d: CanvasRenderingContext2D) {
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
					context2d.drawImage(
						img,
						frameCut.sourceX,
						frameCut.sourceY,
						frameCut.width,
						frameCut.height,
						position.x,
						position.y,
						this.SCALED_TILE_SIZE_X,
						this.SCALED_TILE_SIZE_Y,
					);
				} else {
					this.getTile(x, y);
					return;
				}
			}
		}
	}

	protected generateRandomMap(mapConfig: RandomTileMapConfig) {
		// place full default map
		for (let y = 0; y < this._maxY; y++) {
			for (let x = 0; x < this._maxX; x++) {
				this.placeTile(TileBaseType.default, x, y);
			}
		}

		const fullRooms: Room[] = [];
		// each iteration reduce the max length between rooms (infinite loop avoidance).
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

		// connect rooms with paths
		for (let i = 0; i < this.rooms.length; i++) {
			const room = this.rooms[i];
			const numOfPaths = Math.floor(Math.random() * mapConfig.maxPaths);
			for (let j = 0; j < numOfPaths; j++) {
				const randomIndex = Math.floor(Math.random() * this.rooms.length);
				const pickRandomRoom = this.rooms[randomIndex];
				if (room === pickRandomRoom) continue;
				const path = PathFinding.a_star(this._tileMap, [TileBaseType.default], room.pos, pickRandomRoom.pos).map((step) => this.normalizePosition(step));
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
			let typeOfTile = TileBaseType.ground;
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
					this._tileMap[tile.y][tile.x] = TileBaseType.ground;
				});
			});
			// expend rooms to random sizes
			room.size = Math.floor(Math.random() * mapConfig.maxRoomsSize) + mapConfig.minRoomSize;
			for (let y = -room.size; y < room.size; y++) {
				if (room.pos.y + y < 0 || room.pos.y + y > this._maxY - 1) continue;
				for (let x = -room.size; x < room.size; x++) {
					if (room.pos.x + x < 0 || room.pos.x + x > this._maxX - 1) continue;
					if (this._tileMap[room.pos.y + y][room.pos.x + x] === TileBaseType.default) {
						this._tileMap[room.pos.y + y][room.pos.x + x] = TileBaseType.ground;
					}
				}
			}
		});

		let shouldReplace = [];
		// place walls where there is no ground to walk on
		for (let y = 0; y < this._maxY; y++) {
			for (let x = 0; x < this._maxX; x++) {
				if (this._tileMap[y][x] === TileBaseType.default) {
					this._tileMap[y][x] = TileBaseType.wall;
				}
			}
		}

		if (mapConfig.fillVoid) {
			// place default where there is 4 walls (up, down, left, right)
			for (let y = 0; y < this._maxY; y++) {
				for (let x = 0; x < this._maxX; x++) {
					if (this._tileMap[y][x] === TileBaseType.wall) {
						if (y < 1 || y > this._maxY - 2) continue;
						if (x < 1 || x > this._maxX - 2) continue;
						if (
							this._tileMap[y][x + 1] === TileBaseType.wall &&
							this._tileMap[y - 1][x] === TileBaseType.wall &&
							this._tileMap[y][x - 1] === TileBaseType.wall &&
							this._tileMap[y + 1][x] === TileBaseType.wall
						) {
							shouldReplace.push({ x, y });
						}
					}
				}
			}
			shouldReplace.forEach((pos) => {
				this._tileMap[pos.y][pos.x] = TileBaseType.default;
			});
		}

		// place default where there is 4 walls (up, down, left, right)
		shouldReplace = [];
		for (let y = 0; y < this._maxY; y++) {
			for (let x = 0; x < this._maxX; x++) {
				if (this._tileMap[y][x] === TileBaseType.default) {
					if (y < 1 || y > this._maxY - 2) continue;
					if (x < 1 || x > this._maxX - 2) continue;
					if (
						this._tileMap[y + 1][x] === TileBaseType.wall &&
						this._tileMap[y + 1][x + 1] === TileBaseType.ground &&
						this._tileMap[y][x + 1] === TileBaseType.wall
					) {
						shouldReplace.push({ x, y });
					} else if (
						this._tileMap[y][x + 1] === TileBaseType.wall &&
						this._tileMap[y - 1][x + 1] === TileBaseType.ground &&
						this._tileMap[y - 1][x] === TileBaseType.wall
					) {
						shouldReplace.push({ x, y });
					} else if (
						this._tileMap[y][x - 1] === TileBaseType.wall &&
						this._tileMap[y - 1][x - 1] === TileBaseType.ground &&
						this._tileMap[y - 1][x] === TileBaseType.wall
					) {
						shouldReplace.push({ x, y });
					} else if (
						this._tileMap[y][x - 1] === TileBaseType.wall &&
						this._tileMap[y + 1][x - 1] === TileBaseType.ground &&
						this._tileMap[y + 1][x] === TileBaseType.wall
					) {
						shouldReplace.push({ x, y });
					}
				}
			}
		}

		shouldReplace.forEach((pos) => {
			this._tileMap[pos.y][pos.x] = TileBaseType.wall;
		});

		// place start room and end room
		let pickRandomStartRoom;
		for (let i = 0; i < this.rooms.length; i++) {
			const pickRandomStartRoom = this.rooms[i];
			const randomPosition = {
				x: pickRandomStartRoom.pos.x,
				y: pickRandomStartRoom.pos.y,
			};
			if (
				randomPosition.x > pickRandomStartRoom.size &&
				randomPosition.x < this._maxX - pickRandomStartRoom.size &&
				randomPosition.y > pickRandomStartRoom.size &&
				randomPosition.y < this._maxY - pickRandomStartRoom.size
			) {
				if (this.isTileOnMap(randomPosition) && this._tileMap[randomPosition.y][randomPosition.x] === TileBaseType.ground) {
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
				if (this.isTileOnMap(randomPosition) && this._tileMap[randomPosition.y][randomPosition.x] === TileBaseType.ground) {
					this._endPoint = randomPosition;
				}
			}
		}

		// place wall border around the room
		for (let x = 0; x < this._maxX; x++) {
			this.placeTile(TileBaseType.wall, x, 0);
		}
		for (let x = 0; x < this._maxX; x++) {
			this.placeTile(TileBaseType.wall, x, this._maxY - 1);
		}
		for (let y = 0; y < this._maxY; y++) {
			this.placeTile(TileBaseType.wall, 0, y);
		}
		for (let y = 0; y < this._maxY; y++) {
			this.placeTile(TileBaseType.wall, this._maxX - 1, y);
		}

		if (mapConfig.river) {
			const distList =
				Math.random() > 0.5 ? this.rooms.toSorted((a, b) => (a.pos.x < b.pos.x ? 1 : -1)) : this.rooms.toSorted((a, b) => (a.pos.y < b.pos.y ? 1 : -1));
			const riverPath = PathFinding.a_star(
				this._tileMap,
				[TileBaseType.ground, TileBaseType.wall, TileBaseType.default],
				distList[0].pos,
				distList.at(-1).pos,
			).map((step) => this.normalizePosition(step));
			riverPath.forEach((step) => {
				let sideStep = { x: step.x, y: step.y };

				if (this.isTileOnMap(sideStep)) {
					this.tileMap[sideStep.y][sideStep.x] = TileBaseType.water;
				}

				sideStep = { x: step.x - 1, y: step.y };
				if (this.isTileOnMap(sideStep)) {
					this.tileMap[sideStep.y][sideStep.x] = TileBaseType.water;
				}
				sideStep = { x: step.x, y: step.y + 1 };
				if (this.isTileOnMap(sideStep)) {
					this.tileMap[sideStep.y][sideStep.x] = TileBaseType.water;
				}
			});
		}

		if (!mapConfig.islands) {
			for (let y = 0; y < this._maxY; y++) {
				for (let x = 0; x < this._maxX; x++) {
					if (this._tileMap[y][x] === TileBaseType.wall) {
						if (y < 1 || y > this._maxY - 2) continue;
						if (x < 1 || x > this._maxX - 2) continue;
						if (
							this._tileMap[y][x + 1] === TileBaseType.ground &&
							this._tileMap[y - 1][x] === TileBaseType.ground &&
							this._tileMap[y][x - 1] === TileBaseType.ground &&
							this._tileMap[y + 1][x] === TileBaseType.ground
						) {
							this._tileMap[y][x] = TileBaseType.ground;
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

	protected getTile(x: number, y: number): Frame {
		if (y < this._maxY && x < this._maxX) {
			if (!this._tileMap[y]) this._tileMap[y] = [];
			const tileType = this._tileMap[y][x];
			let condition = [
				y > 0 ? this._tileMap[y - 1][x] : TileBaseType.ground, // up
				x < this._maxX - 1 ? this._tileMap[y][x + 1] : TileBaseType.ground, // right
				y < this._maxY - 1 ? this._tileMap[y + 1][x] : TileBaseType.ground, // down
				x > 0 ? this._tileMap[y][x - 1] : TileBaseType.ground, // left
			];
			const frame = this.tileSet.getTileFrame(tileType, condition.join());
			return frame;
		}
	}

	/**
	 * @param position position in space to check
	 * @param size size of object to normalize position
	 * @param customTileFilter filter for what to check with (e.g. walls, water etc..)
	 * @returns true for blocking tile
	 */
	public checkTileMapCollision(position: LeanPoint, size: Size, customTileFilter?: TileBaseType[]): boolean {
		const normalizedPosition = this.normalizePosition(position, size);
		if (!this._tileMap) return false;
		if (!this.isTileOnMap(normalizedPosition)) return true;
		if (this._tileMap[normalizedPosition.y]) {
			const tile: TileBaseType = this._tileMap[normalizedPosition.y][normalizedPosition.x];
			if ((customTileFilter && !customTileFilter.includes(tile)) || this.walkableTiles.includes(tile)) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	private *spawnPointGenerator() {
		yield this.startPoint;
		// const spawnRadius = config.graphics.tileMap.tileSize / 2;
		// while (true) {
		// 	yield new Point(this.startPoint.x - spawnRadius, this.startPoint.y + spawnRadius);
		// 	yield new Point(this.startPoint.x + spawnRadius, this.startPoint.y + spawnRadius);
		// 	yield new Point(this.startPoint.x + spawnRadius, this.startPoint.y - spawnRadius);
		// 	yield new Point(this.startPoint.x - spawnRadius, this.startPoint.y - spawnRadius);
		// }
	}

	public findPath(startPosition: Point | LeanPoint, targetPosition: Point | LeanPoint): Path {
		let normalizedCurrentPosition: LeanPoint =
			startPosition instanceof Point
				? this.normalizePosition({
						x: startPosition.relativeX,
						y: startPosition.relativeY,
				  })
				: this.normalizePosition(startPosition);

		let normalizedTargetPosition: LeanPoint = this.normalizePosition(targetPosition);

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

	/**
	 * find walkable tile if the current tile is not walkable based of the direction after Math.round .
	 * @param directionHint hint for the increment or decrement after Math.round.
	 */
	private findSuitableWalkableTile(pos: LeanPoint, directionHint: LeanPoint = { x: 0, y: 0 }) {
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

	public normalizePosition(position: LeanPoint, offsetSize?: Size, roundResults: boolean = true): LeanPoint {
		// Math.round is impotent for 0.4~0.5 positions, we cant use something like Math.floor .
		let results = { x: 0, y: 0 };
		if (offsetSize) {
			results = {
				x: (position.x - offsetSize.width) / this.SCALED_TILE_SIZE_X,
				y: (position.y - offsetSize.height / 4) / this.SCALED_TILE_SIZE_Y,
			};
		} else {
			results = {
				x: position.x / this.SCALED_TILE_SIZE_X,
				y: position.y / this.SCALED_TILE_SIZE_Y,
			};
		}
		if (roundResults) {
			return { x: Math.round(results.x), y: Math.round(results.y) };
		} else {
			return results;
		}
	}

	public isTileOnMap(position: LeanPoint) {
		if (position.x < 0.1) return false;
		if (position.y < 0.1) return false;
		if (position.x > this._maxX - 1.1) return false;
		if (position.y > this._maxY - 1.1) return false;
		return true;
	}

	public static isTileOnMap(position: LeanPoint, tileMap: TileMap) {
		if (position.x < 0) return false;
		if (position.y < 0) return false;
		if (position.x > tileMap._maxX - 1) return false;
		if (position.y > tileMap._maxY - 1) return false;
		return true;
	}

	protected createTileMapCanvas() {
		this.backGroundCanvas = new OffscreenCanvas(config.graphics.targetResolution.width, config.graphics.targetResolution.height);
		this.backGroundContext2d = this.backGroundCanvas.getContext('2d', {
			alpha: false,
			desynchronized: true,
		});
		this.backGroundContext2d.imageSmoothingEnabled = config.graphics.imageSmoothing;
	}

	public getDataToSync() {
		const tileMapData: TileMapData = {
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

	protected abstract loadTileSet();

	public debugTile(pos: LeanPoint) {
		let test = [];
		for (let i = -5; i < 5; i++) {
			test.push([]);
			for (let j = -5; j < 5; j++) {
				if (this.isTileOnMap({ x: pos.y + i, y: pos.x + j })) {
					if (i === 0 && j === 0) {
						test.at(-1).push('@');
					} else {
						test.at(-1).push(this.tileMap[pos.y + i][pos.x + j].toString());
					}
				} else {
					test.at(-1).push('#');
				}
			}
		}
		console.group();
		console.log(`Tile position: ${JSON.stringify(pos)}`);
		// console.table(test);
		test.forEach((col) => console.log(col));

		console.groupEnd();
	}

	/**
	 * stop this.update and this.draw
	 * suppose to make this gameObject eligible for garbage collecting.
	 */
	public destroy() {
		if (this?.scene?.tileMap === this) this?.scene?.removeTileMap();
		this._relatedObjects.forEach((object) => object.destroy());
		Object.keys(this).forEach((prop) => (this[prop] = undefined));
	}
}
