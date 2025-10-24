import { DataToSend, GameObject } from './GameObject.js';
import { AnimationStateMachine } from '../animations/AnimationStateMachine.js';
import { Scene } from './Scene.js';
import { NormalizedDirection, Point } from '../Point.js';
import { RemoteController, RemoteEvent } from '../networking/RemoteController.js';
import { Connection } from '../networking/Connection.js';
import { ClientGameUpdateType, HostGameUpdateType, NetworkEvent, NetworkEventType } from '../networking/ConnectionInterface.js';
import { isNullish, manhattanDistance } from '../utils.js';
import { BoxCollider, LeanPoint } from '../collider/BoxCollider.js';
import { Inspector } from '../Inspector.js';

export abstract class NetworkGameObject extends GameObject {
	/**
	 * force move to destination
	 */
	protected destination: Point | LeanPoint = null;

	protected _speed = 4;
	protected get speed(): number {
		return this._speed;
	}
	protected set speed(v: number) {
		this._speed = v;
	}

	protected deltaSpeed = 5;
	protected animationStateMachine: AnimationStateMachine = null;

	constructor(scene: Scene, point: Point = new Point(0, 0), remoteController: RemoteController, objectId?: string) {
		super(scene, point, remoteController, objectId);
		this.addTag('character');
		this.addAnimations();
		this.addCharacterNetworkListeners();
	}

	protected moveTo(destination: Point | LeanPoint) {
		if (destination) this.destination = destination;
		if (!this._isIdle && !this.destination) return;
		let moving = false;

		let nextX = this.position.x;
		let nextY = this.position.y;
		const speed = this.speed / Scene.deltaTime;

		if (nextX - speed <= this.destination.x && nextX + speed <= this.destination.x) {
			nextX += speed;
			moving = true;
		} else if (nextX - speed > this.destination.x && nextX + speed > this.destination.x) {
			nextX -= speed;
			moving = true;
		}

		if (nextY - speed <= this.destination.y && nextY + speed <= this.destination.y) {
			nextY += speed;
			moving = true;
		} else if (nextY - speed > this.destination.y && nextY + speed > this.destination.y) {
			nextY -= speed;
			moving = true;
		}

		const nextMove = new Point(nextX, nextY);
		if (!this.remoteController && BoxCollider.checkGlobalBoxCollision(nextMove, this.colliders)) {
			this.destination = null;
			return;
		}
		this.position = nextMove;

		if (!moving) {
			this.destination = null;
		} else {
			this.sendNetworkPositionUpdate(this.position);
		}
	}

	private addCharacterNetworkListeners() {
		if (Connection.isHost) {
			// host
			if (this.remoteController) {
				// remote controlled object.
				this.remoteController.addEventListener(RemoteEvent.position, (customEvent: CustomEvent) => {
					const networkEvent: NetworkEvent = customEvent.detail;
					const { objectId, nId, data } = networkEvent;
					const { position } = data;
					if (isNullish([objectId, nId, position])) console.warn('received nullish properties from client game update event.');
					if (this.isMe(objectId, nId)) {
						this.destination = new Point(position.x, position.y, true);
					}
				});
			}
		} else {
			// client
			Connection.subscribeHostGameUpdate(HostGameUpdateType.update, (networkEvent: NetworkEvent) => {
				const { objectId, nId, data } = networkEvent;
				const { action, position } = data;
				if (action === RemoteEvent.position) {
					if (isNullish([objectId, nId, position])) {
						console.warn('received nullish properties from host game update event.');
					} else {
						if (this.isMe(objectId, nId)) {
							this.destination = new Point(position.x, position.y, true);
						}
					}
				}
			});
		}
	}

	/**
	 * send network update for changing position for this character
	 * @param position Point
	 */
	protected sendNetworkPositionUpdate(position: Point) {
		if (Connection.minPingCheck(this.objectId)) {
			const networkEvent = {
				updateType: undefined,
				objectId: this.objectId,
				nId: Connection.nId,
				data: {
					action: RemoteEvent.position,
					position: { x: position.relativeX, y: position.relativeY },
				},
			};
			if (Connection.isHost) {
				Connection.sendHostGameUpdate(NetworkEventType.gameState, HostGameUpdateType.update, networkEvent);
			} else {
				networkEvent.updateType = ClientGameUpdateType.position;
				Connection.sendClientRemoteControlUpdate(networkEvent);
			}
		}
	}

	protected abstract addAnimations();
}
