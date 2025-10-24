export class MinTileHeap {
    heap;
    constructor() {
        this.heap = [];
    }
    getParentIndex(index) {
        return Math.floor((index - 1) / 2);
    }
    getLeftChildIndex(index) {
        return 2 * index + 1;
    }
    getRightChildIndex(index) {
        return 2 * index + 2;
    }
    swap(index1, index2) {
        const temp = this.heap[index1];
        this.heap[index1] = this.heap[index2];
        this.heap[index2] = temp;
    }
    heapifyUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parentIndex = this.getParentIndex(index);
            if (this.heap[parentIndex].score > this.heap[index].score) {
                this.swap(parentIndex, index);
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    heapifyDown() {
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
            }
            else {
                break;
            }
        }
    }
    insert(tile) {
        this.heap.push(tile);
        this.heapifyUp();
    }
    extractMin() {
        if (this.heap.length === 0) {
            return null;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown();
        return min;
    }
    peek() {
        return this.heap.length === 0 ? null : this.heap[0];
    }
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
}
