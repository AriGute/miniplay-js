"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightSource = void 0;
const config_1 = require("../../config");
const Decorate_1 = require("./Decorate");
class LightSource extends Decorate_1.Decorate {
    static sources = new Map();
    offSet;
    color;
    range;
    tick = 0;
    static lightFlickerRate = config_1.config.graphics.targetScreenRefreshRate / config_1.config.graphics.targetAnimationFrameRate;
    constructor(scene, point, color = [255, 255, 255], range = 1, offSet) {
        super(scene, point);
        this.offSet = offSet || { x: 0, y: 0 };
        this.color = color;
        this.range = range;
        LightSource.sources.set(this.objectId, this);
    }
    updateFrameClock() {
        if (this.tick > LightSource.lightFlickerRate) {
            this.tick = 0;
        }
        else {
            this.tick++;
        }
    }
    static clear() {
        LightSource.sources.clear();
        LightSource.lightFlickerRate = config_1.config.graphics.targetScreenRefreshRate / config_1.config.graphics.targetAnimationFrameRate;
    }
}
exports.LightSource = LightSource;
//# sourceMappingURL=LightSource.js.map