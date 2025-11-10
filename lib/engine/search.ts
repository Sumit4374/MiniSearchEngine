import { globalTrie, initializeStorage, getIndexedDocuments } from './indexer';
import { Occurrence } from '../structures/Trie';

export interface SearchResultOccurrence extends Occurrence {
  snippet: string;
  lineText: string;
}

export interface SearchResult {
  word: string;
  occurrences: SearchResultOccurrence[];
  totalOccurrences: number;
}

function getContextSnippet(content: string, lineNumber: number, wordIndex: number, searchWord: string): { snippet: string; lineText: string } {
  const lines = content.split('\n');
  const lineText = lines[lineNumber - 1] || '';
  
  // Get surrounding context (up to 100 characters before and after)
  const words = lineText.toLowerCase().split(/\s+/);
  const wordPosition = wordIndex - 1;
  
  // Find the actual position in the line text
  let charPosition = 0;
  for (let i = 0; i < wordPosition && i < words.length; i++) {
    charPosition = lineText.toLowerCase().indexOf(words[i], charPosition);
    if (charPosition !== -1) {
      charPosition += words[i].length;
    }
  }
  
  // Find the search word in the line text
  charPosition = lineText.toLowerCase().indexOf(searchWord.toLowerCase(), charPosition);
  
  if (charPosition === -1) {
    // Fallback: just return the line
    return {
      snippet: lineText.substring(0, 200) + (lineText.length > 200 ? '...' : ''),
      lineText: lineText
    };
  }
  
  // Create snippet with context
  const contextLength = 60;
  let start = Math.max(0, charPosition - contextLength);
  let end = Math.min(lineText.length, charPosition + searchWord.length + contextLength);
  
  // Try to break at word boundaries
  if (start > 0) {
    const spaceIndex = lineText.lastIndexOf(' ', start);
    if (spaceIndex > start - 20 && spaceIndex > 0) {
      start = spaceIndex + 1;
    }
  }
  
  if (end < lineText.length) {
    const spaceIndex = lineText.indexOf(' ', end);
    if (spaceIndex > 0 && spaceIndex < end + 20) {
      end = spaceIndex;
    }
  }
  
  let snippet = lineText.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < lineText.length) snippet = snippet + '...';
  
  return {
    snippet,
    lineText: lineText
  };
}

export function searchWord(word: string): SearchResult | null {
  initializeStorage();
  
  const node = globalTrie.search(word);

  if (!node) {
    return null;
  }

  // Get all indexed documents
  const documents = getIndexedDocuments();
  const docMap = new Map(documents.map(doc => [doc.name, doc.content]));
  
  // Enhance occurrences with snippets
  const enhancedOccurrences: SearchResultOccurrence[] = node.occurrences.map(occ => {
    const content = docMap.get(occ.docName) || '';
    const { snippet, lineText } = getContextSnippet(content, occ.line, occ.index, word);
    
    return {
      ...occ,
      snippet,
      lineText
    };
  });

  return {
    word: word.toLowerCase(),
    occurrences: enhancedOccurrences,
    totalOccurrences: enhancedOccurrences.length
  };
}

export function getAllIndexedWords(): string[] {
  initializeStorage();
  return globalTrie.getAllWords();
}
