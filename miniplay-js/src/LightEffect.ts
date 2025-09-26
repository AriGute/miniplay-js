import { config } from '../config';
import { LightSource } from './abstract/LightSource';
import { BoxCollider } from './collider/BoxCollider';
import { Inspector } from './Inspector';
import { Point } from './Point';
// https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/brightness

// const imgSrc = '../../assets/circle_white_gradient64x64.png';
// const imgSrc = '../../assets/circle_white_gradient180x360.png';
// const imgSrc = '../assets/default/shadow.png';
// const shadow = new Image();
// shadow.src = imgSrc;

function* compositeOperationGenerator() {
	while (true) {
		yield 'source-over';
		yield 'source-in';
		yield 'source-out';
		yield 'source-atop';
		yield 'destination-over';
		yield 'destination-in';
		yield 'destination-out';
		yield 'destination-atop';
		yield 'lighter';
		yield 'copy';
		yield 'xor';
		yield 'multiply';
		yield 'screen';
		yield 'overlay';
		yield 'darken';
		yield 'lighten';
		yield 'color-dodge';
		yield 'color-burn';
		yield 'hard-light';
		yield 'soft-light';
		yield 'difference';
		yield 'exclusion';
		yield 'hue';
		yield 'saturation';
		yield 'color';
		yield 'luminosity';
	}
}
export const operationGenerator = compositeOperationGenerator();

const LOCAL_SCALE = 64;
// export function drawLightMask(context2d: CanvasRenderingContext2D) {
// 	context2d.save();
// 	if (LightSource.sources.length > 0) {
// 		context2d.beginPath();
// 		LightSource.sources.forEach((source: LightSource, i) => {
// 			context2d.arc(source.position.x, source.position.y, LOCAL_SCALE * config.graphics.scale.height, 0, Math.PI * 2);
// 		});
// 	}
// 	context2d.clip();
// 	context2d.fill();
// }

export function drawLight(context2d: CanvasRenderingContext2D) {
	const iterator = LightSource.sources.values();
	let source: LightSource;
	while ((source = iterator.next().value)) {
		if (source.enable) {
			context2d.restore();
			context2d.save();
			context2d.globalCompositeOperation = 'overlay';
			context2d.beginPath();
			context2d.arc(source.position.x, source.position.y, (config.graphics.scaledResolution.height / 2) * source.range, 0, Math.PI * 2);
			const gradient = context2d.createRadialGradient(
				source.position.x + source.offSet.x,
				source.position.y + source.offSet.y,
				(config.graphics.scaledResolution.height / 10) * source.range,
				source.position.x + source.offSet.x,
				source.position.y + source.offSet.y,
				LOCAL_SCALE / 10,
			);

			gradient.addColorStop(1, `rgb(${source.color[0]},${source.color[1]},${source.color[2]},255)`);
			gradient.addColorStop(0, `rgb(${source.color[0]},${source.color[1]},${source.color[2]},0)`);
			context2d.fillStyle = gradient;
			context2d.fill('nonzero');
			context2d.restore();
		}
	}
}

export function drawShadow(context2d: CanvasRenderingContext2D, collider: BoxCollider) {
	const iterator = LightSource.sources.values();
	let source;
	while ((source = iterator.next().value)) {
		if (source.enable) {
			context2d.save();
			context2d.beginPath();
			context2d.ellipse(collider.x + collider.width / 2, collider.y + collider.height, 1.5, collider.width / 2, Math.PI / 2, 0, 2 * Math.PI);
			const gradient = context2d.createRadialGradient(
				source.position.x,
				source.position.y,
				(config.graphics.scaledResolution.height / 10) * source.range,
				source.position.x,
				source.position.y,
				(LOCAL_SCALE / 20) * source.range,
			);
			gradient.addColorStop(1, `rgb(0,0,0,255)`);
			gradient.addColorStop(0, `rgb(0,0,0,0)`);
			context2d.fillStyle = gradient;
			context2d.fill('nonzero');
			context2d.restore();
		}
	}
}
