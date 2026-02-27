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
  - **description**: Returns `true` (or click data) **only once** when the key is pressed down for a given unique `id` (e.g. a GameObject id).  
  - **input**: key/special key and a unique identifier.  
  - **output**: `boolean | MouseClickEvent`.

- `public static getKeyUp(key: string | InputSpecialKeys, id: string): boolean | MouseClickEvent`  
  - **description**: Returns `true` (or click data) **only once** when the key is released for the given `id`.  
  - **input**: key/special key and unique identifier.  
  - **output**: `boolean | MouseClickEvent`.

- `public static clear(): void`  
  - **description**: Clears all stored key states and listeners (called when scenes change).  
  - **input**: none.  
  - **output**: `void`.

### Useful types

- `InputSpecialKeys`  
  - **description**: Enum for special keys such as `leftClick`, `rightClick`, `middleClick`, `esc`, `mouseHover`, `digit1`, etc.  
  - **input**: used as a key in the static APIs.  
  - **output**: improves readability and avoids magic numbers.

- `MouseClickEvent`  
  - **description**: Contains raw and scaled positions, underlying `PointerEvent`, hit `clickAble` targets and colliding `GameObject`s at the click point.  
  - **input**: returned from `getKey` / `getKeyDown` / `getKeyUp` when the key is a mouse button.  
  - **output**: used to aim attacks or interact with the world.

### Hello world example

This example creates a cyan square `GameObject` that moves in response to WASD keys and logs the position of a single left mouse click.

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
  constructor(scene: Scene, position: Point) {
    super(scene, position);

    // register movement keys
    Input.addInputListener('w');
    Input.addInputListener('a');
    Input.addInputListener('s');
    Input.addInputListener('d');
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

    const click = Input.getKeyDown(InputSpecialKeys.leftClick, this.objectId);
    if (click) {
      // react to a single left click
      console.log('Clicked at', click.scaledPosition);
    }
  }

  protected nextDraw(context: CanvasRenderingContext2D): Frame {
    context.fillStyle = 'cyan';
    context.fillRect(this.position.x - 8, this.position.y - 8, 16, 16);
    return null;
  }
}
```

