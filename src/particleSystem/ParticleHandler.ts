import { Particles } from './Particle.js';

export class ParticleHandler extends Particles {
	public static drawParticles(context2d: CanvasRenderingContext2D) {
		const iterator = Particles.particlesMap.values();
		let particle: Particles;
		while ((particle = iterator.next().value)) {
			if (Particles.isAlive(particle)) {
				particle.drawParticles(context2d);
			}
		}
	}

	public static clear() {
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
