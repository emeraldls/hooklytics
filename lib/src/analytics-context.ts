import { createContext, useContext } from 'react';
import { Config, Listener } from './types';

export const AnalyticsContext = createContext<{
  setListener: (fn: Listener) => void;
  config?: Config;
} | null>(null);

export const useAnalyticsContext = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx)
    throw new Error('useListenForData must be used within AnalyticsProvider');
  return ctx;
};
