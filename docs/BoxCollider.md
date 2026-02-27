## Class BoxCollider

**Purpose / usage**

`BoxCollider` is an axis‑aligned rectangle attached to a `GameObject` used for **collisions and hit detection**.  
You typically create one or more colliders in your object constructor and use the static helpers for global collision queries.

### Constructor

```ts
constructor(
  owner: GameObject,
  width: number,
  height: number,
  offSetPos: Point,
  active: boolean = true,
)
```

- **input**
  - `owner`: the `GameObject` this collider belongs to.
  - `width`, `height`: collider size in pixels.
  - `offSetPos`: offset from the owner position (top‑left of the box).
  - `active`: `true` for colliding (solid) boxes, `false` for passive hit boxes.  
- **output**
  - Registers the collider in the global collider sets and associates it with the owner.

### Instance properties

- `public get enable(): boolean` / `public set enable(v: boolean)`  
  - **description**: Turns this collider on/off and adds/removes it from the global sets.  
  - **input**: boolean.  
  - **output**: `void | boolean`.

- `public set isActive(isActive: boolean)`  
  - **description**: Switches this collider between active (solid) and passive (hit box).  
  - **input**: boolean.  
  - **output**: `void`.

- `public get x(): number`, `public get y(): number`  
  - **description**: World‑space top‑left coordinates of the collider.  
  - **input**: none.  
  - **output**: `number`.

- `public get relativeX(): number`, `public get relativeY(): number`  
  - **description**: Position in world space without camera scaling.  
  - **input**: none.  
  - **output**: `number`.

- `public get width(): number`, `public get height(): number`  
  - **description**: Stored collider size.  
  - **input**: none.  
  - **output**: `number`.

### Static collision helpers

- `public static checkGlobalBoxCollision(pointToTest: Point, colliders: BoxCollider[], targetHitBox?: boolean, ignoreTags?: string[]): GameObject | boolean`  
  - **description**: Tests if moving a set of colliders to `pointToTest` would hit another collider or a blocking tile.  
  - **input**: candidate `pointToTest`, list of this object's colliders, `targetHitBox` to test passive hitboxes, optional `ignoreTags`.  
  - **output**: the hit `GameObject`, `true` for tile collisions, or `false` if free.

- `public static checkGlobalCircleCollision(point: Point | { x: number; y: number }, radius: number, targetHitBox?: boolean): GameObject[]`  
  - **description**: Checks if a circle at `point` with `radius` intersects any colliders (used for melee ranges, AoE, etc.).  
  - **input**: center point, radius, optional flag to target hit boxes.  
  - **output**: list of hit game objects.

- `public static checkGlobalPointCollision(pointToTest: Point, targetHitBoxColliders?: boolean, targetActiveBoxCollider?: boolean, tileMapHitTest?: boolean, tileMapFilter?: TileBaseType[]): GameObject | boolean`  
  - **description**: Tests if a single point hits any collider or blocking tile.  
  - **input**: `pointToTest`, booleans to choose hitbox/active/tilemap checks, optional tile filter.  
  - **output**: hit `GameObject`, `true` for tile hit, or `false`.

- `public static checkTileMapCollision(pointToTest: { x: number; y: number }, tileMapFilter?: TileBaseType[]): boolean`  
  - **description**: Convenience wrapper to test collisions against the current `TileMap`.  
  - **input**: world position and optional tile filter.  
  - **output**: `true` if blocked.

- `public static setTileMapCollideFunction(fn: (pos: { x: number; y: number }, size: Size) => boolean): void`  
  - **description**: Called by `Scene.setTileMap` to integrate tilemap collisions.  
  - **input**: collision callback.  
  - **output**: `void`.

- `public static debugMod(context2d: CanvasRenderingContext2D): void`  
  - **description**: Draws all colliders for debugging when enabled.  
  - **input**: context.  
  - **output**: `void`.

- `public destroy(): void`  
  - **description**: Unregisters this collider from global sets.  
  - **input**: none.  
  - **output**: `void`.

- `public static clear(): void`  
  - **description**: Clears all colliders and tilemap callback (called when clearing the scene).  
  - **input**: none.  
  - **output**: `void`.

### Hello world example

This example creates a static gray wall block and a blue player block that moves to the right until it collides with the wall.

```ts
import {
  Scene,
  GameObject,
  BoxCollider,
  Point,
  Frame,
} from 'miniplay-js';

class SolidBlock extends GameObject {
  constructor(scene: Scene, position: Point) {
    super(scene, position);
    this.addTag('wall');
    this.addCollider(new BoxCollider(this, 32, 32, new Point(-16, -16, true)));
  }

  public update(): void {}

  protected nextDraw(ctx: CanvasRenderingContext2D): Frame {
    ctx.fillStyle = 'gray';
    ctx.fillRect(this.position.x - 16, this.position.y - 16, 32, 32);
    return null;
  }
}

class PlayerWithCollision extends GameObject {
  constructor(scene: Scene, position: Point) {
    super(scene, position);
    this.addCollider(new BoxCollider(this, 16, 16, new Point(-8, -8, true)));
  }

  public update(): void {
    const next = new Point(this.position.x + 1, this.position.y);
    const hit = BoxCollider.checkGlobalBoxCollision(next, this.colliders, false);
    if (!hit) {
      this.position = next;
    }
  }

  protected nextDraw(ctx: CanvasRenderingContext2D): Frame {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.position.x - 8, this.position.y - 8, 16, 16);
    return null;
  }
}
```

