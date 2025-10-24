import { config } from '../config.js';
import { LeanPoint } from './collider/BoxCollider.js';
import { Point } from './Point.js';

interface UiImgComponents {
	img: ImageBitmap;
	position: LeanPoint;
	index: number;
}
interface UiTextComponents {
	text: string;
	position: LeanPoint;
	maxWidth?: number;
	color?: string;
}
interface UiRectComponents {
	position: LeanPoint;
	height: number;
	width: number;
	color?: string;
}

export class UI {
	private static _canvas: OffscreenCanvas = null;

	public static get canvas(): OffscreenCanvas {
		return UI._canvas;
	}

	private static context2d: OffscreenCanvasRenderingContext2D = null;
	private static uiImgComponents: Map<string, UiImgComponents> = new Map();
	private static drawImgOrder: Map<number, Set<string>> = new Map();
	private static maxIndex = 0;
	private static uiTextsComponents: Map<string, UiTextComponents> = new Map();
	private static uiRectComponents: Map<string, UiRectComponents> = new Map();
	private static tempShapes: Map<number, { pos: LeanPoint | Point; color: string; size: number; fill: boolean }> = new Map();

	private static size = 1;
	private static flipSize = false;

	private static _font: string = config.graphics.textStyle.default_font;
	public static get font(): string {
		return UI._font;
	}

	public static update() {
		UI.drawUIComponents();
		UI.drawShapes();
	}

	private static drawUIComponents() {
		UI.context2d.clearRect(0, 0, config.graphics.scaledResolution.width, config.graphics.scaledResolution.height);
		UI.context2d.beginPath();
		UI.context2d.lineWidth = 2;
		UI.context2d.strokeStyle = 'black';
		UI.context2d.rect(0, 0, config.graphics.scaledResolution.width, config.graphics.scaledResolution.height);
		UI.context2d.stroke();

		for (let i = 0; i <= UI.maxIndex; i++) {
			const drawOrderIterator: Set<string> = UI.drawImgOrder.get(i);
			if (drawOrderIterator) {
				const toDrawIdIterator = drawOrderIterator.values();
				for (let i = 0; i < drawOrderIterator.size; i++) {
					const idToDraw: string = toDrawIdIterator.next().value;
					const imgToDraw: UiImgComponents = UI.uiImgComponents.get(idToDraw);
					if (imgToDraw)
						UI.context2d.drawImage(
							imgToDraw.img,
							0,
							0,
							imgToDraw.img.width,
							imgToDraw.img.height,
							(imgToDraw.position.x * config.graphics.scaledResolution.width) / config.graphics.targetResolution.width,
							(imgToDraw.position.y * config.graphics.scaledResolution.height) / config.graphics.targetResolution.height,
							(imgToDraw.img.width * config.graphics.scaledResolution.width) / config.graphics.targetResolution.width,
							(imgToDraw.img.height * config.graphics.scaledResolution.height) / config.graphics.targetResolution.height,
						);
				}
			}
		}

		const iteratorUITextComponent = UI.uiTextsComponents.values();
		for (let i = 0; i < UI.uiTextsComponents.size; i++) {
			const textToDraw: UiTextComponents = iteratorUITextComponent.next().value;
			if (textToDraw) {
				UI.context2d.fillStyle = textToDraw.color || config.graphics.textStyle.default_color;
				UI.context2d.font = `bold ${textToDraw.maxWidth || config.graphics.textStyle.default_size}px ${UI._font}`;
				UI.context2d.fillText(
					textToDraw.text,
					(textToDraw.position.x * config.graphics.scaledResolution.width) / config.graphics.targetResolution.width,
					(textToDraw.position.y * config.graphics.scaledResolution.height) / config.graphics.targetResolution.height,
					config.graphics.textStyle.default_max_length,
				);
			}
		}

		const iteratorUIRectComponent = UI.uiRectComponents.values();
		for (let i = 0; i < UI.uiRectComponents.size; i++) {
			const rectToDraw: UiRectComponents = iteratorUIRectComponent.next().value;
			if (rectToDraw) {
				UI.context2d.strokeStyle = rectToDraw.color || 'gray';
				UI.context2d.rect(
					(rectToDraw.position.x * config.graphics.scaledResolution.width) / config.graphics.targetResolution.width,
					(rectToDraw.position.y * config.graphics.scaledResolution.height) / config.graphics.targetResolution.height,
					(rectToDraw.width * config.graphics.scaledResolution.width) / config.graphics.targetResolution.width,
					(rectToDraw.height * config.graphics.scaledResolution.height) / config.graphics.targetResolution.height,
				);
			}
		}
		UI.context2d.stroke();
		UI.context2d.strokeStyle = 'black';
	}

	private static drawShapes() {
		if (UI.flipSize) {
			if (UI.size > 1) {
				UI.size -= 0.5;
			} else {
				UI.flipSize = !UI.flipSize;
			}
		} else {
			if (UI.size < 5) {
				UI.size += 0.5;
			} else {
				UI.flipSize = !UI.flipSize;
			}
		}
		const iteratorShapes = UI.tempShapes.values();
		for (let i = 0; i < UI.tempShapes.size; i++) {
			const toDraw: { pos: LeanPoint | Point; color: string; size: number; fill: boolean } = iteratorShapes.next().value;

			if (toDraw) {
				const size = toDraw.size;
				const x = ((toDraw.pos.x - size / 2) * config.graphics.scaledResolution.width) / config.graphics.scaledResolution.width;
				const y = ((toDraw.pos.y - size / 2) * config.graphics.scaledResolution.height) / config.graphics.scaledResolution.height;
				UI.context2d.beginPath();
				UI.context2d.arc(x, y, (toDraw.size * config.graphics.scaledResolution.width) / config.graphics.targetResolution.width, 0, Math.PI * 2);
				if (toDraw.fill) {
					UI.context2d.fillStyle = toDraw.color;
					UI.context2d.fill();
				} else {
					UI.context2d.strokeStyle = toDraw.color;
					UI.context2d.stroke();
				}
			}
		}
	}

	/**
	 * @param toDraw ImageBitmap
	 * @param pos position {x,y} on the screen
	 * @param uniqueIdentifier any unique identifier (e.g. id, unique animation name, etc..)
	 * @param drawOrderIndex the position in the draw order (0 is drawn first then 1 etc...), (default value is 0)
	 */
	public static drawImg(uniqueIdentifier: string, toDraw: ImageBitmap, pos: LeanPoint, drawOrderIndex: number = 0) {
		UI.uiImgComponents.set(uniqueIdentifier, { img: toDraw, position: pos, index: drawOrderIndex });
		if (!UI.drawImgOrder.has(drawOrderIndex)) UI.drawImgOrder.set(drawOrderIndex, new Set());
		UI.drawImgOrder.get(drawOrderIndex).add(uniqueIdentifier);
		if (UI.maxIndex < drawOrderIndex) UI.maxIndex = drawOrderIndex;
	}

	public static updateImagePosition(uniqueIdentifier: string, pos: LeanPoint) {
		const toDraw = UI.uiImgComponents.get(uniqueIdentifier);

		if (toDraw) {
			toDraw.position = pos;
		}
	}

	public static getImageData(uniqueIdentifier: string): UiImgComponents {
		return UI.uiImgComponents.get(uniqueIdentifier);
	}

	public static drawPoint(pos: LeanPoint | Point, color: string = 'red', size: number = 3, fill: boolean = false) {
		const timeoutId = <number>window.setTimeout(() => {
			UI.tempShapes.delete(timeoutId);
		}, 500);
		UI.tempShapes.set(timeoutId, { pos: pos, color: color, size: size, fill: fill });
	}

	public static drawText(uniqueIdentifier: string, text: string, position: LeanPoint | Point, maxWidth?: number, color?: string) {
		UI.uiTextsComponents.set(uniqueIdentifier, {
			text,
			position,
			maxWidth,
			color,
		});
	}
	public static updateTextPosition(uniqueIdentifier: string, pos: LeanPoint) {
		const toDraw = UI.uiTextsComponents.get(uniqueIdentifier);
		if (toDraw) {
			toDraw.position = pos;
		}
	}

	public static drawRect(uniqueIdentifier: string, position: LeanPoint | Point, width: number, height: number, color?: string) {
		UI.uiRectComponents.set(uniqueIdentifier, {
			position,
			height,
			width,
			color,
		});
	}

	public static unDrawRect(uniqueIdentifier: string) {
		UI.uiRectComponents.delete(uniqueIdentifier);
	}

	/**
	 * @param uniqueIdentifier any unique identifier (e.g. id, unique animation name, etc..)
	 */
	public static unDrawImg(uniqueIdentifier: string) {
		const uiImgComponents = UI.uiImgComponents.get(uniqueIdentifier);
		if (uiImgComponents) {
			UI.drawImgOrder.get(uiImgComponents.index).delete(uniqueIdentifier);
			UI.uiImgComponents.delete(uniqueIdentifier);
		}
	}

	/**
	 * @param uniqueIdentifier any unique identifier (e.g. id, unique animation name, etc..)
	 */
	public static unDrawText(uniqueIdentifier: string) {
		UI.uiTextsComponents.delete(uniqueIdentifier);
	}

	public static init() {
		UI._canvas = new OffscreenCanvas(config.graphics.scaledResolution.width, config.graphics.scaledResolution.height);
		UI.context2d = UI._canvas.getContext('2d', {
			alpha: true,
			desynchronized: true,
		});
		UI.context2d.imageSmoothingEnabled = false;
	}

	public static setFont(fontName: string) {
		UI._font = fontName;
	}

	public static clear() {
		console.log('clear ui');
		UI.context2d = null;
		UI.clearUi();
		UI.size = 1;
		UI.flipSize = false;
		UI._font = 'sans-serif';
	}

	/**
	 * name
	 */
	public static clearUi() {
		UI.uiImgComponents.clear();
		UI.drawImgOrder.clear();
		UI.maxIndex = 0;
		UI.uiTextsComponents.clear();
		UI.uiRectComponents.clear();
		UI.tempShapes.clear();
	}
}
