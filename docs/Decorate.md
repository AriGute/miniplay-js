## Class Decorate

**Purpose / usage**

`Decorate` is an abstract helper for **static or simple animated world decorations** such as barrels, chests, rocks, etc.  
It extends `GameObject` and adds an `AnimationStateMachine` field; subclasses only need to implement `addAnimations` and `nextDraw`.  
Use this as a base when you want an object that usually does not move but can still collide and play an idle animation.

### Constructor

```ts
constructor(scene: Scene, position: Point)
```

- **input**
  - `scene`: the owning `Scene`.
  - `position`: initial placement in world space.
- **output**
  - Registers the object as a `GameObject`, tags it as `'decorate'`, and immediately calls `addAnimations`.

### Methods

- `protected animationStateMachine: AnimationStateMachine`  
  - **description**: Holds all animations for this decoration (idle, open, etc.).  
  - **input**: assigned in `addAnimations`.  
  - **output**: used from `nextDraw` to get frames.

- `protected abstract addAnimations(): void`  
  - **description**: Subclasses define their animations here (usually one or two idle states).  
  - **input**: none.  
  - **output**: `void`.

You still inherit all the methods from `GameObject` (colliders, tags, `update`, `destroy`, etc.).

### Hello world example (barrel decoration)

```ts
import {
  Scene,
  Decorate,
  AnimationStateMachine,
  AnimationOptions,
  Point,
  BoxCollider,
  Frame,
} from 'miniplay-js';

class Barrel extends Decorate {
  constructor(scene: Scene, position: Point) {
    super(scene, position);
    this.addTag('interactAble');
    this.addCollider(new BoxCollider(this, 12, 12, new Point(-6, -6, true)));
  }

  protected addAnimations(): void {
    const options: AnimationOptions = { frameOffSet: { x: 0, y: 0 } };
    this.animationStateMachine = new AnimationStateMachine(this, options);
    this.animationStateMachine.addNewAnimation(
      'idle',
      '/assets/decorate/barrel13x13.png',
      12,
      12,
    );
  }

  public update(): void {
    // decorations often just stay in place
  }

  protected nextDraw(): Frame {
    return this.animationStateMachine.getAndUpdateAnimationFrames().getNextFrame();
  }
}
```

