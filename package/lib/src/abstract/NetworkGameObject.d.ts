import { GameObject } from './GameObject.js';
import { AnimationStateMachine } from '../animations/AnimationStateMachine.js';
import { Scene } from './Scene.js';
import { Point } from '../Point.js';
import { RemoteController } from '../networking/RemoteController.js';
import { LeanPoint } from '../collider/BoxCollider.js';
export declare abstract class NetworkGameObject extends GameObject {
    protected destination: Point | LeanPoint;
    protected _speed: number;
    protected get speed(): number;
    protected set speed(v: number);
    protected deltaSpeed: number;
    protected animationStateMachine: AnimationStateMachine;
    constructor(scene: Scene, point: Point, remoteController: RemoteController, objectId?: string);
    protected moveTo(destination: Point | LeanPoint): void;
    private addCharacterNetworkListeners;
    protected sendNetworkPositionUpdate(position: Point): void;
    protected abstract addAnimations(): any;
}
//# sourceMappingURL=NetworkGameObject.d.ts.map