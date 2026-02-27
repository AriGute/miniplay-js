## Class SceneHandler

**Purpose / usage**

`SceneHandler` is a tiny helper that manages **switching between scenes**.  
You create it once (usually in your entry file) and call `next(new SceneSubclass())` to start or change scenes.

### Constructor

```ts
constructor(doc?: Document)
```

- **input**
  - `doc`: optional `Document` to render into (defaults to global `document`).  
- **output**
  - Stores the document reference and prepares to run scenes.

### Methods

- `public next(nextScene: Scene): void`  
  - **description**: Clears the current scene (if any) and starts `nextScene`.  
  - **input**: `Scene` instance.  
  - **output**: `void`.

Under the hood it:
- Calls `currentScene.clear()` on the old scene.
- Schedules `nextScene.start(doc, sceneHandlerNextMethod)` so that the new scene can later call `this.nextScene(new OtherScene())`.

### Hello world example

This example shows a `SceneHandler` that starts in a main menu scene and can switch to a game scene and back.

```ts
import { Scene, SceneHandler, Point } from 'miniplay-js';

class MainMenu extends Scene {
  onConnectionLost(): void {}

  onLoad(): void {
    this.addElement(this.element({ type: 'div', child: [this.createGameCanvas()] }));
  }

  onStart(): void {
    // when user clicks "Start", move to game scene:
    const startGame = () => this.nextScene(new GameScene());
    // wire startGame to a button or input
  }
}

class GameScene extends Scene {
  onConnectionLost(): void {
    // might go back to main menu
    this.nextScene(new MainMenu());
  }

  onLoad(): void {
    this.addElement(this.element({ type: 'div', child: [this.createGameCanvas()] }));
  }

  onStart(): void {
    // setup world and objects
  }
}

new SceneHandler(document).next(new MainMenu());
```

