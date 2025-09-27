export class Inspector {
	private static _toInspect: Map<string, any> = new Map([['Inspector', '']]);

	public static inspect(name, item, index?) {
		Inspector._toInspect.set(index != undefined ? `${name} [${index}]` : name, item);
	}

	public static draw(context2d: CanvasRenderingContext2D) {
		context2d.font = '4px';
		context2d.fillStyle = 'gray';
		let index = 0;
		this._toInspect.forEach((v, k) => context2d.fillText(`${k}: ${v}`, 10, ++index * 8));
	}
}
