'use client';

import { useState, useEffect } from 'react';
import { History, Search, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface HistoryEntry {
  query: string;
  timestamp: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getFullTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Search History
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View your recent search queries
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
          <Link href="/upload">
            <Button variant="outline">Upload</Button>
          </Link>
          <Link href="/search">
            <Button variant="outline">Search</Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Searches
                </CardTitle>
                <CardDescription>
                  {history.length > 0
                    ? `${history.length} search ${history.length === 1 ? 'query' : 'queries'} recorded`
                    : 'No search history yet'
                  }
                </CardDescription>
              </div>
              {history.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearHistory}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-50 mx-auto"></div>
                <p className="mt-4 text-slate-500 dark:text-slate-400">Loading history...</p>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-2">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-50 truncate">
                          {entry.query}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <p
                            className="text-xs text-slate-500 dark:text-slate-400"
                            title={getFullTimestamp(entry.timestamp)}
                          >
                            {formatTimestamp(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <Badge variant="secondary" className="ml-2">Latest</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                  No search history
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Your search queries will appear here
                </p>
                <Link href="/search">
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    Start Searching
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
