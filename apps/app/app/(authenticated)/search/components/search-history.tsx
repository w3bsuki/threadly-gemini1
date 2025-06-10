'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Clock, X, TrendingUp, Search } from 'lucide-react';

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultsCount?: number;
}

interface SearchHistoryProps {
  onSearchSelect: (query: string) => void;
  currentQuery?: string;
}

export function SearchHistory({ onSearchSelect, currentQuery }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [popularSearches] = useState([
    'designer dresses',
    'vintage jeans',
    'luxury handbags',
    'sneakers',
    'winter coats',
    'evening wear',
    'casual shirts',
    'accessories'
  ]);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  // Add current query to history
  useEffect(() => {
    if (currentQuery && currentQuery.trim()) {
      addToHistory(currentQuery.trim());
    }
  }, [currentQuery]);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    setHistory(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(item => item.query !== query);
      
      // Add new entry at the beginning
      const newHistory = [{
        query,
        timestamp: new Date(),
      }, ...filtered];

      // Keep only the last 20 searches
      return newHistory.slice(0, 20);
    });
  };

  const removeFromHistory = (query: string) => {
    setHistory(prev => prev.filter(item => item.query !== query));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const recentSearches = history.slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Searches
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearHistory}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-1">
            {recentSearches.map((item, index) => (
              <div 
                key={`${item.query}-${index}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <button
                  onClick={() => onSearchSelect(item.query)}
                  className="flex-1 text-left text-sm hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <span>{item.query}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.timestamp.toLocaleDateString()}
                    {item.resultsCount && ` • ${item.resultsCount} results`}
                  </div>
                </button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromHistory(item.query)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Popular Searches
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search) => (
            <Button
              key={search}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onSearchSelect(search)}
            >
              {search}
            </Button>
          ))}
        </div>
      </div>

      {recentSearches.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No recent searches</p>
          <p>Your search history will appear here</p>
        </div>
      )}
    </div>
  );
}