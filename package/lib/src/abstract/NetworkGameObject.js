import { GameObject } from './GameObject.js';
import { Scene } from './Scene.js';
import { Point } from '../Point.js';
import { RemoteEvent } from '../networking/RemoteController.js';
import { Connection } from '../networking/Connection.js';
import { ClientGameUpdateType, HostGameUpdateType, NetworkEventType } from '../networking/ConnectionInterface.js';
import { isNullish } from '../utils.js';
import { BoxCollider } from '../collider/BoxCollider.js';
export class NetworkGameObject extends GameObject {
    destination = null;
    _speed = 4;
    get speed() {
        return this._speed;
    }
    set speed(v) {
        this._speed = v;
    }
    deltaSpeed = 5;
    animationStateMachine = null;
    constructor(scene, point = new Point(0, 0), remoteController, objectId) {
        super(scene, point, remoteController, objectId);
        this.addTag('character');
        this.addAnimations();
        this.addCharacterNetworkListeners();
    }
    moveTo(destination) {
        if (destination)
            this.destination = destination;
        if (!this._isIdle && !this.destination)
            return;
        let moving = false;
        let nextX = this.position.x;
        let nextY = this.position.y;
        const speed = this.speed / Scene.deltaTime;
        if (nextX - speed <= this.destination.x && nextX + speed <= this.destination.x) {
            nextX += speed;
            moving = true;
        }
        else if (nextX - speed > this.destination.x && nextX + speed > this.destination.x) {
            nextX -= speed;
            moving = true;
        }
        if (nextY - speed <= this.destination.y && nextY + speed <= this.destination.y) {
            nextY += speed;
            moving = true;
        }
        else if (nextY - speed > this.destination.y && nextY + speed > this.destination.y) {
            nextY -= speed;
            moving = true;
        }
        const nextMove = new Point(nextX, nextY);
        if (!this.remoteController && BoxCollider.checkGlobalBoxCollision(nextMove, this.colliders)) {
            this.destination = null;
            return;
        }
        this.position = nextMove;
        if (!moving) {
            this.destination = null;
        }
        else {
            this.sendNetworkPositionUpdate(this.position);
        }
    }
    addCharacterNetworkListeners() {
        if (Connection.isHost) {
            if (this.remoteController) {
                this.remoteController.addEventListener(RemoteEvent.position, (customEvent) => {
                    const networkEvent = customEvent.detail;
                    const { objectId, nId, data } = networkEvent;
                    const { position } = data;
                    if (isNullish([objectId, nId, position]))
                        console.warn('received nullish properties from client game update event.');
                    if (this.isMe(objectId, nId)) {
                        this.destination = new Point(position.x, position.y, true);
                    }
                });
            }
        }
        else {
            Connection.subscribeHostGameUpdate(HostGameUpdateType.update, (networkEvent) => {
                const { objectId, nId, data } = networkEvent;
                const { action, position } = data;
                if (action === RemoteEvent.position) {
                    if (isNullish([objectId, nId, position])) {
                        console.warn('received nullish properties from host game update event.');
                    }
                    else {
                        if (this.isMe(objectId, nId)) {
                            this.destination = new Point(position.x, position.y, true);
                        }
                    }
                }
            });
        }
    }
    sendNetworkPositionUpdate(position) {
        if (Connection.minPingCheck(this.objectId)) {
            const networkEvent = {
                updateType: undefined,
                objectId: this.objectId,
                nId: Connection.nId,
                data: {
                    action: RemoteEvent.position,
                    position: { x: position.relativeX, y: position.relativeY },
                },
            };
            if (Connection.isHost) {
                Connection.sendHostGameUpdate(NetworkEventType.gameState, HostGameUpdateType.update, networkEvent);
            }
            else {
                networkEvent.updateType = ClientGameUpdateType.position;
                Connection.sendClientRemoteControlUpdate(networkEvent);
            }
        }
    }
}
