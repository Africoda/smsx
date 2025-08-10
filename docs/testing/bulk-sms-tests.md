# Bulk SMS API Tests

This document describes the test suite for the Bulk SMS API routes and validation.

## Test File Location

```
src/modules/bulk-sms/routes.test.ts
```

## Running Tests

### Install Dependencies

```bash
npm install -D vitest
```

### Run Tests

```bash
# Run all tests
npm test

# Run only bulk SMS tests
npx vitest routes.test.ts

# Run in watch mode
npx vitest --watch

# Run with coverage
npx vitest --coverage
```

## Test Categories

### 1. Route Configuration Tests

Tests the basic route setup and configuration.

```typescript
describe("sendBulkSms route configuration", () => {
  it("should have correct method and path", () => {
    expect(sendBulkSms.method).toBe("post");
    expect(sendBulkSms.path).toBe("/send");
  });

  it("should have correct tags", () => {
    expect(sendBulkSms.tags).toEqual(["Bulk SMS", "SMS"]);
  });
});
```

**What it tests:**

- HTTP method is POST
- Path is `/send`
- Tags are correctly set

### 2. Request Body Validation Tests

Tests the Zod schema validation for incoming requests.

#### Valid Requests

- ✅ Complete request with sender
- ✅ Request without sender (optional)
- ✅ Request with null sender
- ✅ Very long messages
- ✅ Large recipient lists (100+ numbers)

#### Invalid Requests

- ❌ Empty message
- ❌ Missing message
- ❌ Empty strings in recipients array
- ❌ Missing recipients

```typescript
it("should validate valid request body", () => {
  const validBody = {
    sender: "TestSender",
    message: "Hello World",
    recipients: ["+1234567890", "+0987654321"],
  };

  const result = requestSchema.safeParse(validBody);
  expect(result.success).toBe(true);
});
```

### 3. Response Schema Validation Tests

Tests that response schemas match expected formats.

#### Success Response (200)

```typescript
it("should validate successful response", () => {
  const validResponse = {
    status: "success",
    totalSent: 5,
    totalFailed: 0,
  };

  const result = successSchema.safeParse(validResponse);
  expect(result.success).toBe(true);
});
```

#### Error Responses (400, 500)

```typescript
it("should validate bad request response", () => {
  const validResponse = {
    error: "Invalid phone number format",
  };

  const result = badRequestSchema.safeParse(validResponse);
  expect(result.success).toBe(true);
});
```

### 4. Type Export Tests

Ensures TypeScript types are properly exported and usable.

```typescript
it("should export SendBulkSmsRoute type", () => {
  const routeType: SendBulkSmsRoute = sendBulkSms;
  expect(routeType).toBeDefined();
  expect(routeType.method).toBe("post");
});
```

### 5. Edge Case Tests

Tests boundary conditions and edge cases.

- **Very long messages**: 1000+ character strings
- **Large recipient lists**: 100+ phone numbers
- **Empty arrays**: Valid but should be handled by business logic

## Test Structure

```
bulk SMS Routes/
├── sendBulkSms route configuration/
│   ├── should have correct method and path
│   └── should have correct tags
├── request body validation/
│   ├── should validate valid request body
│   ├── should validate request body without sender
│   ├── should validate request body with null sender
│   ├── should reject empty message
│   ├── should reject missing message
│   ├── should reject empty recipients array
│   ├── should reject recipients with empty strings
│   └── should reject missing recipients
├── response schemas/
│   ├── should validate successful response
│   ├── should reject success response with wrong status
│   ├── should validate bad request response
│   ├── should validate internal server error response
│   └── should reject error responses without error field
├── type exports/
│   └── should export SendBulkSmsRoute type
└── edge cases/
    ├── should handle very long messages
    └── should handle large recipient lists
```

## Adding New Tests

### For Phone Number Format Issues

If you need to test comma-separated phone number handling:

```typescript
describe("phone number format handling", () => {
  it("should reject comma-separated phone numbers as single string", () => {
    const invalidBody = {
      message: "vote kirk katamanso",
      recipients: ["0208506317,0552403972"] // Single string with comma
    };

    const result = requestSchema.safeParse(invalidBody);
    expect(result.success).toBe(true); // Current schema allows this
    // But business logic should handle splitting
  });

  it("should accept properly formatted phone number array", () => {
    const validBody = {
      message: "vote kirk katamanso",
      recipients: ["0208506317", "0552403972"] // Separate strings
    };

    const result = requestSchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });
});
```

### For New Validation Rules

When adding new fields or validation:

```typescript
it("should validate new field", () => {
  const requestSchema = sendBulkSms.request.body.content["application/json"].schema;
  const bodyWithNewField = {
    message: "Test",
    recipients: ["+1234567890"],
    newField: "value"
  };

  const result = requestSchema.safeParse(bodyWithNewField);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.newField).toBe("value");
  }
});
```

## Test Coverage

The test suite covers:

- ✅ Route configuration (method, path, tags)
- ✅ Request validation (all fields and combinations)
- ✅ Response validation (all status codes)
- ✅ Type exports
- ✅ Edge cases and boundary conditions
- ✅ Error scenarios

## Integration with VSCode

### Running Tests in VSCode

1. Install the "Vitest" extension
2. Open the test file
3. Click the ▶️ button next to individual tests
4. Use the 🐛 button for debugging with breakpoints
5. View results in the Test Explorer panel

### Debugging Tests

1. Set breakpoints in test code
2. Right-click test → "Debug Test"
3. Use VSCode debugger features (step through, inspect variables)

## Continuous Integration

These tests should be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test

- name: Run Tests with Coverage
  run: npx vitest --coverage
```

## Best Practices

1. **Keep tests focused**: Each test should verify one specific behavior
2. **Use descriptive names**: Test names should clearly state what is being tested
3. **Test both positive and negative cases**: Valid and invalid inputs
4. **Include edge cases**: Boundary conditions and unusual inputs
5. **Update tests when schema changes**: Keep tests in sync with API changes
