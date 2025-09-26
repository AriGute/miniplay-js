import { TileScore } from './PathFinding';

export class MinTileHeap {
	private heap: TileScore[];

	constructor() {
		this.heap = [];
	}

	private getParentIndex(index: number): number {
		return Math.floor((index - 1) / 2);
	}

	private getLeftChildIndex(index: number): number {
		return 2 * index + 1;
	}

	private getRightChildIndex(index: number): number {
		return 2 * index + 2;
	}

	private swap(index1: number, index2: number): void {
		const temp = this.heap[index1];
		this.heap[index1] = this.heap[index2];
		this.heap[index2] = temp;
	}

	private heapifyUp(): void {
		let index = this.heap.length - 1;
		while (index > 0) {
			const parentIndex = this.getParentIndex(index);
			if (this.heap[parentIndex].score > this.heap[index].score) {
				this.swap(parentIndex, index);
				index = parentIndex;
			} else {
				break;
			}
		}
	}

	private heapifyDown(): void {
		let index = 0;
		while (this.getLeftChildIndex(index) < this.heap.length) {
			let smallerChildIndex = this.getLeftChildIndex(index);
			const rightChildIndex = this.getRightChildIndex(index);
			if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].score < this.heap[smallerChildIndex].score) {
				smallerChildIndex = rightChildIndex;
			}

			if (this.heap[index].score > this.heap[smallerChildIndex].score) {
				this.swap(index, smallerChildIndex);
				index = smallerChildIndex;
			} else {
				break;
			}
		}
	}

	insert(tile: TileScore): void {
		this.heap.push(tile);
		this.heapifyUp();
	}

	extractMin(): TileScore | null {
		if (this.heap.length === 0) {
			return null;
		}
		if (this.heap.length === 1) {
			return this.heap.pop()!;
		}
		const min = this.heap[0];
		this.heap[0] = this.heap.pop()!;
		this.heapifyDown();
		return min;
	}

	peek(): TileScore | null {
		return this.heap.length === 0 ? null : this.heap[0];
	}

	size(): number {
		return this.heap.length;
	}

	isEmpty(): boolean {
		return this.heap.length === 0;
	}
}
