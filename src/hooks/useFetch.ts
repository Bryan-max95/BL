'use client';

import { useState, useCallback } from 'react';

interface FetchOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export function useFetch<T = any>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(
    async (options?: FetchOptions) => {
      setLoading(true);
      setError(null);

      try {
        const response = await window.fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          ...options,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  return { data, error, loading, fetch };
}
