"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationStateMachine = void 0;
const ConnectionInterface_1 = require("../networking/ConnectionInterface");
const Connection_1 = require("../networking/Connection");
const AnimationFrames_1 = require("./AnimationFrames");
const RemoteController_1 = require("../networking/RemoteController");
const config_1 = require("../../config");
class AnimationStateMachine {
    owner = null;
    _currentState = null;
    get currentState() {
        return this._currentState?.name;
    }
    animationsMap = new Map();
    stateMachine = new Map();
    options = null;
    constructor(owner, options = {
        scale: { width: 0, height: 0 },
        frameOffSet: { x: 0, y: 0 },
        frameRate: config_1.config.graphics.targetAnimationFrameRate,
    }) {
        this.owner = owner;
        this.options = options;
        this.addNetworkListeners();
    }
    addAnimation(animationFrames) {
        this.animationsMap.set(animationFrames.name, animationFrames);
        if (!this._currentState)
            this._currentState = { name: animationFrames.name, anim: animationFrames };
    }
    addNewAnimation(animationName, img, width, height, options) {
        const newAnimationOptions = structuredClone(this.options);
        if (options) {
            Object.keys(options).forEach((key) => {
                newAnimationOptions[key] = options[key];
            });
        }
        const animation = new AnimationFrames_1.AnimationFrames(animationName, img, width, height, newAnimationOptions);
        this.addAnimation(animation);
    }
    addState(from, stateConnection, options = { includeReverseState: false }) {
        let connections = this.stateMachine.get(from);
        if (!connections)
            connections = [];
        connections.push(stateConnection);
        this.stateMachine.set(from, connections);
        if (options.includeReverseState) {
            const reverseConnection = {
                to: from,
                condition: () => !stateConnection.condition(),
            };
            let connectionsReverse = this.stateMachine.get(stateConnection.to);
            if (!connectionsReverse)
                connectionsReverse = [];
            connectionsReverse.push(reverseConnection);
            this.stateMachine.set(stateConnection.to, connectionsReverse);
        }
    }
    playAnimation(animationName) {
        this.setCurrentState(animationName);
        this.sendNetworkStateUpdate(animationName);
        this.update();
    }
    getAndUpdateAnimationFrames() {
        this.update();
        return this._currentState?.anim;
    }
    getAnimationFrames() {
        return this._currentState.anim;
    }
    update() {
        if (this.currentState) {
            if (!this.owner.isIdle) {
                const connections = this.stateMachine.get(this._currentState.name);
                if (connections) {
                    connections.some((state) => {
                        if (state.condition()) {
                            this.setCurrentState(state.to);
                            this.sendNetworkStateUpdate(state.to);
                            return true;
                        }
                        return false;
                    });
                }
            }
        }
    }
    sendNetworkStateUpdate(animationName) {
        const networkEvent = {
            updateType: undefined,
            objectId: this.owner.objectId,
            nId: this.owner.remoteController?.nId || Connection_1.Connection.nId,
            data: { state: animationName },
        };
        if (Connection_1.Connection.isHost) {
            Connection_1.Connection.sendHostGameUpdate(ConnectionInterface_1.NetworkEventType.gameState, ConnectionInterface_1.HostGameUpdateType.animationState, networkEvent);
        }
        else {
            networkEvent.updateType = ConnectionInterface_1.ClientGameUpdateType.animationState;
            Connection_1.Connection.sendClientRemoteControlUpdate(networkEvent);
        }
        this.setCurrentState(animationName);
    }
    setCurrentState(animationName) {
        const animationOptions = this._currentState.anim.getNextFrame()?.options;
        if (animationOptions) {
            this._currentState.anim.setFrameIndex(animationOptions.selectedFrames.startAt || animationOptions.selectedFrames.from);
        }
        this._currentState = {
            name: animationName,
            anim: this.animationsMap.get(animationName),
        };
    }
    addNetworkListeners() {
        if (Connection_1.Connection.isHost) {
            if (this.owner.remoteController) {
                this.owner.remoteController.addEventListener(RemoteController_1.RemoteEvent.animation, (customEvent) => {
                    const networkEvent = customEvent.detail;
                    const { objectId, nId, data } = networkEvent;
                    if (this.owner.isMe(objectId, nId)) {
                        const { state } = data;
                        this.setCurrentState(state);
                        Connection_1.Connection.sendHostGameUpdate(ConnectionInterface_1.NetworkEventType.gameState, ConnectionInterface_1.HostGameUpdateType.animationState, {
                            objectId: objectId,
                            nId: nId,
                            data: data,
                        });
                    }
                });
            }
        }
        else {
            Connection_1.Connection.subscribeHostGameUpdate(ConnectionInterface_1.HostGameUpdateType.animationState, (networkEvent) => {
                const { objectId, nId, data } = networkEvent;
                if (this.owner.isMe(objectId, nId)) {
                    const { state } = data;
                    this.setCurrentState(state);
                }
            });
        }
    }
}
exports.AnimationStateMachine = AnimationStateMachine;
//# sourceMappingURL=AnimationStateMachine.js.map