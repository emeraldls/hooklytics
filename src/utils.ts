import { Config, Event, Options } from './types';

export const getEnvMeta = (overrides: Record<string, any> = {}) => {
  const defaults = {
    language: navigator.language,
    page_title: document.title,
    pathname: window.location.pathname,
    querystring: window.location.search,
    referrer: document.referrer,
    screen_height: window.innerHeight,
    screen_width: window.innerWidth,
    user_agent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    url: window.location.href,
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
    debug: false,
    environment: 'prod',
    metadataInterval: 5000,
    defaultMetadata: getEnvMeta(overrides?.defaultMetadata),
  };

  return {
    ...defaults,
    ...overrides,
  };
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
  metadata = {},
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
    ...config?.defaultMetadata,
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
