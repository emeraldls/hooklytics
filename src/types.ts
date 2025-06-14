export type Config = {
  batchInterval?: number;
  environment?: 'prod' | 'dev';
  metadataInterval?: number;
  defaultMetadata?: Record<string, any>;
  sendMetadata?: boolean;
  debug?: boolean;
  sendMetadataOnlyWhenVisible?: boolean;
};

export type Options = {
  includeElementPath?: boolean;
  elementId?: string;
  customTimestamp?: number;
};

export type EventElement = {
  elementRef?: HTMLElement;
  elementId?: string;
  elementSelector?: string;
  elementPath?: string;
};

export type Event = {
  type: string;
  metadata: Record<string, any>;
  defaultMetadata: Record<string, any>;
  timestamp: number;
  element: EventElement;
};
export type FastQueue = {
  items: Event[];
  head: number;
};

export type DefaultMetadata = {
  language: string;
  page_title: string;
  pathname: string;
  querystring: string;
  referrer: string;
  screen_height: number;
  screen_width: number;
  user_agent: string;
  timezone: string;
  url: string;
};

export type Listener = (events: Event[]) => void;
