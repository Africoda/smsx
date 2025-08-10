# API Reference

This directory contains documentation for all SMS API endpoints.

## Available APIs

### Bulk SMS

- **[Bulk SMS API](./bulk-sms.md)** - Send SMS messages to multiple recipients

## Quick Reference

| Endpoint | Method | Description                                   |
| -------- | ------ | --------------------------------------------- |
| `/send`  | POST   | Send bulk SMS messages to multiple recipients |

## Common Request Headers

```
Content-Type: application/json
```

## Common Response Formats

### Success Response

```json
{
  "status": "success",
  "totalSent": 2,
  "totalFailed": 0
}
```

### Error Response

```json
{
  "error": "Error description"
}
```

## HTTP Status Codes

| Code | Description                 |
| ---- | --------------------------- |
| 200  | Success                     |
| 400  | Bad Request - Invalid input |
| 500  | Internal Server Error       |
