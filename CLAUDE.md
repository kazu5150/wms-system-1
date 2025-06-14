# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WMS (Warehouse Management System) built with Supabase cloud and Next.js. The system provides inventory management, inbound/outbound order processing, and reporting capabilities. The project uses cloud Supabase for data persistence and real-time features.

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

### MCP Tools Available
- `inventory_check`: Check inventory levels
- `inventory_transfer`: Transfer inventory between locations
- `product_manage`: CRUD operations for products
- Additional tools for orders, locations, and reports (to be implemented)

### Database Schema
The system uses 12 main tables including warehouses, locations, products, inventory, orders, and movements. All tables use UUID primary keys and include audit timestamps.

### Environment Setup
- Copy `.env.example` to `.env`
- Update Supabase credentials from your cloud project
- Required variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Development Notes
- App runs on port 3001 (Next.js)
- Uses cloud Supabase for all data operations
- No authentication required for current version