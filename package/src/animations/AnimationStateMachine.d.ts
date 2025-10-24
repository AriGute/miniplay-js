import { AnimationFrames } from './AnimationFrames.js';
import { GameObject } from '../abstract/GameObject.js';
import { AnimationOptions, StateConnection } from './AnimationInterfaces.js';
export declare class AnimationStateMachine {
    private owner;
    private _currentState;
    get currentState(): string;
    private animationsMap;
    private stateMachine;
    private options;
    constructor(owner: GameObject, options?: AnimationOptions);
    addAnimation(animationFrames: AnimationFrames): void;
    addNewAnimation(animationName: string, img: string, width?: number, height?: number, options?: AnimationOptions): void;
    addState(from: string, stateConnection: StateConnection, options?: {
        includeReverseState: boolean;
    }): void;
    playAnimation(animationName: string): void;
    getAndUpdateAnimationFrames(): AnimationFrames;
    getAnimationFrames(): AnimationFrames;
    private update;
    private sendNetworkStateUpdate;
    private setCurrentState;
    private addNetworkListeners;
}
//# sourceMappingURL=AnimationStateMachine.d.ts.map