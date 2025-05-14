import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Fuse from 'fuse.js';
import { useRouter } from 'next/router';

// Define Page type locally based on schema
type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  // Add other fields as needed
};

// Define the search item type
export type SearchItem = {
  id: string;
  title: string;
  contentText: string; 
  type: 'page' | 'document';
  slug?: string;
  fileName?: string;
};

// Define the search context type
type SearchContextType = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchItem[];
  isSearching: boolean;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  loading: boolean;
};

// Create the search context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Create the search provider component
export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Initialize Fuse instance when items are loaded
  useEffect(() => {
    if (items.length > 0) {
      const fuseOptions = {
        keys: [
          { name: 'title', weight: 0.7 },
          { name: 'contentText', weight: 0.3 }
        ],
        includeScore: true,
        threshold: 0.4,
      };
      setFuse(new Fuse(items, fuseOptions));
    }
  }, [items]);

  // Fetch search data (pages and documents)
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/search/data');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching search data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchData();
  }, []);

  // Perform search when search term changes
  useEffect(() => {
    if (searchTerm && fuse) {
      setIsSearching(true);
      const results = fuse.search(searchTerm);
      setSearchResults(results.map(result => result.item));
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchTerm, fuse]);

  // Reset search when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      closeSearch();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Functions to handle search modal
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        isSearchOpen,
        openSearch,
        closeSearch,
        loading
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// Create a hook for using the search context
export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
} 