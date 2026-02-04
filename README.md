# Taskco - Modern Task Management Application

<div align="center">

![Taskco Banner](frontend/public/img/entrance.avif)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-brightgreen.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**A powerful, full-stack task management application with beautiful UI, real-time notifications, and OAuth authentication**

[Live Demo](#) | [Documentation](#-documentation) | [Report Bug](https://github.com/Aditya-KumarJha/Taskco/issues) | [Request Feature](https://github.com/Aditya-KumarJha/Taskco/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo Screenshots](#-demo-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
- [API Routes & Endpoints](#-api-routes--endpoints)
- [Frontend Features](#-frontend-features)
- [Backend Services](#-backend-services)
- [Database Schema](#-database-schema)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🌟 Overview

**Taskco** is a comprehensive, production-ready task management application built with modern web technologies. It features a beautiful, responsive UI, secure authentication with OAuth support, real-time notifications, and a robust RESTful API backend.

### What Makes Taskco Special?

- ✨ **Modern UI/UX** - Beautiful, intuitive interface with smooth animations
- 🔐 **Enterprise-grade Security** - JWT authentication, OAuth integration, rate limiting
- 🚀 **High Performance** - Optimized builds, code splitting, lazy loading
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- 🔔 **Real-time Notifications** - RabbitMQ-powered async notification system
- ☁️ **CDN Integration** - ImageKit for optimized media delivery
- 🧪 **Well Tested** - Comprehensive test coverage with Jest
- 📚 **Complete Documentation** - Detailed docs for API and features

---

## ✨ Features

### 🎯 Core Functionality

#### Task Management
- ✅ Create, read, update, and delete tasks
- 📊 Task categorization (Work, Personal, Shopping, Health, Other)
- 🎯 Priority levels (Low, Medium, High)
- 📈 Status tracking (Pending, In Progress, Completed)
- 📅 Due date management with calendar picker
- 🖼️ Image attachments via ImageKit CDN
- 🔍 Advanced search and filtering
- 📄 Pagination for large task lists
- 📊 Task statistics and analytics dashboard

#### Authentication & Authorization
- 🔐 JWT-based secure authentication
- 📧 Email/Password registration with OTP verification
- 🔑 OAuth 2.0 integration (Google, GitHub)
- 🔄 Forgot password with email OTP reset
- 🍪 HTTPOnly cookies for token security
- 👥 Protected routes and role-based access
- ⏱️ Session management with auto-logout
- 🔒 Password encryption with bcrypt

#### Profile Management
- 👤 View and edit user profiles
- 🖼️ Profile avatar upload to ImageKit
- ✏️ Update personal information
- 📊 Account statistics and insights
- 🎨 Customizable user preferences

#### Notification System
- 🔔 Real-time notifications via RabbitMQ
- 📬 Notification types: Task assignments, updates, mentions
- ✓ Mark as read/unread functionality
- 🗑️ Delete notifications
- 🔢 Unread count badge
- 📲 Push notification support (future)

#### Additional Features
- 🎨 Beautiful landing page with GSAP animations
- 📱 Responsive design for all devices
- 🌙 Dark mode support (coming soon)
- 🔊 Sound effects and audio feedback
- 📊 Analytics and usage statistics
- 🌐 SEO optimized
- ♿ Accessibility features
- 🚀 Progressive Web App (PWA) capabilities

---

## 📸 Demo Screenshots

### Landing Page
![Taskco Homepage](frontend/public/img/demo/demo-1.png)
*Engaging landing page with smooth animations and modern design*

### Dashboard
![Task Dashboard](frontend/public/img/demo/demo-2.png)
*Comprehensive dashboard with task statistics and quick actions*

### Task Management
![Task Management](frontend/public/img/demo/demo-3.png)
*Intuitive task creation with categories, priorities, and image uploads*

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Library | 18.3.1 |
| **Vite** | Build Tool | 5.4.10 |
| **React Router** | Routing | 6.14.1 |
| **Redux Toolkit** | State Management | 2.2.1 |
| **TailwindCSS** | Styling | 3.4.14 |
| **GSAP** | Animations | 3.12.5 |
| **Framer Motion** | React Animations | 12.31.0 |
| **Lottie React** | JSON Animations | 2.4.1 |
| **React Icons** | Icons | 5.3.0 |
| **Lucide React** | Modern Icons | 0.263.1 |
| **React Toastify** | Notifications | 10.0.4 |
| **date-fns** | Date Formatting | 4.1.0 |
| **Axios** | HTTP Client | Latest |

### Backend

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime | 18+ |
| **Express.js** | Web Framework | 4.18.2 |
| **MongoDB** | Database | 8.0.3 |
| **Mongoose** | ODM | 8.0.3 |
| **JWT** | Authentication | 9.0.2 |
| **Passport.js** | OAuth | 0.7.0 |
| **RabbitMQ** | Message Broker | amqplib 0.10.3 |
| **ImageKit** | CDN | 2.0.1 |
| **Nodemailer** | Email | 6.9.7 |
| **Winston** | Logging | 3.11.0 |
| **Jest** | Testing | Latest |
| **Bcrypt** | Encryption | 2.4.3 |
| **Helmet** | Security | 7.1.0 |

### DevOps & Tools

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 📁 Project Structure

```
Taskco/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── app.js             # Express app configuration
│   │   ├── broker/            # RabbitMQ message queue
│   │   │   ├── broker.js              # Message broker setup
│   │   │   └── notification.consumer.js  # Notification consumer
│   │   ├── config/            # Configuration files
│   │   │   ├── db.js                  # MongoDB connection
│   │   │   ├── imagekit.js            # ImageKit CDN config
│   │   │   └── passport.js            # OAuth strategies
│   │   ├── controllers/       # Request handlers
│   │   │   ├── auth.controller.js     # Authentication logic
│   │   │   ├── notification.controller.js  # Notifications
│   │   │   ├── profile.controller.js  # User profiles
│   │   │   └── task.controller.js     # Task CRUD
│   │   ├── middlewares/       # Custom middlewares
│   │   │   ├── auth.middleware.js     # JWT verification
│   │   │   ├── errorHandler.js        # Global error handler
│   │   │   ├── rateLimiter.js         # Rate limiting
│   │   │   ├── upload.js              # File upload config
│   │   │   ├── upload.middleware.js   # Upload validation
│   │   │   └── validate.js            # Request validation
│   │   ├── models/            # Database schemas
│   │   │   ├── notification.model.js  # Notification schema
│   │   │   ├── task.model.js          # Task schema
│   │   │   └── user.model.js          # User schema
│   │   ├── routes/            # API routes
│   │   │   ├── auth.routes.js         # /api/auth
│   │   │   ├── notification.routes.js # /api/notifications
│   │   │   ├── profile.routes.js      # /api/profile
│   │   │   ├── task.routes.js         # /api/tasks
│   │   │   └── index.js               # Route aggregator
│   │   ├── services/          # Business logic
│   │   │   ├── auth.service.js        # Auth operations
│   │   │   ├── email.service.js       # Email sending
│   │   │   ├── imagekit.service.js    # Image upload
│   │   │   └── mail.service.js        # Email templates
│   │   ├── utils/             # Utility functions
│   │   │   ├── ApiError.js            # Custom error class
│   │   │   ├── asyncHandler.js        # Async wrapper
│   │   │   ├── generate.otp.js        # OTP generation
│   │   │   └── logger.js              # Winston logger
│   │   └── validations/       # Input validators
│   │       ├── auth.validator.js      # Auth validation
│   │       ├── profile.validatior.js  # Profile validation
│   │       └── taskValidation.js      # Task validation
│   ├── tests/                 # Test suites
│   │   ├── auth.test.js              # Auth tests
│   │   ├── notification.test.js      # Notification tests
│   │   ├── profile.test.js           # Profile tests
│   │   ├── tasks.test.js             # Task tests
│   │   ├── db-handler.js             # Test DB setup
│   │   └── setup.js                  # Test config
│   ├── scripts/               # Utility scripts
│   │   ├── seed.js                   # Database seeding
│   │   └── clear-db.js               # Clear database
│   ├── coverage/              # Test coverage reports
│   ├── uploads/               # Temporary uploads
│   ├── server.js              # Entry point
│   ├── package.json           # Dependencies
│   ├── jest.config.js         # Jest config
│   ├── Dockerfile             # Docker image
│   ├── docker-compose.yml     # Docker services
│   ├── .env.example           # Environment template
│   └── README.md              # Backend docs
│
├── frontend/                  # React frontend
│   ├── public/
│   │   ├── audio/            # Sound effects
│   │   ├── fonts/            # Custom fonts
│   │   ├── img/              # Images
│   │   │   ├── about.avif
│   │   │   ├── desk.avif
│   │   │   ├── entrance.avif
│   │   │   ├── notebook.avif
│   │   │   └── demo/         # Screenshots
│   │   │       ├── demo-1.png
│   │   │       ├── demo-2.png
│   │   │       └── demo-3.png
│   │   └── videos/           # Video assets
│   ├── src/
│   │   ├── assets/           # Static assets
│   │   ├── components/       # React components
│   │   │   ├── About.jsx             # About section
│   │   │   ├── Contact.jsx           # Contact form
│   │   │   ├── Features.jsx          # Features showcase
│   │   │   ├── Footer.jsx            # Footer
│   │   │   ├── Hero.jsx              # Hero section
│   │   │   ├── Navbar.jsx            # Navigation
│   │   │   ├── Story.jsx             # Story section
│   │   │   ├── animations/           # Animation components
│   │   │   ├── auth/                 # Auth components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── SignupForm.jsx
│   │   │   │   ├── OTPVerification.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── SocialAuth.jsx
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   │   ├── DashboardHeader.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── QuickActions.jsx
│   │   │   │   └── RecentTasks.jsx
│   │   │   ├── notifications/        # Notification components
│   │   │   │   ├── NotificationList.jsx
│   │   │   │   ├── NotificationItem.jsx
│   │   │   │   └── NotificationBadge.jsx
│   │   │   ├── tasks/                # Task components
│   │   │   │   ├── TaskCard.jsx
│   │   │   │   ├── TaskList.jsx
│   │   │   │   ├── TaskForm.jsx
│   │   │   │   ├── TaskFilters.jsx
│   │   │   │   ├── TaskModal.jsx
│   │   │   │   └── TaskStats.jsx
│   │   │   └── ui/                   # Reusable UI
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Badge.jsx
│   │   │       ├── Spinner.jsx
│   │   │       └── Dropdown.jsx
│   │   ├── lottie/           # Lottie animations
│   │   │   ├── animation-1.json
│   │   │   ├── animation-2.json
│   │   │   └── animation-3.json
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── LoginPage.jsx         # Login
│   │   │   ├── SignupPage.jsx        # Registration
│   │   │   ├── Dashboard.jsx         # Dashboard
│   │   │   ├── TaskPage.jsx          # Task list
│   │   │   ├── CreateTaskPage.jsx    # Create task
│   │   │   └── NotificationPage.jsx  # Notifications
│   │   ├── store/            # Redux state
│   │   │   ├── store.js              # Store config
│   │   │   ├── authSlice.js          # Auth state
│   │   │   ├── taskSlice.js          # Task state
│   │   │   └── notificationSlice.js  # Notification state
│   │   ├── utils/
│   │   │   └── api.js                # Axios config
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html            # HTML template
│   ├── package.json          # Dependencies
│   ├── vite.config.js        # Vite config
│   ├── tailwind.config.js    # Tailwind config
│   ├── postcss.config.js     # PostCSS config
│   ├── .env.example          # Environment template
│   └── README.md             # Frontend docs
│
├── .gitignore                # Git ignore rules
├── LICENSE                   # MIT License
└── README.md                 # This file
```

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   React    │  │ Redux/RTK  │  │  Router    │            │
│  │   Vite     │  │  State     │  │  Pages     │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Express.js │  │ Middleware │  │   CORS     │            │
│  │   Routes   │  │   Auth     │  │ Rate Limit │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │Controllers │  │  Services  │  │ Validators │            │
│  │   Auth     │  │   Email    │  │  Express   │            │
│  │   Task     │  │  ImageKit  │  │ Validator  │            │
│  │   Profile  │  │   Mail     │  │            │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  MongoDB   │  │  RabbitMQ  │  │ ImageKit   │            │
│  │  Mongoose  │  │   Queues   │  │    CDN     │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action → React Component → Redux Action → API Call (Axios)
                                                      ↓
Backend Route → Middleware (Auth, Validation) → Controller
                                                      ↓
Service Layer → Database/External API → Response
                                                      ↓
Controller → Format Response → Send to Client
                                                      ↓
Redux State Update → Component Re-render → UI Update
```

### Authentication Flow

```
1. Registration:
   User → Submit Form → Backend → Generate OTP → Email OTP
   User → Verify OTP → Backend → Create User → Send JWT

2. Login:
   User → Submit Credentials → Backend → Verify → Send OTP
   User → Verify OTP → Backend → Generate JWT → Send Token

3. OAuth:
   User → Click OAuth → Provider Auth → Callback → Backend
   Backend → Verify Token → Create/Find User → Send JWT
```

### Notification System

```
Event Trigger → Publish to RabbitMQ Queue
                        ↓
            Consumer Listens to Queue
                        ↓
        Creates Notification in Database
                        ↓
     Frontend Polls/WebSocket (future)
                        ↓
            Display Notification
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v8.0.0 or higher (comes with Node.js)
- **MongoDB** v6.0 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/downloads))

### Optional (but recommended)

- **RabbitMQ** v3.11 or higher ([Download](https://www.rabbitmq.com/download.html))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **MongoDB Compass** - GUI for MongoDB ([Download](https://www.mongodb.com/products/compass))
- **Postman** - API testing ([Download](https://www.postman.com/downloads/))

### External Services (Required)

- **ImageKit Account** - For CDN ([Sign up](https://imagekit.io/registration))
- **Google Cloud Console** - For Google OAuth ([Console](https://console.cloud.google.com/))
- **GitHub Developer** - For GitHub OAuth ([Settings](https://github.com/settings/developers))
- **SMTP Email Account** - Gmail recommended ([Setup](https://support.google.com/mail/answer/185833))

---

## 🚀 Quick Start

Get Taskco up and running in 5 minutes:

### 1. Clone the Repository

```bash
git clone https://github.com/Aditya-KumarJha/Taskco.git
cd Taskco
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

Backend will start on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

Frontend will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

---

## 📖 Detailed Setup

### Step 1: Clone and Install

```bash
# Clone repository
git clone https://github.com/Aditya-KumarJha/Taskco.git
cd Taskco

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Set Up MongoDB

**Option A: Local MongoDB**

```bash
# Start MongoDB service
# macOS (with Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
# Start MongoDB from Services or:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

**Option B: MongoDB Atlas (Cloud)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a cluster
3. Get connection string
4. Use in `.env` as `MONGODB_URI`

### Step 3: Set Up RabbitMQ

**Option A: Local RabbitMQ**

```bash
# macOS (with Homebrew)
brew install rabbitmq
brew services start rabbitmq

# Linux (Debian/Ubuntu)
sudo apt-get install rabbitmq-server
sudo systemctl start rabbitmq-server

# Windows
# Download from https://www.rabbitmq.com/install-windows.html
# Install and start service
```

RabbitMQ Management UI: `http://localhost:15672` (guest/guest)

**Option B: CloudAMQP (Cloud)**

1. Sign up at [CloudAMQP](https://www.cloudamqp.com/)
2. Create instance
3. Get AMQP URL
4. Use in `.env` as `RABBITMQ_URL`

### Step 4: Set Up ImageKit

1. Sign up at [ImageKit](https://imagekit.io/registration)
2. Go to Dashboard → Developer
3. Copy:
   - Public Key
   - Private Key
   - URL Endpoint
4. Add to `.env` file

### Step 5: Configure OAuth

**Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

**GitHub OAuth:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID and Secret to `.env`

### Step 6: Configure Email (Gmail)

1. Enable 2-Factor Authentication on Gmail
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create app password for "Mail"
4. Use this password in `.env` as `EMAIL_PASS`

### Step 7: Configure Environment Variables

**Backend `.env`:**

```bash
cd backend
cp .env.example .env
nano .env  # or use your favorite editor
```

Fill in all required values (see [Environment Configuration](#-environment-configuration) section)

**Frontend `.env`:**

```bash
cd ../frontend
cp .env.example .env
nano .env
```

Update `VITE_API_URL` to `http://localhost:3000/api`

### Step 8: Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates sample users and tasks for testing.

### Step 9: Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### Step 10: Access Application

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000/api`
- **RabbitMQ Management**: `http://localhost:15672`
- **MongoDB Compass**: `mongodb://localhost:27017/taskco`

---

## 🌐 API Routes & Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/verify-register-otp` | Verify registration OTP | ❌ |
| POST | `/resend-otp` | Resend OTP email | ❌ |
| POST | `/login` | Login with credentials | ❌ |
| POST | `/verify-login-otp` | Verify login OTP | ❌ |
| POST | `/forgot-password` | Request password reset | ❌ |
| POST | `/verify-forgot-password-otp` | Verify reset OTP | ❌ |
| POST | `/reset-password` | Reset password | ❌ |
| GET | `/google` | Google OAuth login | ❌ |
| GET | `/google/callback` | Google OAuth callback | ❌ |
| GET | `/github` | GitHub OAuth login | ❌ |
| GET | `/github/callback` | GitHub OAuth callback | ❌ |
| GET | `/me` | Get current user | ✅ |
| POST | `/logout` | Logout user | ✅ |

### Profile Routes (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user profile | ✅ |
| PATCH | `/` | Update profile & avatar | ✅ |

### Task Routes (`/api/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all tasks (with filters) | ✅ |
| POST | `/` | Create new task | ✅ |
| GET | `/:id` | Get task by ID | ✅ |
| PATCH | `/:id` | Update task | ✅ |
| DELETE | `/:id` | Delete task | ✅ |

**Query Parameters for GET `/tasks`:**
- `status`: `pending | in-progress | completed`
- `priority`: `low | medium | high`
- `category`: `work | personal | shopping | health | other`
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (e.g., `-createdAt`, `dueDate`)
- `search`: Search in title/description

### Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all notifications | ✅ |
| PATCH | `/:id/read` | Mark as read | ✅ |
| PATCH | `/read-all` | Mark all as read | ✅ |
| DELETE | `/:id` | Delete notification | ✅ |

---

## 🎨 Frontend Features

### Pages & Routes

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/` | Home | Landing page | ❌ |
| `/login` | LoginPage | User login | ❌ |
| `/signup` | SignupPage | Registration | ❌ |
| `/dashboard` | Dashboard | Main dashboard | ✅ |
| `/tasks` | TaskPage | Task list | ✅ |
| `/tasks/create` | CreateTaskPage | Create task | ✅ |
| `/notifications` | NotificationPage | Notifications | ✅ |

### Component Categories

**Landing Page Components:**
- `Hero`: Animated hero section with call-to-action
- `Features`: Feature showcase with icons and descriptions
- `About`: About section with team/product info
- `Story`: Product story and journey
- `Contact`: Contact form for inquiries
- `Footer`: Site footer with links

**Authentication Components:**
- `LoginForm`: Email/password login form
- `SignupForm`: Registration form with validation
- `OTPVerification`: OTP input and verification
- `ForgotPassword`: Password reset flow
- `SocialAuth`: OAuth buttons for Google/GitHub

**Dashboard Components:**
- `DashboardHeader`: Header with user info and actions
- `StatCard`: Statistics display cards
- `QuickActions`: Quick action buttons
- `RecentTasks`: Recent tasks widget

**Task Components:**
- `TaskCard`: Individual task card display
- `TaskList`: Scrollable task list with pagination
- `TaskForm`: Create/edit task form with validation
- `TaskFilters`: Filter controls (status, priority, category)
- `TaskModal`: Task details modal dialog
- `TaskStats`: Task statistics charts and graphs

**Notification Components:**
- `NotificationList`: All notifications display
- `NotificationItem`: Single notification card
- `NotificationBadge`: Unread count badge

**UI Components (Reusable):**
- `Button`: Customizable button with variants
- `Input`: Form input with validation states
- `Modal`: Reusable modal dialog
- `Card`: Container card component
- `Badge`: Status/label badge
- `Spinner`: Loading spinner
- `Dropdown`: Dropdown menu

### State Management (Redux)

**Auth Slice:**
- Current user information
- Authentication status
- Login/logout actions
- Token management
- OAuth handling

**Task Slice:**
- Task list
- Active filters
- Current task selection
- CRUD operations
- Statistics data

**Notification Slice:**
- Notification list
- Unread count
- Mark as read
- Delete operations

### Animations

**GSAP Animations:**
- Hero section text reveal
- Scroll-triggered animations
- Parallax effects
- Image reveals
- Feature card entrance

**Framer Motion:**
- Page transitions
- Modal animations
- Button hover effects
- List item animations
- Card hover effects

**Lottie Animations:**
- Loading states
- Empty states
- Success confirmations
- Error messages
- Feature illustrations

---

## ⚙️ Backend Services

### Broker Service (`/src/broker`)

**Purpose:** RabbitMQ message queue integration for async operations

**Files:**
- `broker.js`: Establishes RabbitMQ connection and provides publish functions
- `notification.consumer.js`: Consumes notification messages and creates DB records

**Use Cases:**
- Async notification delivery
- Email queue processing
- Task assignment notifications
- Decoupling services

### Config Service (`/src/config`)

**Purpose:** Application configuration and third-party integrations

**Files:**
- `db.js`: MongoDB connection with retry logic and error handling
- `imagekit.js`: ImageKit CDN initialization for media uploads
- `passport.js`: OAuth strategies for Google and GitHub authentication

### Controllers (`/src/controllers`)

**Purpose:** Handle incoming requests and send responses

**Files:**
- `auth.controller.js`: Registration, login, OAuth, password reset
- `profile.controller.js`: Profile retrieval and updates
- `task.controller.js`: Task CRUD operations
- `notification.controller.js`: Notification management

**Pattern:** Controllers call services → services interact with models → return data

### Middlewares (`/src/middlewares`)

**Purpose:** Request preprocessing and validation

**Files:**
- `auth.middleware.js`: JWT token verification for protected routes
- `errorHandler.js`: Global error catching and formatting
- `rateLimiter.js`: API rate limiting to prevent abuse
- `upload.js`: Multer configuration for file uploads
- `upload.middleware.js`: File upload validation (size, type)
- `validate.js`: Express-validator error aggregation

### Models (`/src/models`)

**Purpose:** Database schema definitions

**Files:**
- `user.model.js`: User schema with authentication fields
- `task.model.js`: Task schema with categories and priorities
- `notification.model.js`: Notification schema with types

**Features:**
- Mongoose validation
- Indexes for performance
- Virtual fields
- Pre/post hooks
- Instance methods

### Routes (`/src/routes`)

**Purpose:** API endpoint definitions and middleware chaining

**Files:**
- `auth.routes.js`: Authentication endpoints
- `profile.routes.js`: Profile management endpoints
- `task.routes.js`: Task CRUD endpoints
- `notification.routes.js`: Notification endpoints
- `index.js`: Route aggregator mounting all routes to `/api`

### Services (`/src/services`)

**Purpose:** Business logic and external integrations

**Files:**
- `auth.service.js`: Token generation, password hashing, OTP management
- `email.service.js`: Email sending via Nodemailer SMTP
- `imagekit.service.js`: Image upload, delete, URL generation
- `mail.service.js`: Email templates (OTP, welcome, reset password)

### Utils (`/src/utils`)

**Purpose:** Helper functions and utilities

**Files:**
- `ApiError.js`: Custom error class with HTTP status codes
- `asyncHandler.js`: Wraps async functions to catch errors
- `generate.otp.js`: Generates random 6-digit OTP
- `logger.js`: Winston logger configuration for debugging

### Validations (`/src/validations`)

**Purpose:** Request input validation rules

**Files:**
- `auth.validator.js`: Auth endpoint validation (email, password, OTP)
- `profile.validatior.js`: Profile update validation
- `taskValidation.js`: Task CRUD validation rules

**Features:**
- Express-validator chains
- Custom validators
- Sanitization
- Error message formatting

---

## 🗄️ Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  fullName: String,          // Required, min 2 chars
  email: String,             // Required, unique, validated
  password: String,          // Hashed with bcrypt
  avatar: String,            // ImageKit URL
  bio: String,               // Max 500 chars
  provider: String,          // 'local' | 'google' | 'github'
  providerId: String,        // OAuth provider user ID
  isVerified: Boolean,       // Email verification status
  otp: String,               // Current OTP (temp)
  otpExpires: Date,          // OTP expiration
  otpType: String,           // 'register' | 'login' | 'reset'
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

**Indexes:**
- `email`: Unique index for fast lookup
- `providerId`: For OAuth user lookup

### Task Collection

```javascript
{
  _id: ObjectId,
  title: String,             // Required, max 200 chars
  description: String,       // Max 2000 chars
  status: String,            // 'pending' | 'in-progress' | 'completed'
  priority: String,          // 'low' | 'medium' | 'high'
  category: String,          // 'work' | 'personal' | 'shopping' | 'health' | 'other'
  dueDate: Date,             // Task deadline
  image: String,             // ImageKit URL
  createdBy: ObjectId,       // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `createdBy`: For user task queries
- `status`: For filtering
- `dueDate`: For sorting

### Notification Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,            // Reference to User
  type: String,              // 'TASK_ASSIGNED' | 'TASK_UPDATED' | etc.
  title: String,             // Notification title
  message: String,           // Notification message
  relatedTask: ObjectId,     // Reference to Task (optional)
  isRead: Boolean,           // Read status
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `user`: For user notification queries
- `isRead`: For filtering unread
- `createdAt`: For sorting

---

## 🔧 Environment Configuration

### Backend Environment Variables

See [backend/.env.example](backend/.env.example) for complete list.

**Critical Variables:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/taskco

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ImageKit
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
```

### Frontend Environment Variables

See [frontend/.env.example](frontend/.env.example) for complete list.

**Critical Variables:**

```env
# API
VITE_API_URL=http://localhost:3000/api

# OAuth (must match backend)
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google
VITE_GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github

# Features
VITE_ENABLE_NOTIFICATIONS=true
```

---

## 🏃 Running the Application

### Development Mode

**Start Backend:**

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3000` with auto-reload.

**Start Frontend:**

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` with HMR.

### Production Mode

**Build Frontend:**

```bash
cd frontend
npm run build
```

**Start Backend:**

```bash
cd backend
NODE_ENV=production npm start
```

**Serve Frontend:**

```bash
cd frontend
npm run preview
# Or use a static server like serve
npx serve -s dist
```

### Using Docker

**Start all services:**

```bash
docker-compose up --build
```

**Services:**
- Backend API: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- MongoDB: `localhost:27017`
- RabbitMQ: `localhost:5672`
- RabbitMQ Management: `http://localhost:15672`

**Stop services:**

```bash
docker-compose down
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# View coverage report
open coverage/lcov-report/index.html
```

**Test Files:**
- `auth.test.js`: Auth endpoints (registration, login, OAuth)
- `profile.test.js`: Profile management
- `tasks.test.js`: Task CRUD operations
- `notification.test.js`: Notification system

**Test Coverage:**
- Unit tests for services
- Integration tests for API endpoints
- Mock database (MongoDB Memory Server)
- Mock RabbitMQ connections

### Frontend Testing

```bash
cd frontend

# Run linter
npm run lint

# Build test
npm run build
```

---

## 🚀 Deployment

### Backend Deployment

**Recommended Platforms:**
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean

**Example: Deploying to Heroku**

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create taskco-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-atlas-uri
heroku config:set JWT_SECRET=your-secret
# ... set all env vars

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Frontend Deployment

**Recommended Platforms:**
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Example: Deploying to Vercel**

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-url.com/api
```

**Example: Deploying to Netlify**

```bash
cd frontend

# Build
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Production Checklist

**Backend:**
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure MongoDB Atlas or production DB
- [ ] Set up CloudAMQP or RabbitMQ Cloud
- [ ] Configure production email service (SendGrid, etc.)
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure log rotation
- [ ] Set up backup strategy
- [ ] Configure CDN for static assets
- [ ] Enable compression
- [ ] Set security headers

**Frontend:**
- [ ] Update `VITE_API_URL` to production backend
- [ ] Update OAuth redirect URLs
- [ ] Enable production build optimizations
- [ ] Configure CDN for assets
- [ ] Set up error tracking (Sentry)
- [ ] Enable analytics (GA4)
- [ ] Test on multiple browsers/devices
- [ ] Optimize images
- [ ] Enable caching
- [ ] Set up CI/CD pipeline

---

## 📚 API Documentation

### Postman Collections

Complete API documentation with examples:

#### 📦 Complete Collection
[View Complete API Documentation](https://documenter.getpostman.com/view/XXXXXXXX/XXXXXXXXXX)

#### Individual Collections

1. **🔐 Authentication API**
   - [View Auth Documentation](https://documenter.getpostman.com/view/38185839/2sBXc7M4kf)
   - Includes: Registration, Login, OAuth, Password Reset

2. **👤 Profile API**
   - [View Profile Documentation](https://documenter.getpostman.com/view/XXXXXXXX/XXXXXXXXXX)
   - Includes: Get Profile, Update Profile, Avatar Upload

3. **✅ Tasks API**
   - [View Tasks Documentation](https://documenter.getpostman.com/view/XXXXXXXX/XXXXXXXXXX)
   - Includes: CRUD Operations, Filtering, Pagination

4. **🔔 Notifications API**
   - [View Notifications Documentation](https://documenter.getpostman.com/view/XXXXXXXX/XXXXXXXXXX)
   - Includes: Get Notifications, Mark as Read, Delete

### Importing Collections

1. Download from Postman links
2. Import into Postman
3. Set environment variables:
   - `base_url`: `http://localhost:3000/api`
   - `token`: Your JWT token (auto-set after login)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit bug fixes
- ✨ Add new features
- 🎨 Improve UI/UX
- 🧪 Write tests

### Contribution Process

1. **Fork the repository**

```bash
git clone https://github.com/YOUR_USERNAME/Taskco.git
```

2. **Create a feature branch**

```bash
git checkout -b feature/AmazingFeature
```

3. **Make your changes**

- Follow existing code style
- Add comments for complex logic
- Update documentation if needed
- Add tests for new features

4. **Commit your changes**

```bash
git commit -m 'Add some AmazingFeature'
```

5. **Push to the branch**

```bash
git push origin feature/AmazingFeature
```

6. **Open a Pull Request**

- Describe your changes
- Link related issues
- Add screenshots for UI changes

### Code Style

- **Backend**: Follow ESLint configuration
- **Frontend**: Follow ESLint + Prettier
- **Commits**: Use conventional commit messages
- **Naming**: Use camelCase for variables, PascalCase for components

### Development Guidelines

- Write clean, readable code
- Add meaningful comments
- Follow DRY principle
- Test your changes
- Update README if needed
- Keep commits atomic

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ Liability and warranty disclaimer

---

## 👨‍💻 Author

**Aditya Kumar Jha**

- 🐙 GitHub: [@Aditya-KumarJha](https://github.com/Aditya-KumarJha)
- 📧 Email: contact@taskco.com
- 🌐 Portfolio: [Your Portfolio Link]
- 💼 LinkedIn: [Your LinkedIn]

### Repository

- **Repository**: [Taskco](https://github.com/Aditya-KumarJha/Taskco)
- **Issues**: [Report Issues](https://github.com/Aditya-KumarJha/Taskco/issues)
- **Discussions**: [Join Discussions](https://github.com/Aditya-KumarJha/Taskco/discussions)

---

## 🙏 Acknowledgments

### Technologies

- **React Team** - For the amazing UI library
- **Express Team** - For the robust web framework
- **MongoDB Team** - For the flexible database
- **Vite Team** - For the blazing-fast build tool
- **TailwindCSS Team** - For utility-first CSS
- **GSAP Team** - For powerful animations

### Libraries

- Redux Toolkit
- Passport.js
- Mongoose
- RabbitMQ
- ImageKit
- Nodemailer
- Winston
- Jest
- And all other open-source contributors

### Community

- Stack Overflow community
- GitHub community
- MDN Web Docs
- All beta testers and early users

---

## 📞 Support

### Getting Help

- 📚 [Documentation](#-api-documentation)
- 🐛 [Report Issues](https://github.com/Aditya-KumarJha/Taskco/issues)
- 💬 [Discussions](https://github.com/Aditya-KumarJha/Taskco/discussions)
- 📧 Email: support@taskco.com

### FAQ

**Q: How do I reset my password?**
A: Use the "Forgot Password" link on the login page.

**Q: Can I use this commercially?**
A: Yes, under MIT License terms.

**Q: How do I report a security issue?**
A: Email security@taskco.com with details.

**Q: Can I contribute?**
A: Absolutely! See [Contributing](#-contributing) section.

---

## 🗺️ Roadmap

### Version 1.1 (Coming Soon)

- [ ] Dark mode support
- [ ] Real-time WebSocket notifications
- [ ] Task sharing and collaboration
- [ ] Calendar view for tasks
- [ ] Mobile app (React Native)

### Version 1.2 (Future)

- [ ] Task templates
- [ ] Recurring tasks
- [ ] Team workspaces
- [ ] Advanced analytics
- [ ] Export/import functionality
- [ ] API rate limiting per user

### Long-term Goals

- [ ] AI-powered task suggestions
- [ ] Voice commands
- [ ] Integration with calendar apps
- [ ] Kanban board view
- [ ] Time tracking
- [ ] Gantt charts

---

## 📊 Project Status

- ✅ Core features implemented
- ✅ Authentication system complete
- ✅ Task management fully functional
- ✅ Notification system operational
- 🚧 Mobile app in planning
- 🚧 Dark mode in development

**Current Version:** 1.0.0  
**Last Updated:** February 4, 2026  
**Status:** Active Development

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

### 🔗 Quick Links

[Live Demo](#) | [Backend Docs](backend/README.md) | [Frontend Docs](frontend/README.md) | [API Docs](#-api-documentation)

---

**Built with ❤️ by [Aditya Kumar Jha](https://github.com/Aditya-KumarJha)**

**© 2026 Taskco. All rights reserved.**

[⬆ Back to Top](#taskco---modern-task-management-application)

</div>
