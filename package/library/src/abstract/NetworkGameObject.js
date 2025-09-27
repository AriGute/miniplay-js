"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkGameObject = void 0;
const GameObject_1 = require("./GameObject");
const Scene_1 = require("./Scene");
const Point_1 = require("../Point");
const RemoteController_1 = require("../networking/RemoteController");
const Connection_1 = require("../networking/Connection");
const ConnectionInterface_1 = require("../networking/ConnectionInterface");
const utils_1 = require("../utils");
const BoxCollider_1 = require("../collider/BoxCollider");
class NetworkGameObject extends GameObject_1.GameObject {
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
    constructor(scene, point = new Point_1.Point(0, 0), remoteController, objectId) {
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
        const speed = this.speed / Scene_1.Scene.deltaTime;
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
        const nextMove = new Point_1.Point(nextX, nextY);
        if (!this.remoteController && BoxCollider_1.BoxCollider.checkGlobalBoxCollision(nextMove, this.colliders)) {
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
        if (Connection_1.Connection.isHost) {
            if (this.remoteController) {
                this.remoteController.addEventListener(RemoteController_1.RemoteEvent.position, (customEvent) => {
                    const networkEvent = customEvent.detail;
                    const { objectId, nId, data } = networkEvent;
                    const { position } = data;
                    if ((0, utils_1.isNullish)([objectId, nId, position]))
                        console.warn('received nullish properties from client game update event.');
                    if (this.isMe(objectId, nId)) {
                        this.destination = new Point_1.Point(position.x, position.y, true);
                    }
                });
            }
        }
        else {
            Connection_1.Connection.subscribeHostGameUpdate(ConnectionInterface_1.HostGameUpdateType.update, (networkEvent) => {
                const { objectId, nId, data } = networkEvent;
                const { action, position } = data;
                if (action === RemoteController_1.RemoteEvent.position) {
                    if ((0, utils_1.isNullish)([objectId, nId, position])) {
                        console.warn('received nullish properties from host game update event.');
                    }
                    else {
                        if (this.isMe(objectId, nId)) {
                            this.destination = new Point_1.Point(position.x, position.y, true);
                        }
                    }
                }
            });
        }
    }
    sendNetworkPositionUpdate(position) {
        if (Connection_1.Connection.minPingCheck(this.objectId)) {
            const networkEvent = {
                updateType: undefined,
                objectId: this.objectId,
                nId: Connection_1.Connection.nId,
                data: {
                    action: RemoteController_1.RemoteEvent.position,
                    position: { x: position.relativeX, y: position.relativeY },
                },
            };
            if (Connection_1.Connection.isHost) {
                Connection_1.Connection.sendHostGameUpdate(ConnectionInterface_1.NetworkEventType.gameState, ConnectionInterface_1.HostGameUpdateType.update, networkEvent);
            }
            else {
                networkEvent.updateType = ConnectionInterface_1.ClientGameUpdateType.position;
                Connection_1.Connection.sendClientRemoteControlUpdate(networkEvent);
            }
        }
    }
}
exports.NetworkGameObject = NetworkGameObject;
//# sourceMappingURL=NetworkGameObject.js.map