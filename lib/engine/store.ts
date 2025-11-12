import fs from 'fs';
import path from 'path';
import { Trie } from '../structures/Trie';
import { IndexedDocument } from './indexer';

const STORAGE_DIR = path.join(process.cwd(), '.search-engine-data');
const INDEX_FILE = path.join(STORAGE_DIR, 'index.json');
const DOCUMENTS_FILE = path.join(STORAGE_DIR, 'documents.json');
const HISTORY_FILE = path.join(STORAGE_DIR, 'history.json');

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export function saveIndex(trie: Trie): void {
  try {
    ensureStorageDir();
    const words = trie.getAllWords();
    const data: any = {};

    words.forEach(word => {
      const node = trie.search(word);
      if (node) {
        data[word] = {
          occurrences: node.occurrences
        };
      }
    });

    fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2));
    console.log('Index saved successfully');
  } catch (error) {
    console.error('Error saving index:', error);
  }
}

export function loadIndex(trie: Trie): void {
  try {
    if (!fs.existsSync(INDEX_FILE)) {
      console.log('No existing index found');
      return;
    }

    const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    
    Object.entries(data).forEach(([word, wordData]: [string, any]) => {
      wordData.occurrences.forEach((occ: any) => {
        trie.insert(word, occ.docName, occ.line, occ.index);
      });
    });

    console.log('Index loaded successfully');
  } catch (error) {
    console.error('Error loading index:', error);
  }
}

export function saveDocuments(documents: IndexedDocument[]): void {
  try {
    ensureStorageDir();
    const data = documents.map(doc => ({
      ...doc,
      indexedAt: doc.indexedAt.toISOString()
    }));
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(data, null, 2));
    console.log('Documents saved successfully');
  } catch (error) {
    console.error('Error saving documents:', error);
  }
}

export function loadDocuments(): IndexedDocument[] {
  try {
    if (!fs.existsSync(DOCUMENTS_FILE)) {
      console.log('No existing documents found');
      return [];
    }

    const data = JSON.parse(fs.readFileSync(DOCUMENTS_FILE, 'utf-8'));
    return data.map((doc: any) => ({
      ...doc,
      indexedAt: new Date(doc.indexedAt)
    }));
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
}

export function clearStorage(): void {
  try {
    if (fs.existsSync(INDEX_FILE)) {
      fs.unlinkSync(INDEX_FILE);
    }
    if (fs.existsSync(DOCUMENTS_FILE)) {
      fs.unlinkSync(DOCUMENTS_FILE);
    }
    console.log('Storage cleared successfully');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

export function saveHistory(history: { query: string; timestamp: Date }[]): void {
  try {
    ensureStorageDir();
    const data = history.map(entry => ({
      query: entry.query,
      timestamp: entry.timestamp.toISOString()
    }));
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
    console.log('History saved successfully');
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

export function loadHistory(): { query: string; timestamp: Date }[] {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      console.log('No existing history found');
      return [];
    }

    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    return data.map((entry: any) => ({
      query: entry.query,
      timestamp: new Date(entry.timestamp)
    }));
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

export function clearHistoryStorage(): void {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      fs.unlinkSync(HISTORY_FILE);
    }
    console.log('History cleared successfully');
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}
