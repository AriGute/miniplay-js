## Class LightSource

**Purpose / usage**

`LightSource` is an abstract decoration that also **emits light** into the scene.  
It extends `Decorate` and registers itself in `LightSource.sources`, which is used by `drawLight` and `drawShadow` to render light and soft shadows.  
Use this base when building torches, lamps, or any object that should glow in a radius.

### Constructor

```ts
constructor(
  scene: Scene,
  point: Point,
  color?: [number, number, number],
  range?: number,
  offSet?: { x: number; y: number },
)
```

- **input**
  - `scene`: the owning `Scene`.
  - `point`: center position of the light in world space.
  - `color`: RGB array for the light color, e.g. `[255, 255, 255]` (default white).
  - `range`: light radius multiplier (default `1`).
  - `offSet`: offset of the light center from the object position, in pixels.
- **output**
  - Creates a decoration, stores color and radius, and adds it to `LightSource.sources`.

### Methods

- `public static sources: Map<string, LightSource>`  
  - **description**: Global registry of all active light sources by `objectId`.  
  - **input**: managed internally by the constructor/destroy logic.  
  - **output**: used by `drawLight` / `drawShadow`.

- `public offSet: { x: number; y: number }`  
  - **description**: Where the light is emitted relative to the object position (e.g. top of a torch).  
  - **input**: set in constructor or by subclass.  
  - **output**: consumed by the lighting system.

- `public color: number[]`  
  - **description**: RGB components of the light.  
  - **input**: `[r, g, b]`.  
  - **output**: used in radial gradient.

- `public range: number`  
  - **description**: Scales the radius of the light cone; higher values light a larger area.  
  - **input**: number.  
  - **output**: number.

- `protected updateFrameClock(): void`  
  - **description**: Internal helper to increment a `tick` and reset it based on `lightFlickerRate` (for flickering effects).  
  - **input**: none.  
  - **output**: `void`.

- `public static clear(): void`  
  - **description**: Clears all registered light sources and resets flicker rate (called when a scene is cleared).  
  - **input**: none.  
  - **output**: `void`.

### Hello world example (torch)

```ts
import {
  Scene,
  LightSource,
  AnimationStateMachine,
  AnimationOptions,
  Point,
  BoxCollider,
  Frame,
} from 'miniplay-js';

class Torch extends LightSource {
  private maxRange = 0.4;
  private minRange = 0.3;

  constructor(scene: Scene, position: Point) {
    super(scene, position, [224, 200, 176], 2, { x: 0, y: -12 });
    this.addCollider(new BoxCollider(this, 10, 5, new Point(-5, 12, true)));
  }

  protected addAnimations(): void {
    const options: AnimationOptions = { frameOffSet: { x: 0, y: 0 } };
    this.animationStateMachine = new AnimationStateMachine(this, options);
    this.animationStateMachine.addNewAnimation(
      'idle',
      '/assets/decorate/torch32x32.png',
      32,
      32,
      { loop: true },
    );
  }

  public update(): void {
    // simple flicker
    if (this.tick === 0) {
      this.range = this.minRange + (this.minRange - this.maxRange) * Math.random();
    }
    this.updateFrameClock();
  }

  protected nextDraw(): Frame {
    return this.animationStateMachine.getAndUpdateAnimationFrames().getNextFrame();
  }
}
```

