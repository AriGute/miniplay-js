## Class NetworkGameObject

**Purpose / usage**

`NetworkGameObject` is an abstract base class for characters or entities whose **position and animation state are synchronized over the network**.  
It extends `GameObject` and adds basic movement towards a destination and helpers to send/receive network updates using `Connection` and `RemoteController`.  
You extend this class for any object that should be controlled by a local or remote player in a multiplayer game.

See also: [`GameObject`](./GameObject.md), [`Scene`](./Scene.md), [`Networking`](./Networking.md), [`AnimationStateMachine`](./AnimationStateMachine.md).

### Constructor

```ts
constructor(
  scene: Scene,
  point?: Point,
  remoteController?: RemoteController | null,
  objectId?: string
)
```

- **input**
  - `scene`: the owning `Scene`.
  - `point`: initial world position (default `(0, 0)`).
  - `remoteController`: if not `null`, this object is driven by a remote client.
  - `objectId`: optional custom id.
- **output**
  - Creates a network‑ready game object, tags it as `'character'`, sets up animations and subscribes to network events.

### Methods

- **Movement**
  - `protected moveTo(destination: Point | { x: number; y: number }): void`  
    - **description**: Smoothly moves the object toward `destination`, checking collisions and sending position updates when needed.  
    - **input**: target position to move to.  
    - **output**: `void`.
  - `protected get speed(): number` / `protected set speed(v: number)`  
    - **description**: Base speed in world units per tick, used by `moveTo`.  
    - **input**: when setting, a numeric speed; when getting, none.  
    - **output**: `number`.

- **Networking**
  - `protected sendNetworkPositionUpdate(position: Point): void`  
    - **description**: Sends a network event with the current position to host or clients (depending on side).  
    - **input**: world `position` to broadcast.  
    - **output**: `void`.
  - `protected abstract addAnimations(): void`  
    - **description**: Subclasses implement this to create an `AnimationStateMachine` and add their animations.  
    - **input**: none.  
    - **output**: `void`.

Internally the constructor also subscribes to:

- remote `position` events (when running on host with a `RemoteController`), and  
- host game updates of type `animationState` / `position` (when running on client),

so usually you only override `addAnimations` and your own `update` logic.

### Hello world example

```ts
import {
  Scene,
  NetworkGameObject,
  AnimationStateMachine,
  AnimationOptions,
  Point,
  RemoteController,
  BoxCollider,
  Frame,
} from 'miniplay-js';

class SimpleNetworkPlayer extends NetworkGameObject {
  constructor(
    scene: Scene,
    position: Point,
    remoteController: RemoteController | null,
    objectId?: string,
  ) {
    super(scene, position, remoteController, objectId);
    this.addTag('player');
    this.addCollider(new BoxCollider(this, 16, 24, new Point(-8, -12, true)));
  }

  protected addAnimations(): void {
    const options: AnimationOptions = { frameOffSet: { x: 0, y: 0 } };
    this.animationStateMachine = new AnimationStateMachine(this, options);
    this.animationStateMachine.addNewAnimation(
      'idle',
      '/assets/player/idle.png',
      32,
      32,
      { loop: true },
    );
  }

  public update(): void {
    // Example: host moves the player to a fixed destination
    if (!this.remoteController) {
      this.moveTo({ x: 200, y: 200 });
    }
  }

  protected nextDraw(context: CanvasRenderingContext2D): Frame {
    return this.animationStateMachine
      .getAndUpdateAnimationFrames()
      .getNextFrame();
  }
}
```

