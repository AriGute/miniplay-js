## Class UI

**Purpose / usage**

`UI` is a static overlay canvas for drawing **HUD elements**: images, text, rectangles and temporary debug shapes.  
The `Scene` draws `UI.canvas` on top of the main game canvas every frame.

### Core properties

- `public static get canvas(): OffscreenCanvas`  
  - **description**: The offscreen canvas where all UI elements are drawn.  
  - **output**: `OffscreenCanvas`.
- `public static get font(): string`  
  - **description**: Current font family used when drawing text.  
  - **output**: font name.

### Lifecycle

- `public static init(): void`  
  - **description**: Creates the UI offscreen canvas and 2D context. Called automatically from `Scene.start`.  
  - **output**: `void`.
- `public static update(): void`  
  - **description**: Redraws all registered images, text and rectangles, and temporary shapes like debug points.  
  - **output**: `void`.
- `public static clear(): void`  
  - **description**: Clears the UI context and internal maps.  
  - **output**: `void`.
- `public static clearUi(): void`  
  - **description**: Clears stored components without resetting the context.  
  - **output**: `void`.

### Drawing methods

- `public static drawImg(id: string, img: ImageBitmap, pos: { x: number; y: number }, drawOrderIndex?: number): void`  
  - **description**: Draws an `ImageBitmap` at screen position `pos` and z‑order `drawOrderIndex`.  
  - **input**: unique `id`, image bitmap, logical position (unscaled), optional draw order.  
  - **output**: `void`.

- `public static updateImagePosition(id: string, pos: { x: number; y: number }): void`  
  - **description**: Move an already drawn image.  
  - **output**: `void`.

- `public static getImageData(id: string): { img: ImageBitmap; position: { x: number; y: number }; index: number }`  
  - **description**: Returns metadata for a drawn image.  
  - **output**: image data or `undefined`.

- `public static drawText(id: string, text: string, position: { x: number; y: number }, maxWidth?: number, color?: string): void`  
  - **description**: Renders text at `position` with optional `maxWidth` and `color`.  
  - **output**: `void`.

- `public static updateTextPosition(id: string, pos: { x: number; y: number }): void`  
  - **description**: Move an already drawn text element.  
  - **output**: `void`.

- `public static drawRect(id: string, position: { x: number; y: number }, width: number, height: number, color?: string): void`  
  - **description**: Draws an outlined rectangle for HUD frames, panels, etc.  
  - **output**: `void`.

- `public static unDrawRect(id: string): void`  
  - **description**: Removes a rectangle from the UI.  
  - **output**: `void`.

- `public static unDrawImg(id: string): void`  
  - **description**: Removes an image from the draw list.  
  - **output**: `void`.

- `public static unDrawText(id: string): void`  
  - **description**: Removes a text entry from the draw list.  
  - **output**: `void`.

- `public static drawPoint(pos: { x: number; y: number }, color?: string, size?: number, fill?: boolean): void`  
  - **description**: Draws a temporary circle (debug helper) that fades after a short delay.  
  - **output**: `void`.

- `public static setFont(fontName: string): void`  
  - **description**: Sets the font used in subsequent text draws.  
  - **output**: `void`.

### Hello world example (simple HUD)

```ts
import { Scene, UI, Point } from 'miniplay-js';

class HudScene extends Scene {
  onConnectionLost(): void {}

  onLoad(): void {
    this.addElement(this.element({ type: 'div', child: [this.createGameCanvas()] }));
  }

  onStart(): void {
    UI.drawText(
      'healthLabel',
      'HP: 100',
      new Point(10, 10, true),
      30,
      'white',
    );
  }
}
```

