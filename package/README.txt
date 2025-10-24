# miniplay-js

**A lightweight TypeScript library for creating an HTML5 `<canvas>` with a built-in toolbox for developing games, interactive visuals, and dynamic web experiences.**  
Simplifies rendering, input handling, and game loops so you can focus on building.

---

## Features
- Easy game loop management  
- Scene-based architecture  
- Built-in tools for rendering, input, and debugging  
- Configurable resolution and scaling  
- TypeScript-first design with strong typings  

---

## Quick Start
Here’s a minimal example demonstrating how to set up and run a simple game using miniplay-js.
// Game.ts
import { Scene, LeanPoint, config } from 'miniplay-js';
import { Map } from './Map';

export class Game extends Scene {
	onLoad(): void {
		this.setGameConfig();
		const canvas = this.createGameCanvas();
		this.addElement(canvas);
		this.setTileMap(new Map(this, 20, 13));
	}

	onStart(): void {
		// Called when the game starts
	}

	onConnectionLost(): void {
		// Handle network disconnects or session loss
	}

	public getCanvas() {
		return this.canvas;
	}

	public setPos(point: LeanPoint) {
		this.canvas.style.left = `${point.x}px`;
		this.canvas.style.top = `${point.y}px`;
	}

	private setGameConfig() {
		config.graphics.targetResolution.height = 320;
		config.graphics.targetResolution.width = 192;
		config.graphics.scaledResolution.height = 400;
		config.graphics.scaledResolution.width = 300;
	}

	public debugCollider(value: boolean) {
		config.debugMode.drawCollider = value;
	}
	public debugInspector(value: boolean) {
		config.debugMode.Inspector = value;
	}

	constructor() {
		super();
	}
}

// index.ts
const demoGame = new Game();
demoGame.start();

### Folder Structure Example
my-game/
├── src/
│   ├── Game.ts
│   ├── Map.ts
│   └── index.ts
├── package.json
└── tsconfig.json

## License
This project is open-source under the Apache-2.0 License.