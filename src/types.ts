export type Config = {
  batchInterval?: number;
  environment?: 'prod' | 'dev';
  metadataInterval?: number;
};

export type Event = {
  type: string;
  metadata: Record<string, any>;
  timestamp: number;
  elementRef?: HTMLElement;
  elementId?: string;
  elementSelector?: string;
  /**
   * Hierachy of element for debugging
   */
  elementPath?: string;
};
export type FastQueue = {
  items: Event[];
  head: number;
};

export type Listener = (events: Event[]) => void;
