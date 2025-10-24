import { Scene } from './Scene.js';
import { Point } from '../Point.js';
import { GameObject } from './GameObject.js';
import { AnimationStateMachine } from '../animations/AnimationStateMachine.js';

export abstract class Decorate extends GameObject {
	protected animationStateMachine: AnimationStateMachine = null;

	constructor(scene: Scene, position: Point) {
		super(scene, position);
		this.addTag('decorate');
		this.addAnimations();
	}

	protected abstract addAnimations();
}
