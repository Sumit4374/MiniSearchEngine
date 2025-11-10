'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, History, FileText, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Stats {
  totalDocuments: number;
  totalWords: number;
  recentSearches: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({ totalDocuments: 0, totalWords: 0, recentSearches: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Mini Search Engine
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-2">
            Index and search through text documents with custom data structures
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Built with Trie (indexing) and Linked List (history) data structures
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-700 dark:text-slate-300" />
              <CardTitle className="text-3xl font-bold">{stats.totalDocuments}</CardTitle>
              <CardDescription>Indexed Documents</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Database className="w-12 h-12 mx-auto mb-4 text-slate-700 dark:text-slate-300" />
              <CardTitle className="text-3xl font-bold">{stats.totalWords}</CardTitle>
              <CardDescription>Total Words Indexed</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <History className="w-12 h-12 mx-auto mb-4 text-slate-700 dark:text-slate-300" />
              <CardTitle className="text-3xl font-bold">{stats.recentSearches}</CardTitle>
              <CardDescription>Search History Entries</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Index .txt and .pdf files for searching. Each word is stored in a Trie structure with location data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/upload">
                <Button className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Go to Upload
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <CardTitle>Search Engine</CardTitle>
              <CardDescription>
                Search for words across all indexed documents. Get instant results with line and position details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/search">
                <Button className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Start Searching
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                <History className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <CardTitle>Search History</CardTitle>
              <CardDescription>
                View recent search queries stored in a linked list. Most recent searches appear first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/history">
                <Button className="w-full">
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">Upload & Index</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload documents and they are processed server-side. Text is extracted, tokenized, and each word is inserted into a custom Trie data structure with document name, line number, and position.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">Search Words</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Search uses the Trie for O(m) time complexity (where m is word length). Results show all occurrences with exact locations in each document.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">Track History</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Each search query is recorded in a custom Singly Linked List. New searches are added at the head for O(1) insertion, maintaining chronological order.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
