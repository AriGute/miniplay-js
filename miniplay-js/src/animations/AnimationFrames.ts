import { config } from '../../config';
import { AnimationOptions, Frame, FrameCut, FrameRelativePosition } from './AnimationInterfaces';

interface CachedImages {
	img: HTMLImageElement;
	imgBitMap: ImageBitmap;
	frames: FrameRelativePosition[];
	frameWidth: number;
	frameHeight: number;
}
export class AnimationFrames {
	private static cachedImages: Map<string, CachedImages> = new Map();
	private animationName: string;
	public get name(): string {
		return this.animationName;
	}

	public onload: Function = null;
	private index = 0;
	private img: HTMLImageElement;
	private imgBitMap: ImageBitmap;
	private frameWidth: number;
	private frameHeight: number;
	private frames: FrameRelativePosition[] = [];
	private options: AnimationOptions;
	private static animationFrameRate: number = config.graphics.targetScreenRefreshRate / config.graphics.targetAnimationFrameRate;
	private tick: number = 0;

	constructor(animName: string, imgUrl: string | null, width?: number, height?: number, options?: AnimationOptions, bitMap?: ImageBitmap) {
		this.animationName = animName;
		this.options = options || { frameOffSet: { x: 0, y: 0 } };
		this.index = (options && options.selectedFrames && (options.selectedFrames.startAt || options.selectedFrames.from)) || 0;
		if (bitMap) {
			this.imgBitMap = bitMap;
			this.frameHeight = bitMap.height;
			this.frameWidth = bitMap.width;
			this.generateFrames(this.imgBitMap, width, height);
		} else {
			if (typeof imgUrl === 'string') {
				this.img = new Image();
				let cachedImg = AnimationFrames.cachedImages.get(imgUrl);

				if (cachedImg && cachedImg.img && cachedImg.imgBitMap && cachedImg.frames) {
					this.img = cachedImg.img;
					this.imgBitMap = cachedImg.imgBitMap;
					this.frames = cachedImg.frames;
					this.frameHeight = cachedImg.frameHeight;
					this.frameWidth = cachedImg.frameWidth;
				} else {
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
						// TODO: change to blob?
						const img = results.target as HTMLImageElement;
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
							} else if (options.selectedFrames.from) {
								this.setFrameIndex(options.selectedFrames.from);
							}
						}
					};
					this.img.src = imgUrl;
				}
			}
		}
	}

	public getNextFrame(): Frame {
		this.updateFrameClock();
		const nextFrame: Frame = this.getFrame(this.index);
		if (this.tick === 0) {
			if (nextFrame) {
				const from = nextFrame?.options?.selectedFrames?.from ?? 0;
				const to = nextFrame?.options?.selectedFrames?.to ?? this.frames.length - 1;
				if (nextFrame.options.reverse) {
					if (this.index <= to) {
						if (this.options.loop) {
							this.index = from;
						}
					} else {
						this.index -= 1;
					}
				} else {
					if (this.index >= to) {
						if (this.options.loop) {
							this.index = from;
						}
					} else {
						this.index += 1;
					}
				}
				nextFrame.frameIndex = this.index;
				nextFrame.options = this.options;
			}
		}
		return nextFrame;
	}

	public getFrame(index: number): Frame {
		try {
			if (this.frames && this.frames[index]) {
				const frameCut: FrameCut = {
					sourceX: this.frames[index].sourceX,
					sourceY: this.frames[index].sourceY,
					height: this.frameHeight,
					width: this.frameWidth,
				};
				const frame: Frame = { img: this.imgBitMap, frameCut: frameCut, frameIndex: index, options: this.options };
				return frame;
			} else {
				config.debugMode.logs.animationFrames && console.warn('`this.frames` or `this.frames[index]` is nullish');
				return null;
			}
		} catch (error) {
			console.warn(error);
			return null;
		}
	}

	private generateFrames(img: HTMLImageElement | ImageBitmap, width?: number, height?: number) {
		this.frameHeight = height || img.height;
		this.frameWidth = width || img.width;

		const maxOffSetY = height ? Math.floor(img.height / height) : Math.floor(img.height);
		const maxOffSetX = width ? Math.floor(img.width / width) - 1 : Math.floor(img.width) - 1;
		for (let offSetY = 0; offSetY < maxOffSetY; offSetY++) {
			for (let offSetX = 0; offSetX <= maxOffSetX; offSetX++) {
				const framePos: FrameRelativePosition = {
					sourceX: this.frameWidth * offSetX,
					sourceY: this.frameHeight * offSetY,
				};
				this.frames.push(framePos);
			}
		}
		if (this.frames.length === 0) throw Error('something went wrong while trying to generate frames.\n(maybe wrong frame height or width?)');
	}

	public setFrameIndex(index: number) {
		this.index = index;
	}

	public getFrameIndex() {
		return this.index;
	}

	private updateFrameClock() {
		if (this.tick > AnimationFrames.animationFrameRate) {
			this.tick = 0;
		} else {
			this.tick++;
		}
	}

	/**
	 * Note: the order of the paths define the order of the draw layers. 
	 * Last path is the last to be drawn.
	 * 
	 * @param animName name of the new animation
	 * @param paths list of paths for the spread-sheets of the animations
	 * @param width width of the animation (all the animation and the new animation need to have the same width)
	 * @param height height of the animation (all the animation and the new animation need to have the same height)
	 * @param options {
						selectedFrames: { from: number, to: number },
						loop: boolean,
					}
	 * @returns  Promise<AnimationFrames>
	 */
	public static combineFrames(animName: string, paths: string[], width: number, height: number, options: AnimationOptions): Promise<AnimationFrames> {
		const animationList: Promise<AnimationFrames>[] = [];
		// Load and generate AnimationFrames for each path
		for (let i = 0; i < paths.length; i++) {
			const path = paths[i];
			animationList.push(
				new Promise((resolve, reject) => {
					try {
						const frame = new AnimationFrames(`${animName}${i}`, path, width, height);
						frame.onload = function () {
							resolve(this);
						};
					} catch (error) {
						return reject(error);
					}
				}),
			);
		}

		return new Promise((resolve, reject) => {
			Promise.all(animationList)
				.then((results) => {
					// create offScreenCanvas to draw on
					const offScreenCanvas = new OffscreenCanvas(results[0].img.width, results[0].img.height);
					const context: OffscreenCanvasRenderingContext2D = offScreenCanvas.getContext('2d');
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

	public static clear() {
		AnimationFrames.cachedImages.clear();
		AnimationFrames.animationFrameRate = config.graphics.targetScreenRefreshRate / config.graphics.targetAnimationFrameRate;
	}
}
