"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const utils_1 = require("../utils");
const InputInterfaces_1 = require("./InputInterfaces");
const config_1 = require("../../config");
const GameObject_1 = require("../abstract/GameObject");
const BoxCollider_1 = require("../collider/BoxCollider");
const Point_1 = require("../Point");
class Input {
    static scene = null;
    static keyDownValues = new Map();
    static keyUpValues = new Map();
    static keyDownMap = new Map();
    static keyUpMap = new Map();
    static mouseOver = null;
    constructor(scene) {
        Input.scene = scene;
        this.addMouseInputListener();
        this.addBlurListener();
    }
    addMouseInputListener() {
        Input.scene.addEventListener('mousemove', (clickEvent) => {
            let fixedButton = 0;
            if (clickEvent.buttons === 1)
                fixedButton = InputInterfaces_1.InputSpecialKeys.leftClick;
            if (clickEvent.buttons === 2)
                fixedButton = InputInterfaces_1.InputSpecialKeys.rightClick;
            if (Input.keyDownValues[fixedButton]) {
                if ([InputInterfaces_1.InputSpecialKeys.leftClick, InputInterfaces_1.InputSpecialKeys.rightClick].includes(fixedButton)) {
                    if (Input.scene.compareCanvas(clickEvent.target)) {
                        Input.keyDownValues[fixedButton] = this.createMouseClickEvent(clickEvent);
                    }
                }
            }
        });
        Input.scene.addEventListener('mousedown', (clickEvent) => {
            if (clickEvent.button === InputInterfaces_1.InputSpecialKeys.leftClick) {
                if (Input.scene.compareCanvas(clickEvent.target)) {
                    Input.keyDownValues[InputInterfaces_1.InputSpecialKeys.leftClick] = this.createMouseClickEvent(clickEvent);
                    Input.keyUpMap.get(InputInterfaces_1.InputSpecialKeys.leftClick).clear();
                }
            }
        });
        Input.keyDownMap.set(InputInterfaces_1.InputSpecialKeys.leftClick, new Set());
        Input.keyUpMap.set(InputInterfaces_1.InputSpecialKeys.leftClick, new Set());
        Input.scene.addEventListener('mousedown', (clickEvent) => {
            if (clickEvent.button === InputInterfaces_1.InputSpecialKeys.rightClick) {
                if (Input.scene.compareCanvas(clickEvent.target)) {
                    Input.keyDownValues[InputInterfaces_1.InputSpecialKeys.rightClick] = this.createMouseClickEvent(clickEvent);
                    Input.keyUpMap.get(InputInterfaces_1.InputSpecialKeys.rightClick).clear();
                }
            }
        });
        Input.keyDownMap.set(InputInterfaces_1.InputSpecialKeys.rightClick, new Set());
        Input.keyUpMap.set(InputInterfaces_1.InputSpecialKeys.rightClick, new Set());
        Input.scene.addEventListener('mousedown', (clickEvent) => {
            if (clickEvent.button === InputInterfaces_1.InputSpecialKeys.middleClick) {
                if (Input.scene.compareCanvas(clickEvent.target)) {
                    Input.keyDownValues[InputInterfaces_1.InputSpecialKeys.middleClick] = this.createMouseClickEvent(clickEvent);
                    Input.keyUpMap.get(InputInterfaces_1.InputSpecialKeys.middleClick).clear();
                }
            }
        });
        Input.keyDownMap.set(InputInterfaces_1.InputSpecialKeys.middleClick, new Set());
        Input.keyUpMap.set(InputInterfaces_1.InputSpecialKeys.middleClick, new Set());
        Input.scene.addEventListener('mouseup', (clickEvent) => {
            if (clickEvent.button === InputInterfaces_1.InputSpecialKeys.leftClick) {
                if (Input.scene.compareCanvas(clickEvent.target)) {
                    Input.keyDownValues[InputInterfaces_1.InputSpecialKeys.leftClick] = false;
                    Input.keyUpValues[InputInterfaces_1.InputSpecialKeys.leftClick] = this.createMouseClickEvent(clickEvent);
                    Input.keyDownMap.get(InputInterfaces_1.InputSpecialKeys.leftClick).clear();
                }
            }
        });
        Input.scene.addEventListener('mouseup', (clickEvent) => {
            if (clickEvent.button === InputInterfaces_1.InputSpecialKeys.rightClick) {
                if (Input.scene.compareCanvas(clickEvent.target)) {
                    Input.keyDownValues[InputInterfaces_1.InputSpecialKeys.rightClick] = false;
                    Input.keyUpValues[InputInterfaces_1.InputSpecialKeys.rightClick] = this.createMouseClickEvent(clickEvent);
                    Input.keyDownMap.get(InputInterfaces_1.InputSpecialKeys.rightClick).clear();
                }
            }
        });
        Input.scene.addEventListener('mouseup', (clickEvent) => {
            if (clickEvent.button === InputInterfaces_1.InputSpecialKeys.middleClick) {
                if (Input.scene.compareCanvas(clickEvent.target)) {
                    Input.keyDownValues[InputInterfaces_1.InputSpecialKeys.middleClick] = false;
                    Input.keyUpValues[InputInterfaces_1.InputSpecialKeys.middleClick] = this.createMouseClickEvent(clickEvent);
                    Input.keyDownMap.get(InputInterfaces_1.InputSpecialKeys.middleClick).clear();
                }
            }
        });
        Input.scene.addEventListener('keydown', (keyboardEvent) => {
            if (!keyboardEvent.repeat) {
                if (keyboardEvent.code === InputInterfaces_1.InputSpecialKeys.esc) {
                    Input.keyDownValues['Escape'] = true;
                }
            }
        });
        Input.keyDownMap.set(InputInterfaces_1.InputSpecialKeys.esc, new Set());
        Input.scene.addEventListener('keyup', (keyboardEvent) => {
            if (!keyboardEvent.repeat) {
                if (keyboardEvent.code === InputInterfaces_1.InputSpecialKeys.esc) {
                    Input.keyDownValues['Escape'] = false;
                    Input.keyDownMap.get(InputInterfaces_1.InputSpecialKeys.esc).clear();
                }
            }
        });
        Input.scene.addEventListener('mousemove', (clickEvent) => {
            Input.mouseOver = this.createMouseClickEvent(clickEvent);
        });
        Input.addInputListener('f');
    }
    addBlurListener() {
        Input.scene.addEventListener('blur', () => {
            let keys = Object.keys(Input.keyDownValues);
            keys.forEach((key) => {
                Input.keyDownValues[key] = undefined;
            });
        });
    }
    static addInputListener(key) {
        if (!(0, utils_1.isNullish)(Input.keyDownValues[key]))
            return;
        let kayCode = `Key${key.toUpperCase()}`;
        if (key.includes('Digit'))
            kayCode = key;
        Input.scene.addEventListener('keydown', (keyboardEvent) => {
            if (!keyboardEvent.repeat) {
                if (keyboardEvent.code === kayCode) {
                    Input.keyDownValues[key] = true;
                    Input.keyUpValues[key] = false;
                    Input.keyUpMap.get(kayCode).clear();
                }
            }
        });
        Input.keyDownMap.set(kayCode, new Set());
        Input.keyUpMap.set(kayCode, new Set());
        Input.scene.addEventListener('keyup', (keyboardEvent) => {
            if (!keyboardEvent.repeat) {
                if (keyboardEvent.code === kayCode) {
                    Input.keyDownValues[key] = false;
                    Input.keyUpValues[key] = true;
                    Input.keyDownMap.get(kayCode).clear();
                }
            }
        });
    }
    createMouseClickEvent(clickEvent) {
        const pointerEvent = clickEvent;
        const mousePos = {
            x: pointerEvent.offsetX,
            y: pointerEvent.offsetY,
        };
        const pos = {
            x: (mousePos.x * config_1.config.graphics.targetResolution.width) / config_1.config.graphics.scaledResolution.width,
            y: (mousePos.y * config_1.config.graphics.targetResolution.height) / config_1.config.graphics.scaledResolution.height,
        };
        const hitList = GameObject_1.GameObject.getGameObjectByTag('clickAble')
            .filter((clickAble) => {
            if (!clickAble.enable)
                return false;
            const props = clickAble.getArea();
            if (pos.x <= props.x + props.width && pos.x >= props.x && pos.y <= props.y + props.height && pos.y >= props.y) {
                return true;
            }
            else {
                return false;
            }
        })
            .map((clickAble) => clickAble.owner);
        const targets = BoxCollider_1.BoxCollider.checkGlobalPointCollision(new Point_1.Point(pos.x, pos.y));
        return {
            mouseEvent: pointerEvent,
            position: mousePos,
            scaledPosition: pos,
            clickAbles: hitList,
            target: targets,
        };
    }
    static getKey(key) {
        if (key === InputInterfaces_1.InputSpecialKeys.mouseHover) {
            return Input.mouseOver;
        }
        return Input.keyDownValues[key];
    }
    static getKeyDown(key, id) {
        if (Input.getKey(key)) {
            let kayCode = null;
            if (key.toString().includes('Digit')) {
                kayCode = key;
            }
            else {
                if (typeof key === 'number') {
                    if (key === InputInterfaces_1.InputSpecialKeys.leftClick) {
                        kayCode = 0;
                    }
                    else if (key === InputInterfaces_1.InputSpecialKeys.middleClick) {
                        kayCode = 1;
                    }
                    else if (key === InputInterfaces_1.InputSpecialKeys.rightClick) {
                        kayCode = 2;
                    }
                }
                else if (typeof key === 'string') {
                    kayCode = `Key${key.toString().toUpperCase()}`;
                }
            }
            if (this.keyDownMap.get(kayCode).has(id)) {
                return false;
            }
            else {
                this.keyDownMap.get(kayCode).add(id);
            }
            return Input.getKey(key);
        }
    }
    static getKeyUp(key, id) {
        if (!Input.getKey(key)) {
            let kayCode = null;
            if (typeof key === 'number') {
                if (key === InputInterfaces_1.InputSpecialKeys.leftClick) {
                    kayCode = 0;
                }
                else if (key === InputInterfaces_1.InputSpecialKeys.rightClick) {
                    kayCode = 1;
                }
                else if (key === InputInterfaces_1.InputSpecialKeys.middleClick) {
                    kayCode = 2;
                }
            }
            else if (typeof key === 'string') {
                kayCode = `Key${key.toString().toUpperCase()}`;
            }
            if (this.keyUpMap.get(kayCode).has(id)) {
                return false;
            }
            else {
                this.keyUpMap.get(kayCode).add(id);
            }
            return Input.keyUpValues[key];
        }
    }
    static clear() {
        Input.scene = null;
        Input.keyDownValues.clear();
        Input.keyUpValues.clear();
        Input.keyDownMap.clear();
        Input.keyUpMap.clear();
        Input.mouseOver = null;
    }
}
exports.Input = Input;
//# sourceMappingURL=Input.js.map