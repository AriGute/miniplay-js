import { isNullish } from '../utils';
import { Scene } from '../abstract/Scene';
import { InputSpecialKeys, keyDownMap, keyUpMap, MouseClickEvent } from './InputInterfaces';
import { config } from '../../config';
import { GameObject } from '../abstract/GameObject';
import { ClickAble } from './ClickAble';
import { BoxCollider } from '../collider/BoxCollider';
import { Point } from '../Point';

export class Input {
	private static scene: Scene = null;
	private static keyDownValues: Map<string, boolean | MouseClickEvent> = new Map();
	private static keyUpValues: Map<string, boolean | MouseClickEvent> = new Map();
	private static keyDownMap: keyDownMap = new Map();
	private static keyUpMap: keyUpMap = new Map();
	private static mouseOver: MouseClickEvent = null;

	constructor(scene: Scene) {
		Input.scene = scene;
		this.addMouseInputListener();
		this.addBlurListener();
	}

	private addMouseInputListener() {
		Input.scene.addEventListener('mousemove', (clickEvent: MouseEvent) => {
			// leftClick is 1 (instead of 0) and rightClick is 2 in the buttons property
			let fixedButton = 0;
			if (clickEvent.buttons === 1) fixedButton = InputSpecialKeys.leftClick;
			if (clickEvent.buttons === 2) fixedButton = InputSpecialKeys.rightClick;
			if (Input.keyDownValues[fixedButton]) {
				if ([InputSpecialKeys.leftClick, InputSpecialKeys.rightClick].includes(fixedButton)) {
					if (Input.scene.compareCanvas(<HTMLCanvasElement>clickEvent.target)) {
						Input.keyDownValues[fixedButton] = this.createMouseClickEvent(clickEvent);
					}
				}
			}
		});
		Input.scene.addEventListener('mousedown', (clickEvent: MouseEvent) => {
			if (clickEvent.button === InputSpecialKeys.leftClick) {
				if (Input.scene.compareCanvas(<HTMLCanvasElement>clickEvent.target)) {
					Input.keyDownValues[InputSpecialKeys.leftClick] = this.createMouseClickEvent(clickEvent);
					Input.keyUpMap.get(InputSpecialKeys.leftClick).clear();
				}
			}
		});
		Input.keyDownMap.set(InputSpecialKeys.leftClick, new Set());
		Input.keyUpMap.set(InputSpecialKeys.leftClick, new Set());

		Input.scene.addEventListener('mousedown', (clickEvent: MouseEvent) => {
			if (clickEvent.button === InputSpecialKeys.rightClick) {
				if (Input.scene.compareCanvas(<HTMLCanvasElement>clickEvent.target)) {
					Input.keyDownValues[InputSpecialKeys.rightClick] = this.createMouseClickEvent(clickEvent);
					Input.keyUpMap.get(InputSpecialKeys.rightClick).clear();
				}
			}
		});
		Input.keyDownMap.set(InputSpecialKeys.rightClick, new Set());
		Input.keyUpMap.set(InputSpecialKeys.rightClick, new Set());

		Input.scene.addEventListener('mousedown', (clickEvent: MouseEvent) => {
			if (clickEvent.button === InputSpecialKeys.middleClick) {
				if (Input.scene.compareCanvas(<HTMLCanvasElement>clickEvent.target)) {
					Input.keyDownValues[InputSpecialKeys.middleClick] = this.createMouseClickEvent(clickEvent);
					Input.keyUpMap.get(InputSpecialKeys.middleClick).clear();
				}
			}
		});
		Input.keyDownMap.set(InputSpecialKeys.middleClick, new Set());
		Input.keyUpMap.set(InputSpecialKeys.middleClick, new Set());

		Input.scene.addEventListener('mouseup', (clickEvent: MouseEvent) => {
			if (clickEvent.button === InputSpecialKeys.leftClick) {
				if (Input.scene.compareCanvas(<HTMLCanvasElement>clickEvent.target)) {
					Input.keyDownValues[InputSpecialKeys.leftClick] = false;
					Input.keyUpValues[InputSpecialKeys.leftClick] = this.createMouseClickEvent(clickEvent);
					Input.keyDownMap.get(InputSpecialKeys.leftClick).clear();
				}
			}
		});

		Input.scene.addEventListener('mouseup', (clickEvent: MouseEvent) => {
			if (clickEvent.button === InputSpecialKeys.rightClick) {
				if (Input.scene.compareCanvas(<HTMLCanvasElement>clickEvent.target)) {
					Input.keyDownValues[InputSpecialKeys.rightClick] = false;
					Input.keyUpValues[InputSpecialKeys.rightClick] = this.createMouseClickEvent(clickEvent);
					Input.keyDownMap.get(InputSpecialKeys.rightClick).clear();
				}
			}
		});

		Input.scene.addEventListener('mouseup', (clickEvent: MouseEvent) => {
			if (clickEvent.button === InputSpecialKeys.middleClick) {
				if (Input.scene.compareCanvas(<HTMLCanvasElement>clickEvent.target)) {
					Input.keyDownValues[InputSpecialKeys.middleClick] = false;
					Input.keyUpValues[InputSpecialKeys.middleClick] = this.createMouseClickEvent(clickEvent);
					Input.keyDownMap.get(InputSpecialKeys.middleClick).clear();
				}
			}
		});

		Input.scene.addEventListener('keydown', (keyboardEvent: KeyboardEvent) => {
			if (!keyboardEvent.repeat) {
				if (keyboardEvent.code === InputSpecialKeys.esc) {
					Input.keyDownValues['Escape'] = true;
				}
			}
		});
		Input.keyDownMap.set(InputSpecialKeys.esc, new Set());

		Input.scene.addEventListener('keyup', (keyboardEvent: KeyboardEvent) => {
			if (!keyboardEvent.repeat) {
				if (keyboardEvent.code === InputSpecialKeys.esc) {
					Input.keyDownValues['Escape'] = false;
					Input.keyDownMap.get(InputSpecialKeys.esc).clear();
				}
			}
		});

		Input.scene.addEventListener('mousemove', (clickEvent: MouseEvent) => {
			Input.mouseOver = this.createMouseClickEvent(clickEvent);
		});

		Input.addInputListener('f');
	}

	private addBlurListener() {
		Input.scene.addEventListener('blur', () => {
			let keys = Object.keys(Input.keyDownValues);
			keys.forEach((key) => {
				Input.keyDownValues[key] = undefined;
			});
		});
	}

	public static addInputListener(key: string) {
		if (!isNullish(Input.keyDownValues[key])) return;
		let kayCode = `Key${key.toUpperCase()}`;
		if (key.includes('Digit')) kayCode = key;

		Input.scene.addEventListener('keydown', (keyboardEvent: KeyboardEvent) => {
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

		Input.scene.addEventListener('keyup', (keyboardEvent: KeyboardEvent) => {
			if (!keyboardEvent.repeat) {
				if (keyboardEvent.code === kayCode) {
					Input.keyDownValues[key] = false;
					Input.keyUpValues[key] = true;
					Input.keyDownMap.get(kayCode).clear();
				}
			}
		});
	}

	private createMouseClickEvent(clickEvent: MouseEvent): MouseClickEvent {
		const pointerEvent = <PointerEvent>clickEvent;
		const mousePos = {
			x: pointerEvent.offsetX,
			y: pointerEvent.offsetY,
		};
		const pos = {
			x: (mousePos.x * config.graphics.targetResolution.width) / config.graphics.scaledResolution.width,
			y: (mousePos.y * config.graphics.targetResolution.height) / config.graphics.scaledResolution.height,
		};

		const hitList = GameObject.getGameObjectByTag('clickAble')
			.filter((clickAble: ClickAble) => {
				if (!clickAble.enable) return false;
				const props = clickAble.getArea();
				if (pos.x <= props.x + props.width && pos.x >= props.x && pos.y <= props.y + props.height && pos.y >= props.y) {
					return true;
				} else {
					return false;
				}
			})
			.map((clickAble: ClickAble) => clickAble.owner);
		const targets = BoxCollider.checkGlobalPointCollision(new Point(pos.x, pos.y));
		return {
			mouseEvent: pointerEvent,
			position: mousePos,
			scaledPosition: pos,
			clickAbles: hitList,
			target: targets,
		};
	}

	/**
	 * @param key  e.g. 'leftClick', 'rightClick', 'middleClick', 'w', 'a', etc..
	 * @returns boolean or MouseClickEvent for mouse click event.
	 */
	public static getKey(key: string | InputSpecialKeys): boolean | MouseClickEvent {
		if (key === InputSpecialKeys.mouseHover) {
			return Input.mouseOver;
		}
		return Input.keyDownValues[key];
	}

	/**
	 * NOTE: key DOWN can be checked only once per unique identifier
	 * @param key  e.g. 'leftClick', 'rightClick', 'middleClick', 'w', 'a', etc..
	 * @param id object id or other unique identifier
	 * @returns boolean or MouseClickEvent for mouse click event.
	 */
	public static getKeyDown(key: string | InputSpecialKeys, id: string): boolean | MouseClickEvent {
		if (Input.getKey(key)) {
			let kayCode = null;
			if (key.toString().includes('Digit')) {
				kayCode = key;
			} else {
				if (typeof key === 'number') {
					if (key === InputSpecialKeys.leftClick) {
						kayCode = 0;
					} else if (key === InputSpecialKeys.middleClick) {
						kayCode = 1;
					} else if (key === InputSpecialKeys.rightClick) {
						kayCode = 2;
					}
				} else if (typeof key === 'string') {
					kayCode = `Key${key.toString().toUpperCase()}`;
				}
			}
			if (this.keyDownMap.get(kayCode).has(id)) {
				return false;
			} else {
				this.keyDownMap.get(kayCode).add(id);
			}
			return Input.getKey(key);
		}
	}

	/**
	 * NOTE: key UP can be checked only once per unique identifier
	 * @param key  e.g. 'leftClick', 'rightClick', 'middleClick', 'w', 'a', etc..
	 * @param id object id or other unique identifier
	 * @returns boolean or MouseClickEvent for mouse click event.
	 */
	public static getKeyUp(key: string | InputSpecialKeys, id: string): boolean | MouseClickEvent {
		if (!Input.getKey(key)) {
			let kayCode = null;
			if (typeof key === 'number') {
				if (key === InputSpecialKeys.leftClick) {
					kayCode = 0;
				} else if (key === InputSpecialKeys.rightClick) {
					kayCode = 1;
				} else if (key === InputSpecialKeys.middleClick) {
					kayCode = 2;
				}
			} else if (typeof key === 'string') {
				kayCode = `Key${key.toString().toUpperCase()}`;
			}

			if (this.keyUpMap.get(kayCode).has(id)) {
				return false;
			} else {
				this.keyUpMap.get(kayCode).add(id);
			}
			return Input.keyUpValues[key];
		}
	}

	public static clear() {
		Input.scene = null;
		Input.keyDownValues.clear();
		Input.keyUpValues.clear();
		Input.keyDownMap.clear();
		Input.keyUpMap.clear();
		Input.mouseOver = null;
	}
}
