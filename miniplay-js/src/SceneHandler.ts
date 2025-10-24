import { Scene } from './abstract/Scene.js';

export class SceneHandler {
	private doc: Document;
	private currentScene: Scene = null;

	constructor(doc?: Document) {
		this.doc = doc || document;
	}

	public next(nextScene: Scene) {
		this.currentScene && this.currentScene.clear();
		setTimeout(
			function () {
				this.currentScene = nextScene;
				const sceneHandlerNextMethod = this.next.bind(this);
				this.currentScene.start(this.doc, sceneHandlerNextMethod);
			}.bind(this),
		);
	}
}
