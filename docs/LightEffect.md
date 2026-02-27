## LightEffect helpers

**Purpose / usage**

The `LightEffect` module provides two functions, `drawLight` and `drawShadow`, that take all active `LightSource`s and draw **dynamic lighting and soft shadows** on top of the scene.

You usually do not call them manually; the `Scene` integrates them into the main draw loop.

### Functions

- `drawLight(context2d: CanvasRenderingContext2D): void`  
  - **description**: Iterates through `LightSource.sources` and draws radial gradients around each active light.  
  - **input**: the main scene rendering context.  
  - **output**: `void`.

- `drawShadow(context2d: CanvasRenderingContext2D, collider: BoxCollider): void`  
  - **description**: Draws an ellipse under a collider, darkened relative to the nearest light source, to simulate a shadow.  
  - **input**: scene context and a `BoxCollider` (usually the main collider of a `NetworkGameObject` or character).  
  - **output**: `void`.

### Hello world example

Normally you do not modify the scene loop, but this is roughly how lighting is used internally:

```ts
import {
  Scene,
  LightSource,
  drawLight,
  drawShadow,
  NetworkGameObject,
  BoxCollider,
} from 'miniplay-js';

// In Scene.draw (already implemented in the engine):
// ...
// 1. Draw tilemap and game objects
// 2. Draw collider debug
// 3. Draw light and UI
drawLight(context2d);

// For each NetworkGameObject, Scene calls:
// drawShadow(context2d, object.colliders[0]);
```

