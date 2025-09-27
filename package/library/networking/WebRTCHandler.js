"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRTCHandler = void 0;
const config_1 = require("../../config");
const Connection_1 = require("./Connection");
class WebRTCHandler {
    remoteConnection = null;
    dataChannel = null;
    handleOnOpen = null;
    constructor(handleOnOpen) {
        window['p2p'] = this;
        this.handleOnOpen = handleOnOpen;
        this.createPeerConnection();
        this.createSendChannel();
        this.handleOnICECandidate();
    }
    handleOnICECandidate() {
        this.remoteConnection.onicecandidate = (e) => {
            if (config_1.config.debugMode.logs.connection) {
                console.log(' NEW ice candidate!! on localconnection reprinting SDP ');
                console.log(JSON.stringify(this.remoteConnection.localDescription));
            }
        };
    }
    createPeerConnection() {
        this.remoteConnection = new RTCPeerConnection();
    }
    createSendChannel() {
        if (Connection_1.Connection.isHost) {
            this.dataChannel = this.remoteConnection.createDataChannel('sendChannel');
            this.handleOnOpen();
        }
        else {
            this.remoteConnection.ondatachannel = (e) => {
                this.dataChannel = e.channel;
                this.handleOnOpen();
            };
        }
    }
    async createOffer() {
        await this.remoteConnection.setLocalDescription(await this.remoteConnection.createOffer());
        const offer = this.remoteConnection.localDescription;
        if (config_1.config.debugMode.logs.connection) {
            console.log('create offer');
            console.log(this.remoteConnection);
            console.log(offer);
        }
        return offer;
    }
    async createAnswer() {
        const answer = await this.remoteConnection.createAnswer();
        await this.remoteConnection.setLocalDescription(answer);
        if (config_1.config.debugMode.logs.connection) {
            console.log('create answer');
            console.log(this.remoteConnection);
        }
        return answer;
    }
    async handleOffer(response) {
        return await this.remoteConnection.setRemoteDescription(response);
    }
    send(msg) {
        if (this.dataChannel.readyState === 'open')
            this.dataChannel.send(msg);
    }
}
exports.WebRTCHandler = WebRTCHandler;
//# sourceMappingURL=WebRTCHandler.js.map