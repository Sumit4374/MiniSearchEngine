export class HistoryNode {
  query: string;
  timestamp: Date;
  next: HistoryNode | null;

  constructor(query: string, timestamp: Date) {
    this.query = query;
    this.timestamp = timestamp;
    this.next = null;
  }
}

export class SearchHistoryList {
  head: HistoryNode | null;
  private size: number;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.head = null;
    this.size = 0;
    this.maxSize = maxSize;
  }

  add(query: string): void {
    const newNode = new HistoryNode(query, new Date());

    if (this.head === null) {
      this.head = newNode;
      this.size = 1;
      return;
    }

    newNode.next = this.head;
    this.head = newNode;
    this.size++;

    if (this.size > this.maxSize) {
      this._removeLast();
    }
  }

  addWithTimestamp(query: string, timestamp: Date): void {
    const newNode = new HistoryNode(query, timestamp);

    if (this.head === null) {
      this.head = newNode;
      this.size = 1;
      return;
    }

    newNode.next = this.head;
    this.head = newNode;
    this.size++;

    if (this.size > this.maxSize) {
      this._removeLast();
    }
  }

  private _removeLast(): void {
    if (!this.head || !this.head.next) {
      return;
    }

    let current = this.head;
    while (current.next && current.next.next) {
      current = current.next;
    }

    current.next = null;
    this.size--;
  }

  getAll(): { query: string; timestamp: Date }[] {
    const result: { query: string; timestamp: Date }[] = [];
    let current = this.head;

    while (current !== null) {
      result.push({
        query: current.query,
        timestamp: current.timestamp
      });
      current = current.next;
    }

    return result;
  }

  clear(): void {
    this.head = null;
    this.size = 0;
  }

  getSize(): number {
    return this.size;
  }
}
