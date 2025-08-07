import { useState, useEffect, useCallback } from "react";
import { useFetcher } from "react-router";

export type SearchResult = {
  value: string;
  label: string;
};

export type SearchType = "users" | "documents";

export function useSearch(type: SearchType, debounceMs: number = 300) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetcher = useFetcher();

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const url = `/api/search?q=${encodeURIComponent(searchQuery)}&type=${type}`;

      fetcher.load(url);
    },
    [type, fetcher]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, search, debounceMs]);

  useEffect(() => {
    if (fetcher.data?.results) {
      setResults(fetcher.data.results);
      setIsLoading(false);
    }
  }, [fetcher.data]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error: fetcher.data?.error,
  };
}