"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inspector = void 0;
class Inspector {
    static _toInspect = new Map([['Inspector', '']]);
    static inspect(name, item, index) {
        Inspector._toInspect.set(index != undefined ? `${name} [${index}]` : name, item);
    }
    static draw(context2d) {
        context2d.font = '4px';
        context2d.fillStyle = 'gray';
        let index = 0;
        this._toInspect.forEach((v, k) => context2d.fillText(`${k}: ${v}`, 10, ++index * 8));
    }
}
exports.Inspector = Inspector;
//# sourceMappingURL=Inspector.js.map