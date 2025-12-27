/**
 * API Helper Utilities
 * Centralized error handling and response processing
 */

import { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from '../services/api';

/**
 * Extract data from API response with type safety
 */
export function extractApiData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || response.data.message || 'API request failed');
  }
  return response.data.data;
}

/**
 * Extract error message from API error
 */
export function extractApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  const axiosError = error as AxiosError<ApiResponse>;
  if (axiosError.response?.data?.error) {
    return axiosError.response.data.error;
  }
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }
  if (axiosError.message) {
    return axiosError.message;
  }
  
  return 'Có lỗi xảy ra';
}

/**
 * Safe API call wrapper with error handling
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<AxiosResponse<ApiResponse<T>>>,
  errorMessage?: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await apiCall();
    const data = extractApiData(response);
    return { data, error: null };
  } catch (error) {
    const errorMsg = errorMessage || extractApiError(error);
    return { data: null, error: errorMsg };
  }
}

