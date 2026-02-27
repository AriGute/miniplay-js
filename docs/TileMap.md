## Class TileMap

**Purpose / usage**

`TileMap` is an abstract base for **grid‑based worlds** rendered under your game objects.  
It stores a 2D array of tiles, draws the visible region to an offscreen canvas, provides collision checks, spawn points and A* pathfinding.

You extend `TileMap` for each type of map (world map, dungeon, encounter, etc.) and assign it to a `Scene` with `scene.setTileMap(map)`.

See also: [`Scene`](./Scene.md), [`BoxCollider`](./BoxCollider.md).

### Constructor

```ts
constructor(
  scene: Scene,
  maxX: number,
  maxY: number,
  objectId?: string,
  initiateData?: TileMapData,
)
```

- **input**
  - `scene`: owning `Scene`.
  - `maxX`, `maxY`: map width/height in tiles.
  - `objectId`: optional id used for networking.
  - `initiateData`: existing `TileMapData` when reconstructing from the network.
- **output**
  - Creates tile storage, offscreen canvas and spawn point generator. When `initiateData` is provided, reuses the saved tiles and rooms.

### Core properties

- `public get objectId(): string`  
  - **description**: Unique id used in networking messages.  
  - **input**: none.  
  - **output**: `string`.

- `protected abstract _relatedObjects: GameObject[]` / `public get relatedObjects(): GameObject[]`  
  - **description**: Objects that belong to this map (enemies, chests, etc.). Disabled/enabled together with the map.  
  - **input**: managed by subclass.  
  - **output**: list of game objects.

- `public set enable(v: boolean)` / `public get enable(): boolean`  
  - **description**: Enables/disables the map and all `relatedObjects`.  
  - **input**: boolean.  
  - **output**: `void | boolean`.

- `public get startPoint(): Point`  
  - **description**: Recommended spawn position for players, in world coordinates.  
  - **input**: none.  
  - **output**: `Point`.

- `public get spawnPoint(): Point`  
  - **description**: Generator‑based spawn point (first call returns `startPoint`).  
  - **input**: none.  
  - **output**: `Point`.

- `public get maxX(): number`, `public get maxY(): number`  
  - **description**: Map dimensions in tiles.  
  - **input**: none.  
  - **output**: `number`.

### Abstract fields to implement

- `protected abstract walkableTiles: TileBaseType[]`  
  - **description**: Tiles that characters are allowed to walk on.  
  - **input**: list of tile types.  
  - **output**: used for pathfinding and collision checks.

- `protected abstract tileSet: TileSet`  
  - **description**: Maps tile types + neighbor conditions to sprite frames.  
  - **input**: built in subclass.  
  - **output**: used by `getTile`.

- `protected abstract loadTileSet(): void`  
  - **description**: Subclass fills the `tileSet` with variants for each `TileBaseType`.  
  - **input**: none.  
  - **output**: `void`.

### Main methods

- `protected placeTile(tileType: TileBaseType, x: number, y: number): void`  
  - **description**: Writes a tile into the `_tileMap` grid.  
  - **input**: tile type and coordinates.  
  - **output**: `void`.

- `public prepareNextDraw(context2d: CanvasRenderingContext2D): void`  
  - **description**: Draws the visible portion of the tile map into the offscreen `backGroundCanvas` based on `Camera.position`.  
  - **input**: scene context (only used to clear background color).  
  - **output**: `void`.

- `public checkTileMapCollision(position: { x: number; y: number }, size: Size, customTileFilter?: TileBaseType[]): boolean`  
  - **description**: Returns `true` when a box at `position` with `size` hits a blocking tile.  
  - **input**: position, box size and optional tile filter.  
  - **output**: `boolean`.

- `public normalizePosition(position: { x: number; y: number }, offsetSize?: Size, roundResults?: boolean): { x: number; y: number }`  
  - **description**: Converts world coordinates into tile indices, optionally rounding.  
  - **input**: position, optional box size and flag.  
  - **output**: normalized tile coords.

- `public isTileOnMap(position: { x: number; y: number }): boolean`  
  - **description**: Returns `false` if tile coordinates are outside the map.  
  - **input**: tile coordinates.  
  - **output**: `boolean`.

- `public findPath(start: Point | { x: number; y: number }, target: Point | { x: number; y: number }): Path`  
  - **description**: Uses `PathFinding.a_star` to compute a path between two positions, snapping them to nearby walkable tiles.  
  - **input**: start and target positions.  
  - **output**: `Path` (array of tiles).

- `public getDataToSync(): { nId: string; objectId: string; name: string; tileMapData: TileMapData }`  
  - **description**: Packages the tile map data for networking.  
  - **input**: none.  
  - **output**: serializable payload.

- `public destroy(): void`  
  - **description**: Detaches this map from the scene, destroys related objects and clears its properties.  
  - **input**: none.  
  - **output**: `void`.

### Hello world example (simple forest encounter)

This example creates a basic forest tile map filled with ground tiles and exposes a central spawn point for players.

```ts
import {
  Scene,
  TileMap,
  TileSet,
  TileBaseType,
  AnimationFrames,
  GameObject,
  Point,
  config,
} from 'miniplay-js';

class ForestEncounterMap extends TileMap {
  protected _relatedObjects: GameObject[] = [];
  protected walkableTiles: TileBaseType[] = [TileBaseType.ground];
  protected tileSet: TileSet;

  constructor(scene: Scene, maxX: number, maxY: number) {
    super(scene, maxX, maxY);
    this.loadTileSet();

    // very simple: fill with ground tiles
    for (let y = 0; y < maxY; y++) {
      for (let x = 0; x < maxX; x++) {
        this.placeTile(TileBaseType.ground, x, y);
      }
    }
    this._startPoint = { x: (maxX / 2) | 0, y: (maxY / 2) | 0 };
  }

  protected loadTileSet(): void {
    const frames = new AnimationFrames(
      'forest',
      '/assets/tiles/encounters/encounter-forest.png',
      config.graphics.tileMap.tileSize,
      config.graphics.tileMap.tileSize,
    );
    this.tileSet = new TileSet(frames, []);
    this.tileSet.addTileVariant(TileBaseType.ground, 0, [TileBaseType.default]);
  }
}

// in a Scene:
// const map = new ForestEncounterMap(this, 30, 30);
// this.setTileMap(map);
// const spawn = map.spawnPoint; // use for player starting point
```

