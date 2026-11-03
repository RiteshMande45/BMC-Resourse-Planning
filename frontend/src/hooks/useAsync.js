import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to execute an async service call.
 * Returns { data, loading, error, reload, setData }
 */
export function useAsync(asyncFunction, immediate = true, deps = []) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await asyncFunction(...params);
      setData(response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to load data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, ...deps]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, reload: execute, setData };
}

export default useAsync;

