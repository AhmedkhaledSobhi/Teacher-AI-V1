/**
 * Custom hook for API data fetching
 * This hook provides a standardized way to interact with the API from client components
 */

'use client'

import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  dependencies?: any[];
  autoFetch?: boolean;
}

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for GET requests
 */
export function useApiGet<T>(url: string, options: UseApiOptions<T> = {}) {
  const {
    initialData = null,
    onSuccess,
    onError,
    dependencies = [],
    autoFetch = true
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    isLoading: autoFetch,
    error: null
  });

  const fetchData = useCallback(async (params?: Record<string, string>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await api.get<T>(url, { params });
      setState({ data, isLoading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
      setState({ data: null, isLoading: false, error: errorObj });
      onError?.(errorObj);
      throw errorObj;
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, ...dependencies]);

  return {
    ...state,
    refetch: fetchData
  };
}

/**
 * Hook for POST requests
 */
export function useApiPost<T, D = any>(url: string, options: UseApiOptions<T> = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseApiState<T> & { isSubmitting: boolean }>({
    data: null,
    isLoading: false,
    isSubmitting: false,
    error: null
  });

  const submit = useCallback(async (data: D) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    
    try {
      const response = await api.post<T>(url, data);
      setState({ data: response, isLoading: false, isSubmitting: false, error: null });
      onSuccess?.(response);
      return response;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
      setState({ data: null, isLoading: false, isSubmitting: false, error: errorObj });
      onError?.(errorObj);
      throw errorObj;
    }
  }, [url, onSuccess, onError]);

  return {
    ...state,
    submit
  };
}

/**
 * Hook for PUT requests
 */
export function useApiPut<T, D = any>(url: string, options: UseApiOptions<T> = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseApiState<T> & { isSubmitting: boolean }>({
    data: null,
    isLoading: false,
    isSubmitting: false,
    error: null
  });

  const submit = useCallback(async (data: D) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    
    try {
      const response = await api.put<T>(url, data);
      setState({ data: response, isLoading: false, isSubmitting: false, error: null });
      onSuccess?.(response);
      return response;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
      setState({ data: null, isLoading: false, isSubmitting: false, error: errorObj });
      onError?.(errorObj);
      throw errorObj;
    }
  }, [url, onSuccess, onError]);

  return {
    ...state,
    submit
  };
}

/**
 * Hook for PATCH requests
 */
export function useApiPatch<T, D = any>(url: string, options: UseApiOptions<T> = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseApiState<T> & { isSubmitting: boolean }>({
    data: null,
    isLoading: false,
    isSubmitting: false,
    error: null
  });

  const submit = useCallback(async (data: D) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    
    try {
      const response = await api.patch<T>(url, data);
      setState({ data: response, isLoading: false, isSubmitting: false, error: null });
      onSuccess?.(response);
      return response;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
      setState({ data: null, isLoading: false, isSubmitting: false, error: errorObj });
      onError?.(errorObj);
      throw errorObj;
    }
  }, [url, onSuccess, onError]);

  return {
    ...state,
    submit
  };
}

/**
 * Hook for DELETE requests
 */
export function useApiDelete<T>(url: string, options: UseApiOptions<T> = {}) {
  const { onSuccess, onError } = options;
  const [state, setState] = useState<UseApiState<T> & { isSubmitting: boolean }>({
    data: null,
    isLoading: false,
    isSubmitting: false,
    error: null
  });

  const submit = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    
    try {
      const response = await api.delete<T>(url);
      setState({ data: response, isLoading: false, isSubmitting: false, error: null });
      onSuccess?.(response);
      return response;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('An unknown error occurred');
      setState({ data: null, isLoading: false, isSubmitting: false, error: errorObj });
      onError?.(errorObj);
      throw errorObj;
    }
  }, [url, onSuccess, onError]);

  return {
    ...state,
    submit
  };
}

/**
 * Combined API hooks
 */
const useApi = {
  get: useApiGet,
  post: useApiPost,
  put: useApiPut,
  patch: useApiPatch,
  delete: useApiDelete
};

export default useApi;