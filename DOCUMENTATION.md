# Taskco API Documentation

<div align="center">

![API Documentation](https://img.shields.io/badge/API-RESTful-blue.svg)
![Postman](https://img.shields.io/badge/Postman-Collections-orange.svg)
![Version](https://img.shields.io/badge/Version-1.0-green.svg)

**Complete API Documentation with Interactive Postman Collections**

[Main README](README.md) | [Backend Docs](backend/README.md) | [Scalability](SCALABILITY.md)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [API Base URL](#-api-base-url)
- [Authentication](#-authentication)
- [Complete API Collection](#-complete-api-collection)
- [Individual API Collections](#-individual-api-collections)
  - [Authentication API](#1-authentication-api)
  - [Profile API](#2-profile-api)
  - [Tasks API](#3-tasks-api)
  - [Notifications API](#4-notifications-api)
  - [Admin API](#5-admin-api)
  - [Session Management API](#6-session-management-api)
- [Importing Collections](#-importing-collections)
- [Environment Setup](#-environment-setup)
- [Common Request Examples](#-common-request-examples)
- [Response Formats](#-response-formats)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Changelog](#-changelog)

---

## 🌟 Overview

Taskco provides a comprehensive RESTful API for managing tasks, users, notifications, and authentication. All endpoints are documented with interactive Postman collections that include:

- ✅ Complete request/response examples
- ✅ Authentication flows
- ✅ Input validation rules
- ✅ Error scenarios
- ✅ Success responses
- ✅ Test scripts
- ✅ Environment variables

---

## 🌐 API Base URL

### Development
```
http://localhost:3000/api/v1
```

### Production
```
https://your-production-domain.com/api/v1
```

### API Versioning

All API endpoints are versioned using the `/api/v1` prefix. This ensures:
- Backward compatibility
- Smooth migrations
- Clear API evolution path

---

## 🔐 Authentication

### Authentication Methods

Taskco supports multiple authentication methods:

1. **JWT Bearer Token** (Primary)
   ```
   Authorization: Bearer <your-jwt-token>
   ```

2. **Cookies** (Automatic)
   ```
   Cookie: accessToken=<your-jwt-token>
   ```

3. **OAuth 2.0** (Social Login)
   - Google OAuth
   - GitHub OAuth

### Getting a Token

1. **Register/Login** → Receive OTP via email
2. **Verify OTP** → Receive JWT token
3. **Use Token** → Include in Authorization header

### Token Lifecycle

- **Expiry**: Configurable (default: 7 days)
- **Refresh**: Login again to get new token
- **Revocation**: Logout invalidates token immediately
- **Storage**: HTTPOnly cookies (secure)

---

## 📦 Complete API Collection

### 🌟 **All APIs in One Workspace**

Access all Taskco APIs in one comprehensive Postman workspace:

🔗 **[View Complete API Workspace](https://cipher-squad.postman.co/workspace/1c4355f7-6b47-42bf-9abc-c27ee3908c7e)**

**What's Included:**
- ✅ All 6 API collections
- ✅ Pre-configured environment variables
- ✅ Test data and examples
- ✅ Authentication flows
- ✅ Error scenarios
- ✅ Success responses

---

## 📚 Individual API Collections

### 1. Authentication API

<div align="center">

#### 🔐 **[View Authentication Documentation](https://documenter.getpostman.com/view/38185839/2sBXc7LjxY)**

</div>

**Endpoints Included:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user with email |
| `POST` | `/auth/verify-otp` | Verify email OTP |
| `POST` | `/auth/login` | Login with email/password |
| `POST` | `/auth/login-verify-otp` | Verify login OTP |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset password with OTP |
| `GET` | `/auth/google` | Google OAuth redirect |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `GET` | `/auth/github` | GitHub OAuth redirect |
| `GET` | `/auth/github/callback` | GitHub OAuth callback |
| `POST` | `/auth/logout` | Logout and invalidate token |

**Key Features:**
- OTP-based email verification
- Secure password reset flow
- OAuth 2.0 integration (Google, GitHub)
- JWT token generation
- Session management
- Token blacklisting on logout

---

### 2. Profile API

<div align="center">

#### 👤 **[View Profile Documentation](https://documenter.getpostman.com/view/38185839/2sBXc7M4kf)**

</div>

**Endpoints Included:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/me` | Get current user profile |
| `PUT` | `/me` | Update user profile |
| `POST` | `/me/avatar` | Upload profile avatar |
| `DELETE` | `/me/avatar` | Remove profile avatar |

**Features:**
- Profile information management
- Avatar upload to ImageKit CDN
- Profile picture optimization
- Personal information updates
- Account statistics

**Protected**: Requires authentication

---

### 3. Tasks API

<div align="center">

#### ✅ **[View Tasks Documentation](https://documenter.getpostman.com/view/38185839/2sBXc7M4km)**

</div>

**Endpoints Included:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tasks` | Create new task |
| `GET` | `/tasks` | Get all user tasks (with filters) |
| `GET` | `/tasks/:id` | Get single task by ID |
| `PUT` | `/tasks/:id` | Update task |
| `DELETE` | `/tasks/:id` | Delete task |
| `GET` | `/tasks/stats` | Get task statistics |
| `POST` | `/tasks/:id/image` | Upload task image |

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | String | Filter by status | `pending`, `in-progress`, `completed` |
| `priority` | String | Filter by priority | `low`, `medium`, `high` |
| `category` | String | Filter by category | `work`, `personal`, `shopping` |
| `search` | String | Search in title/description | `meeting` |
| `sort` | String | Sort order | `createdAt`, `-dueDate`, `priority` |
| `page` | Number | Page number | `1`, `2`, `3` |
| `limit` | Number | Items per page | `10`, `20`, `50` |

**Features:**
- Full CRUD operations
- Advanced filtering and search
- Pagination support
- Task statistics
- Image attachments
- Priority levels
- Status tracking
- Due date management

**Protected**: Requires authentication

---

### 4. Notifications API

<div align="center">

#### 🔔 **[View Notifications Documentation](https://documenter.getpostman.com/view/38185839/2sBXc7M4ko)**

</div>

**Endpoints Included:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notifications` | Get all notifications |
| `GET` | `/notifications/unread` | Get unread count |
| `PUT` | `/notifications/:id/read` | Mark notification as read |
| `PUT` | `/notifications/read-all` | Mark all as read |
| `DELETE` | `/notifications/:id` | Delete notification |
| `DELETE` | `/notifications/clear` | Clear all notifications |

**Notification Types:**
- Task assignment
- Task updates
- Task mentions
- System notifications
- Admin messages

**Features:**
- Real-time notifications via RabbitMQ
- Unread count badge
- Mark as read functionality
- Bulk operations
- Notification preferences

**Protected**: Requires authentication

---

### 5. Admin API

<div align="center">

#### 👨‍💼 **[View Admin Documentation](https://documenter.getpostman.com/view/38185839/2sBXcDG27y)**

</div>

**Endpoints Included:**

#### Dashboard & Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/stats` | Get system statistics |
| `GET` | `/admin/dashboard` | Admin dashboard data |

#### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users` | Get all users (paginated) |
| `GET` | `/admin/users/:id` | Get user by ID |
| `PUT` | `/admin/users/:id` | Update user details |
| `DELETE` | `/admin/users/:id` | Delete user |
| `PUT` | `/admin/users/:id/role` | Change user role |
| `PUT` | `/admin/users/:id/verify` | Toggle verification status |
| `DELETE` | `/admin/users/bulk-delete` | Bulk delete users |

#### Task Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/tasks` | Get all tasks (all users) |
| `GET` | `/admin/tasks/:id` | Get task details |
| `PUT` | `/admin/tasks/:id` | Update any task |
| `DELETE` | `/admin/tasks/:id` | Delete any task |
| `DELETE` | `/admin/tasks/bulk-delete` | Bulk delete tasks |

**Features:**
- Role-based access control (RBAC)
- Comprehensive system analytics
- User management dashboard
- Task oversight across all users
- Bulk operations
- User role management
- Verification status control
- System health monitoring

**Protected**: Requires authentication + Admin role

---

### 6. Session Management API

<div align="center">

#### 🎫 **[View Session Documentation](https://documenter.getpostman.com/view/38185839/2sBXcDG282)**

</div>

**Endpoints Included:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sessions` | Get all active sessions |
| `GET` | `/sessions/current` | Get current session info |
| `GET` | `/sessions/stats` | Get session statistics |
| `DELETE` | `/sessions/:id` | Revoke specific session |
| `DELETE` | `/sessions/other` | Logout from other devices |
| `DELETE` | `/sessions/all` | Revoke all sessions |

**Features:**
- Multi-device session tracking
- Session analytics (device, IP, location)
- Instant session revocation
- Token blacklisting
- Session statistics
- Security monitoring
- Login history
- Device management

**Protected**: Requires authentication

---

## 📥 Importing Collections

### Import from Postman Links

1. **Click any documentation link above**
2. **Click "Run in Postman" button**
3. **Collection auto-imports to your Postman workspace**

### Manual Import

```bash
# Method 1: From URL
1. Open Postman
2. Click "Import"
3. Paste documentation URL
4. Click "Import"

# Method 2: From File (if exported)
1. Download .json collection file
2. Open Postman
3. Click "Import"
4. Select file
5. Click "Import"
```

---

## ⚙️ Environment Setup

### Postman Environment Variables

Create a new environment in Postman with these variables:

```json
{
  "base_url": "http://localhost:3000/api/v1",
  "token": "",
  "user_id": "",
  "task_id": "",
  "notification_id": "",
  "admin_token": ""
}
```

### Auto-Configuration

Most collections include **test scripts** that automatically:
- Extract and save JWT tokens
- Store user IDs
- Save resource IDs
- Update environment variables

### Example Test Script

```javascript
// Automatically save token after login
pm.test("Save token", function () {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
});
```

---

## 📝 Common Request Examples

### Authentication Flow

#### 1. Register New User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "johndoe",
  "fullName": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### 2. Verify OTP

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Task Management

#### Create Task

```http
POST /api/v1/tasks
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "category": "work",
  "priority": "high",
  "status": "pending",
  "dueDate": "2026-02-20T10:00:00.000Z"
}
```

#### Get Tasks with Filters

```http
GET /api/v1/tasks?status=pending&priority=high&page=1&limit=10
Authorization: Bearer <your-token>
```

### Admin Operations

#### Get System Statistics

```http
GET /api/v1/admin/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "verifiedUsers": 980,
    "totalTasks": 5430,
    "completedTasks": 3210,
    "pendingTasks": 1520,
    "inProgressTasks": 700
  }
}
```

---

## 📤 Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created |
| `400` | Bad Request | Invalid input |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `422` | Unprocessable Entity | Validation errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

### Common Error Examples

#### Validation Error (422)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

#### Authentication Error (401)

```json
{
  "success": false,
  "message": "Invalid or expired token. Please log in again."
}
```

#### Authorization Error (403)

```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

---

## 🚦 Rate Limiting

### Rate Limits

| Endpoint Type | Requests | Window | Headers |
|--------------|----------|---------|---------|
| **General** | 100 | 15 min | `X-RateLimit-*` |
| **Auth** | 10 | 15 min | `X-RateLimit-*` |
| **Password Reset** | 3 | 15 min | `X-RateLimit-*` |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645123456
```

### Rate Limit Exceeded

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

---

## 🔄 Changelog

### Version 1.0.0 (Current)

**Released:** February 17, 2026

**New Features:**
- ✅ Complete REST API with JWT authentication
- ✅ OAuth 2.0 integration (Google, GitHub)
- ✅ Task management CRUD operations
- ✅ Real-time notification system
- ✅ Admin panel with RBAC
- ✅ Session management API
- ✅ Profile management
- ✅ Image upload via ImageKit CDN
- ✅ Comprehensive Postman documentation

**Security:**
- JWT-based authentication
- Session token blacklisting
- Rate limiting on all endpoints
- Input validation and sanitization
- XSS and NoSQL injection prevention
- Secure password hashing (bcrypt)

**Performance:**
- Redis caching (80% DB load reduction)
- Optimized database queries
- Connection pooling
- Response compression

---

## 🔗 Related Documentation

- **[Main README](README.md)** - Project overview and setup
- **[Backend README](backend/README.md)** - Backend architecture and setup
- **[Frontend README](frontend/README.md)** - Frontend architecture and components
- **[Scalability Guide](SCALABILITY.md)** - Scaling strategies and architecture
- **[Postman Workspace](https://cipher-squad.postman.co/workspace/1c4355f7-6b47-42bf-9abc-c27ee3908c7e)** - All API collections

---

## 📞 Support

### Need Help?

- 📚 **Documentation**: Read the comprehensive guides above
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Aditya-KumarJha/Taskco/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/Aditya-KumarJha/Taskco/discussions)
- 📧 **Email**: support@taskco.com

### Contributing

Found an issue or want to improve the API?
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

<div align="center">

**📖 Comprehensive API Documentation for Developers**

[⬆ Back to Top](#taskco-api-documentation)

**Built with ❤️ by [Aditya Kumar Jha](https://github.com/Aditya-KumarJha)**

**© 2026 Taskco. All rights reserved.**

</div>
