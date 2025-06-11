---
sidebar_position: 1
---
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

```bash
npm install hooklytics
```

Ensure your app is wrapped with the analytics context provider:

```jsx
import { AnalyticsProvider } from 'hooklytics';

function App() {
  return (
    <AnalyticsProvider>
      <YourApp />
    </AnalyticsProvider>
  );
}
```

## Core Concepts

### Event Structure

All tracked events follow this structure:

```typescript
interface Event {
  type: string;                    // Event type identifier
  metadata: Record<string, any>;   // Custom event data
  timestamp: number;               // Event timestamp
  elementRef?: HTMLElement;        // Reference to DOM element
  elementPath?: string;            // CSS selector path to element
  elementId?: string;              // Custom element identifier
  // ... environment metadata
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
  type: EventType,
  metadata: MetadataType,
  options?: {
    elementRef?: React.RefObject<ElementType>;
    elementId?: string;
    includeElementPath?: boolean;
  }
)
```

#### Parameters

- **type** (`string`): Unique identifier for the event type
- **metadata** (`Record<string, any>`): Custom data to include with the event
- **options** (`object`, optional):
  - `elementRef`: Reference to a DOM element to associate with the event
  - `elementId`: Custom identifier for the element
  - `includeElementPath`: Whether to generate and include the CSS selector path

#### Returns

- **track** (`function`): Function to trigger the event tracking

#### Examples

**Basic event tracking:**

```jsx
function NewsletterSignup() {
  const trackSignup = useTrackEvent('newsletter_signup', {
    source: 'homepage',
    campaign: 'spring_2024'
  });

  const handleSubmit = () => {
    trackSignup();
    // Handle form submission
  };

  return <button onClick={handleSubmit}>Subscribe</button>;
}
```

**Element reference tracking:**

```jsx
function ProductCard({ product }) {
  const buttonRef = useRef(null);
  const trackPurchase = useTrackEvent(
    'product_purchase_click',
    { productId: product.id, price: product.price },
    { 
      elementRef: buttonRef,
      includeElementPath: true,
      elementId: `product-${product.id}-buy-btn`
    }
  );

  return (
    <div>
      <h3>{product.name}</h3>
      <button ref={buttonRef} onClick={trackPurchase}>
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
  type: EventType,
  metadata: MetadataType,
  options?: {
    includeElementPath?: boolean;
    elementId?: string;
  }
)
```

#### Returns

- **elementRef** (`React.RefObject<ElementType>`): Ref to attach to your element
- **track** (`function`): Function to trigger the event tracking

#### Examples

**Simple button tracking:**

```jsx
function CallToAction() {
  const { elementRef, track } = useTrackElementEvent(
    'cta_click',
    { location: 'header', variant: 'primary' },
    { includeElementPath: true }
  );

  return (
    <button ref={elementRef} onClick={track} className="cta-button">
      Get Started Today
    </button>
  );
}
```

**Form field tracking:**

```jsx
function SearchBox() {
  const { elementRef, track } = useTrackElementEvent(
    'search_initiated',
    { feature: 'global_search' }
  );

  const handleSearch = (query) => {
    track();
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

- **threshold** (`number`, default: 0.5): Visibility threshold (0.0 to 1.0)
- **trackOnlyVisible** (`boolean`): Only track when element becomes visible
- **trackOnlyOnce** (`boolean`): Track only the first visibility event

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
  const trackAction = useTrackEvent(
    'user_action',
    { 
      userId, 
      userTier: isVip ? 'vip' : 'standard',
      timestamp: Date.now()
    }
  );

  const handleAction = () => {
    if (isVip) {
      trackAction();
    }
    // Perform action
  };

  return <button onClick={handleAction}>Action</button>;
}
```

### Multiple Event Types

```jsx
function MultiEventButton({ productId }) {
  const { elementRef, track: trackClick } = useTrackElementEvent(
    'product_interaction',
    { type: 'click', productId }
  );

  const { startTracking, endTracking } = useTrackDuration(
    'product_hover_duration',
    { productId }
  );

  return (
    <button
      ref={elementRef}
      onClick={trackClick}
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
  const trackStepView = useTrackEvent('checkout_step_viewed', { step });
  const trackStepComplete = useTrackEvent('checkout_step_completed', { step });

  useEffect(() => {
    trackStepView();
  }, [step]);

  const handleNext = () => {
    trackStepComplete();
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

const track = useTrackEvent('event', metadata);
```

### 4. Element Path Usage

Use `includeElementPath` strategically:

```jsx
// ✅ Useful for debugging and detailed analysis
const track = useTrackEvent('button_click', metadata, {
  includeElementPath: true // For A/B testing, debugging
});

// ✅ Skip for high-frequency events to reduce payload
const track = useTrackEvent('scroll_event', metadata, {
  includeElementPath: false // Skip for performance
});
```

### 5. Error Boundaries

Wrap analytics components to prevent tracking errors from breaking the app:

```jsx
function AnalyticsErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={<div>Analytics unavailable</div>}
      onError={(error) => console.warn('Analytics error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## TypeScript Support

The library provides full TypeScript support with generic type parameters:

```typescript
// Strongly typed event and metadata
const track = useTrackEvent<
  'user_registration', 
  { source: string; campaign?: string },
  HTMLButtonElement
>(
  'user_registration',
  { source: 'homepage', campaign: 'summer2024' },
  { includeElementPath: true }
);

// Custom event interfaces
interface PurchaseEvent {
  productId: string;
  price: number;
  currency: string;
  quantity: number;
}

const trackPurchase = useTrackEvent<'purchase', PurchaseEvent>(
  'purchase',
  {
    productId: 'prod_123',
    price: 29.99,
    currency: 'USD',
    quantity: 1
  }
);
```

### Type Definitions

```typescript
// Event type
interface Event {
  type: string;
  metadata: Record<string, any>;
  timestamp: number;
  elementRef?: HTMLElement;
  elementPath?: string;
  elementId?: string;
}

// Hook options
interface TrackingOptions<E extends HTMLElement = HTMLElement> {
  elementRef?: React.RefObject<E>;
  elementId?: string;
  includeElementPath?: boolean;
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

This documentation provides comprehensive coverage of all analytics hooks with practical examples and best practices. For additional support or feature requests, please refer to the project repository or contact the development team.