# miniplay-js

A lightweight TypeScript library for creating an HTML5 `<canvas>` with a built-in toolbox for developing games, interactive visuals, and dynamic web experiences.
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

```typescript
// Game.ts
import { Scene, config } from 'miniplay-js';

export class Game extends Scene {
	onLoad(): void {
		this.setGameConfig();
		const canvas = this.createGameCanvas();
		this.addElement(canvas);
	}

	onStart(): void {
		// Called when the game starts
	}

	onConnectionLost(): void {
		// Handle network disconnects or session loss
	}

	private setGameConfig() {
		config.graphics.targetResolution.height = 320;
		config.graphics.targetResolution.width = 192;
		config.graphics.scaledResolution.height = 400;
		config.graphics.scaledResolution.width = 300;
	}

	constructor() {
		super();
	}
}
```

```typescript
// index.ts
const demoGame = new Game();
demoGame.start();
```

### Folder Structure Example

```
my-game/
├── src/
│   ├── Game.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## License

This project is open-source under the Apache-2.0 License.
