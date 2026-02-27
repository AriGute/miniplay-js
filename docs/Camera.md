## Class Camera

**Purpose / usage**

`Camera` is a static helper that represents the **view window** into your world.  
It tracks a position and follows a target `GameObject`, and the `TileMap` uses it to draw only the visible tiles.

### Properties

- `public static get heigh(): number`  
  - **description**: Current target resolution height (from `config`).  
  - **output**: `number`.
- `public static get width(): number`  
  - **description**: Current target resolution width.  
  - **output**: `number`.
- `public static get position(): { x: number; y: number }`  
  - **description**: Top‑left corner of the camera in world space.  
  - **output**: `{ x, y }`.

### Methods

- `public static follow(target: GameObject, border?: IBorder): void`  
  - **description**: Smoothly moves the camera towards `target`, optionally clamped by `border`.  
  - **input**:  
    - `target`: object to follow (must have a collider).  
    - `border`: `{ xMin, xMax, yMin, yMax }` world‑space bounds.  
  - **output**: `void`.

### Hello world example

```ts
import {
  Scene,
  Camera,
  GameObject,
  Point,
  BoxCollider,
  Frame,
} from 'miniplay-js';

class Player extends GameObject {
  constructor(scene: Scene, position: Point) {
    super(position);
    this.setScene(scene);
    this.addCollider(new BoxCollider(this, 16, 24, new Point(-8, -12, true)));
  }

  public update(): void {
    // move player ...
    Camera.follow(this);
  }

  protected nextDraw(ctx: CanvasRenderingContext2D): Frame {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.position.x - 8, this.position.y - 12, 16, 24);
    return null;
  }
}
```

