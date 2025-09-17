# Hooklytics Integration Examples

This guide provides real-world examples for integrating **Hooklytics** with common React routing and application frameworks.

## Table of Contents

- [TanStack Router](#tanstack-router)
- [React Router DOM](#react-router-dom)
- [Next.js](#nextjs)
  - [App Router](#app-router)
  - [Pages Router](#pages-router)
- [Remix](#remix)
- [Other React SPA Frameworks](#other-react-spa-frameworks)

---

## TanStack Router

```tsx
// __root.tsx
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { AnalyticsProvider } from "hooklytics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const isDev = import.meta.env.DEV ?? true;
const queryClient = new QueryClient();

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <QueryClientProvider client={queryClient}>
            <AnalyticsProvider
              config={{
                environment: isDev ? "dev" : "prod",
                batchInterval: 1000,
              }}
            >
            <Outlet />
              {isDev && <TanStackRouterDevtools />}
              <Scripts />
            </AnalyticsProvider>
          </QueryClientProvider>
        </body>
      </html>
    );
  },
});
````

## React Router DOM

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnalyticsProvider } from "hooklytics";
import Home from "./pages/Home";
import About from "./pages/About";

function App() {
  return (
    <AnalyticsProvider config={{ environment: 'prod', batchInterval: 2000 }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </AnalyticsProvider>
  );
}
```

## Next.js

### App Router
-  (`app/` directory)

```tsx
// app/layout.tsx
import { AnalyticsProvider } from "hooklytics";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider config={{ environment: "prod", batchInterval: 3000 }}>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### Pages Router 
- (`pages/_app.tsx`)

```tsx
// pages/_app.tsx
import { AnalyticsProvider } from "hooklytics";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AnalyticsProvider config={{ environment: "prod" }}>
      <Component {...pageProps} />
    </AnalyticsProvider>
  );
}

export default MyApp;
```

## Remix

```tsx
// root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { AnalyticsProvider } from "hooklytics";

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AnalyticsProvider config={{ environment: "prod", batchInterval: 1000 }}>
          <Outlet />
        </AnalyticsProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

## Other React SPA Frameworks

### Vite + React

```tsx
// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AnalyticsProvider } from "hooklytics";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AnalyticsProvider config={{ environment: "dev" }}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AnalyticsProvider>
);
```

### CRA (Create React App)

```tsx
// index.tsx
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AnalyticsProvider } from "hooklytics";

ReactDOM.render(
  <AnalyticsProvider config={{ environment: "prod" }}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AnalyticsProvider>,
  document.getElementById("root")
);
```

---

## Tips

* Wrap your highest-level component tree with `AnalyticsProvider`.
* Use the `environment: 'dev'` setting during development for log visibility.
* Adjust `batchInterval` and `metadataInterval` for performance tuning.

---

For full hook usage examples, see [Hook Reference](./intro.md#hook-reference).