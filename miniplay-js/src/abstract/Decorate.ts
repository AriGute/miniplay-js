import { Scene } from './Scene';
import { Point } from '../Point';
import { GameObject } from './GameObject';
import { AnimationStateMachine } from '../animations/AnimationStateMachine';

export abstract class Decorate extends GameObject {
	protected animationStateMachine: AnimationStateMachine = null;

	constructor(scene: Scene, position: Point) {
		super(scene, position);
		this.addTag('decorate');
		this.addAnimations();
	}

	protected abstract addAnimations();
}
