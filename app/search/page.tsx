'use client';

import { useState } from 'react';
import { Search, FileText, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Occurrence {
  docName: string;
  line: number;
  index: number;
  snippet: string;
  lineText: string;
}

interface SearchResult {
  word: string;
  occurrences: Occurrence[];
  totalOccurrences: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    setSearched(true);

    try {
      const response = await fetch(`/api/search?word=${encodeURIComponent(query.trim())}`);
      const data = await response.json();

      if (response.ok && data.result) {
        setResult(data.result);
      } else {
        setResult(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const groupOccurrencesByDocument = (occurrences: Occurrence[]) => {
    const grouped: Record<string, Occurrence[]> = {};

    occurrences.forEach(occ => {
      if (!grouped[occ.docName]) {
        grouped[occ.docName] = [];
      }
      grouped[occ.docName].push(occ);
    });

    return grouped;
  };

  const highlightWord = (text: string, searchWord: string) => {
    if (!text || !searchWord) return text;
    
    const parts = text.split(new RegExp(`(${searchWord})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === searchWord.toLowerCase() ? (
            <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 font-semibold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Search Engine
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Search for words across all indexed documents
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
          <Link href="/upload">
            <Button variant="outline">Upload</Button>
          </Link>
          <Link href="/history">
            <Button variant="outline">History</Button>
          </Link>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Documents
            </CardTitle>
            <CardDescription>
              Enter a word to find all its occurrences in indexed documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter word to search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searching || !query.trim()}>
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {searched && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              {result && (
                <CardDescription>
                  Found {result.totalOccurrences} occurrence(s) of "{result.word}"
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {result && result.occurrences.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupOccurrencesByDocument(result.occurrences)).map(
                    ([docName, occurrences]) => (
                      <div key={docName} className="border-l-4 border-slate-300 dark:border-slate-600 pl-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-slate-500" />
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50">
                            {docName}
                          </h3>
                          <Badge variant="secondary">{occurrences.length} matches</Badge>
                        </div>
                        <div className="grid gap-2 ml-7">
                          {occurrences.map((occ, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                              <div className="flex items-center gap-3 mb-2 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>Line {occ.line}</span>
                                </div>
                                <span>•</span>
                                <span>Position {occ.index}</span>
                              </div>
                              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                                {highlightWord(occ.snippet, result.word)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                    No results found
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    The word "{query}" was not found in any indexed documents
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
