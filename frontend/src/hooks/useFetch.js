import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/format';

// Small data-fetching hook: { data, loading, error, reload, setData }.
// Re-runs whenever `deps` change and ignores results from stale requests.
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const counter = useRef(0);

  const run = useCallback(async () => {
    const id = ++counter.current;
    setLoading(true);
    setError('');
    try {
      const result = await fetcher();
      if (id === counter.current) setData(result);
    } catch (err) {
      if (id === counter.current) setError(getErrorMessage(err));
    } finally {
      if (id === counter.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, reload: run, setData };
}
