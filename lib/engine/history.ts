import { SearchHistoryList } from '../structures/LinkedList';
import { saveHistory, loadHistory, clearHistoryStorage } from './store';

export const searchHistory = new SearchHistoryList(50);
let isHistoryInitialized = false;

function initializeHistory() {
  if (!isHistoryInitialized) {
    console.log('Initializing history...');
    const savedHistory = loadHistory();
    
    for (let i = savedHistory.length - 1; i >= 0; i--) {
      const entry = savedHistory[i];
      searchHistory.addWithTimestamp(entry.query, entry.timestamp);
    }
    
    isHistoryInitialized = true;
    console.log(`Loaded ${savedHistory.length} history entries from storage`);
  }
}

export function addSearchQuery(query: string): void {
  initializeHistory();
  
  if (query && query.trim().length > 0) {
    searchHistory.add(query.trim());
    
    const allHistory = searchHistory.getAll();
    saveHistory(allHistory);
  }
}

export function getSearchHistory(): { query: string; timestamp: Date }[] {
  initializeHistory();
  return searchHistory.getAll();
}

export function clearSearchHistory(): void {
  initializeHistory();
  searchHistory.clear();
  clearHistoryStorage();
}
