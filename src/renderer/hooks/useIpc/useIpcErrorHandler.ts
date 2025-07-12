/**
 * React hook for IPC error handling
 */
import { useCallback, useState } from 'react';

export const useIpcErrorHandler = () => {
  const [errors, setErrors] = useState<Array<{ id: string; message: string; timestamp: number }>>(
    [],
  );

  const addError = useCallback((message: string) => {
    const error = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      timestamp: Date.now(),
    };
    setErrors(prev => [...prev, error]);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return { errors, addError, removeError, clearErrors };
};
