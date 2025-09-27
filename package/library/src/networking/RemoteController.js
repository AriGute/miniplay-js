"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteController = exports.RemoteEvent = void 0;
const ConnectionInterface_1 = require("./ConnectionInterface");
const Connection_1 = require("./Connection");
var RemoteEvent;
(function (RemoteEvent) {
    RemoteEvent["action"] = "action";
    RemoteEvent["position"] = "position";
    RemoteEvent["animation"] = "animation";
    RemoteEvent["update"] = "update";
})(RemoteEvent || (exports.RemoteEvent = RemoteEvent = {}));
class RemoteController extends EventTarget {
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
            case ConnectionInterface_1.ClientGameUpdateType.update:
                this.handleAction(networkEvent, data);
                break;
            case ConnectionInterface_1.ClientGameUpdateType.position:
                this.handlePosition(objectId, nId, data);
                break;
            case ConnectionInterface_1.ClientGameUpdateType.animationState:
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
            if (Connection_1.Connection.isHost) {
                if (Connection_1.Connection.minPingCheck(this._nId)) {
                    Connection_1.Connection.sendHostGameUpdate(ConnectionInterface_1.NetworkEventType.gameState, ConnectionInterface_1.HostGameUpdateType.update, {
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
exports.RemoteController = RemoteController;
//# sourceMappingURL=RemoteController.js.map