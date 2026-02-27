## Class GameObject

**Purpose / usage**

`GameObject` is the abstract base class for everything that lives inside a `Scene`.  
It stores the object position, colliders, tags and update/draw lifecycle, and also helps with ordering objects by their Y position.  
You extend this class to implement your own in‑game entities that are **not** directly networked (for networked entities use `NetworkGameObject`).

See also: [`Scene`](./Scene.md), [`NetworkGameObject`](./NetworkGameObject.md), [`BoxCollider`](./BoxCollider.md).

### Constructor

```ts
constructor(
  scene: Scene,
  point?: Point,
  remoteController?: RemoteController | null,
  gameObjectId?: string,
)
```

- **input**
- `scene`: the owning `Scene`.
- `point`: initial world position (defaults to `(0, 0)`).
- `remoteController`: optional controller for networked input (usually `null` for plain `GameObject`s).
- `gameObjectId`: optional custom id (otherwise a random id is generated).
- **output**
  - Creates a new `GameObject` with a unique id and registers it in the internal drawing sets.

### Methods

- **Lifecycle**
  - `public abstract update(): void`  
    - **description**: Per‑frame logic for this object.  
    - **input**: none.  
    - **output**: `void`.
  - `protected abstract nextDraw(context2d: CanvasRenderingContext2D): Frame`  
    - **description**: Called by `draw`, returns the frame (sprite) to draw or `null` if the object draws manually.  
    - **input**: `context2d` – the main scene canvas context.  
    - **output**: `Frame | null`.
  - `public draw(context2d: CanvasRenderingContext2D): void`  
    - **description**: Calls `nextDraw` and draws the returned frame to the canvas. You rarely override this directly.  
    - **input**: `context2d`.  
    - **output**: `void`.
  - `public destroy(): void`  
    - **description**: Removes the object from its `Scene`, clears colliders and particle components, making it eligible for GC.  
    - **input**: none.  
    - **output**: `void`.

- **Scene and position**
  - `public get position(): Point`  
    - **description**: Current world position of the object (with camera unscaled coordinates).  
    - **input**: none.  
    - **output**: `Point`.
  - `public set position(point: Point)`  
    - **description**: Updates the world position and re‑orders the object in the internal draw sequence.  
    - **input**: `point`.  
    - **output**: `void`.
  - `public get relativePosition(): { x: number; y: number }`  
    - **description**: Position in world space without offsets.  
    - **input**: none.  
    - **output**: `{ x, y }`.
  - `public get centerPosition(): { x: number; y: number } | null`  
    - **description**: Returns the center of the main collider, useful for aiming and distance checks.  
    - **input**: none.  
    - **output**: `{ x, y }` or `null` if no collider.

- **Colliders**
  - `public get colliders(): BoxCollider[]`  
    - **description**: All active colliders attached to this object.  
    - **input**: none.  
    - **output**: `BoxCollider[]`.
  - `protected addCollider(collider: BoxCollider, isMainCollider = false): void`  
    - **description**: Attach a collider; if this is the first collider the object becomes depth‑sorted.  
    - **input**: `collider`, optional `isMainCollider` (put collider first).  
    - **output**: `void`.
  - `protected removeCollider(collider: BoxCollider): void`  
    - **description**: Detach a specific collider and update draw ordering.  
    - **input**: collider to remove.  
    - **output**: `void`.
  - `protected clearColliders(): void`  
    - **description**: Remove all colliders and disable them.  
    - **input**: none.  
    - **output**: `void`.
  - `public get hitBoxColliders(): BoxCollider[]`  
    - **description**: Optional non‑blocking hitbox colliders (for attacks, triggers, etc.).  
    - **input**: none.  
    - **output**: `BoxCollider[]`.

- **Enable / disable**
  - `public get enable(): boolean`  
    - **description**: Whether the object is active and should update/draw.  
    - **input**: none.  
    - **output**: `boolean`.
  - `public set enable(v: boolean)`  
    - **description**: Enable/disable the object and any attached particle systems.  
    - **input**: `v`.  
    - **output**: `void`.

- **Tags and lookup**
  - `protected addTag(tag: string): void`  
    - **description**: Adds a tag and registers the object in the global tag map.  
    - **input**: tag string.  
    - **output**: `void`.
  - `public hasTag(tag: string): boolean`  
    - **description**: Check if the object has a specific tag.  
    - **input**: tag string.  
    - **output**: `boolean`.
  - `public getTags(): string[]`  
    - **description**: Returns all tags attached to this object.  
    - **input**: none.  
    - **output**: `string[]`.
  - `public static getGameObjectByTag(tag: string): GameObject[]`  
    - **description**: Find all objects that have the given tag.  
    - **input**: tag.  
    - **output**: `GameObject[]`.
  - `public static getGameObjectById(id: string): GameObject | undefined`  
    - **description**: Look up a single object by id (delegates to `Scene`).  
    - **input**: id.  
    - **output**: `GameObject | undefined`.

- **Networking support helpers**
  - `public getDataToSync(): DataToSend`  
    - **description**: Returns a serializable payload describing this object (id, owner id, position, tags).  
    - **input**: none.  
    - **output**: `DataToSend`.
  - `public isMe(objectId: string, nId: string): boolean`  
    - **description**: Returns `true` if this object belongs to the given network id and object id.  
    - **input**: `objectId`, `nId`.  
    - **output**: `boolean`.

- **Pathfinding**
  - `protected findPath(target: Point | { x: number; y: number }): Path`  
    - **description**: Uses the active `TileMap` on the scene to compute a path from this object to `target`.  
    - **input**: target position.  
    - **output**: `Path` (array of tile positions) or empty array if no tile map.

- **Static helpers**
  - `public static clear(): void`  
    - **description**: Destroys all existing game objects and clears the internal draw sets.  
    - **input**: none.  
    - **output**: `void`.

### Hello world example

This example creates a simple yellow square `GameObject` and adds it to a scene so it appears at a fixed position on the screen.

```ts
import {
  Scene,
  GameObject,
  Point,
  BoxCollider,
  Frame,
} from 'miniplay-js';

class HelloWorldObject extends GameObject {
  constructor(scene: Scene, position: Point = new Point(100, 100)) {
    super(scene, position);
    this.addTag('hello');
    this.addCollider(new BoxCollider(this, 16, 16, new Point(-8, -8, true)));
  }

  public update(): void {
    // simple idle logic – no movement
  }

  protected nextDraw(ctx: CanvasRenderingContext2D): Frame {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.position.x - 8, this.position.y - 8, 16, 16);
    return null;
  }
}

class MyScene extends Scene {
  onConnectionLost(): void {}

  onLoad(): void {
    this.addElement(this.element({ type: 'div', child: [this.createGameCanvas()] }));
  }

  onStart(): void {
    const hello = new HelloWorldObject(this, new Point(120, 120));
    this.addObject(hello);
  }
}
```

