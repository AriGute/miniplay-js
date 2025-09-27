"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneHandler = void 0;
class SceneHandler {
    doc;
    currentScene = null;
    constructor(doc) {
        this.doc = doc || document;
    }
    next(nextScene) {
        this.currentScene && this.currentScene.clear();
        setTimeout(function () {
            this.currentScene = nextScene;
            const sceneHandlerNextMethod = this.next.bind(this);
            this.currentScene.start(this.doc, sceneHandlerNextMethod);
        }.bind(this));
    }
}
exports.SceneHandler = SceneHandler;
//# sourceMappingURL=SceneHandler.js.map