import { GameObject } from '../abstract/GameObject';
import { LeanPoint } from '../collider/BoxCollider';

export enum InputSpecialKeys {
	leftClick = 0,
	middleClick = 1,
	rightClick = 2,
	mouseHover = 3,
	esc = 'Escape',
	digit1 = 'Digit1',
	digit2 = 'Digit2',
	digit3 = 'Digit3',
	digit4 = 'Digit4',
	digit5 = 'Digit5',
	digit6 = 'Digit6',
	digit7 = 'Digit7',
	digit8 = 'Digit8',
	digit9 = 'Digit9',
}

export type keyDownMap = Map<string | InputSpecialKeys, Set<string>>;
export type keyUpMap = Map<string | InputSpecialKeys, Set<string>>; // {key, id, isDown, checked}

export interface MouseClickEvent {
	mouseEvent: PointerEvent;
	position: LeanPoint;
	scaledPosition: LeanPoint;
	clickAbles: GameObject[];
	target: GameObject | boolean;
}
