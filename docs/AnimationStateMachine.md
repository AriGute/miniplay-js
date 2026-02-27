## Class AnimationStateMachine

**Purpose / usage**

`AnimationStateMachine` manages **named animations and transitions** for a `GameObject`.  
It owns a map of `AnimationFrames` and automatically switches between them based on conditions (walk vs idle, attack end, etc.), and can sync the current state over the network.

### Constructor

```ts
constructor(owner: GameObject, options?: AnimationOptions)
```

- **input**
  - `owner`: the `GameObject` that this state machine belongs to.
  - `options`: default `AnimationOptions` shared by all animations (frame rate, scale, frame offset, etc.).
- **output**
  - Creates a new state machine linked to the owner and subscribes to relevant networking events.

### Methods

- `public get currentState(): string | undefined`  
  - **description**: Returns the name of the current animation state.  
  - **input**: none.  
  - **output**: state name or `undefined`.

- `public addAnimation(animationFrames: AnimationFrames): void`  
  - **description**: Registers an existing `AnimationFrames` instance by its name and sets it as current if none exist.  
  - **input**: `animationFrames`.  
  - **output**: `void`.

- `public addNewAnimation(animationName: string, img: string, width?: number, height?: number, options?: AnimationOptions): void`  
  - **description**: Convenience helper that creates an `AnimationFrames` for you and adds it.  
  - **input**: animation name, image URL, frame size, optional overrides for `AnimationOptions`.  
  - **output**: `void`.

- `public addState(from: string, stateConnection: StateConnection, options = { includeReverseState: false }): void`  
  - **description**: Adds a transition from state `from` to `stateConnection.to` when `stateConnection.condition()` is `true`.  
  - **input**: `from` state name, `stateConnection` (`to`, `condition`), optional `includeReverseState` to auto‑create the opposite condition.  
  - **output**: `void`.

- `public playAnimation(animationName: string): void`  
  - **description**: Forces the current state to `animationName`, sends a network state update, and runs an immediate internal update.  
  - **input**: animation name.  
  - **output**: `void`.

- `public getAndUpdateAnimationFrames(): AnimationFrames`  
  - **description**: Runs the internal state update (may change state) and returns the current `AnimationFrames`.  
  - **input**: none.  
  - **output**: `AnimationFrames`.

- `public getAnimationFrames(): AnimationFrames`  
  - **description**: Returns the current `AnimationFrames` without running a state transition.  
  - **input**: none.  
  - **output**: `AnimationFrames`.

### Hello world example

```ts
import {
  Scene,
  GameObject,
  AnimationStateMachine,
  AnimationOptions,
  StateConnection,
  Frame,
  Point,
} from 'miniplay-js';

class SimpleCharacter extends GameObject {
  private animationStateMachine: AnimationStateMachine;
  private walking = false;

  constructor(scene: Scene, position: Point) {
    super(position);
    this.setScene(scene);

    const options: AnimationOptions = {
      frameOffSet: { x: 0, y: 0 },
      selectedFrames: { from: 0, to: 0 },
    };
    this.animationStateMachine = new AnimationStateMachine(this, options);

    this.animationStateMachine.addNewAnimation(
      'idle',
      '/assets/character/idle.png',
      32,
      32,
      { loop: true },
    );
    this.animationStateMachine.addNewAnimation(
      'walk',
      '/assets/character/walk.png',
      32,
      32,
      { loop: true },
    );

    const toWalk: StateConnection = {
      to: 'walk',
      condition: () => this.walking,
    };
    this.animationStateMachine.addState('idle', toWalk, {
      includeReverseState: true,
    });
  }

  public update(): void {
    // toggle walking from your input or AI
  }

  protected nextDraw(): Frame {
    return this.animationStateMachine.getAndUpdateAnimationFrames().getNextFrame();
  }
}
```

