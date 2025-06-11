import React, {
  HTMLAttributes,
  JSX,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { Config, Event, Listener } from './types';
import { flushQueue } from './queue';
import { AnalyticsContext } from './analytics-context';
import { getEnvMeta } from './utils';

export interface ProviderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  config?: Config;
}

export const AnalyticsProvider = ({
  children,
  config,
  ...props
}: ProviderProps): JSX.Element => {
  const listenerRef = useRef<Listener | null>(null);

  if (config?.environment === 'dev') {
    console.log('Analytics Provider Initialized');
  }

  useEffect(() => {
    // Interval for flushing queued events
    const queueInterval = setInterval(() => {
      const events = flushQueue();
      if (events.length > 0 && listenerRef.current) {
        listenerRef.current(events);
      }
    }, config?.batchInterval || 5000);

    // Separate interval for auto-tracking core metadata
    const metadataInterval = setInterval(() => {
      if (listenerRef.current) {
        const coreMetadata = getEnvMeta();

        const metadataEvent: Event = {
          type: 'metadata_heartbeat',
          metadata: coreMetadata,
          timestamp: Date.now(),
        };

        if (config?.environment === 'dev') {
          console.log('Sending core metadata:', metadataEvent);
        }

        listenerRef.current([metadataEvent]);
      }
    }, config?.metadataInterval || 30000); // Default to 30 seconds

    return () => {
      clearInterval(queueInterval);
      clearInterval(metadataInterval);
    };
  }, [config?.batchInterval, config?.metadataInterval, config?.environment]);

  const setListener = (fn: Listener) => {
    listenerRef.current = fn;
  };

  return (
    <AnalyticsContext.Provider value={{ setListener }} {...props}>
      {children}
    </AnalyticsContext.Provider>
  );
};
