# SMSX - SMS Communications Platform

A modern, production-ready SMS communications platform built with TypeScript, Hono, and Drizzle ORM.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with refresh tokens
- 📱 **SMS Services** - Send single and bulk SMS messages via MNotify integration
- 👥 **Contact Management** - Organize and manage contact lists
- 📁 **CSV Upload** - Bulk import contacts via CSV files
- 🚦 **Rate Limiting** - Built-in rate limiting to prevent abuse
- 🏥 **Health Checks** - Monitor service and database health
- 📊 **API Documentation** - OpenAPI/Swagger documentation
- 🔒 **Security** - CORS, input validation, and secure password handling
- 📝 **Logging** - Structured logging with Pino
- 🎯 **TypeScript** - Fully typed codebase

## Prerequisites

- Node.js 18+ or higher
- PostgreSQL database
- MNotify API key (for SMS sending)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Africoda/smsx.git
cd smsx
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
NODE_ENV=development
PORT=9999
LOG_LEVEL=debug

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smsx"
# For production with Turso/LibSQL:
# DATABASE_AUTH_TOKEN=your_token_here

# JWT Configuration
JWT_SECRET=your-strong-secret-key-min-6-chars
JWT_EXPIRATION=30d
JWT_REFRESH_EXPIRATION=30d
JWT_RESET_PASSWORD_EXPIRATION=10m
JWT_VERIFY_EMAIL_EXPIRATION=10m

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password

# MNotify SMS Provider
MNOTIFY_API_KEY=your-mnotify-api-key
```

4. Run database migrations:

```bash
npm run db:migrate
```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start at `http://localhost:9999`.

## Production

1. Build the project:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## API Endpoints

### Public Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke refresh token

### Protected Endpoints (Require JWT)

#### Contacts

- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create a new contact
- `GET /api/contacts/:id` - Get a specific contact
- `PUT /api/contacts/:id` - Update a contact
- `DELETE /api/contacts/:id` - Delete a contact

#### SMS

- `POST /api/send` - Send bulk SMS

#### Upload

- `POST /api/upload/contacts` - Upload contacts via CSV

## API Documentation

Interactive API documentation is available at:

- Swagger UI: `http://localhost:9999/docs`
- OpenAPI Spec: `http://localhost:9999/openapi.json`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate migration files

## Testing

Run tests:

```bash
npm test
```

For tests to work, ensure you have a test database configured in `.env.test`.

## Project Structure

```
src/
├── app.ts                 # Application setup
├── index.ts              # Server entry point
├── env.ts                # Environment configuration
├── db/                   # Database configuration and migrations
│   ├── index.ts
│   ├── schema/          # Database schemas
│   └── migrations/      # Database migration files
├── lib/                  # Shared libraries
│   ├── create-app.ts    # App factory
│   ├── configure-open-api.ts
│   └── types.ts
├── middlewares/          # Custom middleware
│   ├── pino-logger.ts
│   └── rate-limiter.ts
├── modules/              # Feature modules
│   ├── auth/            # Authentication
│   ├── bulk-sms/        # SMS sending
│   ├── contacts/        # Contact management
│   ├── notifications/   # Notifications
│   └── upload/          # File upload
├── routes/              # Route definitions
│   ├── index.ts
│   └── health.ts
├── utils/               # Utility functions
└── tests/              # Test files
```

## Rate Limiting

The API includes rate limiting to prevent abuse:

- **Standard endpoints**: 500 requests per 15 minutes
- **Authentication endpoints**: 5 attempts per 15 minutes
- **Strict endpoints**: 100 requests per 15 minutes

Rate limit information is included in response headers:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Time when the limit resets

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS enabled with configurable origins
- Input validation on all endpoints
- SQL injection prevention via Drizzle ORM
- Rate limiting on all endpoints

## Production Deployment

### Environment Variables

Ensure the following are set in production:

- `NODE_ENV=production`
- `DATABASE_AUTH_TOKEN` (required for Turso/LibSQL in production)
- Strong `JWT_SECRET` (minimum 32 characters recommended)
- Configure `SMTP_*` variables for email functionality
- Set `MNOTIFY_API_KEY` for SMS sending

### Database

For production, consider using:

- PostgreSQL (traditional SQL database)
- Turso (edge-hosted LibSQL database)

### Deployment Platforms

The application can be deployed to:

- Docker containers
- Kubernetes
- Vercel
- Railway
- Fly.io
- Any Node.js hosting platform

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 9999
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t smsx .
docker run -p 9999:9999 --env-file .env smsx
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
