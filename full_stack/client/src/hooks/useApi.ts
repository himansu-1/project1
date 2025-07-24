import { useState, useCallback, useEffect, useRef } from 'react';
import axios, { type AxiosRequestConfig, type Method, type CancelTokenSource } from 'axios';

interface RequestOptions {
  method?: Method;
  url: string;
  body?: any;
  params?: any;
  headers?: Record<string, string>;
  skip?: boolean; // if true, skip auto-fetch on mount
}

export const useApi = ({
  method = 'GET',
  url,
  body,
  params,
  headers,
  skip = false,
}: RequestOptions) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelRef = useRef<CancelTokenSource | null>(null);

  const fetchData = useCallback(
    async (overrideOptions: Partial<Omit<RequestOptions, 'url'>> = {}) => {
      setLoading(true);
      setError(null);

      const finalMethod = overrideOptions.method || method;
      const finalBody = overrideOptions.body ?? body;
      const finalParams = overrideOptions.params ?? params;
      const finalHeaders = overrideOptions.headers ?? headers;

      cancelRef.current?.cancel(); // cancel previous request
      cancelRef.current = axios.CancelToken.source();

      try {
        const config: AxiosRequestConfig = {
          method: finalMethod,
          url,
          data: finalBody,
          params: finalParams,
          headers: finalHeaders,
          cancelToken: cancelRef.current.token,
        };

        const response = await axios(config);
        setData(response.data);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          setError(err?.response?.data?.error || err.message || 'Something went wrong');
        }
      } finally {
        setLoading(false);
      }
    },
    [url, method, body, params, headers]
  );

  useEffect(() => {
    if (!skip) {
      fetchData();
    }

    return () => {
      cancelRef.current?.cancel();
    };
  }, [fetchData, skip]);

  return { loading, data, error, refetch: fetchData };
};
