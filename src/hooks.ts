import { useEffect, useRef, useCallback } from 'react';
import { enqueue } from './queue';
import { useAnalyticsContext } from './analytics-context';
import { Event } from './types';
import { getEnvMeta } from './utils';

// Utility to generate a unique selector path for an element
const getElementPath = (element: HTMLElement): string => {
  const path: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    }

    if (current.className) {
      selector += `.${current.className
        .trim()
        .split(/\s+/)
        .join('.')}`;
    }

    const siblings = Array.from(current.parentElement?.children || []);
    const sameTagSiblings = siblings.filter(
      s => s.tagName === current!.tagName
    );

    if (sameTagSiblings.length > 1) {
      const index = sameTagSiblings.indexOf(current) + 1;
      selector += `:nth-of-type(${index})`;
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
};

/**
 *  Original hook with element reference support
 * @param type
 * @param metadata
 * @param options
 * @returns
 */
export const useTrackEvent = <
  T extends string,
  D extends Record<string, any>,
  E extends HTMLElement = any
>(
  type: T,
  metadata: D,

  options: {
    elementRef?: React.RefObject<E>;
    elementId?: string;
    includeElementPath?: boolean;
  } = {}
) => {
  const track = useCallback(() => {
    const element = options.elementRef?.current;

    const eventData: Event = {
      type,
      metadata,
      timestamp: Date.now(),
      ...getEnvMeta(),
    };

    // Add element reference information
    if (element) {
      eventData.elementRef = element;
      if (options.includeElementPath) {
        eventData.elementPath = getElementPath(element);
      }
    }

    if (options.elementId) {
      eventData.elementId = options.elementId;
    }

    enqueue(eventData);
  }, [type, metadata, options]);

  return track;
};

/**
 * Hook that returns both a ref and track function for easy element tracking
 * @param type
 * @param metadata
 * @param options
 * @returns
 */
export const useTrackElementEvent = <
  T extends string,
  D extends Record<string, any>,
  E extends HTMLElement = any
>(
  type: T,
  metadata: D,
  options: {
    includeElementPath?: boolean;
    elementId?: string;
  } = {}
) => {
  const elementRef = useRef<E>(null);

  const track = useCallback(() => {
    const element = elementRef.current;

    const eventData: Event = {
      type,
      metadata,
      timestamp: Date.now(),
      ...getEnvMeta(),
    };

    if (element) {
      eventData.elementRef = element;
      if (options.includeElementPath) {
        eventData.elementPath = getElementPath(element);
      }
    }

    if (options.elementId) {
      eventData.elementId = options.elementId;
    }

    enqueue(eventData);
  }, [type, metadata, options]);

  return { elementRef, track };
};

// Manual duration tracking with explicit start/end control
export const useTrackDuration = <T extends string, E extends HTMLElement = any>(
  type: T,
  metadata: Record<string, any> = {},
  options: {
    elementRef?: React.RefObject<E>;
    elementId?: string;
    includeElementPath?: boolean;
  } = {}
) => {
  const startTimeRef = useRef<number | null>(null);
  const isTrackingRef = useRef(false);

  const startTracking = useCallback(() => {
    if (!isTrackingRef.current) {
      startTimeRef.current = Date.now();
      isTrackingRef.current = true;
    }
  }, []);

  const endTracking = useCallback(() => {
    if (isTrackingRef.current && startTimeRef.current) {
      const endTime = Date.now();
      const element = options.elementRef?.current;

      const eventData: Event = {
        type,
        metadata: {
          ...metadata,
          entered_at: startTimeRef.current,
          left_at: endTime,
          duration: endTime - startTimeRef.current,
        },
        timestamp: endTime,
        ...getEnvMeta(),
      };

      // Add element reference information
      if (element) {
        eventData.elementRef = element;
        if (options.includeElementPath) {
          eventData.elementPath = getElementPath(element);
        }
      }

      if (options.elementId) {
        eventData.elementId = options.elementId;
      }

      enqueue(eventData);

      // Reset tracking state
      startTimeRef.current = null;
      isTrackingRef.current = false;
    }
  }, [type, metadata, options]);

  return { startTracking, endTracking };
};

/**
 * Hook for automatic click tracking on an element
 * @param type
 * @param metadata
 * @param options
 * @returns
 */
export const useTrackClicks = <T extends string, E extends HTMLElement = any>(
  type: T,
  metadata: Record<string, any> = {},
  options: {
    includeElementPath?: boolean;
    elementId?: string;
  } = {}
) => {
  const elementRef = useRef<E>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleClick = (event: MouseEvent) => {
      const eventData: Event = {
        type,
        metadata: {
          ...metadata,
          clickX: event.clientX,
          clickY: event.clientY,
          button: event.button,
        },
        timestamp: Date.now(),
        elementRef: element,
        ...getEnvMeta(),
      };

      if (options.includeElementPath) {
        eventData.elementPath = getElementPath(element);
      }

      if (options.elementId) {
        eventData.elementId = options.elementId;
      }

      enqueue(eventData);
    };

    element.addEventListener('click', handleClick);
    return () => element.removeEventListener('click', handleClick);
  }, [type, metadata, options]);

  return elementRef;
};

/**
 * Hook for intersection observer tracking (visibility tracking)
 * @param type
 * @param metadata
 * @param options
 * @returns
 */
export const useTrackVisibility = <
  T extends string,
  E extends HTMLElement = any
>(
  type: T,
  metadata: Record<string, any> = {},
  options: {
    threshold?: number;
    elementId?: string;
    includeElementPath?: boolean;
    trackOnlyVisible?: boolean; // Only track when becoming visible
    trackOnlyOnce?: boolean; // Track only the first time it becomes visible
  } = {}
) => {
  const elementRef = useRef<E>(null);
  const hasTrackedOnce = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // Skip if we only want to track visible events and this isn't visible
          if (options.trackOnlyVisible && !entry.isIntersecting) {
            return;
          }

          // Skip if we only want to track once and we already have
          if (options.trackOnlyOnce && hasTrackedOnce.current) {
            return;
          }

          // Mark as tracked if this is a visibility event
          if (entry.isIntersecting) {
            hasTrackedOnce.current = true;
          }

          const eventData: Event = {
            type,
            metadata: {
              ...metadata,
              isVisible: entry.isIntersecting,
              intersectionRatio: entry.intersectionRatio,
              boundingClientRect: entry.boundingClientRect,
              viewportHeight: window.innerHeight,
              viewportWidth: window.innerWidth,
            },
            timestamp: Date.now(),
            elementRef: element,
            ...getEnvMeta(),
          };

          if (options.includeElementPath) {
            eventData.elementPath = getElementPath(element);
          }

          if (options.elementId) {
            eventData.elementId = options.elementId;
          }

          enqueue(eventData);
        });
      },
      { threshold: options.threshold || 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [type, metadata, options]);

  return elementRef;
};

/**
 * Hook for getting events
 * @param callback
 */
export const useListenForData = (callback: (events: Event[]) => void) => {
  const { setListener } = useAnalyticsContext();

  useEffect(() => {
    setListener(callback);
  }, [callback]);
};
