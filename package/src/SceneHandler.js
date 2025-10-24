export class SceneHandler {
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
