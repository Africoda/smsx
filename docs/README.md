# SMS API Documentation

Welcome to the SMS API documentation. This API provides endpoints for sending SMS messages efficiently and reliably.

## Quick Start

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Available Endpoints](#available-endpoints)

## API Overview

The SMS API is built with:

- **OpenAPI 3.0** specification
- **Zod schema validation** for type safety
- **Hono framework** for fast, lightweight routing
- **TypeScript** for enhanced developer experience

## Available Endpoints

### Bulk SMS

- [**Bulk SMS API**](./api/bulk-sms.md) - Send SMS messages to multiple recipients simultaneously

## Testing Documentation

### Test Suites

- [**Bulk SMS Tests**](./testing/bulk-sms-tests.md) - Comprehensive test documentation and examples

## Development

### Project Structure

```
src/
├── modules/
│   └── bulk-sms/
│       ├── routes.ts          # Route definitions with OpenAPI schemas
│       ├── routes.test.ts     # Comprehensive route tests
│       ├── handlers.ts        # Route handlers and business logic
│       └── service.ts         # SMS service implementations
docs/
├── api/                       # API endpoint documentation
├── testing/                   # Test documentation and guides
└── markdown/                  # Additional guides and resources
```

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode (development)
npx vitest --watch

# Run tests with coverage report
npx vitest --coverage

# Run specific test file
npx vitest bulk-sms/routes.test.ts
```

### Adding New Features

When adding new API endpoints:

1. **Create route definition** in `routes.ts` with OpenAPI schema
2. **Add comprehensive tests** in `routes.test.ts`
3. **Implement handlers** for business logic
4. **Update documentation** in the `docs/` folder
5. **Test thoroughly** including edge cases

## Common Issues and Solutions

### Phone Number Format Issues

**Problem**: Sending comma-separated phone numbers as a single string

```json
// ❌ Incorrect format
{
  "recipients": ["0208506317,0552403972"]
}
```

**Solution**: Split phone numbers into separate array elements

```json
// ✅ Correct format
{
  "recipients": ["0208506317", "0552403972"]
}
```

### Empty Recipients Array

**Problem**: Sending empty recipients array passes validation but sends no messages

**Solution**: Add business logic validation in handlers to check for empty arrays:

```typescript
if (recipients.length === 0) {
  return c.json({ error: "At least one recipient is required" }, 400);
}
```

### Validation Errors

**Problem**: Understanding why requests fail validation

**Solution**: Use the test suite to understand expected formats:

- Check `docs/testing/bulk-sms-tests.md` for examples
- Run tests locally to see validation behavior
- Review schema definitions in route files

## API Design Principles

### Request Validation

- All inputs are validated using Zod schemas
- Clear error messages for validation failures
- Optional fields are properly marked
- Type safety throughout the application

### Response Structure

- Consistent response formats across endpoints
- Proper HTTP status codes
- Structured error responses
- Clear success indicators

### Documentation

- OpenAPI schemas generate automatic documentation
- Comprehensive test coverage documents expected behavior
- Examples for all common use cases
- Clear error handling guidance

## Contributing

### Code Standards

1. **Write tests first**: All new features should have corresponding tests
2. **Update documentation**: Keep docs in sync with code changes
3. **Follow existing patterns**: Maintain consistency with current codebase
4. **Validate thoroughly**: Test edge cases and error conditions

### Documentation Standards

1. **Clear examples**: Provide both correct and incorrect usage examples
2. **Complete coverage**: Document all fields, responses, and error cases
3. **Keep updated**: Documentation should reflect current implementation
4. **User-focused**: Write from the API consumer's perspective

## Support and Resources

### Getting Help

1. **Check documentation**: Start with relevant API and test documentation
2. **Review examples**: Look at test files for usage patterns
3. **Common issues**: Check the common issues section above
4. **Test locally**: Use the test suite to understand expected behavior

### Additional Resources

- [Endpoint Creation Guide](./markdown/endpoint-creation.md)
- [API Introduction](./markdown/intro-to-apis.md)
- [Good to Know](./markdown/good-to-know.md)

### Development Tools

- **VSCode Extensions**: Install Vitest extension for integrated testing
- **Testing**: Comprehensive test suite with coverage reporting
- **Type Safety**: Full TypeScript support with Zod validation
- **Documentation**: Auto-generated OpenAPI documentation
