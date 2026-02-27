## Miniplay-JS

Miniplay-JS is a small TypeScript engine for building 2D games and interactive elements inside a web page.  
It provides a simple scene system, game objects with collisions, animations, particles, lighting, input handling and optional networking for multiplayer.

The library is designed around a few core ideas:
- **Scene**: owns the canvas, input and game loop.
- **GameObject**: anything that can update and draw.
- **Systems**: focused helpers for animations, collisions, tile maps, UI, particles, lights and networking.

All public entry points are exported from the main package:

```ts
import {
  Scene,
  SceneHandler,
  GameObject,
  NetworkGameObject,
  Decorate,
  LightSource,
  AnimationFrames,
  AnimationStateMachine,
  Input,
  BoxCollider,
  TileMap,
  Camera,
  UI,
  drawLight,
  drawShadow,
} from 'miniplay-js';
```

### Getting started

1. **Create a custom scene**

```ts
import { Scene, SceneHandler, Point } from 'miniplay-js';

class MyFirstScene extends Scene {
  onConnectionLost(): void {}

  onLoad(): void {
    this.addElement(this.element({ type: 'div', child: [this.createGameCanvas()] }));
  }

  onStart(): void {
    // add your game objects here
  }
}

new SceneHandler(document).next(new MyFirstScene());
```

2. **Create a simple game object**

```ts
import { GameObject, Scene, Point, BoxCollider, Frame } from 'miniplay-js';

class HelloBox extends GameObject {
  constructor(scene: Scene, position: Point) {
    super(position);
    this.setScene(scene);
    this.addCollider(new BoxCollider(this, 16, 16, new Point(-8, -8, true)));
  }

  public update(): void {
    // game logic here
  }

  protected nextDraw(context: CanvasRenderingContext2D): Frame {
    context.fillStyle = 'white';
    context.fillRect(this.position.x - 8, this.position.y - 8, 16, 16);
    return null;
  }
}
```

3. **Add the object to your scene**

```ts
import { Point } from 'miniplay-js';

class MyFirstScene extends Scene {
  // ...
  onStart(): void {
    const box = new HelloBox(this, new Point(100, 100));
    this.addObject(box);
  }
}
```

### Documentation index

- **Core game loop and scenes**
  - [`Scene`](./Scene.md)
  - [`SceneHandler`](./SceneHandler.md)
- **Game objects**
  - [`GameObject`](./GameObject.md)
  - [`NetworkGameObject`](./NetworkGameObject.md)
  - [`Decorate`](./Decorate.md)
  - [`LightSource`](./LightSource.md)
- **Animation**
  - [`AnimationFrames`](./AnimationFrames.md)
  - [`AnimationStateMachine`](./AnimationStateMachine.md)
- **Input and collision**
  - [`Input`](./Input.md)
  - [`BoxCollider`](./BoxCollider.md)
- **Tile maps**
  - [`TileMap`](./TileMap.md)
- **Networking**
  - [`Networking`](./Networking.md)
- **Utilities**
  - [`Camera`](./Camera.md)
  - [`UI`](./UI.md)
  - [`LightEffect`](./LightEffect.md)
  - [`Particles`](./Particles.md)

For networking and multiplayer, see [`Networking`](./Networking.md).

