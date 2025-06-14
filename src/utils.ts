import { Config, Event, Options } from './types';

const isBrowser = typeof window !== 'undefined';

export const getEnvMeta = (overrides: Record<string, any> = {}) => {
  const defaults = {
    language: isBrowser ? navigator.language : 'en-US',
    page_title: isBrowser ? document.title : '',
    pathname: isBrowser ? window.location.pathname : '',
    querystring: isBrowser ? window.location.search : '',
    referrer: isBrowser ? document.referrer : '',
    screen_height: isBrowser ? window.innerHeight : 0,
    screen_width: isBrowser ? window.innerWidth : 0,
    user_agent: isBrowser ? navigator.userAgent : '',
    timezone: isBrowser
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'UTC',
    url: isBrowser ? window.location.href : '',
    userId: '',
  };

  return {
    ...defaults,
    ...overrides,
  };
};

export const getConfig = (overrides?: Config): Config => {
  const defaults: Config = {
    batchInterval: 1000,
    sendMetadata: true,
    sendMetadataOnlyWhenVisible: false,
    debug: false,
    environment: 'prod',
    metadataInterval: 5000,
    defaultMetadata: getEnvMeta(),
  };

  const mergedConfig = {
    ...defaults,
    ...overrides,
  };

  if (overrides?.defaultMetadata) {
    mergedConfig.defaultMetadata = getEnvMeta(overrides.defaultMetadata);
  }

  return mergedConfig;
};

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

export const buildEvent = ({
  type,
  metadata,
  options,
  element,
  config,
}: {
  type: string;
  metadata?: Record<string, any>;
  options?: Options;
  element?: HTMLElement | null;
  config?: Config;
}): Event => {
  const eventData: Event = {
    type,
    timestamp: options?.customTimestamp || Date.now(),
    metadata: {
      ...metadata,
    },
    defaultMetadata: {
      ...config?.defaultMetadata,
    },
    element: {},
  };

  if (element) {
    eventData.element.elementRef = element;
    if (options?.includeElementPath) {
      eventData.element.elementPath = getElementPath(element);
    }
  }

  if (options?.elementId) {
    eventData.element.elementId = options?.elementId;
  }

  if (config?.debug) {
    console.debug('[Analytics Debug Event]', eventData);
  }

  return eventData;
};
