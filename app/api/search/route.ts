import { NextRequest, NextResponse } from 'next/server';
import { searchWord } from '@/lib/engine/search';
import { addSearchQuery } from '@/lib/engine/history';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const word = searchParams.get('word');

    console.log('Search request for word:', word);

    if (!word) {
      return NextResponse.json(
        { error: 'Search word is required' },
        { status: 400 }
      );
    }

    const result = searchWord(word);
    
    console.log('Search result:', result ? `Found ${result.totalOccurrences} occurrences` : 'Not found');

    addSearchQuery(word);

    return NextResponse.json({
      success: true,
      result,
      found: result !== null
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
