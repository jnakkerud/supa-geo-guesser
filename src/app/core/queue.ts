export class Queue<T> {
    private items: T[] = [];
    private threshold: number | null = null;
    private thresholdCallback: (() => void) | null = null;

    peek(): T | undefined {
        return this.items[0];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }

    onThreshold(threshold: number, callback: () => void): void {
        this.threshold = threshold;
        this.thresholdCallback = callback;
    }

    private checkThreshold(): void {
        if (
            this.threshold !== null &&
            this.thresholdCallback &&
            this.items.length === this.threshold
        ) {
            this.thresholdCallback();
        }
    }

    enqueue(item: T): void {
        this.items.push(item);
        //this.checkThreshold();
    }

    dequeue(): T | undefined {
        const item = this.items.shift();
        this.checkThreshold();
        return item;
    }

    clear(): void {
        this.items = [];
    }
}