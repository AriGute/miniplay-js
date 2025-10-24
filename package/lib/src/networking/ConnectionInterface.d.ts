export declare enum NetworkEventType {
    textMessage = "textMessage",
    requestRemoteController = "requestRemoteController",
    remoteUpdate = "remoteUpdate",
    gameState = "gameState"
}
export declare enum HostGameUpdateType {
    start = "start",
    create = "create",
    tileMap = "tileMap",
    update = "update",
    animationState = "animationState",
    remove = "remove",
    stop = "stop"
}
export declare enum ClientGameUpdateType {
    update = "update",
    position = "position",
    animationState = "animationState"
}
export interface NetworkEvent {
    objectId: string;
    nId: string;
    data: {
        [key: string]: any;
    };
}
export interface ClientNetworkEvent extends NetworkEvent {
    updateType: ClientGameUpdateType;
}
//# sourceMappingURL=ConnectionInterface.d.ts.map