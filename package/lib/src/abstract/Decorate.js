import { GameObject } from './GameObject.js';
export class Decorate extends GameObject {
    animationStateMachine = null;
    constructor(scene, position) {
        super(scene, position);
        this.addTag('decorate');
        this.addAnimations();
    }
}
