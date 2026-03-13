# Core Patterns

Scene lifecycle, GameObject hierarchy, and config.

---

## Entry and Scene Flow

**SceneHandler**
- `SceneHandler.next(scene)` clears the current scene, then calls `scene.start(doc, nextScene)`
- `nextScene` is passed so the scene can transition (e.g. menu → game)

**Scene lifecycle**
- States: `initiate` → `loading` → `start` → `running` → `destroying`
- `onLoad()` — load assets, create DOM/canvas
- `onStart()` — add objects, begin game logic
- `clear()` — tear down: remove listeners, intervals, DOM, static state, `UI.clear()`

**DOM and canvas**
- `element({ type, style, styleClass, attributes, props, child })` — creates and tracks DOM nodes
- `createGameCanvas()` — creates canvas, sets resolution scale, returns HTMLCanvasElement

---

## Scene Ownership and Transition Contract

1. **Scene independence**
   - A `Scene` is self-contained and owns only its own lifecycle/state (`onLoad`, `onStart`, `clear`).
   - A scene should not manually orchestrate multiple live scenes.

2. **SceneHandler is the transition authority**
   - Only `SceneHandler.next(nextScene)` is responsible for switching scenes.
   - Transition sequence is centralized: clear current scene -> start next scene with injected `nextScene` callback.

3. **How scenes request transitions**
   - Scene code should call `this.nextScene(next)` (the callback provided by `SceneHandler`).
   - Do not start another scene directly from scene code with `new OtherScene().start()`.

4. **Single-active-scene invariant**
   - Runtime should have one active scene managed by `SceneHandler`.
   - Without `SceneHandler` wiring, only the scene manually started with `start()` is running; no managed transition chain exists.

5. **Agent implementation guidance**
   - Prefer `this.nextScene(...)` inside scene classes.
   - Avoid parallel scene execution unless explicitly implementing engine internals.

---

## GameObject Pattern

**Abstract base**
- `update()` — called every tick
- `nextDraw(ctx)` — return `Frame` for rendering (or null)
- `destroy()` — remove from scene, clear colliders/particles

**Colliders**
- `addCollider(BoxCollider)` — if present, object goes into `gameObjectSequence`
- Without collider: in `gameObjectNonSequence` (background, no Y-sorting)

**Sequence index**
- `normalizeObjectSequencePosition(y)` — draw order by world Y (higher Y = drawn later)
- Objects with colliders are sorted by Y for correct overlap

**Tags**
- `addTag(tag)`, `getTags()`, `hasTag(tag)`
- `GameObject.getGameObjectByTag(tag)` — static lookup

---

## NetworkGameObject

- Extends `GameObject`
- Constructor: `(scene, point, remoteController, objectId?)`
- **Host (remote entity):** listens to `RemoteController` `RemoteEvent.position` → sets `destination`
- **Client (own entity):** listens to `HostGameUpdateType.update` → sets `destination`
- `sendNetworkPositionUpdate(position)` — debounced via `minPingCheck`
- Host calls `Connection.sendHostGameUpdate()`; Client calls `Connection.sendClientRemoteControlUpdate()`

---

## Config

| Key | Purpose |
|-----|---------|
| `targetResolution` | Logical size for game (e.g. 360×180) |
| `scaledResolution` | Actual canvas size (e.g. 1600×900) |
| `targetUpdateTicks` | Update rate (e.g. 60) |
| `targetScreenRefreshRate` | Draw rate (e.g. 60) |
| `targetNetworkTicks` | Network debounce (e.g. 30) |
| `debugMode` | Logs, colliders, Inspector, etc. |

Design at `targetResolution`; scale to `scaledResolution` in UI and canvas.

---

## Key Modules

- `Scene` — scene lifecycle, draw loop, update loop
- `SceneHandler` — scene transitions
- `GameObject` — base class, colliders, tags
- `NetworkGameObject` — multiplayer entities

---

[← Back to index](README.md) | [UI patterns →](ui.md)
