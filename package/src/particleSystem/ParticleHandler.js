import { Particles } from './Particle.js';
export class ParticleHandler extends Particles {
    static drawParticles(context2d) {
        const iterator = Particles.particlesMap.values();
        let particle;
        while ((particle = iterator.next().value)) {
            if (Particles.isAlive(particle)) {
                particle.drawParticles(context2d);
            }
        }
    }
    static clear() {
        const iterator = Particles.particlesMap.values();
        let particle;
        while ((particle = iterator.next().value)) {
            if (Particles.isAlive(particle)) {
                particle.clear();
            }
            Particles.particlesMap.clear();
        }
    }
}
