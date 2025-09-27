import { GameObject } from './GameObject';
import { AnimationStateMachine } from '../animations/AnimationStateMachine';
import { Scene } from './Scene';
import { Point } from '../Point';
import { RemoteController } from '../networking/RemoteController';
import { LeanPoint } from '../collider/BoxCollider';
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
