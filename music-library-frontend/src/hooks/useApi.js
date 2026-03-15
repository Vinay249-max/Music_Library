import { useState, useEffect, useCallback } from 'react';

/**
 * useApi — wraps any async service call with loading / error / data state.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(getSongs, { search: '' });
 */
const useApi = (serviceFunc, params = null, deps = []) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await serviceFunc(overrideParams ?? params);
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export default useApi;
