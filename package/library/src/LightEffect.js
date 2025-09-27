"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operationGenerator = void 0;
exports.drawLight = drawLight;
exports.drawShadow = drawShadow;
const config_1 = require("../config");
const LightSource_1 = require("./abstract/LightSource");
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
exports.operationGenerator = compositeOperationGenerator();
const LOCAL_SCALE = 64;
function drawLight(context2d) {
    const iterator = LightSource_1.LightSource.sources.values();
    let source;
    while ((source = iterator.next().value)) {
        if (source.enable) {
            context2d.restore();
            context2d.save();
            context2d.globalCompositeOperation = 'overlay';
            context2d.beginPath();
            context2d.arc(source.position.x, source.position.y, (config_1.config.graphics.scaledResolution.height / 2) * source.range, 0, Math.PI * 2);
            const gradient = context2d.createRadialGradient(source.position.x + source.offSet.x, source.position.y + source.offSet.y, (config_1.config.graphics.scaledResolution.height / 10) * source.range, source.position.x + source.offSet.x, source.position.y + source.offSet.y, LOCAL_SCALE / 10);
            gradient.addColorStop(1, `rgb(${source.color[0]},${source.color[1]},${source.color[2]},255)`);
            gradient.addColorStop(0, `rgb(${source.color[0]},${source.color[1]},${source.color[2]},0)`);
            context2d.fillStyle = gradient;
            context2d.fill('nonzero');
            context2d.restore();
        }
    }
}
function drawShadow(context2d, collider) {
    const iterator = LightSource_1.LightSource.sources.values();
    let source;
    while ((source = iterator.next().value)) {
        if (source.enable) {
            context2d.save();
            context2d.beginPath();
            context2d.ellipse(collider.x + collider.width / 2, collider.y + collider.height, 1.5, collider.width / 2, Math.PI / 2, 0, 2 * Math.PI);
            const gradient = context2d.createRadialGradient(source.position.x, source.position.y, (config_1.config.graphics.scaledResolution.height / 10) * source.range, source.position.x, source.position.y, (LOCAL_SCALE / 20) * source.range);
            gradient.addColorStop(1, `rgb(0,0,0,255)`);
            gradient.addColorStop(0, `rgb(0,0,0,0)`);
            context2d.fillStyle = gradient;
            context2d.fill('nonzero');
            context2d.restore();
        }
    }
}
//# sourceMappingURL=LightEffect.js.map