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
  const appConfig = getConfig({ ...config });

  if (appConfig?.environment === 'dev') {
    console.log('App Config', appConfig);
    console.log('Analytics Provider Initialized');
  }

  useEffect(() => {
    // Interval for flushing queued events
    const queueInterval = setInterval(() => {
      const events = flushQueue();
      if (events.length > 0 && listenerRef.current) {
        listenerRef.current(events);
      }
    }, appConfig?.batchInterval || 5000);

    // Separate interval for auto-tracking core metadata
    const metadataInterval = setInterval(() => {
      if (listenerRef.current && appConfig?.sendMetadata) {
        // only send metadata when page is visible
        const isPageVisible = appConfig?.sendMetadataOnlyWhenVisible
          ? !document.hidden
          : true;

        if (isPageVisible) {
          const eventData = buildEvent({
            type: 'metadata_heartbeat',
            config: appConfig,
          });

          if (appConfig?.environment === 'dev') {
            console.log('Sending core metadata:', eventData);
          }

          listenerRef.current([eventData]);
        } else if (appConfig?.environment === 'dev') {
          console.log('Skipping metadata heartbeat - page not visible');
        }
      }
    }, appConfig?.metadataInterval || 30000);

    return () => {
      clearInterval(queueInterval);
      clearInterval(metadataInterval);
    };
  }, [
    appConfig?.batchInterval,
    appConfig?.metadataInterval,
    appConfig?.sendMetadata,
    appConfig?.sendMetadataOnlyWhenVisible,
    appConfig?.environment,
  ]);

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
