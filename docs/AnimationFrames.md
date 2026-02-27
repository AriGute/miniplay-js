## Class AnimationFrames

**Purpose / usage**

`AnimationFrames` loads a spritesheet image (or bitmap), **splits it into frames**, and lets you iterate over them.  
Use it to create static images (one frame) or looping animations (multiple frames) and feed the resulting `Frame` into your `GameObject.nextDraw`.

### Constructor

```ts
constructor(
  animName: string,
  imgUrl: string | null,
  width?: number,
  height?: number,
  options?: AnimationOptions,
  bitMap?: ImageBitmap,
)
```

- **input**
  - `animName`: logical name of this animation (used as key in `AnimationStateMachine`).
  - `imgUrl`: path to the sprite sheet image; can be `null` when you pass a pre‑built `bitMap`.
  - `width`, `height`: single frame width/height in pixels.
  - `options`: `AnimationOptions` (e.g. `selectedFrames`, `loop`, `reverse`, `frameOffSet`).
  - `bitMap`: optional `ImageBitmap` (used when combining animations into a single sheet).
- **output**
  - Asynchronously loads the image, cuts it into frames and caches the bitmap and frames by `imgUrl`.

### Methods

- `public get name(): string`  
  - **description**: Returns the animation name passed to the constructor.  
  - **input**: none.  
  - **output**: `string`.

- `public getNextFrame(): Frame`  
  - **description**: Updates the internal frame index according to `options` (loop, reverse, selected range) and returns the resulting `Frame`.  
  - **input**: none.  
  - **output**: `Frame`.

- `public getFrame(index: number): Frame | null`  
  - **description**: Returns a specific frame by index without changing the internal frame counter.  
  - **input**: frame `index`.  
  - **output**: `Frame` or `null` if out of range.

- `public setFrameIndex(index: number): void`  
  - **description**: Manually sets the current frame index.  
  - **input**: new index.  
  - **output**: `void`.

- `public getFrameIndex(): number`  
  - **description**: Returns the current frame index.  
  - **input**: none.  
  - **output**: `number`.

- `public static combineFrames(animName: string, paths: string[], width: number, height: number, options: AnimationOptions): Promise<AnimationFrames>`  
  - **description**: Loads multiple animations, draws their first frames into an offscreen canvas and returns a new `AnimationFrames` built from the combined bitmap.  
  - **input**: `animName`, list of image `paths`, frame `width`/`height`, and `options`.  
  - **output**: `Promise<AnimationFrames>`.

- `public static clear(): void`  
  - **description**: Clears the image/frames cache and resets internal frame‑rate settings.  
  - **input**: none.  
  - **output**: `void`.

### Hello world example

```ts
import {
  AnimationFrames,
  Frame,
  Scene,
  GameObject,
  Point,
} from 'miniplay-js';

class AnimatedSprite extends GameObject {
  private walk: AnimationFrames;

  constructor(scene: Scene, position: Point) {
    super(position);
    this.setScene(scene);

    this.walk = new AnimationFrames(
      'walk',
      '/assets/player/walk.png',
      32,
      32,
      {
        selectedFrames: { from: 0, to: 7 },
        loop: true,
      },
    );
  }

  public update(): void {}

  protected nextDraw(ctx: CanvasRenderingContext2D): Frame {
    const frame = this.walk.getNextFrame();
    if (frame) {
      return frame;
    }
    return null;
  }
}
```

