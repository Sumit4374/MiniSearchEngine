import { NextResponse } from 'next/server';
import { getSearchHistory, clearSearchHistory } from '@/lib/engine/history';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = getSearchHistory();

    return NextResponse.json({
      success: true,
      history: history.map(entry => ({
        query: entry.query,
        timestamp: entry.timestamp.toISOString()
      }))
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearSearchHistory();

    return NextResponse.json({
      success: true,
      message: 'Search history cleared'
    });
  } catch (error) {
    console.error('History clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    );
  }
}
