import { Frame } from '../animations/AnimationInterfaces.js';
import { GameObject } from '../abstract/GameObject.js';
import { config } from '../../config.js';

/**
 *  motivation: clickAble is a connection between two data structures (option class and the dialog class) on mouse interaction.
 *	functionality: hovering/clicking with the mouse over/on the clickAble will add the clickAble to the MouseClickEvent.clickAbles.
 *	
 *  example:
 *	the dialog is the container which have couple of options to select (each option is clickAble).
 *	Snippet for dialog-option:
 *
	export class Option {
		private readonly clickAble: ClickAble = null;
		public readonly dialog: Dialog = null;
		public dialogNodeData: dialogOptionNode = null;

		public get height(): number {
			return this.clickAble.height;
		}
		public get width(): number {
			return this.clickAble.width;
		}
		public set height(h: number) {
			this.clickAble.height = h;
		}
		public set width(w: number) {
			this.clickAble.width = w;
		}

		public set position(pos: Point) {
			this.clickAble.position = pos;
		}
		public get position(): Point {
			return this.clickAble.position;
		}

		constructor(scene: Scene, dialog: Dialog, height: number, width: number, optionNodeData: DialogOptionNode) {
			this.clickAble = new ClickAble(scene, this, height, width);
			this.dialog = dialog;
			this.dialogNodeData = optionNodeData;
		}

		public select() {
			this.dialog.selectOption(this.dialogNodeData);
		}
	}
 */

export class ClickAble extends GameObject {
	public height: number;
	public width: number;
	public readonly owner: GameObject = null;

	constructor(scene, owner, height: number, width: number) {
		super(scene);
		this.owner = owner;
		this.width = width;
		this.height = height;
		this.addTag('clickAble');
	}

	public getArea(): { x: number; y: number; width: number; height: number } {
		return {
			x: this.position.relativeX,
			y: this.position.relativeY,
			width: this.width,
			height: this.height,
		};
	}

	public update() {
		// pass
	}

	protected nextDraw(context2d: CanvasRenderingContext2D): Frame {
		if (config.debugMode.drawClickAbles) {
			context2d.lineWidth = 0.5;
			context2d.strokeStyle = 'gray';
			context2d.strokeRect(this.position.relativeX, this.position.relativeY, this.width, this.height);
		}
		return null;
	}
}
