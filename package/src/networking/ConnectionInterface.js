export var NetworkEventType;
(function (NetworkEventType) {
    NetworkEventType["textMessage"] = "textMessage";
    NetworkEventType["requestRemoteController"] = "requestRemoteController";
    NetworkEventType["remoteUpdate"] = "remoteUpdate";
    NetworkEventType["gameState"] = "gameState";
})(NetworkEventType || (NetworkEventType = {}));
export var HostGameUpdateType;
(function (HostGameUpdateType) {
    HostGameUpdateType["start"] = "start";
    HostGameUpdateType["create"] = "create";
    HostGameUpdateType["tileMap"] = "tileMap";
    HostGameUpdateType["update"] = "update";
    HostGameUpdateType["animationState"] = "animationState";
    HostGameUpdateType["remove"] = "remove";
    HostGameUpdateType["stop"] = "stop";
})(HostGameUpdateType || (HostGameUpdateType = {}));
export var ClientGameUpdateType;
(function (ClientGameUpdateType) {
    ClientGameUpdateType["update"] = "update";
    ClientGameUpdateType["position"] = "position";
    ClientGameUpdateType["animationState"] = "animationState";
})(ClientGameUpdateType || (ClientGameUpdateType = {}));
