"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationFrames = void 0;
const config_1 = require("../../config");
class AnimationFrames {
    static cachedImages = new Map();
    animationName;
    get name() {
        return this.animationName;
    }
    onload = null;
    index = 0;
    img;
    imgBitMap;
    frameWidth;
    frameHeight;
    frames = [];
    options;
    static animationFrameRate = config_1.config.graphics.targetScreenRefreshRate / config_1.config.graphics.targetAnimationFrameRate;
    tick = 0;
    constructor(animName, imgUrl, width, height, options, bitMap) {
        this.animationName = animName;
        this.options = options || { frameOffSet: { x: 0, y: 0 } };
        this.index = (options && options.selectedFrames && (options.selectedFrames.startAt || options.selectedFrames.from)) || 0;
        if (bitMap) {
            this.imgBitMap = bitMap;
            this.frameHeight = bitMap.height;
            this.frameWidth = bitMap.width;
            this.generateFrames(this.imgBitMap, width, height);
        }
        else {
            if (typeof imgUrl === 'string') {
                this.img = new Image();
                let cachedImg = AnimationFrames.cachedImages.get(imgUrl);
                if (cachedImg && cachedImg.img && cachedImg.imgBitMap && cachedImg.frames) {
                    this.img = cachedImg.img;
                    this.imgBitMap = cachedImg.imgBitMap;
                    this.frames = cachedImg.frames;
                    this.frameHeight = cachedImg.frameHeight;
                    this.frameWidth = cachedImg.frameWidth;
                }
                else {
                    AnimationFrames.cachedImages.set(imgUrl, {
                        img: null,
                        imgBitMap: null,
                        frames: null,
                        frameWidth: undefined,
                        frameHeight: undefined,
                    });
                    cachedImg = AnimationFrames.cachedImages.get(imgUrl);
                    this.img.setAttribute('decoding', 'async');
                    this.img.onload = (results) => {
                        const img = results.target;
                        cachedImg.img = img;
                        createImageBitmap(img).then((bitmap) => {
                            this.imgBitMap = bitmap;
                            cachedImg.imgBitMap = this.imgBitMap;
                            if (this.onload) {
                                this.onload();
                            }
                        });
                        this.generateFrames(img, width, height);
                        cachedImg.frames = this.frames;
                        cachedImg.frameWidth = this.frameWidth;
                        cachedImg.frameHeight = this.frameHeight;
                        if (options?.selectedFrames) {
                            if (options.selectedFrames.startAt) {
                                this.setFrameIndex(options.selectedFrames.startAt);
                            }
                            else if (options.selectedFrames.from) {
                                this.setFrameIndex(options.selectedFrames.from);
                            }
                        }
                    };
                    this.img.src = imgUrl;
                }
            }
        }
    }
    getNextFrame() {
        this.updateFrameClock();
        const nextFrame = this.getFrame(this.index);
        if (this.tick === 0) {
            if (nextFrame) {
                const from = nextFrame?.options?.selectedFrames?.from ?? 0;
                const to = nextFrame?.options?.selectedFrames?.to ?? this.frames.length - 1;
                if (nextFrame.options.reverse) {
                    if (this.index <= to) {
                        if (this.options.loop) {
                            this.index = from;
                        }
                    }
                    else {
                        this.index -= 1;
                    }
                }
                else {
                    if (this.index >= to) {
                        if (this.options.loop) {
                            this.index = from;
                        }
                    }
                    else {
                        this.index += 1;
                    }
                }
                nextFrame.frameIndex = this.index;
                nextFrame.options = this.options;
            }
        }
        return nextFrame;
    }
    getFrame(index) {
        try {
            if (this.frames && this.frames[index]) {
                const frameCut = {
                    sourceX: this.frames[index].sourceX,
                    sourceY: this.frames[index].sourceY,
                    height: this.frameHeight,
                    width: this.frameWidth,
                };
                const frame = { img: this.imgBitMap, frameCut: frameCut, frameIndex: index, options: this.options };
                return frame;
            }
            else {
                config_1.config.debugMode.logs.animationFrames && console.warn('`this.frames` or `this.frames[index]` is nullish');
                return null;
            }
        }
        catch (error) {
            console.warn(error);
            return null;
        }
    }
    generateFrames(img, width, height) {
        this.frameHeight = height || img.height;
        this.frameWidth = width || img.width;
        const maxOffSetY = height ? Math.floor(img.height / height) : Math.floor(img.height);
        const maxOffSetX = width ? Math.floor(img.width / width) - 1 : Math.floor(img.width) - 1;
        for (let offSetY = 0; offSetY < maxOffSetY; offSetY++) {
            for (let offSetX = 0; offSetX <= maxOffSetX; offSetX++) {
                const framePos = {
                    sourceX: this.frameWidth * offSetX,
                    sourceY: this.frameHeight * offSetY,
                };
                this.frames.push(framePos);
            }
        }
        if (this.frames.length === 0)
            throw Error('something went wrong while trying to generate frames.\n(maybe wrong frame height or width?)');
    }
    setFrameIndex(index) {
        this.index = index;
    }
    getFrameIndex() {
        return this.index;
    }
    updateFrameClock() {
        if (this.tick > AnimationFrames.animationFrameRate) {
            this.tick = 0;
        }
        else {
            this.tick++;
        }
    }
    static combineFrames(animName, paths, width, height, options) {
        const animationList = [];
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            animationList.push(new Promise((resolve, reject) => {
                try {
                    const frame = new AnimationFrames(`${animName}${i}`, path, width, height);
                    frame.onload = function () {
                        resolve(this);
                    };
                }
                catch (error) {
                    return reject(error);
                }
            }));
        }
        return new Promise((resolve, reject) => {
            Promise.all(animationList)
                .then((results) => {
                const offScreenCanvas = new OffscreenCanvas(results[0].img.width, results[0].img.height);
                const context = offScreenCanvas.getContext('2d');
                for (let i = 0; i < results.length; i++) {
                    const frame = results[i].getNextFrame();
                    context.drawImage(frame.img, 0, 0);
                }
                const imgData = context.getImageData(0, 0, offScreenCanvas.width, offScreenCanvas.height);
                createImageBitmap(imgData).then((imgBitMap) => {
                    const animationOptions = {
                        selectedFrames: { from: 0, to: 10 },
                        loop: true,
                    };
                    resolve(new AnimationFrames(animName, null, 32, 32, options, imgBitMap));
                });
            })
                .catch((err) => reject(err));
        });
    }
    static clear() {
        AnimationFrames.cachedImages.clear();
        AnimationFrames.animationFrameRate = config_1.config.graphics.targetScreenRefreshRate / config_1.config.graphics.targetAnimationFrameRate;
    }
}
exports.AnimationFrames = AnimationFrames;
//# sourceMappingURL=AnimationFrames.js.map