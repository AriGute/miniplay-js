import { GameObject } from '../abstract/GameObject.js';
import { ClientNetworkEvent, HostGameUpdateType, NetworkEventType } from './ConnectionInterface.js';
import { WebRTCHandler } from './WebRTCHandler.js';
export declare class Connection {
    static webRTCHandler: WebRTCHandler;
    static playerName: string;
    private static _isHost;
    private static connection;
    private static subscribers;
    private static syncSubscribers;
    private static networkId;
    private static remoteControllers;
    private static debounceNetworkMap;
    private static _onNewConnectionHostUpdate;
    static localEntity: GameObject;
    static connectedClients: number;
    static onNewConnectionHostUpdate(): void;
    private static recoverOrGenerateName;
    static get isHost(): boolean;
    private static set isHost(value);
    static get nId(): string;
    static host(): void;
    static connect(ip: string): void;
    private static createConnection;
    static sendTextMessage(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    static clientRequestRemoteControl(): void;
    static subscribeNetworkEvent(eventType: NetworkEventType, callback: any): void;
    static unSubscribeNetworkEvent(eventType: NetworkEventType, callback: any): void;
    static subscribeHostGameUpdate(updateType: HostGameUpdateType, callback: any): void;
    static unSubscribeHostGameUpdate(updateType: HostGameUpdateType, callback: any): void;
    private static handleOnMessage;
    static sendHostGameUpdate(eventType: NetworkEventType, updateType?: HostGameUpdateType, data?: any, onNewConnection?: boolean): void;
    static sendClientRemoteControlUpdate(payload: ClientNetworkEvent): void;
    private static receiveGameStateUpdate;
    private static handleOnOpen;
    private static handleClose;
    static minPingCheck(id: string): boolean;
}
//# sourceMappingURL=Connection.d.ts.map