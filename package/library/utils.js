"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = logger;
exports.generateId = generateId;
exports.isNullish = isNullish;
exports.manhattanDistance = manhattanDistance;
const config_1 = require("../config");
const uniqueId = new Set();
function logger(msg, color1, color2) {
    if (config_1.config.debugMode) {
        const time = new Date();
        console.log(`%c [${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}:${time.getMilliseconds()}] ${msg} `, `${color1 ? 'background-color:' + color1 + ';' : ''}${color2 ? 'color:' + color2 + ';' : ''}`);
    }
}
function generateId() {
    let id;
    do {
        id = Math.ceil((performance.now() * Math.random() * 30 * 100000000000) % 9999999999999999999).toString();
    } while (uniqueId.has(id));
    uniqueId.add(id);
    return id;
}
function isNullish(toCheck) {
    if (toCheck instanceof Array) {
        return toCheck.some((i) => i === null || i === undefined);
    }
    else {
        return toCheck === null || toCheck === undefined;
    }
}
function manhattanDistance(point1, point2) {
    try {
        return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
    }
    catch (error) {
        return undefined;
    }
}
//# sourceMappingURL=utils.js.map