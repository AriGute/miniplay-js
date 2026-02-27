## Classes Particles and ParticleHandler

**Purpose / usage**

The particle system lets you create simple **sprite‑based particle effects** (smoke, fire, leaves, etc.).  
`Particles` describes a single emitter, and `ParticleHandler` iterates over all active emitters and draws them.

### Class Particles

```ts
constructor(
  img: string,
  width: number,
  height: number,
  options?: {
    position: Point;
    timer?: number;
    delay?: number;
    maxCount?: number;
    randomRangeX?: number;
    randomRangeY?: number;
    randomRangeScale?: number;
    scaleWidth?: number;
    scaleHeight?: number;
    timeToLive?: number;
    forceX?: number;
    forceY?: number;
    preCycle?: boolean;
  },
)
```

- **input**
  - `img`: path to the particle sprite sheet.
  - `width`, `height`: frame size.
  - `options`: configuration object controlling burst rate, lifetime, forces and spawn area.
- **output**
  - Creates a new particle emitter and registers it globally.

Key options:
- `position`: where particles spawn in world space.  
- `delay`: time between spawns.  
- `maxCount`: maximum number of active particles.  
- `timeToLive`: life of each particle (seconds).  
- `forceX`, `forceY`: direction and speed of particle movement.  
- `randomRangeX`, `randomRangeY`: random offset around the emitter position.  
- `randomRangeScale`: random size variation.  
- `scaleWidth`, `scaleHeight`: global scale factors.  
- `preCycle`: if `true`, pre‑spawns particles so the effect appears already running.

#### Methods

- `public set enable(v: boolean)`  
  - **description**: Enables or disables this emitter; disabled emitters are removed from the global set.  
  - **output**: `void`.

- `public get isAlive(): boolean`  
  - **description**: Returns whether this emitter is still active.  
  - **output**: `boolean`.

- `public drawParticles(context2d: CanvasRenderingContext2D): void`  
  - **description**: Updates internal timers, spawns new particles if needed and draws current particles.  
  - **output**: `void`.

- `public clear(): void`  
  - **description**: Clears this emitter state and marks it as dead.  
  - **output**: `void`.

- `public remove(): void`  
  - **description**: Completely removes the emitter from the global map and clears its properties.  
  - **output**: `void`.

- `public static clear(): void`  
  - **description**: Clears all emitters (called when a scene is cleared).  
  - **output**: `void`.

### Class ParticleHandler

`ParticleHandler` extends `Particles` with static helpers that operate on all emitters.

- `public static drawParticles(context2d: CanvasRenderingContext2D): void`  
  - **description**: Iterates over all registered `Particles` and calls `drawParticles` on each alive emitter.  
  - **output**: `void`.

- `public static clear(): void`  
  - **description**: Clears and removes all emitters.  
  - **output**: `void`.

### Hello world example (smoke effect)

```ts
import {
  Scene,
  GameObject,
  Particles,
  ParticleHandler,
  Point,
  Frame,
} from 'miniplay-js';

class Campfire extends GameObject {
  private smoke: Particles;

  constructor(scene: Scene, position: Point) {
    super(position);
    this.setScene(scene);

    this.smoke = new Particles(
      '/assets/particles/smoke32x32.png',
      32,
      32,
      {
        position: new Point(position.x, position.y - 10),
        delay: 0.3,
        maxCount: 20,
        randomRangeX: 4,
        randomRangeY: 0,
        timeToLive: 5,
        forceX: 0,
        forceY: -5,
        randomRangeScale: 20,
        scaleWidth: 0.05,
        scaleHeight: 0.05,
        preCycle: true,
      },
    );
  }

  public update(): void {
    // no logic; particles are updated by ParticleHandler
  }

  protected nextDraw(): Frame {
    return null;
  }
}

// ParticleHandler.drawParticles(context2d) is already called by Scene.draw().
```

