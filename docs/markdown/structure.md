africoda-smsx/
│
├── .env\* ← Environment variables for dev/test
├── drizzle.config.ts ← ORM (Drizzle) setup
├── package.json ← NPM scripts & dependencies
├── tsconfig.json ← TypeScript config, includes path aliases
│
├── src/
│ ├── index.ts ← Entry point (boots the app with Hono)
│ ├── app.ts ← Sets up app middleware, routes, and JWT protection
│ ├── env.ts ← Loads & validates environment variables
│ │
│ ├── db/ ← Database logic
│ │ ├── index.ts ← Initializes DB client (postgres.js + drizzle)
│ │ ├── migrations/ ← SQL + metadata
│ │ └── schema/ ← Table schemas + Zod types
│ │
│ ├── lib/ ← App-level utilities (OpenAPI config, constants)
│ ├── routes/ ← Root-level routes (like “/” index)
│ ├── shared/ ← Global shared types, errors, and middleware
│ ├── utils/ ← Logger, error handler
│ ├── middlewares/ ← Custom Hono middleware (logging, etc.)
│ └── modules/ ← Business logic, split into features
│ ├── auth/
│ └── notifications/
│
└── tests/ ← Unit/integration tests
