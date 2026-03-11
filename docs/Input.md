## Class Input

**Purpose / usage**

`Input` is a static helper that listens to **keyboard and mouse events** for the active `Scene`.  
You use it from inside `GameObject.update` to check if keys are held, pressed once, or released, and to read mouse click positions and hovered targets.

### Constructor

```ts
constructor(scene: Scene)
```

- **input**
  - `scene`: the scene for which input should be tracked. Usually created by the `Scene` itself.  
- **output**
  - Sets up all mouse and keyboard listeners on the scene window.

Most consumers never call the constructor directly; you use the static methods below.

### Static methods

- `public static addInputListener(key: string): void`  
  - **description**: Registers a keyboard key so it can be tracked (e.g. `'w'`, `'a'`, `'Digit1'`).  
  - **input**: key code string.  
  - **output**: `void`.

- `public static getKey(key: string | InputSpecialKeys): boolean | MouseClickEvent`  
  - **description**: Returns whether a key/mouse button is currently held, or a `MouseClickEvent` for mouse buttons / hover.  
  - **input**: key name or special key (e.g. `InputSpecialKeys.leftClick`, `mouseHover`).  
  - **output**: `boolean | MouseClickEvent`.

- `public static getKeyDown(key: string | InputSpecialKeys, id: string): boolean | MouseClickEvent`  
  - **description**: Returns `true` (or click data) **only once** when the key is pressed down for a given unique `id`. Internally `Input` keeps a per‑id key-map, so each `id` sees its own \"edge\" when the key changes from **up → down**.  
  - **input**: key/special key and a unique identifier (see \"Per-object key edge detection\" below).  
  - **output**: `boolean | MouseClickEvent`. Subsequent frames while the key is still held return `false` for the same `id` until the key goes up and is pressed again.

- `public static getKeyUp(key: string | InputSpecialKeys, id: string): boolean | MouseClickEvent`  
  - **description**: Returns `true` (or click data) **only once** when the key is released for the given `id`. It uses the same per‑id key-map to detect the **down → up** edge.  
  - **input**: key/special key and unique identifier.  
  - **output**: `boolean | MouseClickEvent`. This is useful for one‑shot actions that should fire exactly once when a key is released, even if multiple systems listen to the same physical key.

- `public static clear(): void`  
  - **description**: Clears all stored key states and listeners (called when scenes change).  
  - **input**: none.  
  - **output**: `void`.

### Per-object key edge detection

`getKey` reports the **current state** of a key or mouse button and does not use ids.  
`getKeyDown` and `getKeyUp` add an extra dimension: they remember, per logical consumer, whether that consumer has already reacted to the current press/release.

- **Unique id (`id` argument)**  
  - Use a stable id per consumer, typically `GameObject.objectId` or a composite id like `"<objectId>:<actionName>"`.  
  - Each unique `id` gets its own entry in the internal key-map, so two objects can both listen to the same key without interfering.  
  - Avoid temporary or changing ids, or you may miss edges because `Input` treats every new id as a fresh listener.

Common patterns:

- Use `getKey` for **continuous** input (movement, holding a key).  
- Use `getKeyDown` for **one-shot** actions when a key is first pressed (start jump, open inventory, trigger attack).  
- Use `getKeyUp` for **one-shot** actions on release (stop charging, confirm selection, toggle states on key release).

### Useful types

- `InputSpecialKeys`  
  - **description**: Enum for special keys such as `leftClick`, `rightClick`, `middleClick`, `esc`, `mouseHover`, `digit1`, etc.  
  - **input**: used as a key in the static APIs.  
  - **output**: improves readability and avoids magic numbers.

- `MouseClickEvent`  
  - **description**: Contains raw and scaled positions, underlying `PointerEvent`, hit `clickAble` targets and colliding `GameObject`s at the click point.  
  - **input**: returned from `getKey` / `getKeyDown` / `getKeyUp` when the key is a mouse button.  
  - **output**: used to aim attacks or interact with the world.

### Example: movement + key down/up with ids

This example creates a simple `GameObject` that:

- Moves with **WASD** using `getKey` (continuous input).
- Starts a \"jump\" on **Space** using `getKeyDown` with a per-object id.
- Ends the jump on **Space release** using `getKeyUp` with the same id.

```ts
import {
  Scene,
  GameObject,
  Input,
  InputSpecialKeys,
  Point,
  Frame,
} from 'miniplay-js';

class PlayerController extends GameObject {
  private readonly jumpInputId: string;
  private isJumping = false;

  constructor(scene: Scene, position: Point) {
    super(scene, position);

    // register movement keys
    Input.addInputListener('w');
    Input.addInputListener('a');
    Input.addInputListener('s');
    Input.addInputListener('d');

    // register jump key (Space)
    Input.addInputListener(' ');

    // stable id for this object's jump action
    this.jumpInputId = `${this.objectId}:jump`;
  }

  public update(): void {
    const speed = 2;
    let x = this.position.x;
    let y = this.position.y;

    if (Input.getKey('w')) y -= speed;
    if (Input.getKey('s')) y += speed;
    if (Input.getKey('a')) x -= speed;
    if (Input.getKey('d')) x += speed;

    this.position = new Point(x, y);

    // fire once when Space is pressed (per jumpInputId)
    if (Input.getKeyDown(' ', this.jumpInputId)) {
      this.isJumping = true;
      console.log('Jump started for', this.jumpInputId);
    }

    // fire once when Space is released (same id)
    if (Input.getKeyUp(' ', this.jumpInputId)) {
      this.isJumping = false;
      console.log('Jump ended for', this.jumpInputId);
    }
  }

  protected nextDraw(context: CanvasRenderingContext2D): Frame {
    context.fillStyle = this.isJumping ? 'orange' : 'cyan';
    context.fillRect(this.position.x - 8, this.position.y - 8, 16, 16);
    return null;
  }
}
```

