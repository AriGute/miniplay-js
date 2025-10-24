import { NetworkEventType, HostGameUpdateType, ClientGameUpdateType } from './ConnectionInterface.js';
import { Connection } from './Connection.js';
export var RemoteEvent;
(function (RemoteEvent) {
    RemoteEvent["action"] = "action";
    RemoteEvent["position"] = "position";
    RemoteEvent["animation"] = "animation";
    RemoteEvent["update"] = "update";
})(RemoteEvent || (RemoteEvent = {}));
export class RemoteController extends EventTarget {
    _nId = null;
    static remoteActions = new Map();
    constructor(networkId) {
        super();
        this._nId = networkId;
        this.subscribeEvents();
    }
    static setRemoteAction(key, action) {
        RemoteController.remoteActions.set(key, action);
    }
    get nId() {
        return this._nId;
    }
    subscribeEvents() {
        this.addEventListener('update', this.update);
    }
    update(customEvent) {
        const networkEvent = customEvent.detail;
        const { updateType, objectId, nId, data } = networkEvent;
        switch (updateType) {
            case ClientGameUpdateType.update:
                this.handleAction(networkEvent, data);
                break;
            case ClientGameUpdateType.position:
                this.handlePosition(objectId, nId, data);
                break;
            case ClientGameUpdateType.animationState:
                this.handleAnimation(objectId, nId, data);
                break;
            default:
                break;
        }
    }
    handleAnimation(objectId, nId, data) {
        const { state } = data;
        if (!state) {
            return;
        }
        else {
            this.dispatchEvent(new CustomEvent(RemoteEvent.animation, {
                detail: {
                    objectId: objectId,
                    nId: nId,
                    data: {
                        state: state,
                    },
                },
            }));
        }
    }
    handleAction(networkEvent, data) {
        const action = RemoteController.remoteActions.get(data.action);
        action && action(networkEvent);
    }
    handlePosition(objectId, nId, data) {
        const { position } = data;
        if (!position) {
            return;
        }
        else {
            this.dispatchEvent(new CustomEvent(RemoteEvent.position, {
                detail: {
                    objectId: objectId,
                    nId: nId,
                    data: {
                        action: RemoteEvent.position,
                        position: {
                            x: position.x,
                            y: position.y,
                        },
                    },
                },
            }));
            if (Connection.isHost) {
                if (Connection.minPingCheck(this._nId)) {
                    Connection.sendHostGameUpdate(NetworkEventType.gameState, HostGameUpdateType.update, {
                        objectId: objectId,
                        nId: nId,
                        data: {
                            action: RemoteEvent.position,
                            position: {
                                x: position.x,
                                y: position.y,
                            },
                        },
                    });
                }
            }
        }
    }
}
