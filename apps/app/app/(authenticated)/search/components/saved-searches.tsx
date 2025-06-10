'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { 
  Bookmark, 
  BookmarkPlus, 
  MoreVertical, 
  Trash2, 
  Bell,
  Search,
  Heart
} from 'lucide-react';
import { type SearchFilters } from '@/lib/hooks/use-search';

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  alertsEnabled: boolean;
  createdAt: Date;
  lastUsed: Date;
}

interface SavedSearchesProps {
  currentFilters: SearchFilters;
  onApplySearch: (filters: SearchFilters) => void;
}

export function SavedSearches({ currentFilters, onApplySearch }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [enableAlerts, setEnableAlerts] = useState(true);

  // Load saved searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      try {
        const searches = JSON.parse(saved);
        setSavedSearches(searches.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          lastUsed: new Date(s.lastUsed),
        })));
      } catch (error) {
        console.error('Failed to load saved searches:', error);
      }
    }
  }, []);

  // Save searches to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  const saveCurrentSearch = () => {
    if (!searchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName.trim(),
      filters: currentFilters,
      alertsEnabled: enableAlerts,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    setSavedSearches(prev => [newSearch, ...prev]);
    setSearchName('');
    setIsDialogOpen(false);
  };

  const deleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  const toggleAlerts = (id: string) => {
    setSavedSearches(prev => 
      prev.map(s => 
        s.id === id ? { ...s, alertsEnabled: !s.alertsEnabled } : s
      )
    );
  };

  const applySearch = (search: SavedSearch) => {
    setSavedSearches(prev => 
      prev.map(s => 
        s.id === search.id ? { ...s, lastUsed: new Date() } : s
      )
    );
    onApplySearch(search.filters);
  };

  const hasActiveFilters = Object.keys(currentFilters).some(
    key => key !== 'sortBy' && currentFilters[key as keyof SearchFilters]
  );

  const getSearchDescription = (filters: SearchFilters) => {
    const parts = [];
    if (filters.query) parts.push(`"${filters.query}"`);
    if (filters.categories?.length) parts.push(`${filters.categories.length} categories`);
    if (filters.brands?.length) parts.push(`${filters.brands.length} brands`);
    if (filters.conditions?.length) parts.push(`${filters.conditions.length} conditions`);
    if (filters.priceMin || filters.priceMax) {
      parts.push(`$${filters.priceMin || 0}-${filters.priceMax || '∞'}`);
    }
    return parts.join(', ') || 'All products';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          Saved Searches
        </h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!hasActiveFilters}
            >
              <BookmarkPlus className="h-3 w-3 mr-1" />
              Save
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Search</DialogTitle>
              <DialogDescription>
                Save your current search filters for quick access later
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="searchName">Search Name</Label>
                <Input
                  id="searchName"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="e.g. Designer Dresses Under $100"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Filters</Label>
                <p className="text-sm text-muted-foreground">
                  {getSearchDescription(currentFilters)}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableAlerts"
                  checked={enableAlerts}
                  onChange={(e) => setEnableAlerts(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="enableAlerts" className="text-sm">
                  Get notified when new items match this search
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveCurrentSearch}
                disabled={!searchName.trim()}
              >
                Save Search
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {savedSearches.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No saved searches yet</p>
          <p>Save your favorite searches for quick access</p>
        </div>
      ) : (
        <div className="space-y-2">
          {savedSearches.slice(0, 5).map((search) => (
            <div 
              key={search.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div 
                className="flex-1 cursor-pointer" 
                onClick={() => applySearch(search)}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{search.name}</h4>
                  {search.alertsEnabled && (
                    <Bell className="h-3 w-3 text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getSearchDescription(search.filters)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Used {search.lastUsed.toLocaleDateString()}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => applySearch(search)}>
                    <Search className="h-4 w-4 mr-2" />
                    Apply Search
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleAlerts(search.id)}>
                    <Bell className="h-4 w-4 mr-2" />
                    {search.alertsEnabled ? 'Disable' : 'Enable'} Alerts
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => deleteSearch(search.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          
          {savedSearches.length > 5 && (
            <Button variant="ghost" size="sm" className="w-full">
              View All ({savedSearches.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}