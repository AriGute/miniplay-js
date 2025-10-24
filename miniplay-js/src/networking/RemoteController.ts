import { NetworkEventType, HostGameUpdateType, ClientGameUpdateType, ClientNetworkEvent } from './ConnectionInterface.js';
import { Connection } from './Connection.js';

export enum RemoteEvent {
	action = 'action',
	position = 'position',
	animation = 'animation',
	update = 'update',
}

export interface RemoteEventPayload {
	position: string; //  position should not be nullish.
	data?: string;
}

export interface RemoteControllerPayload {
	position: string;
	action: string;
	data: string;
}

export type Receiver = (payload) => RemoteControllerPayload;

export class RemoteController extends EventTarget {
	private _nId: string = null;
	private static remoteActions: Map<string, Function> = new Map();

	constructor(networkId: string) {
		super();
		this._nId = networkId;
		this.subscribeEvents();
	}

	public static setRemoteAction(key: string, action: Function) {
		RemoteController.remoteActions.set(key, action);
	}

	// get network id
	public get nId(): string {
		return this._nId;
	}

	private subscribeEvents() {
		this.addEventListener('update', this.update);
	}

	private update(customEvent: CustomEvent) {
		const networkEvent: ClientNetworkEvent = customEvent.detail;
		const { updateType, objectId, nId, data } = networkEvent;
		switch (updateType) {
			case ClientGameUpdateType.update:
				this.handleAction(networkEvent, data);
				break;
			case ClientGameUpdateType.position:
				this.handlePosition(objectId, nId, data);
				break;
			case ClientGameUpdateType.animationState:
				this.handleAnimation(objectId, nId, data);
				break;

			default:
				break;
		}
	}

	private handleAnimation(objectId, nId, data) {
		const { state } = data;
		if (!state) {
			return;
		} else {
			// host receive remote update
			this.dispatchEvent(
				new CustomEvent(RemoteEvent.animation, {
					detail: {
						objectId: objectId,
						nId: nId,
						data: {
							state: state,
						},
					},
				}),
			);
		}
	}

	private handleAction(networkEvent: ClientNetworkEvent, data) {
		const action = RemoteController.remoteActions.get(data.action);
		action && action(networkEvent);
	}

	private handlePosition(objectId, nId, data) {
		const { position } = data;
		if (!position) {
			return;
		} else {
			// host receive remote update
			this.dispatchEvent(
				new CustomEvent(RemoteEvent.position, {
					detail: {
						objectId: objectId,
						nId: nId,
						data: {
							action: RemoteEvent.position,
							position: {
								x: position.x,
								y: position.y,
							},
						},
					},
				}),
			);
			if (Connection.isHost) {
				// host broadcast update
				if (Connection.minPingCheck(this._nId)) {
					Connection.sendHostGameUpdate(NetworkEventType.gameState, HostGameUpdateType.update, {
						objectId: objectId,
						nId: nId,
						data: {
							action: RemoteEvent.position,
							position: {
								x: position.x,
								y: position.y,
							},
						},
					});
				}
			}
		}
	}
}
