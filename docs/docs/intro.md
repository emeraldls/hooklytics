# Analytics Hooks Documentation

A comprehensive React hook library for tracking user interactions and analytics events with element reference support.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Core Concepts](#core-concepts)
- [Hook Reference](#hook-reference)
  - [useTrackEvent](#usetrackevent)
  - [useTrackElementEvent](#usetrackelementevent)
  - [useTrackDuration](#usetrackduration)
  - [useTrackClicks](#usetrackclicks)
  - [useTrackVisibility](#usetrackvisibility)
  - [useListenForData](#uselistenfordata)
- [Common Patterns](#common-patterns)
- [Best Practices](#best-practices)
- [TypeScript Support](#typescript-support)

## Installation & Setup

Install the package:

```bash
npm install hooklytics
````

Wrap your application with the `AnalyticsProvider`:

```tsx
import { AnalyticsProvider } from 'hooklytics';

function App() {
  return (
    <AnalyticsProvider
      config={{
        environment: 'dev',                    // Optional: 'dev' | 'prod'
        batchInterval: 1000,                   // Optional: how often to batch events (ms)
        metadataInterval: 5000,                // Optional: how often to send metadata heartbeat (ms)
        sendMetadata: true,                    // Optional: whether to send metadata heartbeats
        sendMetadataOnlyWhenVisible: false,    // Optional: only send metadata when page is visible
        debug: false,                          // Optional: enable debug logging
      }}
    >
      <YourApp />
    </AnalyticsProvider>
  );
}
```

### `config` Options

The `AnalyticsProvider` accepts an optional `config` object:

| Option                         | Type                    | Default | Description                                           |
| ------------------------------ | ----------------------- | ------- | ----------------------------------------------------- |
| `environment`                  | `'dev' \| 'prod'`       | `prod`  | Enables dev logs when set to `'dev'`                 |
| `batchInterval`                | `number`                | `1000`  | Interval (in ms) to batch and send events            |
| `metadataInterval`             | `number`                | `5000`  | Interval (in ms) to send core environment data       |
| `sendMetadata`                 | `boolean`               | `true`  | Whether to automatically send metadata heartbeats    |
| `staticMetadata`               | `Record<string, any>`   | `{}`    | Static metadata overrides that don't change (e.g., userId, app version)|
| `sendMetadataOnlyWhenVisible`  | `boolean`               | `false` | Only send metadata when page is visible              |
| `defaultMetadata`              | `Record<string, any>`   | `{}`    | Additional default metadata to include with events   |
| `debug`                        | `boolean`               | `false` | Enable debug logging for events                      |

---

## Core Concepts

### Event Structure

All tracked events follow this structure:

```tsx
interface Event {
  type: string;                              // Event type identifier
  metadata: Record<string, any>;             // Custom event data
  defaultMetadata: Record<string, any>;      // Automatic environment data
  timestamp: number;                         // Event timestamp
  element: {                                 // Element information
    elementRef?: HTMLElement;                // Reference to DOM element
    elementPath?: string;                    // CSS selector path to element
    elementId?: string;                      // Custom element identifier
  };
}
```

### Default Metadata

The library automatically includes environment metadata with every event:

```tsx
interface DefaultMetadata {
  language: string;        // Browser language
  page_title: string;      // Current page title
  pathname: string;        // Current pathname
  querystring: string;     // Current query string
  referrer: string;        // Document referrer
  screen_height: number;   // Viewport height
  screen_width: number;    // Viewport width
  user_agent: string;      // Browser user agent
  timezone: string;        // User's timezone
  url: string;            // Current full URL
}
```

### Element Path Generation

The library automatically generates CSS selector paths for tracked elements, creating paths like:
- `div.container > button#submit-btn`
- `section.hero > div.content:nth-of-type(2) > p`

## Hook Reference

### useTrackEvent

The foundational hook for tracking custom events with optional element reference support.

#### Signature

```typescript
const track = useTrackEvent<EventType, MetadataType, ElementType>(
  options?: {
    elementRef?: React.RefObject<ElementType>;
    elementId?: string;
    includeElementPath?: boolean;
  }
)
```

#### Parameters

- **options** (`object`, optional):
  - `elementRef`: Reference to a DOM element to associate with the event
  - `elementId`: Custom identifier for the element
  - `includeElementPath`: Whether to generate and include the CSS selector path

#### Returns

- **track** (`function`): Function that accepts `(type: string, metadata: Record<string, any>)` to trigger event tracking

#### Examples

**Basic event tracking:**

```jsx
function NewsletterSignup() {
  const track = useTrackEvent();

  const handleSubmit = () => {
    track('newsletter_signup', {
      source: 'homepage',
      campaign: 'spring_2024'
    });
    // Handle form submission
  };

  return <button onClick={handleSubmit}>Subscribe</button>;
}
```

**Element reference tracking:**

```jsx
function ProductCard({ product }) {
  const buttonRef = useRef(null);
  const track = useTrackEvent({ 
    elementRef: buttonRef,
    includeElementPath: true,
    elementId: `product-${product.id}-buy-btn`
  });

  const handlePurchase = () => {
    track('product_purchase_click', {
      productId: product.id, 
      price: product.price
    });
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <button ref={buttonRef} onClick={handlePurchase}>
        Buy Now - ${product.price}
      </button>
    </div>
  );
}
```

### useTrackElementEvent

A convenience hook that provides both an element ref and tracking function, eliminating the need to create separate refs.

#### Signature

```typescript
const { elementRef, track } = useTrackElementEvent<EventType, MetadataType, ElementType>(
  options?: {
    includeElementPath?: boolean;
    elementId?: string;
  }
)
```

#### Parameters

- **options** (`object`, optional):
  - `includeElementPath`: Whether to generate and include the CSS selector path
  - `elementId`: Custom identifier for the element

#### Returns

- **elementRef** (`React.RefObject<ElementType>`): Ref to attach to your element
- **track** (`function`): Function that accepts `(type: string, metadata: Record<string, any>)` to trigger event tracking

#### Examples

**Simple button tracking:**

```jsx
function CallToAction() {
  const { elementRef, track } = useTrackElementEvent({
    includeElementPath: true
  });

  const handleClick = () => {
    track('cta_click', {
      location: 'header', 
      variant: 'primary'
    });
  };

  return (
    <button ref={elementRef} onClick={handleClick} className="cta-button">
      Get Started Today
    </button>
  );
}
```

**Form field tracking:**

```jsx
function SearchBox() {
  const { elementRef, track } = useTrackElementEvent();

  const handleSearch = (query) => {
    track('search_initiated', {
      feature: 'global_search',
      query: query
    });
    // Perform search
  };

  return (
    <input
      ref={elementRef}
      placeholder="Search products..."
      onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
    />
  );
}
```

### useTrackDuration

Tracks time-based events with explicit start and end controls, perfect for measuring engagement duration.

#### Signature

```typescript
const { startTracking, endTracking } = useTrackDuration<EventType, ElementType>(
  type: EventType,
  metadata?: Record<string, any>,
  options?: {
    elementRef?: React.RefObject<ElementType>;
    elementId?: string;
    includeElementPath?: boolean;
  }
)
```

#### Parameters

- **type** (`string`): Event type identifier
- **metadata** (`Record<string, any>`, optional): Base metadata to include
- **options** (`object`, optional):
  - `elementRef`: Reference to a DOM element to associate with the event
  - `elementId`: Custom identifier for the element
  - `includeElementPath`: Whether to generate and include the CSS selector path

#### Returns

- **startTracking** (`function`): Start the duration timer
- **endTracking** (`function`): End the timer and send the event

#### Event Data

The tracked event includes:
- `entered_at`: Start timestamp
- `left_at`: End timestamp  
- `duration`: Time difference in milliseconds

#### Examples

**Video player engagement:**

```jsx
function VideoPlayer({ videoId }) {
  const videoRef = useRef(null);
  const { startTracking, endTracking } = useTrackDuration(
    'video_engagement',
    { videoId, player: 'custom' },
    { elementRef: videoRef, includeElementPath: true }
  );

  return (
    <video
      ref={videoRef}
      onPlay={startTracking}
      onPause={endTracking}
      onEnded={endTracking}
    >
      <source src={`/videos/${videoId}.mp4`} />
    </video>
  );
}
```

**Modal interaction tracking:**

```jsx
function ProductModal({ product, isOpen, onClose }) {
  const { startTracking, endTracking } = useTrackDuration(
    'product_modal_view',
    { productId: product.id, category: product.category }
  );

  useEffect(() => {
    if (isOpen) {
      startTracking();
    } else {
      endTracking();
    }
  }, [isOpen]);

  // Modal JSX...
}
```

**Reading time tracking:**

```jsx
function Article({ articleId }) {
  const { startTracking, endTracking } = useTrackDuration(
    'article_reading_time',
    { articleId, category: 'blog' }
  );

  useEffect(() => {
    startTracking();
    return () => endTracking(); // Track when component unmounts
  }, []);

  // Article content...
}
```

### useTrackClicks

Automatically tracks click events on an element with detailed click information.

#### Signature

```typescript
const elementRef = useTrackClicks<EventType, ElementType>(
  type: EventType,
  metadata?: Record<string, any>,
  options?: {
    includeElementPath?: boolean;
    elementId?: string;
  }
)
```

#### Parameters

- **type** (`string`): Event type identifier
- **metadata** (`Record<string, any>`, optional): Base metadata to include
- **options** (`object`, optional):
  - `includeElementPath`: Whether to generate and include the CSS selector path
  - `elementId`: Custom identifier for the element

#### Returns

- **elementRef** (`React.RefObject<ElementType>`): Ref to attach to the clickable element

#### Event Data

Automatically includes:
- `clickX`, `clickY`: Click coordinates
- `button`: Mouse button used (0=left, 1=middle, 2=right)

#### Examples

**Navigation link tracking:**

```jsx
function NavigationMenu() {
  const homeRef = useTrackClicks('nav_click', { 
    item: 'home', 
    section: 'main_nav' 
  });
  
  const aboutRef = useTrackClicks('nav_click', { 
    item: 'about', 
    section: 'main_nav' 
  });

  return (
    <nav>
      <a ref={homeRef} href="/">Home</a>
      <a ref={aboutRef} href="/about">About</a>
    </nav>
  );
}
```

**Interactive element tracking:**

```jsx
function ImageGallery({ images }) {
  return (
    <div className="gallery">
      {images.map((image, index) => {
        const imageRef = useTrackClicks(
          'gallery_image_click',
          { imageId: image.id, position: index },
          { includeElementPath: true }
        );
        
        return (
          <img
            key={image.id}
            ref={imageRef}
            src={image.src}
            alt={image.alt}
          />
        );
      })}
    </div>
  );
}
```

### useTrackVisibility

Tracks element visibility using Intersection Observer API, perfect for measuring content engagement and scroll-based analytics.

#### Signature

```typescript
const elementRef = useTrackVisibility<EventType, ElementType>(
  type: EventType,
  metadata?: Record<string, any>,
  options?: {
    threshold?: number;
    elementId?: string;
    includeElementPath?: boolean;
    trackOnlyVisible?: boolean;
    trackOnlyOnce?: boolean;
  }
)
```

#### Parameters

- **type** (`string`): Event type identifier
- **metadata** (`Record<string, any>`, optional): Base metadata to include
- **options** (`object`, optional):
  - `threshold` (`number`, default: 0.5): Visibility threshold (0.0 to 1.0)
  - `elementId`: Custom identifier for the element
  - `includeElementPath`: Whether to generate and include the CSS selector path
  - `trackOnlyVisible` (`boolean`): Only track when element becomes visible
  - `trackOnlyOnce` (`boolean`): Track only the first visibility event

#### Returns

- **elementRef** (`React.RefObject<ElementType>`): Ref to attach to the element to track

#### Event Data

Automatically includes:
- `isVisible`: Whether element is currently visible
- `intersectionRatio`: How much of the element is visible (0.0 to 1.0)
- `boundingClientRect`: Element's position and size
- `viewportHeight`, `viewportWidth`: Current viewport dimensions

#### Examples

**Content engagement tracking:**

```jsx
function BlogPost({ postId }) {
  const contentRef = useTrackVisibility(
    'content_viewed',
    { postId, type: 'blog_post' },
    { 
      threshold: 0.7,
      trackOnlyVisible: true,
      trackOnlyOnce: true 
    }
  );

  return (
    <article ref={contentRef}>
      <h1>Blog Post Title</h1>
      <div className="content">
        {/* Post content */}
      </div>
    </article>
  );
}
```

**Advertisement viewability:**

```jsx
function AdBanner({ adId, campaign }) {
  const adRef = useTrackVisibility(
    'ad_impression',
    { adId, campaign, placement: 'sidebar' },
    { 
      threshold: 0.5,
      trackOnlyVisible: true,
      includeElementPath: true
    }
  );

  return (
    <div ref={adRef} className="ad-banner">
      {/* Ad content */}
    </div>
  );
}
```

**Scroll milestone tracking:**

```jsx
function LandingPage() {
  const heroRef = useTrackVisibility('section_viewed', { section: 'hero' });
  const featuresRef = useTrackVisibility('section_viewed', { section: 'features' });
  const pricingRef = useTrackVisibility('section_viewed', { section: 'pricing' });

  return (
    <div>
      <section ref={heroRef} className="hero">Hero Content</section>
      <section ref={featuresRef} className="features">Features</section>
      <section ref={pricingRef} className="pricing">Pricing</section>
    </div>
  );
}
```

### useListenForData

Sets up a listener to receive and process analytics events, useful for debugging or custom analytics processing.

#### Signature

```typescript
useListenForData(callback: (events: Event[]) => void)
```

#### Parameters

- **callback** (`function`): Function called with array of events

#### Examples

**Debug logging:**

```jsx
function AnalyticsDebugger() {
  useListenForData((events) => {
    console.group('Analytics Events');
    events.forEach(event => {
      console.log(`${event.type}:`, event);
    });
    console.groupEnd();
  });

  return <div>Analytics debugging active</div>;
}
```

**Custom analytics processing:**

```jsx
function CustomAnalytics() {
  useListenForData((events) => {
    events.forEach(event => {
      // Send to custom analytics service
      if (event.type.startsWith('purchase_')) {
        sendToEcommercePlatform(event);
      }
      
      // Real-time notifications
      if (event.type === 'error_occurred') {
        notifyErrorService(event);
      }
    });
  });

  return null;
}
```

## Common Patterns

### Conditional Tracking

```jsx
function ConditionalTracking({ isVip, userId }) {
  const track = useTrackEvent();

  const handleAction = () => {
    if (isVip) {
      track('user_action', {
        userId, 
        userTier: 'vip',
        timestamp: Date.now()
      });
    }
    // Perform action
  };

  return <button onClick={handleAction}>Action</button>;
}
```

### Multiple Event Types

```jsx
function MultiEventButton({ productId }) {
  const { elementRef, track } = useTrackElementEvent();

  const { startTracking, endTracking } = useTrackDuration(
    'product_hover_duration',
    { productId }
  );

  const handleClick = () => {
    track('product_interaction', {
      type: 'click', 
      productId
    });
  };

  return (
    <button
      ref={elementRef}
      onClick={handleClick}
      onMouseEnter={startTracking}
      onMouseLeave={endTracking}
    >
      View Product
    </button>
  );
}
```

### Event Chaining

```jsx
function CheckoutFlow({ step }) {
  const track = useTrackEvent();

  useEffect(() => {
    track('checkout_step_viewed', { step });
  }, [step]);

  const handleNext = () => {
    track('checkout_step_completed', { step });
    // Proceed to next step
  };

  return (
    <div>
      <h2>Step {step}</h2>
      <button onClick={handleNext}>Continue</button>
    </div>
  );
}
```

### Using Default Metadata

```jsx
function App() {
  return (
    <AnalyticsProvider
      config={{
        userId: 'user123',
        sessionId: 'session456',
        defaultMetadata: {
          appVersion: '1.2.0',
          experiment: 'checkout_flow_v2'
        }
      }}
    >
      <YourApp />
    </AnalyticsProvider>
  );
}

// All events will automatically include:
// - userId: 'user123'
// - sessionId: 'session456' 
// - appVersion: '1.2.0'
// - experiment: 'checkout_flow_v2'
// Plus all the standard environment metadata
```

## Best Practices

### 1. Event Naming Convention

Use consistent, descriptive event names:

```jsx
// ✅ Good
'user_registration_completed'
'product_purchase_initiated'
'video_playback_started'

// ❌ Avoid
'click'
'event1'
'user_thing'
```

### 2. Metadata Structure

Keep metadata consistent and meaningful:

```jsx
// ✅ Good
const metadata = {
  userId: user.id,
  productId: product.id,
  category: product.category,
  price: product.price,
  currency: 'USD'
};

// ❌ Avoid
const metadata = {
  id: 'something',
  data: 'misc info',
  value: 42
};
```

### 3. Performance Considerations

```jsx
// ✅ Memoize expensive metadata calculations
const metadata = useMemo(() => ({
  complexCalculation: expensiveFunction(data),
  timestamp: Date.now()
}), [data]);

const track = useTrackEvent();

const handleEvent = () => {
  track('event', metadata);
};
```

### 4. Element Path Usage

Use `includeElementPath` strategically:

```jsx
// ✅ Useful for debugging and detailed analysis
const { elementRef, track } = useTrackElementEvent({
  includeElementPath: true // For A/B testing, debugging
});

// ✅ Skip for high-frequency events to reduce payload
const scrollRef = useTrackVisibility('scroll_event', metadata, {
  includeElementPath: false // Skip for performance
});
```

### 5. Debug Mode

Enable debug mode during development:

```jsx
// Development
<AnalyticsProvider config={{ debug: true, environment: 'dev' }}>
  <App />
</AnalyticsProvider>

// Production
<AnalyticsProvider config={{ debug: false, environment: 'prod' }}>
  <App />
</AnalyticsProvider>
```

## TypeScript Support

The library provides full TypeScript support with generic type parameters:

```typescript
// Strongly typed event and metadata
const track = useTrackEvent<HTMLButtonElement>({
  includeElementPath: true
});

// Usage with type safety
track('user_registration', {
  source: 'homepage',
  campaign: 'summer2024'
});

// Custom interfaces
interface PurchaseMetadata {
  productId: string;
  price: number;
  currency: string;
  quantity: number;
}

const { elementRef, track } = useTrackElementEvent<HTMLButtonElement>();

const handlePurchase = () => {
  track('purchase', {
    productId: 'prod_123',
    price: 29.99,
    currency: 'USD',
    quantity: 1
  } as PurchaseMetadata);
};
```

### Type Definitions

```typescript
// Event type
interface Event {
  type: string;
  metadata: Record<string, any>;
  defaultMetadata: Record<string, any>;
  timestamp: number;
  element: {
    elementRef?: HTMLElement;
    elementPath?: string;
    elementId?: string;
  };
}

// Config type
interface Config {
  batchInterval?: number;
  environment?: 'prod' | 'dev';
  metadataInterval?: number;
  defaultMetadata?: Record<string, any>;
  staticMetadata?: Record<string, any>;
  sendMetadata?: boolean;
  userId?: any;
  debug?: boolean;
  sessionId?: any;
  sendMetadataOnlyWhenVisible?: boolean;
}

interface VisibilityOptions {
  threshold?: number;
  elementId?: string;
  includeElementPath?: boolean;
  trackOnlyVisible?: boolean;
  trackOnlyOnce?: boolean;
}
```

---

This documentation provides comprehensive coverage of all analytics hooks with practical examples and best practices. The library now supports more flexible event tracking with the updated API that separates tracking configuration from event data, making it easier to reuse tracking functions across different events.