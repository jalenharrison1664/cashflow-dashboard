import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchData, setSearchDataState] = useState({
    transactions: [],
    summary: null,
    aiInsights: null,
  });
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const registerData = useCallback((data) => {
    setSearchDataState((prev) => ({ ...prev, ...data }));
  }, []);

  return (
    <SearchContext.Provider value={{ query, setQuery, debouncedQuery, searchData, registerData }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
