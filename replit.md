# POS Prompt - Internal Promotion Interface

## Overview
A full-stack web application for managing internal promotions. Built with React frontend and Express backend, using PostgreSQL for data persistence.

## Project Architecture

### Tech Stack
- **Frontend**: React 19 with Vite, TypeScript, Tailwind CSS 4, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with Radix UI primitives

### Project Structure
```
├── client/                 # React frontend
│   └── src/
│       ├── components/     # React components (UI primitives in /ui)
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utility functions
│       └── pages/          # Page components
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage layer
│   ├── static.ts          # Static file serving (production)
│   └── vite.ts            # Vite dev server integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle database schema
└── attached_assets/        # Static assets
```

### Key Scripts
- `npm run dev` - Start development server (frontend + backend on port 5000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes

### Database
Uses PostgreSQL with Drizzle ORM. Schema defined in `shared/schema.ts`.

Current tables:
- `users` - User accounts with id, username, password

### Development Notes
- Frontend served via Vite in development, static files in production
- Backend and frontend both run on port 5000
- Vite configured to allow all hosts for Replit proxy compatibility
