import { NextResponse } from 'next/server';
import { getIndexedDocuments, getTotalIndexedWords } from '@/lib/engine/indexer';
import { searchHistory } from '@/lib/engine/history';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const documents = getIndexedDocuments();
    const totalWords = getTotalIndexedWords();
    const historySize = searchHistory.getSize();

    return NextResponse.json({
      totalDocuments: documents.length,
      totalWords,
      recentSearches: historySize
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
