import { useState, useEffect, useRef } from 'react';

type FetchFn<T> = (
  query: string,
  page: number,
) => Promise<{
  data: T[];
  totalPages: number;
}>;

export function usePaginatedSearch<T>(fetchFn: FetchFn<T>, debounceMs = 300) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tooShort = query.trim().length > 0 && query.trim().length < 3;

  // Reset to page 1 when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      setTotalPages(0);
      setError(null);
      return;
    }

    if (query.trim().length < 3) {
      setItems([]);
      setTotalPages(0);
      setError(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    let cancelled = false;

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchFn(query, page)
        .then((result) => {
          if (!cancelled) {
            setItems(result.data);
            setTotalPages(result.totalPages);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setItems([]);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, debounceMs);

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, page, debounceMs]);

  return { query, setQuery, page, setPage, items, totalPages, loading, error, tooShort };
}
