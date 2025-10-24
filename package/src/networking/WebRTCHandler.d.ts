export declare class WebRTCHandler {
    remoteConnection: RTCPeerConnection;
    dataChannel: RTCDataChannel;
    private handleOnOpen;
    constructor(handleOnOpen: Function);
    private handleOnICECandidate;
    private createPeerConnection;
    private createSendChannel;
    createOffer(): Promise<RTCSessionDescriptionInit>;
    createAnswer(): Promise<RTCSessionDescriptionInit>;
    handleOffer(response: any): Promise<void>;
    send(msg: string): void;
}
//# sourceMappingURL=WebRTCHandler.d.ts.map