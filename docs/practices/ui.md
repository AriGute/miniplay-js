# UI Patterns

UI system, Input, ClickAble, and building screens.

---

## UI System

**Singleton-like static API**
- Single OffscreenCanvas composited onto the main canvas each frame
- `UI.init()` in scene start; `UI.clear()` in scene clear

**Components**
| Method | Purpose |
|--------|---------|
| `drawImg(id, ImageBitmap, pos, drawOrderIndex?)` | Draw image; `unDrawImg(id)` to remove |
| `drawText(id, text, pos, maxWidth?, color?)` | Draw text; `unDrawText(id)` to remove |
| `drawRect(id, pos, width, height, color?)` | Draw rect; `unDrawRect(id)` to remove |
| `drawPoint(pos, color?, size?, fill?)` | Debug shapes (auto-clear after 500ms) |

**Draw order**
- `drawOrderIndex`: 0 = back, higher = front
- Managed via `drawImgOrder` Map; render in order each frame

**Resolution**
- Positions use `targetResolution`; internally scale to `scaledResolution`

---

## Input and ClickAble

**ClickAble**
- Extends `GameObject`
- Fields: `width`, `height`, `position`, `owner`
- `addTag('clickAble')` so Input includes it in hit-test
- `getArea()` returns `{ x, y, width, height }`

**Input**
- On mousedown/mouseup/mousemove, hit-tests all enabled ClickAbles
- Builds `MouseClickEvent.clickAbles[]` — ClickAbles overlapping cursor
- Keyboard: `Input.getKeyDown(key, sceneId)`, `Input.getKeyUp(key, sceneId)`

**Composition**
- Buttons, options, panels **own** a `ClickAble`
- Input populates `clickAbles` for cursor overlap; owner handles click logic

---

## Building UI Screens

**Register / unregister**
- `open()`: `UI.drawImg()`, `UI.drawText()`, etc.
- `close()`: `unDrawImg()`, `unDrawText()`, etc.

**ClickAble enable / disable**
- `panelClickAble.enable = true` when open so Input includes it in hit-test
- `enable = false` when closed

**Layout**
- Grid or pixel offsets (e.g. `MAX_X × MAX_Y`)
- Tooltip: position to keep on screen, use `UI.drawRect` for background

**Drag / drop**
- `onMouseClickDown` — start drag, store item
- `onMouseClick` — update drag position
- `onMouseClickUp` — `dropItem()` checks `clickAbles` for target (e.g. slot, another panel)

**Shared pattern**
- UI screens extend `GameObject`
- Use `update()` for input handling when open
- Call `open()` / `close()` to show/hide

---

## Example: Item Panel

- Extends `GameObject`
- `panelClickAble` — ClickAble for the whole panel
- `open()`: draw background, items; `panelClickAble.enable = true`
- `close()`: unregister all UI, `panelClickAble.enable = false`
- `update()`: when open, handle `onMouseClickDown`, `onMouseClick`, `onMouseClickUp`, tooltip

---

## Example: Dialog / Choice Flow

- `dialogTree: Map<string, treeNode>` — nodeId → text + options
- `start()` → `drawUi()` — creates options with ClickAbles, draws text
- `selectOption(nodeId)` — either run `action()` or `drawUi(nextNodeId)`
- Hover: `UI.drawRect` for highlight

---

## Key Modules

- `UI` — component API
- `Input` — keyboard/mouse
- `ClickAble` — clickable regions

---

[← Back to index](README.md) | [Core patterns ←](core.md)
