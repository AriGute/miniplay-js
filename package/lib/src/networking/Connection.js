import { config } from '../../config.js';
import { generateId, logger } from '../utils.js';
import { ClientGameUpdateType, HostGameUpdateType, NetworkEventType } from './ConnectionInterface.js';
import { RemoteController, RemoteEvent } from './RemoteController.js';
import { WebRTCHandler } from './WebRTCHandler.js';
export class Connection {
    static webRTCHandler;
    static playerName = Connection.recoverOrGenerateName();
    static _isHost;
    static connection;
    static subscribers;
    static syncSubscribers;
    static networkId = generateId();
    static remoteControllers = new Map();
    static debounceNetworkMap = new Map();
    static _onNewConnectionHostUpdate = new Set();
    static localEntity = null;
    static connectedClients = 0;
    static onNewConnectionHostUpdate() {
        const msgs = [...Connection._onNewConnectionHostUpdate];
        msgs.forEach((msg) => {
            if (config.network.webRTC) {
                Connection.webRTCHandler.send(msg);
            }
            else {
                Connection.connection.send(msg);
            }
        });
    }
    static recoverOrGenerateName() {
        const name = localStorage.getItem('playerName');
        if (name) {
            return name;
        }
        else {
            return btoa((Math.random() * 10).toString())
                .replaceAll(/\d+|=/g, '')
                .substring(0, 10);
        }
    }
    static get isHost() {
        return Connection._isHost;
    }
    static set isHost(value) {
        Connection._isHost = value;
    }
    static get nId() {
        return Connection.networkId;
    }
    static host() {
        console.log('[host game]');
        const host = config.network.webSocketIp;
        Connection.isHost = true;
        this.createConnection(host);
    }
    static connect(ip) {
        console.log('[connect game]');
        Connection.isHost = false;
        this.createConnection(ip);
    }
    static createConnection(ip) {
        if (config.network.webRTC) {
            Connection.webRTCHandler = new WebRTCHandler(function () {
                this.dataChannel.onmessage = Connection.handleOnMessage;
                this.dataChannel.onclose = Connection.handleClose;
            });
        }
        else {
            try {
                Connection.connection = new WebSocket(ip);
                Connection.connection.onopen = Connection.handleOnOpen;
                Connection.connection.onmessage = Connection.handleOnMessage;
                Connection.connection.onclose = Connection.handleClose;
            }
            catch (error) {
                console.log('Failed to connect the Server, error:', error);
            }
        }
    }
    static sendTextMessage(data) {
        const msg = {
            eventType: NetworkEventType.textMessage,
            payload: { name: Connection.playerName, text: data },
            objectId: Connection.nId,
        };
        if (config.network.webRTC) {
            Connection.webRTCHandler.send(JSON.stringify(msg));
        }
        else {
            Connection.connection.send(JSON.stringify(msg));
        }
    }
    static clientRequestRemoteControl() {
        const msg = {
            eventType: NetworkEventType.requestRemoteController,
            payload: { nId: Connection.nId },
        };
        if (config.network.webRTC) {
            Connection.webRTCHandler.send(JSON.stringify(msg));
        }
        else {
            Connection.connection.send(JSON.stringify(msg));
        }
    }
    static subscribeNetworkEvent(eventType, callback) {
        if (!Connection.subscribers)
            Connection.subscribers = new Map();
        if (!Connection.subscribers.has(eventType))
            Connection.subscribers.set(eventType, []);
        Connection.subscribers.get(eventType).push(callback);
    }
    static unSubscribeNetworkEvent(eventType, callback) {
        Connection.subscribers.get(eventType).toSpliced(Connection.subscribers.get(eventType).indexOf(callback), 1);
    }
    static subscribeHostGameUpdate(updateType, callback) {
        if (!Connection.syncSubscribers)
            Connection.syncSubscribers = new Map();
        if (!Connection.syncSubscribers.get(updateType))
            Connection.syncSubscribers.set(updateType, []);
        Connection.syncSubscribers.get(updateType).push(callback);
    }
    static unSubscribeHostGameUpdate(updateType, callback) {
        Connection.syncSubscribers.get(updateType).toSpliced(Connection.syncSubscribers.get(updateType).indexOf(callback), 1);
    }
    static handleOnMessage(messageEvent) {
        try {
            const data = messageEvent.data;
            const parsedData = JSON.parse(data);
            const { eventType, payload } = parsedData;
            const { nId, objectId } = payload || { objectId: null };
            switch (eventType) {
                case NetworkEventType.textMessage:
                    Connection.subscribers.get(eventType).forEach((callback) => {
                        const { name, text } = payload;
                        const msg = name + ': ' + text;
                        callback(msg);
                    });
                    break;
                case NetworkEventType.gameState:
                    if (!Connection.isHost) {
                        Connection.receiveGameStateUpdate(payload);
                    }
                    break;
                case NetworkEventType.requestRemoteController:
                    if (Connection.isHost) {
                        Connection.subscribers.get(eventType).forEach((callback) => {
                            const remoteController = new RemoteController(nId);
                            Connection.remoteControllers.set(nId, remoteController);
                            callback(remoteController);
                        });
                    }
                    break;
                case NetworkEventType.remoteUpdate:
                    const remoteController = Connection.remoteControllers.get(nId);
                    if (remoteController) {
                        const { updateType } = payload;
                        const data = payload;
                        switch (updateType) {
                            case ClientGameUpdateType.update:
                                remoteController.dispatchEvent(new CustomEvent(RemoteEvent.update, {
                                    detail: data,
                                }));
                                break;
                            case ClientGameUpdateType.position:
                                remoteController.dispatchEvent(new CustomEvent(RemoteEvent.update, {
                                    detail: data,
                                }));
                                break;
                            case ClientGameUpdateType.animationState:
                                remoteController.dispatchEvent(new CustomEvent(RemoteEvent.update, {
                                    detail: data,
                                }));
                                break;
                            default:
                                break;
                        }
                    }
                    break;
                default:
                    throw new Error('unknown EventType.');
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    static sendHostGameUpdate(eventType, updateType, data, onNewConnection) {
        if (config.debugMode.debugGameScene)
            return;
        const payload = {
            nId: Connection.nId,
            updateType: updateType,
            data: data,
        };
        const networkEvent = {
            eventType: eventType,
            payload: payload,
        };
        if (config.network.webRTC) {
            Connection.webRTCHandler.send(JSON.stringify(networkEvent));
        }
        else {
            if (onNewConnection) {
                this._onNewConnectionHostUpdate.add(JSON.stringify(networkEvent));
            }
            Connection.connection && Connection.connection.send(JSON.stringify(networkEvent));
        }
    }
    static sendClientRemoteControlUpdate(payload) {
        if (Connection.connection) {
            const networkEvent = { eventType: NetworkEventType.remoteUpdate, payload: payload };
            if (config.network.webRTC) {
                Connection.webRTCHandler.send(JSON.stringify(networkEvent));
            }
            else {
                Connection.connection.send(JSON.stringify(networkEvent));
            }
        }
    }
    static receiveGameStateUpdate(networkEvent) {
        const { eventType, updateType, nId, data } = networkEvent;
        if (!Connection.syncSubscribers)
            Connection.syncSubscribers = new Map();
        if (!Connection.syncSubscribers.has(updateType))
            Connection.syncSubscribers.set(updateType, []);
        if (Connection.syncSubscribers.get(updateType)) {
            Connection.syncSubscribers.get(updateType).forEach((callbacks) => {
                callbacks(data);
            });
        }
    }
    static handleOnOpen(message) {
        logger('Connection has been open');
    }
    static handleClose() {
        logger('Disconnected from server');
        Connection.syncSubscribers.get(HostGameUpdateType.stop).forEach((callbacks) => callbacks());
    }
    static minPingCheck(id) {
        const debounce = this.debounceNetworkMap.get(id) || 0;
        if (performance.now() - debounce > config.network.targetNetworkTicks) {
            Connection.debounceNetworkMap.set(id, performance.now());
            return true;
        }
        else {
            return false;
        }
    }
}
