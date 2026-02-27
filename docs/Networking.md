## Networking overview

Miniplay-JS includes a small networking layer for **host–client multiplayer**.  
At a high level:
- `Connection` manages the WebSocket/WebRTC link and dispatches events.
- `ConnectionInterface` defines enums and payload types.
- `RemoteController` represents a remote player controller on the host.
- `WebRTCHandler` wraps peer‑to‑peer (WebRTC) transport.

You usually:
1. Call `Connection.host()` or `Connection.connect(ip)` from a menu `Scene`.
2. Use `Connection.subscribeNetworkEvent` / `subscribeHostGameUpdate` to react to game events.
3. Extend `NetworkGameObject` and use its networking helpers for movement and animations.

---

## Class Connection

**Purpose / usage**

`Connection` is the static entry point for all network activity.  
It opens the WebSocket (or WebRTC) connection, broadcasts host game updates, and routes client updates to `RemoteController`s.

### Key properties

- `public static get isHost(): boolean`  
  - returns `true` when this instance is the host.
- `public static get nId(): string`  
  - unique network id for this client.
- `public static localEntity: GameObject | null`  
  - reference to the local player (e.g. set after spawning a local `Player`).

### Main methods

- `public static host(): void`  
  - **description**: Start hosting a game using the configured server address.  
  - **input**: none.  
  - **output**: opens a network connection.

- `public static connect(ip: string): void`  
  - **description**: Connect to a host at `ip`.  
  - **input**: WebSocket URL.  
  - **output**: opens a network connection.

- `public static sendTextMessage(data: string | ArrayBufferLike | Blob | ArrayBufferView): void`  
  - **description**: Simple text message helper (uses `NetworkEventType.textMessage`).  
  - **input**: payload to send.  
  - **output**: `void`.

- `public static clientRequestRemoteControl(): void`  
  - **description**: Client asks the host to spawn a remote‑controlled entity.  
  - **input**: none.  
  - **output**: `void`.

- `public static subscribeNetworkEvent(eventType: NetworkEventType, callback: (payload: any) => void): void`  
  - **description**: Subscribe to a high‑level network event (e.g. `requestRemoteController`).  
  - **input**: event type, callback.  
  - **output**: `void`.

- `public static subscribeHostGameUpdate(updateType: HostGameUpdateType, callback: (event: any) => void): void`  
  - **description**: Subscribe to host game updates like `create`, `tileMap`, `update`, `animationState`, `stop`.  
  - **input**: update type, callback.  
  - **output**: `void`.

- `public static sendHostGameUpdate(eventType: NetworkEventType, updateType?: HostGameUpdateType, data?: any, onNewConnection?: boolean): void`  
  - **description**: Host broadcasts a game update to clients (object created, tilemap changed, etc.).  
  - **input**: event type, update type, payload and optional `onNewConnection` flag.  
  - **output**: `void`.

- `public static sendClientRemoteControlUpdate(payload: ClientNetworkEvent): void`  
  - **description**: Client sends an update to the host (position, actions, animation state).  
  - **input**: typed payload.  
  - **output**: `void`.

- `public static minPingCheck(id: string): boolean`  
  - **description**: Returns `true` if enough time passed to send a new update for `id`, used to throttle network traffic.  
  - **input**: id string.  
  - **output**: `boolean`.

---

## ConnectionInterface types

**Purpose / usage**

`ConnectionInterface` provides enums and interfaces used by the networking code.

- `enum NetworkEventType`  
  - `textMessage`, `requestRemoteController`, `remoteUpdate`, `gameState`.
- `enum HostGameUpdateType`  
  - `start`, `create`, `tileMap`, `update`, `animationState`, `remove`, `stop`.
- `enum ClientGameUpdateType`  
  - `update`, `position`, `animationState`.
- `interface NetworkEvent`  
  - `{ objectId: string; nId: string; data: { [key: string]: any } }`.
- `interface ClientNetworkEvent extends NetworkEvent`  
  - `{ updateType: ClientGameUpdateType; ... }`.

You reference these enums when subscribing or sending updates.

---

## Class RemoteController

**Purpose / usage**

`RemoteController` lives on the **host** and represents a single remote client.  
It receives network events from `Connection` and dispatches higher‑level custom events (`RemoteEvent.position`, `RemoteEvent.animation`, etc.) to networked game objects.

### Key methods

- `constructor(networkId: string)`  
  - **description**: Creates a controller for a given client id and subscribes to updates.  
  - **input**: `networkId` from `Connection.nId`.  
  - **output**: controller instance.

- `public static setRemoteAction(key: string, action: Function): void`  
  - **description**: Register a named remote action (e.g. `'attack'`, `'projectile'`) to be called when the client sends an update.  
  - **input**: key string and handler function.  
  - **output**: `void`.

- `public get nId(): string`  
  - **description**: Returns the network id of this controller.  
  - **input**: none.  
  - **output**: `string`.

Internally, `RemoteController` dispatches:
- `RemoteEvent.position` when the client sends a new position.  
- `RemoteEvent.animation` when the client changes animation state.  
- `RemoteEvent.update` when arbitrary update messages are received.

`NetworkGameObject` and `AnimationStateMachine` listen to these events to update movement and state.

---

## Class WebRTCHandler

**Purpose / usage**

`WebRTCHandler` wraps **peer‑to‑peer WebRTC** data channels when `config.network.webRTC` is enabled.  
It is used internally by `Connection` as an alternative transport to WebSocket.

### Main methods

- `constructor(handleOnOpen: Function)`  
  - **description**: Prepares the RTCPeerConnection, data channel and ICE candidates, then calls `handleOnOpen` when ready.  
  - **input**: callback to set `onmessage` / `onclose` handlers.  
  - **output**: handler instance.

- `public async createOffer(): Promise<RTCSessionDescriptionInit>`  
  - **description**: Creates an SDP offer to be sent to the peer.  
  - **input**: none.  
  - **output**: offer.

- `public async createAnswer(): Promise<RTCSessionDescriptionInit>`  
  - **description**: Creates an SDP answer for an incoming offer.  
  - **input**: none.  
  - **output**: answer.

- `public async handleOffer(response: RTCSessionDescriptionInit): Promise<void>`  
  - **description**: Applies a received offer or answer to the local connection.  
  - **input**: SDP description.  
  - **output**: `Promise<void>`.

- `public send(msg: string): void`  
  - **description**: Sends a message over the open data channel (used by `Connection`).  
  - **input**: serialized message.  
  - **output**: `void`.

---

## Hello world snippet (host + client)

This example shows how to start a host or client, request a remote controller, and subscribe to basic create events from the host.

```ts
import {
  Connection,
  NetworkEventType,
  HostGameUpdateType,
} from 'miniplay-js';

// In main menu scene, host:
Connection.host();

// Or client:
Connection.connect('ws://localhost:8080');
Connection.clientRequestRemoteControl();

// On host game scene, when ready to spawn players:
Connection.subscribeNetworkEvent(
  NetworkEventType.requestRemoteController,
  (remoteController) => {
    // spawn a NetworkGameObject subclass with this remote controller
    // e.g. new Player(scene, spawnPoint, remoteController)
  },
);

// Example: subscribe to host game creates on client
Connection.subscribeHostGameUpdate(
  HostGameUpdateType.create,
  (networkEvent) => {
    const { objectId, position, tags } = networkEvent;
    // spawn local representations of remote objects based on tags
  },
);
```

