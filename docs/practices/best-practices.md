# Best Practices Checklist

Actionable do's and don'ts for miniplay-js.

---

## Networking

| Do | Don't |
|----|-------|
| Use `subscribeNetworkEvent` / `subscribeHostGameUpdate` for handlers | Register handlers without unsubscribing on scene clear |
| Call `minPingCheck(id)` before sending position/updates | Send updates every frame without debouncing |
| Subscribe to `HostGameUpdateType.stop` for `onConnectionLost` | Ignore disconnect; leave stale state |

---

## Scenes

| Do | Don't |
|----|-------|
| Implement `onLoad`, `onStart`, `onConnectionLost` | Leave lifecycle methods empty or unimplemented |
| Use `clear()` to remove listeners, intervals, DOM, static state | Rely on GC; listeners/intervals can leak |
| Call `UI.init()` in scene start, `UI.clear()` in scene clear | Forget to clear UI when transitioning |

---

## GameObjects

| Do | Don't |
|----|-------|
| Add colliders for draw ordering (Y-sorting) | Draw important objects without colliders if they need correct overlap |
| Use `addTag()` and `getGameObjectByTag()` for lookups | Hardcode object references where tags would suffice |
| Extend `NetworkGameObject` for multiplayer entities | Implement network logic in plain `GameObject` |

---

## UI

| Do | Don't |
|----|-------|
| Register components in `open()`, unregister in `close()` | Leave UI elements registered when closing |
| Use unique IDs for `drawImg`, `drawText`, `drawRect` | Reuse IDs (last write wins, earlier elements get orphaned) |
| Set `drawOrderIndex` to control stacking | Rely on registration order alone |

---

## Input

| Do | Don't |
|----|-------|
| Use `ClickAble` composition for clickable regions | Implement custom hit-testing per screen |
| Set `clickAble.enable = true` when screen is open | Leave ClickAbles enabled when parent UI is hidden |

---

## Resolution

| Do | Don't |
|----|-------|
| Design at `targetResolution` | Hardcode pixel values for `scaledResolution` |
| Scale positions in UI/canvas to `scaledResolution` | Ignore scale; UI will misalign on different sizes |

---

## Quick Reference Table

| Area | Practice |
|------|----------|
| Networking | `subscribeNetworkEvent` / `subscribeHostGameUpdate`; debounce with `minPingCheck` |
| Scenes | `onLoad`, `onStart`, `onConnectionLost`; `clear()` to clean up |
| GameObjects | Colliders for draw order; tags for lookups; `NetworkGameObject` for multiplayer |
| UI | Register in `open()`, unregister in `close()`; unique IDs; `drawOrderIndex` |
| Input | `ClickAble` composition; `enable` to show/hide from hit-test |
| Resolution | Design at `targetResolution`; scale to `scaledResolution` |

---

[← Back to index](README.md)
