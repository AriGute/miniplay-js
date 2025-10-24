# miniplay-js 0.3.5

A lightweight TypeScript library for creating an HTML5 `<canvas>` with a built-in toolbox for developing games, interactive visuals, and dynamic web experiences.
Simplifies rendering, input handling, and game loops so you can focus on building.

## Features

- Easy game loop management
- Scene-based architecture
- Built-in tools for rendering, input, and debugging
- Configurable resolution and scaling
- TypeScript-first design with strong typings

## Quick Start - Local Development Testing

1.  **In the `miniplay-js` package directory:**

    - Build the package: `npm run build-dev`
      - build the package inside `/dist/build-dev`
      - create a local package `miniplay-js-[version].tgz`
    - Register the package globally:
      - go to `/dist/build-dev`
      - run `npm link`

2.  **In your consuming repository:**

    - Link the local package to your project's `node_modules`: `npm link miniplay-js`
    - _You can now import and use `miniplay-js` as if it were installed from the registry._

3.  **To unlink and return to normal:**
    - In the consuming repo: `npm unlink miniplay-js`
    - In the `miniplay-js` package: `npm unlink`

## Quick Start - Pre-Publish Verification

This process verifies the exact files that will be uploaded to npm.

1.  **In the `miniplay-js` package directory:**

    - Run your build script: `npm run build`
    - Generate the package tarball: `npm pack`
    - _This will create a file (e.g., `miniplay-js-1.0.0.tgz`) in your root directory._

2.  **In your consuming repository:**
    - Install the local tarball:
      `npm install /path/to/miniplay-js/miniplay-js-1.0.0.tgz`

## License

This project is open-source under the Apache-2.0 License.
