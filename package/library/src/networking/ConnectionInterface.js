"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientGameUpdateType = exports.HostGameUpdateType = exports.NetworkEventType = void 0;
var NetworkEventType;
(function (NetworkEventType) {
    NetworkEventType["textMessage"] = "textMessage";
    NetworkEventType["requestRemoteController"] = "requestRemoteController";
    NetworkEventType["remoteUpdate"] = "remoteUpdate";
    NetworkEventType["gameState"] = "gameState";
})(NetworkEventType || (exports.NetworkEventType = NetworkEventType = {}));
var HostGameUpdateType;
(function (HostGameUpdateType) {
    HostGameUpdateType["start"] = "start";
    HostGameUpdateType["create"] = "create";
    HostGameUpdateType["tileMap"] = "tileMap";
    HostGameUpdateType["update"] = "update";
    HostGameUpdateType["animationState"] = "animationState";
    HostGameUpdateType["remove"] = "remove";
    HostGameUpdateType["stop"] = "stop";
})(HostGameUpdateType || (exports.HostGameUpdateType = HostGameUpdateType = {}));
var ClientGameUpdateType;
(function (ClientGameUpdateType) {
    ClientGameUpdateType["update"] = "update";
    ClientGameUpdateType["position"] = "position";
    ClientGameUpdateType["animationState"] = "animationState";
})(ClientGameUpdateType || (exports.ClientGameUpdateType = ClientGameUpdateType = {}));
//# sourceMappingURL=ConnectionInterface.js.map