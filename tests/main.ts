import { Scene } from 'miniplay-js';

class TestClass extends Scene {
	onLoad(): void {
		throw new Error('Method not implemented.');
	}
	onStart(): void {
		throw new Error('Method not implemented.');
	}
	onConnectionLost(): void {
		throw new Error('Method not implemented.');
	}
}

const testClass = new TestClass();
testClass.start();
