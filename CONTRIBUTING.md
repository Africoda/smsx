# Contributing to SMSX

Thank you for your interest in contributing to SMSX! This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node.js version, etc.)
- **Error messages** or logs

Example bug report:

```markdown
**Bug**: Rate limiting not working on health endpoint

**Steps to Reproduce**:

1. Send 600 requests to /api/health
2. All requests return 200 OK

**Expected**: Should return 429 after 500 requests

**Environment**:

- OS: Ubuntu 22.04
- Node.js: v18.17.0
- Version: 1.0.0
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear title** describing the enhancement
- **Provide detailed description** of the suggested feature
- **Explain why** this enhancement would be useful
- **Include examples** of how it would work

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow coding standards** (see below)
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Ensure all tests pass**
6. **Submit pull request** with clear description

## Development Setup

1. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/smsx.git
cd smsx
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up database:

```bash
# Start PostgreSQL (or use Docker)
docker run -d --name smsx-dev-db \
  -e POSTGRES_USER=smsx \
  -e POSTGRES_PASSWORD=smsx \
  -e POSTGRES_DB=smsx \
  -p 5432:5432 \
  postgres:15-alpine

# Run migrations
npm run db:migrate
```

5. Start development server:

```bash
npm run dev
```

## Coding Standards

### TypeScript

- **Type everything** - No `any` types unless absolutely necessary
- **Use interfaces** for object shapes
- **Prefer const** over let
- **Use async/await** over promises where possible

### Code Style

We use ESLint and Prettier. Run linting before committing:

```bash
npm run lint
npm run lint:fix
```

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Functions**: camelCase (`getUserById`)
- **Classes**: PascalCase (`UserService`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces/Types**: PascalCase (`UserData`)

### Project Structure

```
src/
├── modules/           # Feature modules (auth, contacts, etc.)
│   └── [module]/
│       ├── index.ts
│       ├── handlers.ts   # Request handlers
│       ├── routes.ts     # Route definitions
│       ├── service.ts    # Business logic
│       └── schema.ts     # Validation schemas
├── lib/              # Shared libraries
├── middlewares/      # Custom middleware
├── routes/           # General routes
├── utils/            # Utility functions
└── tests/            # Test files
```

### Writing Modules

When adding a new module:

1. Create directory under `src/modules/[module-name]`
2. Add required files:
   - `index.ts` - Router export
   - `routes.ts` - OpenAPI route definitions
   - `handlers.ts` - Request handlers
   - `service.ts` - Business logic
   - `schema.ts` - Zod validation schemas (if needed)

Example module structure:

```typescript
// routes.ts
export const createItem = createRoute({
  method: "post",
  path: "/items",
  tags: ["Items"],
  request: { body: jsonContentRequired(ItemSchema) },
  responses: { /* ... */ },
});

// handlers.ts
export const createItem: AppRouteHandler<typeof routes.createItem> = async (c) => {
  const data = c.req.valid("json");
  const result = await itemService.create(data);
  return c.json(result, HttpStatusCodes.CREATED);
};

// service.ts
export const itemService = {
  async create(data: NewItem): Promise<Item> {
    return await db.insert(items).values(data).returning();
  },
};

// index.ts
const router = createRouter();
router.openapi(routes.createItem, handlers.createItem);
export default router;
```

### Error Handling

Always use the `AppError` class for custom errors:

```typescript
throw new AppError(
  "User not found",
  HttpStatusCodes.NOT_FOUND,
  { userId }
);
```

### Database

- Use Drizzle ORM for all database operations
- Create migrations for schema changes
- Never use raw SQL strings
- Always use transactions for multi-step operations

### Testing

Write tests for:

- All new features
- Bug fixes
- Critical paths

Example test:

```typescript
describe("User Service", () => {
  beforeEach(async () => {
    await db.delete(users).execute();
  });

  it("should create a user", async () => {
    const user = await userService.create({
      email: "test@example.com",
      password: "password123",
    });

    expect(user).toBeDefined();
    expect(user.email).toBe("test@example.com");
  });
});
```

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add password reset functionality

Implements password reset flow with email verification.
Includes rate limiting and token expiration.

Closes #123
```

```
fix(sms): handle MNotify API timeout errors

Added retry logic and better error messages for timeout scenarios.
```

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features or bug fixes
3. **Update CHANGELOG.md** with your changes
4. **Ensure CI passes** (linting, type checking, tests)
5. **Request review** from maintainers
6. **Address feedback** promptly

### PR Title Format

```
[type] Brief description of changes
```

Examples:

- `[feat] Add SMS scheduling functionality`
- `[fix] Resolve rate limiting bypass issue`
- `[docs] Update API documentation`

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests pass locally
- [ ] Changes are backward compatible (or noted)
```

## Review Process

All submissions require review:

1. **Automated checks** must pass (CI/CD)
2. **Code review** by at least one maintainer
3. **Testing verification** in staging environment (if applicable)
4. **Documentation review** if docs were changed

## Release Process

1. **Version bump** following semantic versioning
2. **Update CHANGELOG.md** with release notes
3. **Create release tag** on GitHub
4. **Deploy to staging** for final verification
5. **Deploy to production**

## Getting Help

- **Documentation**: Check README.md, API.md, and other docs
- **Issues**: Search existing issues
- **Discussions**: Start a discussion for questions
- **Email**: Contact maintainers (for security issues)

## Recognition

Contributors will be:

- Listed in release notes
- Mentioned in CHANGELOG.md
- Added to contributors list (if significant contribution)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SMSX! 🎉
