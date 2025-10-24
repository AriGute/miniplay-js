import { ClientGameUpdateType, HostGameUpdateType, NetworkEventType } from '../networking/ConnectionInterface.js';
import { Connection } from '../networking/Connection.js';
import { AnimationFrames } from './AnimationFrames.js';
import { RemoteEvent } from '../networking/RemoteController.js';
import { config } from '../../config.js';
export class AnimationStateMachine {
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
        frameRate: config.graphics.targetAnimationFrameRate,
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
        const animation = new AnimationFrames(animationName, img, width, height, newAnimationOptions);
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
            nId: this.owner.remoteController?.nId || Connection.nId,
            data: { state: animationName },
        };
        if (Connection.isHost) {
            Connection.sendHostGameUpdate(NetworkEventType.gameState, HostGameUpdateType.animationState, networkEvent);
        }
        else {
            networkEvent.updateType = ClientGameUpdateType.animationState;
            Connection.sendClientRemoteControlUpdate(networkEvent);
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
        if (Connection.isHost) {
            if (this.owner.remoteController) {
                this.owner.remoteController.addEventListener(RemoteEvent.animation, (customEvent) => {
                    const networkEvent = customEvent.detail;
                    const { objectId, nId, data } = networkEvent;
                    if (this.owner.isMe(objectId, nId)) {
                        const { state } = data;
                        this.setCurrentState(state);
                        Connection.sendHostGameUpdate(NetworkEventType.gameState, HostGameUpdateType.animationState, {
                            objectId: objectId,
                            nId: nId,
                            data: data,
                        });
                    }
                });
            }
        }
        else {
            Connection.subscribeHostGameUpdate(HostGameUpdateType.animationState, (networkEvent) => {
                const { objectId, nId, data } = networkEvent;
                if (this.owner.isMe(objectId, nId)) {
                    const { state } = data;
                    this.setCurrentState(state);
                }
            });
        }
    }
}
