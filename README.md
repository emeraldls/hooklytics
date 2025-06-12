# Hooklytics

**Lightweight React analytics hook library** for tracking user interactions like clicks, durations, visibility, and custom events with DOM element reference support and zero external dependencies.

---

## Features

- Simple React Hooks API
- Element-based tracking (ref, path, ID)
- Duration + visibility tracking
- No external scripts
- Works with all routing libraries (React Router, TanStack, Next.js, Remix)
- Fully typed (TypeScript)

---

## Installation

```bash
npm install hooklytics
# or
yarn add hooklytics
```

---

## Quick Start

### 1. Wrap your app with `<AnalyticsProvider />`

```tsx
import { AnalyticsProvider } from 'hooklytics';

<AnalyticsProvider
  config={{
    environment: 'dev',       // or 'prod'
    batchInterval: 2000,      // send events every 2s
    metadataInterval: 30000,  // send env metadata every 30s
  }}
>
  <App />
</AnalyticsProvider>
```

----

### 2. Track Events

#### Basic event

```tsx
const track = useTrackEvent("cta_clicked", { location: "homepage" });

<button onClick={track}>Click me</button>;
```

---

#### Element ref + path

```tsx
const buttonRef = useRef(null);
const track = useTrackEvent(
  "purchase_clicked",
  { productId: "123" },
  {
    elementRef: buttonRef,
    includeElementPath: true,
    elementId: "buy-btn-123"
  }
);

<button ref={buttonRef} onClick={track}>Buy</button>;
```

---

## 🧠 Other Hooks

| Hook                   | Purpose                        |
| ---------------------- | ------------------------------ |
| `useTrackEvent`        | Manual/custom event trigger    |
| `useTrackElementEvent` | Ref + tracking combo           |
| `useTrackClicks`       | Auto-track clicks via ref      |
| `useTrackDuration`     | Measure time spent in element  |
| `useTrackVisibility`   | Track if an element is in view |
| `useListenForData`     | Listen to tracked events       |

---

## 📘 Example

```tsx
const { elementRef, track } = useTrackElementEvent(
  "banner_clicked",
  { campaign: "summer2024" },
  { includeElementPath: true }
);

return <button ref={elementRef} onClick={track}>Shop Now</button>;
```
