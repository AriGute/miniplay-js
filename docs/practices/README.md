# miniplay-js Architecture & Practices

Guide to **how** miniplay-js works—architecture, patterns, and practices—rather than game-specific content. Use for planning and reducing context bloat.

---

## Navigation

| Document | Description |
|----------|-------------|
| [architecture.md](architecture.md) | Client-server model, Connection, RemoteController, message protocol |
| [core.md](core.md) | Scene, GameObject, NetworkGameObject, config |
| [ui.md](ui.md) | UI system, Input/ClickAble, building screens |
| [best-practices.md](best-practices.md) | Checklist and do's/don'ts |

---

## Quick Reference

| Area | Key API / Pattern |
|------|-------------------|
| **Connection** | `Connection.host()` / `Connection.connect(ip)` |
| **Networking** | `subscribeNetworkEvent()`, `subscribeHostGameUpdate()`, `minPingCheck()` |
| **Remote control** | Host: `RemoteController` per client; Client: `sendClientRemoteControlUpdate()` |
| **Scenes** | `SceneHandler.next(scene)` → `onLoad()` → `onStart()` → `running` |
| **GameObjects** | `addCollider()`, `addTag()`, `gameObjectSequence` for draw order |
| **Network entities** | Extend `NetworkGameObject`, use `remoteController` |
| **UI** | `UI.drawImg()`, `UI.drawText()`, `UI.drawRect()`; unique IDs, `drawOrderIndex` |
| **Input** | `ClickAble` + `owner`; `enable` controls hit-test inclusion |
| **Resolution** | Design at `targetResolution`, scale to `scaledResolution` |

---

## Build & Run

- **Client:** Webpack/bundler compiles entry → `public/bundle.js`
- **Server:** Express + WebSocket (e.g. ports 3000, 8080)
- **Static:** Serve `index.html` and assets from `public/`
