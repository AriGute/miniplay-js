import { Scene } from './Scene.js';
import { Point } from '../Point.js';
import { GameObject } from './GameObject.js';
import { AnimationStateMachine } from '../animations/AnimationStateMachine.js';
export declare abstract class Decorate extends GameObject {
    protected animationStateMachine: AnimationStateMachine;
    constructor(scene: Scene, position: Point);
    protected abstract addAnimations(): any;
}
//# sourceMappingURL=Decorate.d.ts.map