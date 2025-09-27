import { Scene } from './abstract/Scene';
export declare class SceneHandler {
    private doc;
    private currentScene;
    constructor(doc?: Document);
    next(nextScene: Scene): void;
}
