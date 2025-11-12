# API Documentation

## Base URL

- Development: `http://localhost:9999`
- Production: `https://your-domain.com`

All API endpoints are prefixed with `/api`.

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Refresh tokens are stored in HTTP-only cookies.

## Rate Limiting

API requests are rate-limited:

- **Standard endpoints**: 500 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **Upload endpoints**: 100 requests per 15 minutes

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 499
X-RateLimit-Reset: 2024-01-01T00:15:00.000Z
```

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response.

## Response Format

All responses follow this format:

**Success Response:**

```json
{
  "data": { /* response data */ },
  "message": "Success message"
}
```

**Error Response:**

```json
{
  "error": "Error message",
  "details": { /* optional error details */ }
}
```

## Endpoints

### Health Check

#### GET /api/health

Check service health and database connectivity.

**Authentication:** Not required

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "database": "connected"
}
```

**Status Codes:**

- `200 OK` - Service is healthy
- `503 Service Unavailable` - Service or database is down

---

### Authentication

#### POST /api/auth/register

Register a new user account.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "strongPassword123"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Status Codes:**

- `201 Created` - User registered successfully
- `400 Bad Request` - Invalid input
- `409 Conflict` - Email already exists

---

#### POST /api/auth/login

Login and receive access token.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "strongPassword123"
}
```

**Response:**

```json
{
  "token": "jwt-access-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

The response also sets a refresh token cookie:

```
Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict
```

**Status Codes:**

- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials

---

#### POST /api/auth/refresh

Refresh access token using refresh token.

**Authentication:** Refresh token (from cookie)

**Response:**

```json
{
  "token": "new-jwt-access-token",
  "message": "Token refreshed"
}
```

**Status Codes:**

- `200 OK` - Token refreshed
- `401 Unauthorized` - Invalid or expired refresh token

---

#### POST /api/auth/logout

Logout and revoke refresh token.

**Authentication:** Refresh token (from cookie)

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**

- `200 OK` - Logout successful
- `401 Unauthorized` - Not authenticated

---

### Contacts

#### GET /api/contacts

List all contacts for the authenticated user.

**Authentication:** Required

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response:**

```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "233201234567",
      "userId": "user-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

**Status Codes:**

- `200 OK` - Contacts retrieved
- `401 Unauthorized` - Not authenticated

---

#### POST /api/contacts

Create a new contact.

**Authentication:** Required

**Request Body:**

```json
{
  "name": "John Doe",
  "phone": "233201234567"
}
```

**Response:**

```json
{
  "message": "Contact created successfully",
  "contact": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "233201234567",
    "userId": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `201 Created` - Contact created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated

---

#### GET /api/contacts/:id

Get a specific contact.

**Authentication:** Required

**Response:**

```json
{
  "contact": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "233201234567",
    "userId": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200 OK` - Contact retrieved
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Contact not found

---

#### PUT /api/contacts/:id

Update a contact.

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Jane Doe",
  "phone": "233209876543"
}
```

**Response:**

```json
{
  "message": "Contact updated successfully",
  "contact": {
    "id": "uuid",
    "name": "Jane Doe",
    "phone": "233209876543",
    "userId": "user-uuid",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**

- `200 OK` - Contact updated
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Contact not found

---

#### DELETE /api/contacts/:id

Delete a contact.

**Authentication:** Required

**Response:**

```json
{
  "message": "Contact deleted successfully"
}
```

**Status Codes:**

- `200 OK` - Contact deleted
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Contact not found

---

### SMS

#### POST /api/send

Send bulk SMS to multiple recipients.

**Authentication:** Required

**Request Body:**

```json
{
  "sender": "YourBrand",
  "message": "Hello! This is a test message.",
  "recipients": [
    "233201234567",
    "233209876543"
  ]
}
```

**Response:**

```json
{
  "status": "success",
  "totalSent": 2,
  "totalFailed": 0
}
```

**Status Codes:**

- `200 OK` - SMS sent successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - SMS service error

**Notes:**

- Sender name should be alphanumeric and max 11 characters
- Phone numbers should be in international format (233...)
- Message length is limited by SMS standards (160 chars for single SMS)

---

### Upload

#### POST /api/upload/contacts

Upload contacts via CSV file.

**Authentication:** Required

**Request:**

- Content-Type: `multipart/form-data`
- Form field: `file` (CSV file)

**CSV Format:**

```csv
name,phone
John Doe,233201234567
Jane Smith,233209876543
```

**Response:**

```json
{
  "message": "CSV parsed successfully",
  "data": {
    "totalRows": 2,
    "validRows": 2,
    "errorRows": 0,
    "errors": [],
    "contacts": [
      {
        "name": "John Doe",
        "phone": "233201234567",
        "userId": "user-uuid"
      },
      {
        "name": "Jane Smith",
        "phone": "233209876543",
        "userId": "user-uuid"
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - File processed successfully
- `400 Bad Request` - Invalid file or format
- `401 Unauthorized` - Not authenticated

**CSV Requirements:**

- Must be a CSV file (text/csv)
- Must have headers: `name`, `phone`
- Phone numbers must be in format: 233XXXXXXXXX (Ghana format)

---

## Error Codes

| Status Code | Description                                       |
| ----------- | ------------------------------------------------- |
| 200         | Success                                           |
| 201         | Created                                           |
| 400         | Bad Request - Invalid input                       |
| 401         | Unauthorized - Authentication required or invalid |
| 403         | Forbidden - Insufficient permissions              |
| 404         | Not Found - Resource doesn't exist                |
| 409         | Conflict - Resource already exists                |
| 429         | Too Many Requests - Rate limit exceeded           |
| 500         | Internal Server Error                             |
| 503         | Service Unavailable                               |

## Common Error Messages

### Authentication Errors

- "Invalid credentials" - Wrong email or password
- "Token expired" - JWT token has expired
- "Invalid token" - Malformed or invalid JWT
- "Unauthorized" - No authentication provided

### Validation Errors

- "Email already exists" - During registration
- "Invalid email format" - Email validation failed
- "Password too weak" - Password doesn't meet requirements
- "Invalid phone number format" - Phone number validation failed
- "Required field missing" - Required field not provided

### Rate Limiting

- "Rate limit exceeded. Try again in X seconds" - Too many requests

## Examples

### cURL Examples

**Register:**

```bash
curl -X POST http://localhost:9999/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "strongPassword123"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:9999/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "strongPassword123"
  }' \
  -c cookies.txt
```

**Create Contact:**

```bash
curl -X POST http://localhost:9999/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John Doe",
    "phone": "233201234567"
  }'
```

**Send SMS:**

```bash
curl -X POST http://localhost:9999/api/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sender": "YourBrand",
    "message": "Hello World!",
    "recipients": ["233201234567", "233209876543"]
  }'
```

**Upload CSV:**

```bash
curl -X POST http://localhost:9999/api/upload/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@contacts.csv"
```

### JavaScript/TypeScript Examples

```typescript
// Using fetch API
const response = await fetch("http://localhost:9999/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "strongPassword123",
  }),
});

const data = await response.json();
const token = data.token;

// Make authenticated request
const contactsResponse = await fetch("http://localhost:9999/api/contacts", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const contacts = await contactsResponse.json();
```

## Interactive Documentation

For interactive API testing, visit:

- Swagger UI: `http://localhost:9999/docs`
- OpenAPI Spec: `http://localhost:9999/openapi.json`

The interactive documentation allows you to test all endpoints directly from your browser.

## Webhooks (Future Feature)

Webhooks for SMS delivery status will be added in a future release.

## Support

For API issues or questions:

1. Check this documentation
2. Review the OpenAPI specification
3. Check application logs
4. Open an issue on GitHub
