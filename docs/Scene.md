## Class Scene

**Purpose / usage**

`Scene` controls the **game loop, canvas, input and all game objects** for a single screen (main menu, game, etc.).  
You extend `Scene` to create your own main menu, game world, pause screen, and more.  
`SceneHandler` is then used to switch between scenes.

See also: [`SceneHandler`](./SceneHandler.md), [`GameObject`](./GameObject.md), [`TileMap`](./TileMap.md), [`Input`](./Input.md), [`UI`](./UI.md), [`Networking`](./Networking.md).

### Constructor

`Scene` is abstract and has no public constructor parameters; it is created by `new MyScene()` where `MyScene extends Scene`.

### Required lifecycle methods

```ts
abstract onLoad(): void;
abstract onStart(): void;
abstract onConnectionLost(): void;
```

- **`onLoad()`**
  - **description**: Called once, before the scene starts; set up DOM elements, create canvas, load assets.  
  - **input**: none.  
  - **output**: `void`.
- **`onStart()`**
  - **description**: Called when the canvas is ready and the scene is about to start updating and drawing; add `GameObject`s here.  
  - **input**: none.  
  - **output**: `void`.
- **`onConnectionLost()`**
  - **description**: Called when the host sends a `stop` event; use this to clean up or navigate back to a menu.  
  - **input**: none.  
  - **output**: `void`.

### Core properties

- `public nextScene: (scene: Scene) => void`  
  - **description**: Function you call to switch to another scene (provided by `SceneHandler`).  
  - **input**: next scene instance.  
  - **output**: `void`.
- `public get tileMap(): TileMap | null`  
  - **description**: Current tile map assigned to this scene.  
  - **input**: none.  
  - **output**: `TileMap | null`.
- `public static get deltaTime(): number`  
  - **description**: Time factor between updates, used by movement code to be frame‑rate independent.  
  - **input**: none.  
  - **output**: `number`.

### Main methods

- **Starting and clearing**
  - `public start(doc?: Document, nextScene?: (scene: Scene) => void, point?: Point): void`  
    - **description**: Starts the scene: sets up DOM root, input, canvas and runs `onLoad`/`onStart`. Normally called only by `SceneHandler`.  
    - **input**: optional `Document`, optional `nextScene` callback, optional canvas offset `Point`.  
    - **output**: `void`.
  - `public clear(): void`  
    - **description**: Stops update/draw loops, clears UI, input, colliders, tile maps and all game objects, and removes DOM elements.  
    - **input**: none.  
    - **output**: `void`.

- **Game objects**
  - `public addObject(gameObject: GameObject): void`  
    - **description**: Attach a `GameObject` to this scene so it will update and draw.  
    - **input**: object instance.  
    - **output**: `void`.
  - `public removeObject(gameObject: GameObject): boolean`  
    - **description**: Detach an object from the main update loop and keep it as "detached".  
    - **input**: object instance.  
    - **output**: `true` if removed.
  - `public removeDetachedObject(gameObject: GameObject): boolean`  
    - **description**: Remove a detached object completely.  
    - **input**: object instance.  
    - **output**: `boolean`.
  - `public clearDetachedObject(): void`  
    - **description**: Remove all detached objects.  
    - **input**: none.  
    - **output**: `void`.
  - `public static getGameObjectById(id: string): GameObject | undefined`  
    - **description**: Look up an object in the current scene by id.  
    - **input**: id.  
    - **output**: `GameObject | undefined`.

- **DOM helpers**
  - `public element(options: ElementOptions): HTMLElement`  
    - **description**: Utility to create a DOM element with styles, classes and children attached to the scene.  
    - **input**: `type`, `style`, `styleClass`, `attributes`, `props`, `child`.  
    - **output**: `HTMLElement`.
  - `public addElement(element: HTMLElement | HTMLElement[]): void`  
    - **description**: Append one or more elements to the scene root.  
    - **input**: element(s).  
    - **output**: `void`.

- **Events and timers**
  - `public addEventListener(event: string, callback: EventListener, options?): void`  
    - **description**: Subscribe to a window event; automatically cleaned up on `clear()`.  
    - **input**: event name, callback, optional options.  
    - **output**: `void`.
  - `public setTimeout(callback: () => void, timeout?: number): number`  
    - **description**: Scene‑scoped `setTimeout` that is cancelled when the scene is cleared.  
    - **input**: callback, timeout ms.  
    - **output**: timeout id.
  - `public setInterval(callback: () => void, timeout?: number): number`  
    - **description**: Scene‑scoped `setInterval`.  
    - **input**: callback, timeout ms.  
    - **output**: interval id.
  - `public clearTimeout(id: number): void` / `public clearInterval(id: number): void`  
    - **description**: Clear a scene timer.  
    - **input**: id.  
    - **output**: `void`.

- **Tile maps**
  - `public setTileMap(tileMap: TileMap): void`  
    - **description**: Attach a `TileMap` to this scene and register its collision function with `BoxCollider`.  
    - **input**: tile map instance.  
    - **output**: `void`.
  - `public removeTileMap(): boolean`  
    - **description**: Disable and detach the current tile map.  
    - **input**: none.  
    - **output**: `true` if removed.

- **Canvas**
  - `protected createGameCanvas(): HTMLCanvasElement`  
    - **description**: Creates the canvas, sets resolution and 2D context, and prepares scaling. Typically called in `onLoad`.  
    - **input**: none.  
    - **output**: the created `HTMLCanvasElement`.
  - `public compareCanvas(target: HTMLCanvasElement): boolean`  
    - **description**: Returns `true` if `target` is this scene's canvas (used by input system).  
    - **input**: `target` canvas.  
    - **output**: `boolean`.

### Hello world example

This example defines a minimal scene that creates a white square `GameObject` and starts it using `SceneHandler`.

```ts
import {
  Scene,
  SceneHandler,
  GameObject,
  Point,
  BoxCollider,
  Frame,
} from 'miniplay-js';

class SimpleObject extends GameObject {
  constructor(scene: Scene, position: Point = new Point(100, 100)) {
    super(scene, position);
    this.addCollider(new BoxCollider(this, 16, 16, new Point(-8, -8, true)));
  }

  public update(): void {}

  protected nextDraw(ctx: CanvasRenderingContext2D): Frame {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.position.x - 8, this.position.y - 8, 16, 16);
    return null;
  }
}

class MyGameScene extends Scene {
  onConnectionLost(): void {
    console.log('Connection lost');
  }

  onLoad(): void {
    this.addElement(this.element({ type: 'div', child: [this.createGameCanvas()] }));
  }

  onStart(): void {
    const obj = new SimpleObject(this, new Point(150, 90));
    this.addObject(obj);
  }
}

new SceneHandler(document).next(new MyGameScene());
```

