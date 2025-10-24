## Quick Start - Local Development Testing

1.  **In the `miniplay-js` package directory:**

    - Build the package: `npm run build`
    - Register the package globally: `npm link`

2.  **In your consuming repository:**

    - Link the local package to your project's `node_modules`: `npm link [package path]/miniplay-js`
    - You can now import and use `miniplay-js` as if it were installed from the registry.

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
      `npm install [package path]/miniplay-js-1.0.0.tgz`
