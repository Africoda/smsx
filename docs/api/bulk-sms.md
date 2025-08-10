# Bulk SMS API

The Bulk SMS API allows you to send SMS messages to multiple recipients simultaneously.

## Endpoint

```
POST /send
```

## Request

### Headers

```
Content-Type: application/json
```

### Request Body

| Field        | Type           | Required | Description                                                                 |
| ------------ | -------------- | -------- | --------------------------------------------------------------------------- |
| `sender`     | string \| null | No       | The sender ID for the SMS. Can be omitted or set to null for default sender |
| `message`    | string         | Yes      | The SMS message content. Must not be empty                                  |
| `recipients` | string[]       | Yes      | Array of phone numbers to send the SMS to. Each number must not be empty    |

### Example Request

```json
{
  "sender": "MyCompany",
  "message": "Hello! This is a test message.",
  "recipients": [
    "+1234567890",
    "+0987654321",
    "0208506317"
  ]
}
```

### Example Request (without sender)

```json
{
  "message": "Vote Kirk Katamanso",
  "recipients": [
    "0208506317",
    "0552403972"
  ]
}
```

## Responses

### Success Response (200 OK)

```json
{
  "status": "success",
  "totalSent": 2,
  "totalFailed": 0
}
```

| Field         | Type      | Description                              |
| ------------- | --------- | ---------------------------------------- |
| `status`      | "success" | Always "success" for successful requests |
| `totalSent`   | number    | Number of messages successfully sent     |
| `totalFailed` | number    | Number of messages that failed to send   |

### Error Responses

#### Bad Request (400)

```json
{
  "error": "Invalid phone number format"
}
```

#### Internal Server Error (500)

```json
{
  "error": "SMS service unavailable"
}
```

## Validation Rules

### Message

- Must not be empty
- No maximum length enforced at schema level (check with SMS provider for limits)

### Recipients

- Must be an array of strings
- Each phone number must not be empty
- Empty arrays are technically valid but will result in no messages being sent

### Sender

- Optional field
- Can be null or omitted
- When provided, must not be empty

## Common Error Cases

1. **Empty message**: Returns 400 with validation error
2. **Missing recipients**: Returns 400 with validation error
3. **Empty phone numbers in recipients**: Returns 400 with validation error
4. **SMS service issues**: Returns 500 with service error

## Phone Number Format

The API accepts phone numbers in various formats:

- International format: `+1234567890`
- Local format: `0208506317`
- Any string format your SMS provider supports

**Important**: If you have comma-separated phone numbers as a single string (e.g., `"0208506317,0552403972"`), you must split them into separate array elements before sending the request.

### Incorrect Format

```json
{
  "recipients": ["0208506317,0552403972"] // Wrong - single string
}
```

### Correct Format

```json
{
  "recipients": ["0208506317", "0552403972"] // Correct - separate strings
}
```

## Rate Limiting

Check with your SMS provider for rate limiting policies. The API itself doesn't enforce rate limits at the schema level.

## Tags

This endpoint is tagged with:

- `Bulk SMS`
- `SMS`
