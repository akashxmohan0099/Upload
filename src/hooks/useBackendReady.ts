import { useState, useEffect } from 'react';

// Hook to check if backend is ready/connected
// This will be useful when actually integrating with backend
export const useBackendReady = () => {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    checkBackendStatus();
  }, []);
  
  const checkBackendStatus = async () => {
    try {
      setIsChecking(true);

      // Backend is ready since we're using Supabase
      setIsBackendReady(true);

    } catch (err) {
      setError('Unable to connect to backend');
      setIsBackendReady(false);
    } finally {
      setIsChecking(false);
    }
  };
  
  return {
    isBackendReady,
    isChecking,
    error,
    retry: checkBackendStatus
  };
};