import { GameObject } from '../abstract/GameObject.js';
import { config } from '../../config.js';
import { generateId, logger } from '../utils.js';
import { ClientGameUpdateType, ClientNetworkEvent, HostGameUpdateType, NetworkEventType } from './ConnectionInterface.js';
import { RemoteController, RemoteEvent } from './RemoteController.js';
import { WebRTCHandler } from './WebRTCHandler.js';

export class Connection {
	public static webRTCHandler: WebRTCHandler;
	public static playerName: string = Connection.recoverOrGenerateName();

	private static _isHost: boolean;
	private static connection: WebSocket;
	private static subscribers: Map<NetworkEventType, Function[]>;
	private static syncSubscribers: Map<HostGameUpdateType, Function[]>;
	private static networkId: string = generateId();
	private static remoteControllers: Map<string, RemoteController> = new Map();
	private static debounceNetworkMap: Map<string, number> = new Map();
	private static _onNewConnectionHostUpdate: Set<string> = new Set();
	public static localEntity: GameObject = null;
	public static connectedClients = 0; // TODO: increment per successful client remote control request

	public static onNewConnectionHostUpdate() {
		const msgs = [...Connection._onNewConnectionHostUpdate];
		msgs.forEach((msg) => {
			if (config.network.webRTC) {
				Connection.webRTCHandler.send(msg);
			} else {
				Connection.connection.send(msg);
			}
		});
	}

	private static recoverOrGenerateName() {
		const name = localStorage.getItem('playerName');
		if (name) {
			return name;
		} else {
			return btoa((Math.random() * 10).toString())
				.replaceAll(/\d+|=/g, '')
				.substring(0, 10);
		}
	}

	public static get isHost(): boolean {
		return Connection._isHost;
	}

	private static set isHost(value) {
		Connection._isHost = value;
	}

	public static get nId(): string {
		return Connection.networkId;
	}

	public static host() {
		console.log('[host game]');
		const host = config.network.webSocketIp;
		Connection.isHost = true;
		this.createConnection(host);
	}

	public static connect(ip: string) {
		console.log('[connect game]');
		Connection.isHost = false;
		this.createConnection(ip);
	}

	private static createConnection(ip: string) {
		if (config.network.webRTC) {
			Connection.webRTCHandler = new WebRTCHandler(function () {
				this.dataChannel.onmessage = Connection.handleOnMessage;
				this.dataChannel.onclose = Connection.handleClose;
			});
		} else {
			try {
				Connection.connection = new WebSocket(ip);
				Connection.connection.onopen = Connection.handleOnOpen;
				Connection.connection.onmessage = Connection.handleOnMessage;
				Connection.connection.onclose = Connection.handleClose;
			} catch (error) {
				console.log('Failed to connect the Server, error:', error);
			}
		}
	}

	/**
	 * send the most simple text massage as string
	 * @param data string
	 */
	public static sendTextMessage(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
		const msg = {
			eventType: NetworkEventType.textMessage,
			payload: { name: Connection.playerName, text: data },
			objectId: Connection.nId,
		};
		if (config.network.webRTC) {
			Connection.webRTCHandler.send(JSON.stringify(msg));
		} else {
			Connection.connection.send(JSON.stringify(msg));
		}
	}

	public static clientRequestRemoteControl() {
		const msg = {
			eventType: NetworkEventType.requestRemoteController,
			payload: { nId: Connection.nId },
		};
		if (config.network.webRTC) {
			Connection.webRTCHandler.send(JSON.stringify(msg));
		} else {
			Connection.connection.send(JSON.stringify(msg));
		}
	}

	/**
	 * for client updates: (enum member) NetworkEventType.requestRemoteController
	 * @param eventType HostGameUpdateType
	 * @param callback callback
	 * example:
			(remoteController: RemoteController) => {
				this.spawnPlayer(Point.getRandomPoint(), remoteController);
			}
	 */
	public static subscribeNetworkEvent(eventType: NetworkEventType, callback) {
		if (!Connection.subscribers) Connection.subscribers = new Map();
		if (!Connection.subscribers.has(eventType)) Connection.subscribers.set(eventType, []);
		Connection.subscribers.get(eventType).push(callback);
	}

	public static unSubscribeNetworkEvent(eventType: NetworkEventType, callback) {
		Connection.subscribers.get(eventType).toSpliced(Connection.subscribers.get(eventType).indexOf(callback), 1);
	}

	public static subscribeHostGameUpdate(updateType: HostGameUpdateType, callback) {
		if (!Connection.syncSubscribers) Connection.syncSubscribers = new Map();
		if (!Connection.syncSubscribers.get(updateType)) Connection.syncSubscribers.set(updateType, []);
		Connection.syncSubscribers.get(updateType).push(callback);
	}
	public static unSubscribeHostGameUpdate(updateType: HostGameUpdateType, callback) {
		Connection.syncSubscribers.get(updateType).toSpliced(Connection.syncSubscribers.get(updateType).indexOf(callback), 1);
	}

	private static handleOnMessage(messageEvent: MessageEvent<any>) {
		try {
			const data: string = messageEvent.data;
			const parsedData = JSON.parse(data);
			const { eventType, payload } = parsedData;
			const { nId, objectId } = payload || { objectId: null };

			switch (eventType) {
				case NetworkEventType.textMessage:
					// simple string as for text messaging
					Connection.subscribers.get(eventType).forEach((callback: Function) => {
						const { name, text } = payload;
						const msg: string = name + ': ' + text;
						callback(msg);
					});
					break;

				case NetworkEventType.gameState:
					// update game state
					if (!Connection.isHost) {
						Connection.receiveGameStateUpdate(payload);
					}
					break;

				case NetworkEventType.requestRemoteController:
					// Spawn new client player game object
					if (Connection.isHost) {
						Connection.subscribers.get(eventType).forEach((callback: Function) => {
							const remoteController = new RemoteController(nId);
							Connection.remoteControllers.set(nId, remoteController);
							callback(remoteController);
						});
					}
					break;

				case NetworkEventType.remoteUpdate:
					// host receive update from remote controlled player game object
					const remoteController = Connection.remoteControllers.get(nId);
					if (remoteController) {
						const { updateType } = payload;
						const data = payload;
						switch (updateType) {
							case ClientGameUpdateType.update:
								remoteController.dispatchEvent(
									new CustomEvent(RemoteEvent.update, {
										detail: data,
									}),
								);
								break;
							case ClientGameUpdateType.position:
								remoteController.dispatchEvent(
									new CustomEvent(RemoteEvent.update, {
										detail: data,
									}),
								);
								break;
							case ClientGameUpdateType.animationState:
								remoteController.dispatchEvent(
									new CustomEvent(RemoteEvent.update, {
										detail: data,
									}),
								);
								break;

							default:
								break;
						}
					}
					break;

				default:
					throw new Error('unknown EventType.');
			}
		} catch (error) {
			console.error(error);
		}
	}

	public static sendHostGameUpdate(eventType: NetworkEventType, updateType?: HostGameUpdateType, data?: any, onNewConnection?: boolean) {
		if (config.debugMode.debugGameScene) return;

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
		} else {
			if (onNewConnection) {
				// TODO: change from static initiate event to reference witch later we cant extract new networkEvent from.
				this._onNewConnectionHostUpdate.add(JSON.stringify(networkEvent));
			}
			Connection.connection && Connection.connection.send(JSON.stringify(networkEvent));
		}
	}

	/**
	 * Send an update about this client update (host broadcast to the other clients)
	 * @param payload 	
	 * example:
			networkEvent = {
				updateType: ClientGameUpdateType.update,
				objectId: this.objectId,
				nId: Connection.nId,
				data: DataToSend,
			}
	 */
	public static sendClientRemoteControlUpdate(payload: ClientNetworkEvent) {
		if (Connection.connection) {
			const networkEvent = { eventType: NetworkEventType.remoteUpdate, payload: payload };
			if (config.network.webRTC) {
				Connection.webRTCHandler.send(JSON.stringify(networkEvent));
			} else {
				Connection.connection.send(JSON.stringify(networkEvent));
			}
		}
	}

	private static receiveGameStateUpdate(networkEvent: any) {
		const { eventType, updateType, nId, data } = networkEvent;
		if (!Connection.syncSubscribers) Connection.syncSubscribers = new Map();
		if (!Connection.syncSubscribers.has(updateType)) Connection.syncSubscribers.set(updateType, []);
		if (Connection.syncSubscribers.get(updateType)) {
			Connection.syncSubscribers.get(updateType).forEach((callbacks) => {
				callbacks(data);
			});
		}
	}

	private static handleOnOpen(message: MessageEvent<any>) {
		logger('Connection has been open');
	}

	private static handleClose() {
		logger('Disconnected from server');
		Connection.syncSubscribers.get(HostGameUpdateType.stop).forEach((callbacks) => callbacks());
	}

	public static minPingCheck(id: string): boolean {
		const debounce = this.debounceNetworkMap.get(id) || 0;
		if (performance.now() - debounce > config.network.targetNetworkTicks) {
			Connection.debounceNetworkMap.set(id, performance.now());
			return true;
		} else {
			return false;
		}
	}
}
