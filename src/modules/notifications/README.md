# Notifications Module

The notifications module provides in-app notification management for SMSX users, enabling businesses to surface important alerts and messages to their end-users.

## Endpoints

All endpoints require a valid JWT bearer token.

| Method  | Path                          | Description                                   |
| ------- | ----------------------------- | --------------------------------------------- |
| `POST`  | `/api/notifications`          | Create a new notification                     |
| `GET`   | `/api/notifications`          | List notifications for the authenticated user |
| `PATCH` | `/api/notifications/:id/read` | Mark a notification as read                   |

## Notification Types

Notifications support the following types:

- `INFO` – General informational messages
- `WARNING` – Advisory or cautionary alerts
- `ERROR` – Error or failure alerts
- `SUCCESS` – Confirmation of a successful action

## List Query Parameters

| Parameter    | Type                  | Default | Description                                      |
| ------------ | --------------------- | ------- | ------------------------------------------------ |
| `page`       | number                | `1`     | Page number for pagination                       |
| `limit`      | number                | `10`    | Results per page (max 100)                       |
| `unreadOnly` | `"true"` \| `"false"` | —       | When `"true"`, returns only unread notifications |

## Example Usage

### Create a notification

```http
POST /api/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Campaign Sent",
  "message": "Your bulk SMS campaign was delivered to 150 recipients.",
  "recipientId": "uuid-of-user",
  "type": "SUCCESS"
}
```

### List unread notifications

```
GET /api/notifications?unreadOnly=true&page=1&limit=20
Authorization: Bearer <token>
```

### Mark a notification as read

```
PATCH /api/notifications/<notification-id>/read
Authorization: Bearer <token>
```
