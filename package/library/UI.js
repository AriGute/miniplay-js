"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI = void 0;
const config_1 = require("../config");
class UI {
    static _canvas = null;
    static get canvas() {
        return UI._canvas;
    }
    static context2d = null;
    static uiImgComponents = new Map();
    static drawImgOrder = new Map();
    static maxIndex = 0;
    static uiTextsComponents = new Map();
    static uiRectComponents = new Map();
    static tempShapes = new Map();
    static size = 1;
    static flipSize = false;
    static _font = config_1.config.graphics.textStyle.default_font;
    static get font() {
        return UI._font;
    }
    static update() {
        UI.drawUIComponents();
        UI.drawShapes();
    }
    static drawUIComponents() {
        UI.context2d.clearRect(0, 0, config_1.config.graphics.scaledResolution.width, config_1.config.graphics.scaledResolution.height);
        UI.context2d.beginPath();
        UI.context2d.lineWidth = 2;
        UI.context2d.strokeStyle = 'black';
        UI.context2d.rect(0, 0, config_1.config.graphics.scaledResolution.width, config_1.config.graphics.scaledResolution.height);
        UI.context2d.stroke();
        for (let i = 0; i <= UI.maxIndex; i++) {
            const drawOrderIterator = UI.drawImgOrder.get(i);
            if (drawOrderIterator) {
                const toDrawIdIterator = drawOrderIterator.values();
                for (let i = 0; i < drawOrderIterator.size; i++) {
                    const idToDraw = toDrawIdIterator.next().value;
                    const imgToDraw = UI.uiImgComponents.get(idToDraw);
                    if (imgToDraw)
                        UI.context2d.drawImage(imgToDraw.img, 0, 0, imgToDraw.img.width, imgToDraw.img.height, (imgToDraw.position.x * config_1.config.graphics.scaledResolution.width) / config_1.config.graphics.targetResolution.width, (imgToDraw.position.y * config_1.config.graphics.scaledResolution.height) / config_1.config.graphics.targetResolution.height, (imgToDraw.img.width * config_1.config.graphics.scaledResolution.width) / config_1.config.graphics.targetResolution.width, (imgToDraw.img.height * config_1.config.graphics.scaledResolution.height) / config_1.config.graphics.targetResolution.height);
                }
            }
        }
        const iteratorUITextComponent = UI.uiTextsComponents.values();
        for (let i = 0; i < UI.uiTextsComponents.size; i++) {
            const textToDraw = iteratorUITextComponent.next().value;
            if (textToDraw) {
                UI.context2d.fillStyle = textToDraw.color || config_1.config.graphics.textStyle.default_color;
                UI.context2d.font = `bold ${textToDraw.maxWidth || config_1.config.graphics.textStyle.default_size}px ${UI._font}`;
                UI.context2d.fillText(textToDraw.text, (textToDraw.position.x * config_1.config.graphics.scaledResolution.width) / config_1.config.graphics.targetResolution.width, (textToDraw.position.y * config_1.config.graphics.scaledResolution.height) / config_1.config.graphics.targetResolution.height, config_1.config.graphics.textStyle.default_max_length);
            }
        }
        const iteratorUIRectComponent = UI.uiRectComponents.values();
        for (let i = 0; i < UI.uiRectComponents.size; i++) {
            const rectToDraw = iteratorUIRectComponent.next().value;
            if (rectToDraw) {
                UI.context2d.strokeStyle = rectToDraw.color || 'gray';
                UI.context2d.rect((rectToDraw.position.x * config_1.config.graphics.scaledResolution.width) / config_1.config.graphics.targetResolution.width, (rectToDraw.position.y * config_1.config.graphics.scaledResolution.height) / config_1.config.graphics.targetResolution.height, (rectToDraw.width * config_1.config.graphics.scaledResolution.width) / config_1.config.graphics.targetResolution.width, (rectToDraw.height * config_1.config.graphics.scaledResolution.height) / config_1.config.graphics.targetResolution.height);
            }
        }
        UI.context2d.stroke();
        UI.context2d.strokeStyle = 'black';
    }
    static drawShapes() {
        if (UI.flipSize) {
            if (UI.size > 1) {
                UI.size -= 0.5;
            }
            else {
                UI.flipSize = !UI.flipSize;
            }
        }
        else {
            if (UI.size < 5) {
                UI.size += 0.5;
            }
            else {
                UI.flipSize = !UI.flipSize;
            }
        }
        const iteratorShapes = UI.tempShapes.values();
        for (let i = 0; i < UI.tempShapes.size; i++) {
            const toDraw = iteratorShapes.next().value;
            if (toDraw) {
                const size = toDraw.size;
                const x = ((toDraw.pos.x - size / 2) * config_1.config.graphics.scaledResolution.width) / config_1.config.graphics.scaledResolution.width;
                const y = ((toDraw.pos.y - size / 2) * config_1.config.graphics.scaledResolution.height) / config_1.config.graphics.scaledResolution.height;
                UI.context2d.beginPath();
                UI.context2d.arc(x, y, (toDraw.size * config_1.config.graphics.scaledResolution.width) / config_1.config.graphics.targetResolution.width, 0, Math.PI * 2);
                if (toDraw.fill) {
                    UI.context2d.fillStyle = toDraw.color;
                    UI.context2d.fill();
                }
                else {
                    UI.context2d.strokeStyle = toDraw.color;
                    UI.context2d.stroke();
                }
            }
        }
    }
    static drawImg(uniqueIdentifier, toDraw, pos, drawOrderIndex = 0) {
        UI.uiImgComponents.set(uniqueIdentifier, { img: toDraw, position: pos, index: drawOrderIndex });
        if (!UI.drawImgOrder.has(drawOrderIndex))
            UI.drawImgOrder.set(drawOrderIndex, new Set());
        UI.drawImgOrder.get(drawOrderIndex).add(uniqueIdentifier);
        if (UI.maxIndex < drawOrderIndex)
            UI.maxIndex = drawOrderIndex;
    }
    static updateImagePosition(uniqueIdentifier, pos) {
        const toDraw = UI.uiImgComponents.get(uniqueIdentifier);
        if (toDraw) {
            toDraw.position = pos;
        }
    }
    static getImageData(uniqueIdentifier) {
        return UI.uiImgComponents.get(uniqueIdentifier);
    }
    static drawPoint(pos, color = 'red', size = 3, fill = false) {
        const timeoutId = window.setTimeout(() => {
            UI.tempShapes.delete(timeoutId);
        }, 500);
        UI.tempShapes.set(timeoutId, { pos: pos, color: color, size: size, fill: fill });
    }
    static drawText(uniqueIdentifier, text, position, maxWidth, color) {
        UI.uiTextsComponents.set(uniqueIdentifier, {
            text,
            position,
            maxWidth,
            color,
        });
    }
    static updateTextPosition(uniqueIdentifier, pos) {
        const toDraw = UI.uiTextsComponents.get(uniqueIdentifier);
        if (toDraw) {
            toDraw.position = pos;
        }
    }
    static drawRect(uniqueIdentifier, position, width, height, color) {
        UI.uiRectComponents.set(uniqueIdentifier, {
            position,
            height,
            width,
            color,
        });
    }
    static unDrawRect(uniqueIdentifier) {
        UI.uiRectComponents.delete(uniqueIdentifier);
    }
    static unDrawImg(uniqueIdentifier) {
        const uiImgComponents = UI.uiImgComponents.get(uniqueIdentifier);
        if (uiImgComponents) {
            UI.drawImgOrder.get(uiImgComponents.index).delete(uniqueIdentifier);
            UI.uiImgComponents.delete(uniqueIdentifier);
        }
    }
    static unDrawText(uniqueIdentifier) {
        UI.uiTextsComponents.delete(uniqueIdentifier);
    }
    static init() {
        UI._canvas = new OffscreenCanvas(config_1.config.graphics.scaledResolution.width, config_1.config.graphics.scaledResolution.height);
        UI.context2d = UI._canvas.getContext('2d', {
            alpha: true,
            desynchronized: true,
        });
        UI.context2d.imageSmoothingEnabled = false;
    }
    static setFont(fontName) {
        UI._font = fontName;
    }
    static clear() {
        console.log('clear ui');
        UI.context2d = null;
        UI.clearUi();
        UI.size = 1;
        UI.flipSize = false;
        UI._font = 'sans-serif';
    }
    static clearUi() {
        UI.uiImgComponents.clear();
        UI.drawImgOrder.clear();
        UI.maxIndex = 0;
        UI.uiTextsComponents.clear();
        UI.uiRectComponents.clear();
        UI.tempShapes.clear();
    }
}
exports.UI = UI;
//# sourceMappingURL=UI.js.map