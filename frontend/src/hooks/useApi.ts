/**
 * Custom hook for API calls with loading and error states
 */

import { useState, useCallback } from 'react';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '../services/api';
import { extractApiData, extractApiError, safeApiCall } from '../utils/apiHelper';

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (apiCall: () => Promise<AxiosResponse<ApiResponse<T>>>) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for making API calls with built-in loading and error state management
 */
export function useApi<T = unknown>(): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    apiCall: () => Promise<AxiosResponse<ApiResponse<T>>>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      const result = extractApiData(response);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      const errorMsg = extractApiError(err);
      setError(errorMsg);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

