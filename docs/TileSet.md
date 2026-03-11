## Class TileSet

**Purpose / usage**

`TileSet` maps logical tile types (like `TileBaseType.ground`, `water`, `wall`) and their **neighbor conditions** to sprite frames from an `AnimationFrames` spritesheet.  
You use it from `TileMap` / map classes (like a forest encounter map) to automatically pick the correct tile image based on surrounding tiles (autotiling).

### Constructor

```ts
constructor(imgSet: AnimationFrames, tileTypes: number[])
```

- **input**
  - `imgSet`: `AnimationFrames` instance that holds all frames for this tileset (e.g. a 36x36 forest tiles PNG).  
  - `tileTypes`: optional extra tile type ids (numbers) beyond the built‑in `TileBaseType` values that should get their own variant map.
- **output**
  - Initializes an internal `Map<TileBaseType | number, Map<string, number>>` where each tile type key holds a map from **condition key** → **frame index**.

By default, the following tile base types are supported:

- `TileBaseType.default` (fallback)
- `TileBaseType.ground`
- `TileBaseType.wall`
- `TileBaseType.water`
- `TileBaseType.hole`

### Useful types

- `TileBaseType`
  - **description**: Enum of base logical tile categories used by the engine.
  - **values**: `default`, `ground`, `wall`, `water`, `hole`.

- `tileVariantCondition`
  - **description**: Encodes the \"context\" around a tile to select a specific sprite frame.  
  - **shape**: Either a single-element array `[TileBaseType.default]` for a default variant, or a 4‑element array `[top, right, bottom, left]` using tile type ids.
  - **usage**: When the map generator knows the 4 neighbor types around a tile, it builds this array and uses it as the key to look up the correct frame.

### Methods

- `public addTileVariant(tileType: number, frameIndex: number, condition: tileVariantCondition): void`
  - **description**: Registers a sprite frame for a given `tileType` under a specific neighbor `condition`. Internally the condition array is turned into a string key with `condition.join()`.
  - **input**:
    - `tileType`: logical tile type (e.g. `TileBaseType.ground`, `TileBaseType.water`, or a custom id from `tileTypes`).
    - `frameIndex`: index in the `AnimationFrames` sprite sheet that should be used when the condition matches.
    - `condition`: `[TileBaseType.default]` for a default frame, or `[top, right, bottom, left]` for context‑sensitive variants.
  - **output**: `void`. Updates the internal `tileSet` map.

- `public getTileFrame(tileType: number, condition: string)`
  - **description**: Resolves the sprite frame for `tileType` and a serialized `condition` key, updates `imgSet`’s current frame, and returns the next `Frame`.
  - **input**:
    - `tileType`: tile type for which we want a frame.
    - `condition`: **string** key (typically produced by `conditionArray.join()`) that describes the current neighbor configuration.
  - **output**: `Frame` from the underlying `AnimationFrames` (or the default frame if no exact variant is registered).
  - **notes**:
    - If no exact condition exists for the given `condition`, it falls back to the variant registered under `[TileBaseType.default]`.

### Typical usage pattern

1. Create a `TileSet` with a forest tiles spritesheet.
2. Register a default ground tile.
3. Register multiple water and wall variants with different neighbor configurations.
4. In your `TileMap` subclass, when building the visual layer, compute a condition key from neighboring tile types and call `getTileFrame` to draw the correct sprite.

### Example: forest encounter map tileset

This is a simplified version of how a forest encounter map configures its tileset:

```ts
import { TileBaseType, TileSet } from 'miniplay-js';
import { AnimationFrames } from 'miniplay-js';

class ForestEventMap /* extends TileMap */ {
  private tileSet: TileSet;

  protected loadTileSet() {
    // 36x36 spritesheet with all forest tiles
    this.tileSet = new TileSet(
      new AnimationFrames(
        'forestMap',
        '/assets/tiles/encounters/encounter-forest.png',
        36,
        36
      ),
      []
    );

    // default ground tile (used as fallback)
    this.tileSet.addTileVariant(TileBaseType.ground, 0, [TileBaseType.default]);

    // a few water variants depending on neighbors (top, right, bottom, left)
    this.tileSet.addTileVariant(
      TileBaseType.water,
      1,
      [TileBaseType.ground, TileBaseType.water, TileBaseType.ground, TileBaseType.water]
    );
    this.tileSet.addTileVariant(
      TileBaseType.water,
      2,
      [TileBaseType.water, TileBaseType.ground, TileBaseType.water, TileBaseType.ground]
    );

    // ...more variants for rivers, shores, and bridges
  }
}
```

In your own maps, follow the same pattern:

- **Choose** a spritesheet and create an `AnimationFrames` for it.  
- **Register** a default variant per tile type using `[TileBaseType.default]`.  
- **Add** more variants with 4‑element conditions to handle edges, corners, and special transitions (e.g. ground → water).  
- **Use** `getTileFrame` during rendering, passing the correct `tileType` and the `condition.join()` string based on the tile’s neighbors.

