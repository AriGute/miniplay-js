import { config } from '../config.js';
import { LeanPoint } from './collider/BoxCollider.js';
import { Point } from './Point.js';
const uniqueId = new Set();

export function logger(msg: string, color1?: string, color2?: string) {
	if (config.debugMode) {
		const time = new Date();
		console.log(
			`%c [${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}:${time.getMilliseconds()}] ${msg} `,
			`${color1 ? 'background-color:' + color1 + ';' : ''}${color2 ? 'color:' + color2 + ';' : ''}`,
		);
	}
}

export function generateId(): string {
	// TODO: create some kind of object of id to handle removed ids and create new id based on deleted ids (avoid unnecessary id creation).
	let id;
	do {
		id = Math.ceil((performance.now() * Math.random() * 30 * 100000000000) % 9999999999999999999).toString();
	} while (uniqueId.has(id));
	uniqueId.add(id);
	return id;
}

export function isNullish(toCheck) {
	if (toCheck instanceof Array) {
		return toCheck.some((i) => i === null || i === undefined);
	} else {
		return toCheck === null || toCheck === undefined;
	}
}

export function manhattanDistance(point1: Point | LeanPoint, point2: Point | LeanPoint): number {
	try {
		return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
	} catch (error) {
		return undefined;
	}
}
