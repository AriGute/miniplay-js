import { Scene } from './Scene';
import { Point } from '../Point';
import { GameObject } from './GameObject';
import { AnimationStateMachine } from '../animations/AnimationStateMachine';
export declare abstract class Decorate extends GameObject {
    protected animationStateMachine: AnimationStateMachine;
    constructor(scene: Scene, position: Point);
    protected abstract addAnimations(): any;
}
