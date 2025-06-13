import React, { JSX, ReactNode, useEffect, useRef } from 'react';
import { Config, Listener } from './types';
import { flushQueue } from './queue';
import { AnalyticsContext } from './analytics-context';
import { buildEvent, getConfig } from './utils';

export interface ProviderProps {
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

  const appConfig = getConfig({ ...config });

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
        const eventData = buildEvent({ type: 'metadata_heartbeat' });
        if (appConfig.sendMetadata) {
        }

        if (config?.environment === 'dev') {
          console.log('Sending core metadata:', eventData);
        }

        if (config?.sendMetadata) {
          listenerRef.current([eventData]);
        }
      }
    }, config?.metadataInterval || 30000);

    return () => {
      clearInterval(queueInterval);
      clearInterval(metadataInterval);
    };
  }, [config?.batchInterval, config?.metadataInterval, config?.environment]);

  const setListener = (fn: Listener) => {
    listenerRef.current = fn;
  };

  return (
    <AnalyticsContext.Provider
      value={{ setListener, config: appConfig }}
      {...props}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
