"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticleHandler = void 0;
const Particle_1 = require("./Particle");
class ParticleHandler extends Particle_1.Particles {
    static drawParticles(context2d) {
        const iterator = Particle_1.Particles.particlesMap.values();
        let particle;
        while ((particle = iterator.next().value)) {
            if (Particle_1.Particles.isAlive(particle)) {
                particle.drawParticles(context2d);
            }
        }
    }
    static clear() {
        const iterator = Particle_1.Particles.particlesMap.values();
        let particle;
        while ((particle = iterator.next().value)) {
            if (Particle_1.Particles.isAlive(particle)) {
                particle.clear();
            }
            Particle_1.Particles.particlesMap.clear();
        }
    }
}
exports.ParticleHandler = ParticleHandler;
//# sourceMappingURL=ParticleHandler.js.map