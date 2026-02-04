# Taskco Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

A powerful and scalable RESTful API backend for Taskco - a modern task management application with authentication, profile management, notifications, and OAuth integration.

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Scripts](#-scripts)
- [Folder Structure Details](#-folder-structure-details)
- [Contributing](#-contributing)

---

## ✨ Features

### Authentication & Authorization
- 🔐 **JWT-based Authentication** - Secure token-based authentication
- 📧 **OTP Verification** - Email OTP for registration and login
- 🔑 **OAuth Integration** - Google and GitHub OAuth 2.0
- 🔄 **Password Reset** - Secure password recovery flow
- 🍪 **Cookie Management** - HTTPOnly cookies for token storage

### Profile Management
- 👤 **User Profiles** - Complete user profile CRUD operations
- 🖼️ **Image Upload** - Profile avatar upload via ImageKit CDN
- ✏️ **Profile Updates** - Update user information and preferences

### Task Management
- ✅ **CRUD Operations** - Create, Read, Update, Delete tasks
- 🏷️ **Task Categorization** - Status, priority, and category filters
- 📎 **File Attachments** - Task image attachments via ImageKit
- 🔍 **Search & Filter** - Advanced filtering and pagination
- 📊 **Task Statistics** - Track task counts by status

### Notifications
- 🔔 **Real-time Notifications** - RabbitMQ-based notification system
- 📬 **Notification Types** - Task assignments, updates, mentions
- ✓ **Read/Unread Status** - Mark notifications as read
- 🗑️ **Notification Management** - Delete and manage notifications

### Additional Features
- 🛡️ **Security** - Helmet.js, CORS, rate limiting
- 📝 **Logging** - Winston logger for debugging and monitoring
- ✉️ **Email Service** - Nodemailer for transactional emails
- 🔄 **Message Queue** - RabbitMQ for async processing
- ☁️ **CDN Integration** - ImageKit for media storage
- 🧪 **Testing** - Comprehensive Jest test suite
- 📚 **API Validation** - Express-validator for input validation

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime Environment | 18+ |
| **Express.js** | Web Framework | 4.18.2 |
| **MongoDB** | Database | 8.0.3 |
| **Mongoose** | ODM | 8.0.3 |
| **JWT** | Authentication | 9.0.2 |
| **Passport.js** | OAuth Strategies | 0.7.0 |
| **RabbitMQ** | Message Broker | amqplib 0.10.3 |
| **ImageKit** | Media CDN | 2.0.1 |
| **Nodemailer** | Email Service | 6.9.7 |
| **Winston** | Logging | 3.11.0 |
| **Jest** | Testing Framework | Latest |
| **Multer** | File Upload | 1.4.5-lts.1 |
| **Bcrypt** | Password Hashing | 2.4.3 |
| **Helmet** | Security | 7.1.0 |
| **CORS** | Cross-Origin | 2.8.5 |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── broker/                   # RabbitMQ message broker
│   │   ├── broker.js            # Broker connection & channels
│   │   └── notification.consumer.js  # Notification queue consumer
│   ├── config/                   # Configuration files
│   │   ├── db.js                # MongoDB connection
│   │   ├── imagekit.js          # ImageKit configuration
│   │   └── passport.js          # Passport OAuth strategies
│   ├── controllers/              # Route controllers (business logic)
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── notification.controller.js  # Notifications logic
│   │   ├── profile.controller.js      # Profile management
│   │   └── task.controller.js   # Task CRUD operations
│   ├── middlewares/              # Custom middlewares
│   │   ├── auth.middleware.js   # JWT authentication
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── rateLimiter.js       # Rate limiting
│   │   ├── upload.js            # Multer upload config
│   │   ├── upload.middleware.js # Upload validation
│   │   └── validate.js          # Validation middleware
│   ├── models/                   # Mongoose schemas
│   │   ├── notification.model.js # Notification schema
│   │   ├── task.model.js        # Task schema
│   │   └── user.model.js        # User schema
│   ├── routes/                   # API routes
│   │   ├── auth.routes.js       # /api/auth routes
│   │   ├── notification.routes.js # /api/notifications routes
│   │   ├── profile.routes.js    # /api/profile routes
│   │   ├── task.routes.js       # /api/tasks routes
│   │   └── index.js             # Route aggregator
│   ├── services/                 # Business services
│   │   ├── auth.service.js      # Auth business logic
│   │   ├── email.service.js     # Email sending service
│   │   ├── imagekit.service.js  # ImageKit operations
│   │   └── mail.service.js      # Mail templates
│   ├── utils/                    # Utility functions
│   │   ├── ApiError.js          # Custom error class
│   │   ├── asyncHandler.js      # Async error wrapper
│   │   ├── generate.otp.js      # OTP generation
│   │   └── logger.js            # Winston logger config
│   └── validations/              # Request validators
│       ├── auth.validator.js    # Auth validation rules
│       ├── profile.validatior.js # Profile validation
│       └── taskValidation.js    # Task validation
├── tests/                        # Test suites
│   ├── auth.test.js             # Auth endpoint tests
│   ├── notification.test.js     # Notification tests
│   ├── profile.test.js          # Profile tests
│   ├── tasks.test.js            # Task tests
│   ├── db-handler.js            # Test DB setup
│   └── setup.js                 # Test configuration
├── scripts/                      # Utility scripts
│   ├── seed.js                  # Database seeding
│   └── clear-db.js              # Clear database
├── coverage/                     # Test coverage reports
├── uploads/                      # Temporary file uploads
├── server.js                     # Application entry point
├── package.json                  # Dependencies
├── jest.config.js               # Jest configuration
├── Dockerfile                    # Docker container config
└── docker-compose.yml           # Docker services setup
```

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (v6.0 or higher) - Local or Atlas
- **RabbitMQ** (v3.11 or higher) - Local or Cloud
- **ImageKit Account** - For media CDN
- **Google OAuth Credentials** - For Google login
- **GitHub OAuth App** - For GitHub login
- **SMTP Email Account** - For sending emails

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Aditya-KumarJha/Taskco.git
cd Taskco/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the backend directory (see [Environment Variables](#-environment-variables) section):

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials.

### 4. Start MongoDB and RabbitMQ

**Using Docker Compose:**
```bash
docker-compose up -d
```

**Or manually:**
- Start MongoDB: `mongod`
- Start RabbitMQ: `rabbitmq-server`

---

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/taskco
MONGODB_TEST_URI=mongodb://localhost:27017/taskco-test

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Frontend URL (for OAuth redirects)
CLIENT_URL=http://localhost:5173

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@taskco.com

# ImageKit CDN
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
NOTIFICATION_QUEUE=notifications

# Security
BCRYPT_SALT_ROUNDS=10
OTP_EXPIRE_MINUTES=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development`, `production`, `test` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/taskco` |
| `JWT_SECRET` | Secret key for JWT signing | Random 64-char string |
| `JWT_EXPIRE` | JWT expiration time | `7d`, `24h`, `60m` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | From Google Console |
| `GITHUB_CLIENT_ID` | GitHub OAuth app ID | From GitHub Settings |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | From GitHub Settings |
| `CLIENT_URL` | Frontend application URL | `http://localhost:5173` |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_USER` | SMTP username/email | `your-email@gmail.com` |
| `EMAIL_PASS` | SMTP password/app password | Gmail app password |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | From ImageKit dashboard |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key | From ImageKit dashboard |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit CDN endpoint | `https://ik.imagekit.io/xxx` |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://localhost:5672` |

---

## 🏃 Running the Application

### Development Mode

Start the server with auto-reload on file changes:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your specified PORT).

### Production Mode

```bash
npm start
```

### Using Docker

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f api
```

---

## 📚 API Documentation

### Postman Collections

Complete API documentation is available via Postman:

#### 📦 **Complete Collection**
[View Complete API Documentation](https://documenter.getpostman.com/view/XXXXXXXX/XXXXXXXXXX)

#### Individual Collections:

1. **🔐 Authentication API**
   - [View Auth Documentation](https://documenter.getpostman.com/view/38185839/2sBXc7M4kf)
   - Endpoints: Registration, Login, OAuth, Password Reset

2. **👤 Profile API**
   - [View Profile Documentation](https://documenter.getpostman.com/view/XXXXXXXX/XXXXXXXXXX)
   - Endpoints: Get Profile, Update Profile, Upload Avatar

3. **✅ Tasks API**
   - [View Tasks Documentation](https://documenter.getpostman.com/view/XXXXXXXX/XXXXXXXXXX)
   - Endpoints: CRUD operations, Filtering, Pagination

4. **🔔 Notifications API**
   - [View Notifications Documentation](https://documenter.getpostman.com/view/XXXXXXXX/XXXXXXXXXX)
   - Endpoints: Get Notifications, Mark as Read, Delete

---

### API Endpoints Overview

#### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user with email | ❌ |
| POST | `/verify-register-otp` | Verify registration OTP | ❌ |
| POST | `/resend-otp` | Resend OTP to email | ❌ |
| POST | `/login` | Login with email/password | ❌ |
| POST | `/verify-login-otp` | Verify login OTP | ❌ |
| POST | `/forgot-password` | Request password reset | ❌ |
| POST | `/verify-forgot-password-otp` | Verify reset OTP | ❌ |
| POST | `/reset-password` | Reset password with token | ❌ |
| GET | `/google` | Initiate Google OAuth | ❌ |
| GET | `/google/callback` | Google OAuth callback | ❌ |
| GET | `/github` | Initiate GitHub OAuth | ❌ |
| GET | `/github/callback` | GitHub OAuth callback | ❌ |
| GET | `/me` | Get current user | ✅ |
| POST | `/logout` | Logout user | ✅ |

**Authentication Details:**

- **Register**: Send `fullName`, `email`, `password`
- **Verify OTP**: Submit `email`, `otp` received via email
- **Login**: Supports email/password with OTP verification
- **OAuth**: Redirect-based Google/GitHub authentication
- **Password Reset**: Three-step process (request → verify → reset)

#### Profile Routes (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get current user profile | ✅ |
| PATCH | `/` | Update profile & upload avatar | ✅ |

**Profile Fields:**
- `fullName`: User's display name
- `email`: User's email (verified)
- `bio`: Profile biography
- `avatar`: Profile picture URL
- `createdAt`: Account creation date

#### Task Routes (`/api/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all user tasks (with filters) | ✅ |
| POST | `/` | Create new task | ✅ |
| GET | `/:id` | Get single task by ID | ✅ |
| PATCH | `/:id` | Update task by ID | ✅ |
| DELETE | `/:id` | Delete task by ID | ✅ |

**Query Parameters for GET `/tasks`:**
- `status`: Filter by status (`pending`, `in-progress`, `completed`)
- `priority`: Filter by priority (`low`, `medium`, `high`)
- `category`: Filter by category
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (e.g., `-createdAt`, `dueDate`)

**Task Schema:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "status": "pending | in-progress | completed",
  "priority": "low | medium | high",
  "category": "work | personal | shopping | health | other",
  "dueDate": "2026-12-31T23:59:59.000Z",
  "image": "https://ik.imagekit.io/...",
  "createdBy": "userId"
}
```

#### Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all user notifications | ✅ |
| PATCH | `/:id/read` | Mark notification as read | ✅ |
| PATCH | `/read-all` | Mark all as read | ✅ |
| DELETE | `/:id` | Delete notification | ✅ |

**Notification Types:**
- `TASK_ASSIGNED`: Task assigned to user
- `TASK_UPDATED`: Task status/details changed
- `TASK_DELETED`: Task was deleted
- `TASK_MENTIONED`: User mentioned in task
- `SYSTEM`: System notifications

---

## 🗄️ Database Schema

### User Model

```javascript
{
  fullName: String,          // User's full name
  email: String,             // Unique email (indexed)
  password: String,          // Hashed password (OAuth users may not have)
  avatar: String,            // Profile picture URL
  bio: String,               // User biography
  provider: String,          // 'local' | 'google' | 'github'
  providerId: String,        // OAuth provider ID
  isVerified: Boolean,       // Email verification status
  otp: String,               // Current OTP (expires)
  otpExpires: Date,          // OTP expiration timestamp
  otpType: String,           // 'register' | 'login' | 'reset'
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model

```javascript
{
  title: String,             // Task title (required)
  description: String,       // Task description
  status: String,            // 'pending' | 'in-progress' | 'completed'
  priority: String,          // 'low' | 'medium' | 'high'
  category: String,          // 'work' | 'personal' | 'shopping' | 'health' | 'other'
  dueDate: Date,             // Task due date
  image: String,             // Task attachment URL
  createdBy: ObjectId,       // Reference to User (indexed)
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model

```javascript
{
  user: ObjectId,            // Reference to User (indexed)
  type: String,              // Notification type
  title: String,             // Notification title
  message: String,           // Notification message
  relatedTask: ObjectId,     // Reference to Task (optional)
  isRead: Boolean,           // Read status
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Test Coverage

```bash
npm test
# Coverage report will be generated in /coverage directory
```

### View Coverage Report

```bash
open coverage/lcov-report/index.html
```

### Test Files

- `auth.test.js` - Authentication endpoint tests
- `profile.test.js` - Profile management tests
- `tasks.test.js` - Task CRUD operation tests
- `notification.test.js` - Notification system tests

**Test Environment:**
- Uses separate MongoDB test database
- MongoDB Memory Server for isolated testing
- Automatic cleanup after each test suite
- Mock RabbitMQ connections
- JWT token generation for protected routes

---

## 📜 Scripts

| Command | Description | Usage |
|---------|-------------|-------|
| `npm start` | Start production server | Production deployment |
| `npm run dev` | Start development server with nodemon | Local development |
| `npm test` | Run test suite with coverage | CI/CD, Testing |
| `npm run test:watch` | Run tests in watch mode | Development testing |
| `npm run lint` | Run ESLint on source code | Code quality check |
| `npm run seed` | Seed database with sample data | Development setup |
| `npm run seed:dev` | Seed with NODE_ENV=development | Specific env seeding |
| `npm run clear-db` | Clear all database collections | Reset database |

### Script Details

#### Development Scripts

**`npm run dev`**
- Starts server with nodemon
- Auto-restarts on file changes
- Enables debug logging
- Connects to development database

**`npm run seed`**
- Creates sample users
- Generates sample tasks
- Creates test notifications
- Useful for development and demo

**`npm run clear-db`**
- Drops all collections
- Resets database to clean state
- Use with caution!

#### Production Scripts

**`npm start`**
- Starts optimized production server
- No auto-reload
- Production-level logging
- Performance optimizations enabled

#### Testing Scripts

**`npm test`**
- Runs all Jest test suites
- Generates coverage report
- Uses test database
- Forces exit after completion

**`npm run test:watch`**
- Interactive test runner
- Re-runs on file changes
- Useful for TDD workflow

---

## 📂 Folder Structure Details

### `/src/broker`
**RabbitMQ Integration**
- `broker.js`: Establishes RabbitMQ connection, creates channels, and provides publish functions
- `notification.consumer.js`: Consumes notification messages and creates database records

**Use Case**: Async notification delivery, email queue, task processing

### `/src/config`
**Configuration Management**
- `db.js`: MongoDB connection with retry logic and error handling
- `imagekit.js`: ImageKit CDN initialization for media uploads
- `passport.js`: OAuth strategies for Google and GitHub authentication

### `/src/controllers`
**Request Handlers**
- `auth.controller.js`: Registration, login, OAuth, password reset logic
- `profile.controller.js`: Profile retrieval and update operations
- `task.controller.js`: Task CRUD operations with validation
- `notification.controller.js`: Notification management endpoints

**Pattern**: Each controller contains business logic and response handling

### `/src/middlewares`
**Request Processing**
- `auth.middleware.js`: JWT token verification for protected routes
- `errorHandler.js`: Global error catching and formatting
- `rateLimiter.js`: API rate limiting to prevent abuse
- `upload.js`: Multer configuration for file uploads
- `upload.middleware.js`: File upload validation (size, type)
- `validate.js`: Express-validator error aggregation

### `/src/models`
**Database Schemas**
- Mongoose models with validation
- Indexes for query optimization
- Virtual fields and methods
- Pre/post save hooks

### `/src/routes`
**API Routing**
- Route definitions
- Middleware chaining
- Validation integration
- `index.js`: Aggregates all routes to `/api`

### `/src/services`
**Business Logic**
- `auth.service.js`: Token generation, password hashing
- `email.service.js`: Email sending via Nodemailer
- `imagekit.service.js`: Image upload, delete, URL generation
- `mail.service.js`: Email templates (OTP, welcome, reset)

### `/src/utils`
**Helper Functions**
- `ApiError.js`: Custom error class with status codes
- `asyncHandler.js`: Wraps async functions to catch errors
- `generate.otp.js`: Generates random 6-digit OTP
- `logger.js`: Winston logger configuration

### `/src/validations`
**Input Validation**
- Express-validator rules
- Custom validators
- Sanitization functions
- Error message formatting

### `/tests`
**Test Suites**
- Integration tests for each API module
- Database setup/teardown
- Mock data generators
- Coverage reporting

### `/scripts`
**Utility Scripts**
- Database seeding for development
- Database cleanup
- Migration scripts

---

## 🔒 Security Features

- **Helmet.js**: Sets security HTTP headers
- **CORS**: Configured for frontend origin
- **Rate Limiting**: Prevents brute force attacks
- **JWT**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Prevents injection attacks
- **File Upload Validation**: Type and size restrictions
- **HTTPOnly Cookies**: XSS protection
- **Environment Variables**: Sensitive data protection

---

## 🚀 Deployment

### Docker Deployment

```bash
docker build -t taskco-backend .
docker run -p 3000:3000 --env-file .env taskco-backend
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure MongoDB Atlas or production DB
- [ ] Set up CloudAMQP or RabbitMQ Cloud
- [ ] Configure production email service
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring (PM2, NewRelic)
- [ ] Configure log rotation
- [ ] Set up backup strategy
- [ ] Configure CDN for static assets

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 👨‍💻 Author

**Aditya Kumar Jha**
- GitHub: [@Aditya-KumarJha](https://github.com/Aditya-KumarJha)
- Repository: [Taskco](https://github.com/Aditya-KumarJha/Taskco)

---

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB for the powerful database
- RabbitMQ for reliable message queuing
- ImageKit for CDN services
- All open-source contributors

---

<div align="center">

**Made with ❤️ for the developer community**

[Report Bug](https://github.com/Aditya-KumarJha/Taskco/issues) · [Request Feature](https://github.com/Aditya-KumarJha/Taskco/issues)

</div>
