export declare enum RemoteEvent {
    action = "action",
    position = "position",
    animation = "animation",
    update = "update"
}
export interface RemoteEventPayload {
    position: string;
    data?: string;
}
export interface RemoteControllerPayload {
    position: string;
    action: string;
    data: string;
}
export type Receiver = (payload: any) => RemoteControllerPayload;
export declare class RemoteController extends EventTarget {
    private _nId;
    private static remoteActions;
    constructor(networkId: string);
    static setRemoteAction(key: string, action: Function): void;
    get nId(): string;
    private subscribeEvents;
    private update;
    private handleAnimation;
    private handleAction;
    private handlePosition;
}
