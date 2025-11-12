# Testing Guide

## Overview

SMSX uses Vitest for testing. The test suite includes unit tests and integration tests for key functionality.

## Prerequisites

Tests require a PostgreSQL database. You have two options:

### Option 1: Use Docker for Testing

The easiest way to run tests is using Docker:

```bash
# Start a test database
docker run -d \
  --name smsx-test-db \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_DB=test_db \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for database to be ready
sleep 5

# Run tests
npm test

# Stop and remove test database
docker stop smsx-test-db
docker rm smsx-test-db
```

### Option 2: Use Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create a test database:

```bash
psql -U postgres
CREATE DATABASE test_db;
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE test_db TO test_user;
\q
```

2. Configure test environment:

```bash
# .env.test is already configured with these values
# DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_db"
```

3. Run migrations:

```bash
NODE_ENV=test npm run db:migrate
```

4. Run tests:

```bash
npm test
```

## Test Structure

```
src/tests/
├── setup.ts                      # Test setup and teardown
├── auth/
│   └── auth.test.ts             # Authentication tests
└── notifications/
    └── notifications.test.ts    # Notification tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/tests/auth/auth.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Writing Tests

### Example Test Structure

```typescript
import { beforeEach, describe, expect, it } from "vitest";

import db from "@/db";

describe("Feature Name", () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await db.delete(table).execute();
  });

  it("should do something", async () => {
    // Arrange
    const testData = { /* ... */ };

    // Act
    const result = await someFunction(testData);

    // Assert
    expect(result).toBeDefined();
    expect(result.status).toBe("success");
  });
});
```

### Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data in `beforeEach` or `afterEach`
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Follow the AAA pattern for test organization
5. **Mock External Services**: Mock external APIs like MNotify to avoid real API calls

## Test Configuration

Test configuration is in `vitest.config.ts`:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    setupFiles: ["./src/tests/setup.ts"],
  },
});
```

Environment variables for tests are in `.env.test`.

## Continuous Integration

For CI/CD pipelines, use Docker to run tests:

```yaml
# GitHub Actions example
- name: Start test database
  run: |
    docker run -d \
      --name test-db \
      -e POSTGRES_USER=test_user \
      -e POSTGRES_PASSWORD=test_password \
      -e POSTGRES_DB=test_db \
      -p 5432:5432 \
      postgres:15-alpine
    sleep 5

- name: Run tests
  run: npm test

- name: Cleanup
  run: docker stop test-db && docker rm test-db
```

## Troubleshooting

### Database Connection Errors

If you see `ECONNREFUSED` errors:

1. Verify PostgreSQL is running:

```bash
# Check if PostgreSQL is running
docker ps  # for Docker
sudo systemctl status postgresql  # for local installation
```

2. Verify connection parameters in `.env.test`

3. Check if port 5432 is available:

```bash
lsof -i :5432
```

### Test Timeouts

If tests timeout:

1. Increase test timeout in test file:

```typescript
it("long running test", async () => {
  // test code
}, 30000); // 30 second timeout
```

2. Check database performance
3. Verify network connectivity to database

### Failed Migrations

If migrations fail during tests:

```bash
# Reset test database
docker stop smsx-test-db
docker rm smsx-test-db
# Start fresh and run migrations again
```

## Adding New Tests

When adding new features, always add corresponding tests:

1. Create test file in appropriate directory under `src/tests/`
2. Import necessary utilities and types
3. Write test cases covering:
   - Happy path (expected behavior)
   - Error cases (validation, missing data, etc.)
   - Edge cases
4. Run tests locally before committing
5. Ensure all tests pass in CI

## Coverage

To see test coverage:

```bash
npm test -- --coverage
```

Aim for:

- Line coverage: > 80%
- Branch coverage: > 75%
- Function coverage: > 80%

## Mocking

For external services, use Vitest mocks:

```typescript
import { vi } from "vitest";

// Mock external API
vi.mock("mnotify-ts-sdk", () => ({
  MNotify: vi.fn().mockImplementation(() => ({
    sms: {
      sendQuickBulkSMS: vi.fn().mockResolvedValue({ status: "success" }),
    },
  })),
}));
```

## Database Test Utilities

Create helper functions for common test setup:

```typescript
// src/tests/helpers.ts
export async function createTestUser() {
  return await db.insert(users).values({
    email: "test@example.com",
    password: await hash("password123"),
  }).returning();
}

export async function cleanupTestData() {
  await db.delete(users).execute();
  await db.delete(contacts).execute();
  // ... other tables
}
```

## Next Steps

- Add more integration tests for SMS sending
- Add tests for file upload functionality
- Add performance tests for rate limiting
- Add tests for edge cases and error scenarios
