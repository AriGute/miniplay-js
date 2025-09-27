import { ClientGameUpdateType, HostGameUpdateType, NetworkEvent, NetworkEventType } from '../networking/ConnectionInterface.js';
import { Connection } from '../networking/Connection.js';
import { AnimationFrames } from './AnimationFrames.js';
import { GameObject } from '../abstract/GameObject.js';
import { RemoteEvent } from '../networking/RemoteController.js';
import { AnimationOptions, CurrentState, StateConnection } from './AnimationInterfaces.js';
import { config } from '../../config.js';

export class AnimationStateMachine {
	private owner: GameObject = null;
	private _currentState: CurrentState = null;
	public get currentState(): string {
		return this._currentState?.name;
	}

	private animationsMap: Map<string, AnimationFrames> = new Map();
	private stateMachine: Map<string, StateConnection[]> = new Map();
	private options: AnimationOptions = null;

	constructor(
		owner: GameObject,
		options: AnimationOptions = {
			scale: { width: 0, height: 0 },
			frameOffSet: { x: 0, y: 0 },
			frameRate: config.graphics.targetAnimationFrameRate,
		},
	) {
		this.owner = owner;
		this.options = options;
		this.addNetworkListeners();
	}

	public addAnimation(animationFrames: AnimationFrames) {
		this.animationsMap.set(animationFrames.name, animationFrames);
		if (!this._currentState) this._currentState = { name: animationFrames.name, anim: animationFrames };
	}

	public addNewAnimation(animationName: string, img: string, width?: number, height?: number, options?: AnimationOptions) {
		const newAnimationOptions: AnimationOptions = structuredClone(this.options);
		if (options) {
			Object.keys(options).forEach((key) => {
				newAnimationOptions[key] = options[key];
			});
		}
		const animation = new AnimationFrames(animationName, img, width, height, newAnimationOptions);
		this.addAnimation(animation);
	}

	public addState(from: string, stateConnection: StateConnection, options = { includeReverseState: false }) {
		let connections = this.stateMachine.get(from);
		if (!connections) connections = [];
		connections.push(stateConnection);

		this.stateMachine.set(from, connections);
		if (options.includeReverseState) {
			const reverseConnection: StateConnection = {
				to: from,
				condition: () => !stateConnection.condition(),
			};

			let connectionsReverse = this.stateMachine.get(stateConnection.to);
			if (!connectionsReverse) connectionsReverse = [];
			connectionsReverse.push(reverseConnection);

			this.stateMachine.set(stateConnection.to, connectionsReverse);
		}
	}

	/**
	 *	set the state to the `animationName` on demand.
	 * @param animationName name of animation that already exist in the state machine
	 */
	public playAnimation(animationName: string) {
		this.setCurrentState(animationName);
		this.sendNetworkStateUpdate(animationName);
		this.update();
	}

	/**
	 * update the current animation to the next frame
	 * @returns the current frame
	 */
	public getAndUpdateAnimationFrames(): AnimationFrames {
		this.update();
		return this._currentState?.anim;
	}

	/**
	 * get the current animation without update to the next frame
	 * @returns the current frame
	 */
	public getAnimationFrames(): AnimationFrames {
		return this._currentState.anim;
	}

	private update() {
		if (this.currentState) {
			if (!this.owner.isIdle) {
				const connections: StateConnection[] = this.stateMachine.get(this._currentState.name);
				if (connections) {
					connections.some((state) => {
						if (state.condition()) {
							this.setCurrentState(state.to);
							this.sendNetworkStateUpdate(state.to);
							return true;
						}
						return false;
					});
				}
			}
		}
	}

	private sendNetworkStateUpdate(animationName: string) {
		const networkEvent = {
			updateType: undefined,
			objectId: this.owner.objectId,
			nId: this.owner.remoteController?.nId || Connection.nId,
			data: { state: animationName },
		};
		if (Connection.isHost) {
			Connection.sendHostGameUpdate(NetworkEventType.gameState, HostGameUpdateType.animationState, networkEvent);
		} else {
			networkEvent.updateType = ClientGameUpdateType.animationState;
			Connection.sendClientRemoteControlUpdate(networkEvent);
		}

		this.setCurrentState(animationName);
	}
	private setCurrentState(animationName: string) {
		const animationOptions: AnimationOptions = this._currentState.anim.getNextFrame()?.options;
		if (animationOptions) {
			this._currentState.anim.setFrameIndex(animationOptions.selectedFrames.startAt || animationOptions.selectedFrames.from);
		}

		this._currentState = {
			name: animationName,
			anim: this.animationsMap.get(animationName),
		};
	}

	private addNetworkListeners() {
		if (Connection.isHost) {
			if (this.owner.remoteController) {
				this.owner.remoteController.addEventListener(RemoteEvent.animation, (customEvent: CustomEvent) => {
					const networkEvent: NetworkEvent = customEvent.detail;
					const { objectId, nId, data } = networkEvent;
					if (this.owner.isMe(objectId, nId)) {
						const { state } = data;
						this.setCurrentState(state);

						Connection.sendHostGameUpdate(NetworkEventType.gameState, HostGameUpdateType.animationState, {
							objectId: objectId,
							nId: nId,
							data: data,
						});
					}
				});
			}
		} else {
			Connection.subscribeHostGameUpdate(HostGameUpdateType.animationState, (networkEvent: NetworkEvent) => {
				const { objectId, nId, data } = networkEvent;
				if (this.owner.isMe(objectId, nId)) {
					const { state } = data;
					this.setCurrentState(state);
				}
			});
		}
	}
}
