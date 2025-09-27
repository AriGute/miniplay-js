"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decorate = void 0;
const GameObject_1 = require("./GameObject");
class Decorate extends GameObject_1.GameObject {
    animationStateMachine = null;
    constructor(scene, position) {
        super(scene, position);
        this.addTag('decorate');
        this.addAnimations();
    }
}
exports.Decorate = Decorate;
//# sourceMappingURL=Decorate.js.map