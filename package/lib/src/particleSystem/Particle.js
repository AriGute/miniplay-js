import { config } from '../../config.js';
import { Scene } from '../abstract/Scene.js';
import { AnimationFrames } from '../animations/AnimationFrames.js';
import { Point } from '../Point.js';
import { generateId } from '../utils.js';
export class Particles {
    static particlesMap = new Map();
    id = '.js';
    _enable = true;
    set enable(v) {
        if (v) {
            Particles.particlesMap.set(this.id, this);
        }
        else {
            Particles.particlesMap.delete(this.id);
        }
        this._enable = v;
    }
    pieces = [];
    particle = null;
    count = 0;
    frameDeltaTime = 0;
    forceX = 0;
    forceY = 0;
    _isAlive = true;
    get isAlive() {
        return this._isAlive;
    }
    timer = 0;
    delay = 1;
    position = new Point(0, 0);
    maxCount = 1;
    randomRangeX = 0;
    randomRangeY = 0;
    randomRangeScale = 0;
    timeToLive = 5;
    scaleWidth = 1;
    scaleHeight = 1;
    preCycle = false;
    constructor(img, width, height, options) {
        this.particle = new AnimationFrames('particle', img, width, height, { loop: true });
        this.id = generateId();
        options &&
            Object.keys(options).forEach((key) => {
                if (key === 'position') {
                    this[key] = new Point(options[key].x, options[key].y);
                }
                else if (key === 'forceX') {
                    this[key] = options[key];
                }
                else if (key === 'forceY') {
                    this[key] = options[key];
                }
                else if (key === 'randomRangeX') {
                    this[key] = options[key];
                }
                else if (key === 'randomRangeY') {
                    this[key] = options[key];
                }
                else {
                    this[key] = options[key];
                }
            });
        Particles.particlesMap.set(this.id, this);
        if (this.preCycle) {
            this.particle.onload = () => this.invokePreCycle();
        }
    }
    invokePreCycle() {
        for (let i = 0; i < this.maxCount / 3; i++) {
            const piece = this.createPiece();
            const timeToLive = Math.random() * this.timeToLive;
            const y = piece.position.relativeY + this.forceY * timeToLive - this.forceY * 10;
            const x = piece.position.relativeX + this.forceX * timeToLive - this.forceY;
            piece.position = new Point(x, y, true);
            piece.timeToLive = timeToLive;
            this.pieces.push(piece);
            this.count++;
        }
        this.timer = this.delay;
        this.delay = this.delay / 3;
    }
    drawParticles(context2d) {
        this.beforeDrawUpdate();
        if (this.timer < 0 && this.count < this.maxCount) {
            this.pieces.push(this.createPiece());
            this.count++;
            this.timer = this.delay;
        }
        this.drawPieces(context2d);
    }
    beforeDrawUpdate() {
        this.frameDeltaTime = Scene.deltaTime / config.graphics.targetScreenRefreshRate;
        this.timer -= this.frameDeltaTime;
    }
    drawPieces(context2d) {
        let piece = null;
        let frame = null;
        let list = [];
        for (let i = 0; i < this.pieces.length; i++) {
            piece = this.pieces[i];
            frame = this.getPieceFrame(piece);
            if (piece.timeToLive > 0 && frame) {
                this.draw(context2d, frame.img, frame.frameCut, piece);
                piece.position = new Point(piece.position.x + this.forceX * this.frameDeltaTime, piece.position.y + this.forceY * this.frameDeltaTime, false, false);
                piece.frameIndex = frame.frameIndex;
                piece.timeToLive -= this.frameDeltaTime;
                list.push(piece);
            }
        }
        this.pieces = list;
        this.count = list.length;
    }
    draw(context2d, img, frameCut, piece) {
        context2d.drawImage(img, frameCut.sourceX, frameCut.sourceY, frameCut.width, frameCut.height, piece.position.x, piece.position.y, (frameCut.width + piece.scale) * this.scaleWidth, (frameCut.height + piece.scale) * this.scaleHeight);
    }
    getPieceFrame(piece) {
        this.particle.setFrameIndex(piece.frameIndex);
        return this.particle.getNextFrame();
    }
    createPiece() {
        const frame = this.particle.getNextFrame();
        return {
            position: new Point(this.position.x + Math.random() * (this.randomRangeX * 2) - this.randomRangeX, this.position.y + Math.random() * (this.randomRangeY * 2) - this.randomRangeY),
            scale: Math.random() * this.randomRangeScale,
            frameIndex: (frame && ((Math.random() * frame.img.width) / frame.img.height - 1) | 0) || 0,
            timeToLive: this.timeToLive,
        };
    }
    clear() {
        this.particle = undefined;
        this.timer = undefined;
        this.delay = undefined;
        this.maxCount = undefined;
        this.maxCount = undefined;
        this.position = undefined;
        this._isAlive = false;
    }
    remove() {
        Particles.particlesMap.delete(this.id);
        Object.keys(this).forEach((prop) => {
            this[prop] = undefined;
        });
    }
    static isAlive(particle) {
        return particle._isAlive;
    }
    static clear() {
        Particles.particlesMap.clear();
    }
}
