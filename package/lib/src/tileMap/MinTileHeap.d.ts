import { TileScore } from './PathFinding.js';
export declare class MinTileHeap {
    private heap;
    constructor();
    private getParentIndex;
    private getLeftChildIndex;
    private getRightChildIndex;
    private swap;
    private heapifyUp;
    private heapifyDown;
    insert(tile: TileScore): void;
    extractMin(): TileScore | null;
    peek(): TileScore | null;
    size(): number;
    isEmpty(): boolean;
}
//# sourceMappingURL=MinTileHeap.d.ts.map