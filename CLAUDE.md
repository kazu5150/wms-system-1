# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WMS (Warehouse Management System) built with Supabase cloud and Next.js. The system provides comprehensive inventory management, warehouse operations, location management, product management with image support, and reporting capabilities with charts. The project uses cloud Supabase for data persistence and real-time features.

## Development Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev         # Run all services (MCP server + Next.js)
pnpm dev:mcp     # Run MCP server only
pnpm dev:web     # Run Next.js frontend only

# Build
pnpm build       # Build all packages

# Linting
pnpm lint        # Lint all packages

# Database
# Project uses cloud Supabase - no local setup required
```

## Architecture

### Project Structure
```
supabase-mcp/
├── packages/
│   ├── mcp-server/      # WMS MCP Server
│   │   └── src/
│   │       ├── tools/   # MCP tool implementations
│   │       ├── db/      # Supabase client
│   │       └── index.ts # Server entry point
│   └── web/            # Next.js Frontend
│       ├── app/        # App Router pages
│       ├── components/ # React components
│       └── lib/       # Utilities
└── supabase/
    └── migrations/     # Database schema

```

### Key Technologies
- **Backend**: Supabase Cloud (PostgreSQL), MCP Server (TypeScript)
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Database**: Cloud Supabase with real-time subscriptions
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Custom components including ImageUpload, ImageLightbox for product image management

### MCP Tools Available
- `inventory_check`: Check inventory levels
- `inventory_transfer`: Transfer inventory between locations
- `product_manage`: CRUD operations for products
- Additional tools for orders, locations, and reports (to be implemented)

### Database Schema
The system uses 12 main tables including warehouses, locations, products, inventory, orders, and movements. All tables use UUID primary keys and include audit timestamps.

**Products Table**: Includes image support with `main_image_url`, `additional_image_1_url`, `additional_image_2_url`, `additional_image_3_url` columns for comprehensive product image management.

### Environment Setup
- Copy `.env.example` to `.env`
- Update Supabase credentials from your cloud project
- Required variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Development Notes
- App runs on port 3000 (Next.js)
- Uses cloud Supabase for all data operations  
- No authentication required for current version

## Features Implemented

### Dashboard & Navigation
- Responsive dashboard layout with collapsible sidebar
- Chevron toggle buttons for sidebar collapse/expand
- Mobile-friendly navigation

### Product Management
- Complete CRUD operations for products
- **Product Image Management**: 
  - Support for 1 main image + 3 additional images per product
  - Drag & drop image upload with base64 conversion
  - Image preview and management in product forms
  - Click-to-expand lightbox with zoom, navigation, and thumbnails
  - Optimized display for portrait and landscape orientations
- Product list with search and filtering
- Image thumbnails in product tables with click-to-expand

### Inventory Management  
- Real-time inventory tracking
- Stock status indicators (normal, low stock, overstocked, out of stock)
- Inventory search and filtering
- **Product images displayed** in inventory lists with lightbox support

### Location Management
- Hierarchical location structure (Zone > Aisle > Rack > Level > Bin)
- Location capacity management
- Location search and filtering

### Warehouse Management
- Warehouse CRUD operations
- Address and contact information management

### Reports & Analytics
- Interactive charts using Chart.js/React-chartjs-2
- Inventory level charts
- Stock movement analytics
- Responsive chart layouts

### UI/UX Features
- **Custom ImageUpload Component**: Drag & drop, preview, remove functionality
- **Custom ImageLightbox Component**: Full-screen image viewing with:
  - Zoom in/out controls
  - Navigation between multiple images  
  - Thumbnail strip for quick navigation
  - Keyboard shortcuts (ESC, arrows, +/- for zoom)
  - Click-to-close functionality
- Consistent styling with Tailwind CSS and shadcn/ui
- Loading states and error handling
- Mobile-responsive design