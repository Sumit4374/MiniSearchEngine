import { Trie } from '../structures/Trie';
import { loadIndex, saveIndex, loadDocuments, saveDocuments, clearStorage } from './store';

export const globalTrie = new Trie();

export interface IndexedDocument {
  name: string;
  content: string;
  wordCount: number;
  indexedAt: Date;
}

let indexedDocuments: IndexedDocument[] = [];
export function initializeStorage() {
  const currentWords = globalTrie.getAllWords();
  if (currentWords.length === 0) {
    console.log('Initializing storage...');
    loadIndex(globalTrie);
    indexedDocuments = loadDocuments();
    console.log(`Loaded ${indexedDocuments.length} documents from storage`);
  }
}

export function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

export function indexDocument(docName: string, content: string): void {
  initializeStorage();
  
  const lines = content.split('\n');
  let totalWords = 0;

  lines.forEach((line, lineNumber) => {
    const words = tokenizeText(line);

    words.forEach((word, wordIndex) => {
      globalTrie.insert(word, docName, lineNumber + 1, wordIndex + 1);
      totalWords++;
    });
  });

  indexedDocuments.push({
    name: docName,
    content,
    wordCount: totalWords,
    indexedAt: new Date()
  });

  saveIndex(globalTrie);
  saveDocuments(indexedDocuments);
  
  console.log(`Indexed document: ${docName} with ${totalWords} words`);
}

export function getIndexedDocuments(): IndexedDocument[] {
  initializeStorage();
  return indexedDocuments;
}

export function clearIndex(): void {
  initializeStorage();
  indexedDocuments = [];
  
  clearStorage();
  
  Object.keys(globalTrie.root.children).forEach(key => {
    delete globalTrie.root.children[key];
  });
}

export function getTotalIndexedWords(): number {
  initializeStorage();
  return indexedDocuments.reduce((sum, doc) => sum + doc.wordCount, 0);
}
