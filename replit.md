# DigitalCart - Digital Product Sales Platform

## Overview

DigitalCart is a conversion-optimized digital product sales platform designed for creators to sell ebooks and digital products. The platform provides customizable checkout pages, order management, customer analytics, and email automation. Built with a modern full-stack architecture, it emphasizes clean design, professional credibility, and conversion-first principles inspired by SamCart's approach to e-commerce.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type-safe component development
- Vite for fast development builds and HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management with optimistic updates

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system built on Radix with Tailwind CSS
- Class Variance Authority (CVA) for component variant management
- Custom theming system supporting light/dark modes with CSS variables

**Design Philosophy:**
- Conversion-first approach prioritizing trust and reduced friction
- Typography: Inter/DM Sans for primary text, Space Grotesk for accents
- Spacing system based on Tailwind's 4px base unit (2, 4, 6, 8, 12, 16, 20, 24, 32)
- Responsive grid layouts: single-column checkout, 3-4 column dashboards
- Visual editor with 40/60 split view for live preview

**Form Handling:**
- React Hook Form with Zod schema validation
- @hookform/resolvers for seamless integration
- Client-side validation with server-side verification

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for API routes
- HTTP server using Node's native `createServer`
- RESTful API design with `/api/*` namespacing
- Demo user mode for development (demo@example.com)

**Database Layer:**
- Drizzle ORM with PostgreSQL dialect for type-safe database queries
- Schema-first design with Zod validation integration (drizzle-zod)
- Migration system via drizzle-kit
- Connection pooling with node-postgres (pg)

**Database Schema Design:**
- Users: Store owners with business settings, payment credentials, branding
- Products: Digital goods with pricing, files, download limits, activation status
- Checkout Pages: Customizable templates with JSON block-based content system
- Order Bumps & Upsells: Conversion optimization features
- Coupons: Discount codes with usage limits and expiration
- Customers: Buyer information with order history tracking
- Orders & Order Items: Transaction records with line items
- Abandoned Carts: Recovery tracking for incomplete purchases
- Email Templates: Customizable transactional emails
- Pixel Events: Analytics and conversion tracking (Facebook Pixel)

**Session & Authentication:**
- Express-session for stateful sessions
- Session storage options: connect-pg-simple (PostgreSQL) or memorystore (in-memory)
- Demo mode bypasses authentication for development

**API Design Patterns:**
- Resource-based endpoints (GET /api/products, POST /api/orders)
- Consistent error handling with try-catch blocks
- JSON request/response format
- Query invalidation via TanStack Query for cache management

### Data Storage Solutions

**Primary Database:**
- PostgreSQL for relational data storage
- UUID primary keys (gen_random_uuid())
- JSONB columns for flexible schema (blocks, customStyles, pixelData)
- Decimal type for currency (precision: 10, scale: 2)
- Timestamp tracking for created_at/updated_at fields

**Alternative Storage (Firebase):**
- Firebase Admin SDK integration for Firestore support
- IStorage interface abstraction for database-agnostic operations
- Serialization layer for Date/Timestamp conversions
- Fallback storage option configured via environment variables

**File Storage:**
- Product images and digital files via URL references
- File metadata tracking (fileName, fileSize)
- Download limit enforcement per product

### External Dependencies

**Payment Processing:**
- UddoktaPay integration (Bangladesh-focused payment gateway)
- API credentials stored per user (uddoktapayApiKey, uddoktapayApiUrl)
- Support for test mode and multiple currencies (default: BDT)

**Email Services:**
- SendGrid integration for transactional emails
- Template system for order confirmations, delivery, abandoned cart recovery
- Variable substitution for personalization

**Analytics & Tracking:**
- Facebook Pixel integration for conversion tracking
- Pixel event storage with JSON metadata
- Custom event tracking support
- Access token management for Facebook Conversions API

**Design System:**
- Google Fonts: Inter, DM Sans, Space Grotesk, Fira Code, Geist Mono
- Tailwind CSS v3+ for utility-first styling
- PostCSS with Autoprefixer for cross-browser compatibility

**Charting & Visualization:**
- Recharts for revenue analytics, product performance, order trends
- Responsive chart containers for dashboard widgets
- Support for area charts, bar charts, pie charts, and line charts

**Development Tools:**
- Replit-specific plugins: cartographer, dev-banner, runtime-error-modal
- ESBuild for production bundling with dependency allowlisting
- TypeScript strict mode with path aliases (@/, @shared/, @assets/)

**Build & Deployment:**
- Production builds combine Vite (client) + ESBuild (server)
- Single output directory (dist/) with public/ subfolder for static assets
- Server bundling with selective external dependencies to reduce cold start times
- Allowlisted dependencies for bundling include: drizzle-orm, express, passport, stripe, axios, openai