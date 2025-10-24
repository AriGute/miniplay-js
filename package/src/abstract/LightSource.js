import { config } from '../../config.js';
import { Decorate } from './Decorate.js';
export class LightSource extends Decorate {
    static sources = new Map();
    offSet;
    color;
    range;
    tick = 0;
    static lightFlickerRate = config.graphics.targetScreenRefreshRate / config.graphics.targetAnimationFrameRate;
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
        LightSource.lightFlickerRate = config.graphics.targetScreenRefreshRate / config.graphics.targetAnimationFrameRate;
    }
}
