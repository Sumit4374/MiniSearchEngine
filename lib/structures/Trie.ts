export interface Occurrence {
  docName: string;
  line: number;
  index: number;
}

export class TrieNode {
  children: Record<string, TrieNode>;
  isEndOfWord: boolean;
  occurrences: Occurrence[];

  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.occurrences = [];
  }
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string, docName: string, line: number, index: number): void {
    const normalizedWord = word.toLowerCase();
    let current = this.root;

    for (let i = 0; i < normalizedWord.length; i++) {
      const char = normalizedWord[i];

      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }

      current = current.children[char];
    }

    current.isEndOfWord = true;
    current.occurrences.push({ docName, line, index });
  }

  search(word: string): TrieNode | null {
    const normalizedWord = word.toLowerCase();
    let current = this.root;

    for (let i = 0; i < normalizedWord.length; i++) {
      const char = normalizedWord[i];

      if (!current.children[char]) {
        return null;
      }

      current = current.children[char];
    }

    return current.isEndOfWord ? current : null;
  }

  getAllWords(): string[] {
    const words: string[] = [];
    this._collectWords(this.root, '', words);
    return words;
  }

  private _collectWords(node: TrieNode, prefix: string, words: string[]): void {
    if (node.isEndOfWord) {
      words.push(prefix);
    }

    for (const char in node.children) {
      this._collectWords(node.children[char], prefix + char, words);
    }
  }
}
