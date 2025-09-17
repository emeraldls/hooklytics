import { Event, FastQueue } from './types';

const queue: FastQueue = {
  items: [],
  head: 0,
};

export function enqueue(item: Event): void {
  queue.items.push(item);
}

export function dequeue(): Event | undefined {
  if (queue.head >= queue.items.length) return undefined;

  const item = queue.items[queue.head];
  queue.head++;

  if (queue.head > 1000 && queue.head >= queue.items.length / 2) {
    queue.items = queue.items.slice(queue.head);
    queue.head = 0;
  }

  return item;
}

export function flushQueue(): Event[] {
  const result = queue.items.slice(queue.head);
  queue.items = [];
  queue.head = 0;
  return result;
}

export function queueLength(): number {
  return queue.items.length - queue.head;
}

export function isQueueEmpty(): boolean {
  return queue.head >= queue.items.length;
}
