#  Hooklytics

**A complete analytics solution for React applications** - from lightweight tracking hooks to a full analytics platform with Go backend and management dashboard.

```
Alot of things still needs to be done, only the lib is usable at the moment.
```

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![Go](https://img.shields.io/badge/go-1.24.4-blue.svg)
![React](https://img.shields.io/badge/react-%3E%3D16-blue.svg)

---

## Architecture Overview

This monorepo contains four interconnected components that form a complete analytics ecosystem:

```
hooklytics/
├── 📦 lib/          # React hooks library (NPM package)
├── 🖥️ server/      # Go analytics backend API
├── 🌐 www/         # Management dashboard (TanStack Router)
└── 📚 docs/        # Documentation site (Docusaurus)
```

### Component Breakdown

| Component | Purpose | Technology Stack |
|-----------|---------|------------------|
| **lib** | Lightweight React hooks for tracking user interactions | TypeScript, React Hooks, Zero deps |
| **server** | High-performance event ingestion and analytics API | Go, ClickHouse, PostgreSQL, JWT Auth |
| **www** | Management dashboard for analytics projects | TanStack Router, React, Drizzle ORM |
| **docs** | Documentation and guides | Docusaurus, Markdown |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and pnpm
- **Go** 1.24.4+
- **PostgreSQL** (for user/website management)
- **ClickHouse** (for analytics data storage)

### 1. Clone the Repository

```bash
git clone https://github.com/emeraldls/hooklytics.git
cd hooklytics
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
cd www && pnpm install

# Install lib dependencies specifically
cd lib && npm install

# Install server dependencies
cd server && go mod tidy
```

### 3. Environment Setup

Create environment files:

```bash
# Server environment
cp server/.env.example server/.env
# Edit server/.env with your database credentials

# WWW environment  
cp www/.env.example www/.env
# Edit www/.env with your configuration
```

### 4. Database Setup

```bash
# Set up PostgreSQL tables (user/website management)
cd server
psql -d your_database -f schema/schema.sql

# ClickHouse setup for analytics events
# See server/README.md for ClickHouse schema
```

### 5. Start Development

```bash
# Terminal 1: Start the Go analytics server
cd server
go run main.go

# Terminal 2: Start the management dashboard
cd www
pnpm dev

# Terminal 3: Start documentation site (optional)
cd docs
pnpm start

# Terminal 4: Develop the hooks library (optional)
cd lib
npm run start
```

---

## 📦 Library Usage (Hooklytics)

The core React hooks library for tracking analytics events:

### Installation

```bash
npm install hooklytics
# or
yarn add hooklytics
```

### Basic Setup

```tsx
import { AnalyticsProvider } from 'hooklytics';

function App() {
  return (
    <AnalyticsProvider
      config={{
        environment: 'dev',       // or 'prod'
        batchInterval: 2000,      // send events every 2s
        metadataInterval: 30000,  // send env metadata every 30s
      }}
    >
      <YourApp />
    </AnalyticsProvider>
  );
}
```

### Track Events

```tsx
import { useTrackEvent, useTrackElementEvent } from 'hooklytics';

function MyComponent() {
  // Basic event tracking
  const track = useTrackEvent();
  
  // Element-specific tracking with ref
  const { elementRef, track: trackElement } = useTrackElementEvent({
    includeElementPath: true,
    elementId: "cta-button"
  });

  return (
    <div>
      <button 
        onClick={() => track({
          type: "button_clicked", 
          metadata: { location: "homepage" }
        })}
      >
        Basic Track
      </button>
      
      <button 
        ref={elementRef}
        onClick={() => trackElement({
          type: "cta_clicked", 
          metadata: { campaign: "summer2024" }
        })}
      >
        Advanced Track
      </button>
    </div>
  );
}
```

### Available Hooks

| Hook | Purpose | Use Case |
|------|---------|----------|
| `useTrackEvent` | Manual event tracking | Custom events, form submissions |
| `useTrackElementEvent` | Element-based tracking | Button clicks, link interactions |
| `useTrackClicks` | Automatic click tracking | Monitor all clicks on an element |
| `useTrackDuration` | Time-based tracking | Page/component viewing time |
| `useTrackVisibility` | Intersection observer tracking | Element visibility, scroll tracking |
| `useListenForData` | Event listener | Real-time event monitoring |

---

## 🖥️ Server API

High-performance Go backend for analytics event ingestion and management.

### Features

- **JWT Authentication** with refresh tokens
- **ClickHouse Integration** for high-volume analytics data
- **PostgreSQL** for user and website management
- **CORS-enabled** REST API
- **Event batching** and real-time processing

### Key Endpoints

```bash
# Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh

# Website Management
GET /api/websites
POST /api/websites
PUT /api/websites/:id
DELETE /api/websites/:id

# Analytics Events
POST /api/events/batch    # Batch event ingestion
GET /api/events/:website  # Query analytics data
```

### Event Schema

```go
type Event struct {
    UserId    string         `json:"user_id"`
    WebsiteId string         `json:"website_id"`
    HookType  string         `json:"hook_type"`
    EventType string         `json:"event_type"`
    DefaultMetadata map[string]any `json:"default_metadata"`
    CoreMetadata    map[string]any `json:"core_metadata"`
    ElementMetadata ElementMetadata `json:"element_metadata"`
    Timestamp       int64          `json:"timestamp"`
}
```

### Running the Server

```bash
cd server

# Development
go run main.go

# Production build
go build -o hooklytics-server
./hooklytics-server
```

---

## 🌐 Management Dashboard

React-based dashboard for managing analytics projects, viewing data, and configuring tracking.

### Features

- **Project Management** - Create and manage websites
- **Real-time Analytics** - View events as they happen
- **Data Visualization** - Charts and tables for analytics data
- **User Authentication** - Secure login and registration
- **Team Collaboration** - Multi-user support

### Technology Stack

- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching and caching
- **Drizzle ORM** - Database interactions
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives

### Development

```bash
cd www

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm start
```

---

## 📚 Documentation

Comprehensive documentation built with Docusaurus.

### Available Docs

- **Getting Started** - Installation and basic setup
- **API Reference** - Complete hooks documentation
- **Integration Guides** - Framework-specific examples
- **Best Practices** - Performance and privacy recommendations
- **Migration Guide** - Upgrading between versions

### Development

```bash
cd docs

# Install dependencies
pnpm install

# Start development server
pnpm start

# Build documentation
pnpm build
```

---

## 🏃‍♂️ Development Workflows

### Working on the Library

```bash
cd lib

# Watch mode for development
npm run start

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

### Working on the Server

```bash
cd server

# Development with auto-reload
go run main.go

# Run tests
go test ./...

# Build for production
go build -o bin/hooklytics-server
```

### Working on the Dashboard

```bash
cd www

# Development server
pnpm dev

# Type checking
pnpm build

# Database migrations
pnpm drizzle:migrate
```

### Working on Documentation

```bash
cd docs

# Development server
pnpm start

# Build static site
pnpm build

# Serve built site
pnpm serve
```

---

## 📁 Project Structure

```
hooklytics/
├── lib/                           # React hooks library
│   ├── src/
│   │   ├── analytics-provider.tsx # Context provider
│   │   ├── hooks.ts              # Core tracking hooks
│   │   ├── types.ts              # TypeScript definitions
│   │   ├── queue.ts              # Event queue management
│   │   └── utils.ts              # Helper functions
│   ├── example/                  # Usage examples
│   └── package.json
│
├── server/                       # Go analytics backend
│   ├── auth/                     # Authentication handlers
│   ├── config/                   # Configuration management
│   ├── repository/               # Data access layer
│   ├── rest/                     # REST API handlers
│   ├── schema/                   # Database schemas
│   ├── types/                    # Go type definitions
│   ├── main.go                   # Server entry point
│   ├── go.mod                    # Go dependencies
│   └── Dockerfile               # Container configuration
│
├── www/                          # Management dashboard
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── routes/               # TanStack Router routes
│   │   ├── schemas/              # Database schemas
│   │   ├── server-fn/           # Server functions
│   │   ├── stores/               # State management
│   │   └── utils/               # Utility functions
│   ├── drizzle/                 # Database migrations
│   ├── public/                  # Static assets
│   └── package.json
│
├── docs/                         # Documentation site
│   ├── docs/                     # Markdown documentation
│   ├── blog/                     # Blog posts
│   ├── src/                      # Custom components
│   ├── static/                   # Static assets
│   ├── docusaurus.config.ts     # Docusaurus configuration
│   └── package.json
│
├── docker-compose.yml            # Development environment
├── drizzle.sh                   # Database utilities
└── README.md                    # This file
```

---

## 🔧 Configuration

### Library Configuration

```tsx
<AnalyticsProvider
  config={{
    environment: 'prod',          // 'dev' | 'prod'
    batchInterval: 5000,          // Event batch interval (ms)
    metadataInterval: 30000,      // Metadata send interval (ms)
    debug: false,                 // Enable debug logging
    sendMetadata: true,           // Auto-send browser metadata
    sendMetadataOnlyWhenVisible: true, // Only when page visible
    defaultMetadata: {},          // Default metadata for all events
    staticMetadata: {},           // Static metadata (never changes)
  }}
>
```

### Server Configuration

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost/hooklytics
CLICKHOUSE_URL=http://localhost:8123

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server
PORT=5555
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Dashboard Configuration

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost/hooklytics

# Authentication
AUTH_SECRET=your-auth-secret
AUTH_TRUST_HOST=true

# API
API_URL=http://localhost:5555
```

---

## 🚀 Deployment

### Library (NPM Package)

```bash
cd lib

# Build and publish
npm run build
npm publish
```

### Server (Docker)

```bash
cd server

# Build Docker image
docker build -t hooklytics-server .

# Run with docker-compose
docker-compose up -d
```

### Dashboard (Static/Node.js)

```bash
cd www

# Build for production
pnpm build

# Deploy the .output directory to your hosting provider
```

### Documentation (Static)

```bash
cd docs

# Build static site
pnpm build

# Deploy the build directory to your hosting provider
```

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch** - `git checkout -b feature/amazing-feature`
3. **Make your changes** - Follow our coding standards
4. **Add tests** - Ensure your changes are tested
5. **Commit changes** - Use conventional commit messages
6. **Push to branch** - `git push origin feature/amazing-feature`
7. **Open a Pull Request** - Describe your changes

### Development Setup

```bash
# Install all dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start all services
pnpm dev
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Support

- **Documentation**: [https://hooklytics-docs.netlify.app](https://hooklytics-docs.netlify.app)
- **Issues**: [GitHub Issues](https://github.com/VingtAI/hooklytics/issues)
- **Discussions**: [GitHub Discussions](https://github.com/VingtAI/hooklytics/discussions)
- **Email**: support@hooklytics.com

---

## 🎯 Roadmap

- [ ] **Real-time Dashboard** - WebSocket integration for live events
- [ ] **Advanced Analytics** - Funnel analysis, cohort tracking
- [ ] **Mobile SDKs** - React Native, Flutter support
- [ ] **A/B Testing** - Built-in experimentation platform
- [ ] **Data Export** - CSV, JSON, API integrations
- [ ] **Custom Dashboards** - Drag-and-drop dashboard builder
- [ ] **Privacy Controls** - GDPR compliance tools
- [ ] **Enterprise Features** - SSO, advanced permissions

---

**Built with ❤️ by the Hooklytics [Mr Lawrence](https://x.com/@emeraldls)**
