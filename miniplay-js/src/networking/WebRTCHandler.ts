import { config } from '../../config.js';
import { Connection } from './Connection.js';

export class WebRTCHandler {
	/**
	 *  1. clientA => create offer
	 *  2. clientB => handle offer
	 *  3. clientB => create answer
	 *  4. clientA => handle answer
	 * 	5. clientA => send(msg);
	 */

	public remoteConnection: RTCPeerConnection = null;
	public dataChannel: RTCDataChannel = null;
	private handleOnOpen = null;

	constructor(handleOnOpen: Function) {
		window['p2p'] = this;
		this.handleOnOpen = handleOnOpen;
		this.createPeerConnection();
		this.createSendChannel();
		this.handleOnICECandidate();
	}

	private handleOnICECandidate() {
		this.remoteConnection.onicecandidate = (e) => {
			if (config.debugMode.logs.connection) {
				console.log(' NEW ice candidate!! on localconnection reprinting SDP ');
				console.log(JSON.stringify(this.remoteConnection.localDescription));
			}
		};
	}

	private createPeerConnection() {
		this.remoteConnection = new RTCPeerConnection();
	}

	private createSendChannel() {
		if (Connection.isHost) {
			this.dataChannel = this.remoteConnection.createDataChannel('sendChannel');
			this.handleOnOpen();
		} else {
			this.remoteConnection.ondatachannel = (e) => {
				this.dataChannel = e.channel;
				this.handleOnOpen();
			};
		}
	}

	public async createOffer(): Promise<RTCSessionDescriptionInit> {
		await this.remoteConnection.setLocalDescription(await this.remoteConnection.createOffer());
		const offer = this.remoteConnection.localDescription;
		if (config.debugMode.logs.connection) {
			console.log('create offer');
			console.log(this.remoteConnection);
			console.log(offer);
		}
		return offer;
	}

	public async createAnswer(): Promise<RTCSessionDescriptionInit> {
		const answer = await this.remoteConnection.createAnswer();
		await this.remoteConnection.setLocalDescription(answer);
		if (config.debugMode.logs.connection) {
			console.log('create answer');
			console.log(this.remoteConnection);
		}
		return answer;
	}

	public async handleOffer(response) {
		return await this.remoteConnection.setRemoteDescription(response);
	}

	public send(msg: string) {
		if (this.dataChannel.readyState === 'open') this.dataChannel.send(msg);
	}
}
