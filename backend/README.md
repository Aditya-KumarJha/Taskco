# Taskco Backend

Production-ready Node.js + Express API with MongoDB, JWT auth, OAuth (Google/GitHub), RabbitMQ mail queue, ImageKit uploads, rate limiting, and pagination.

## Setup

```bash
cp .env.example .env
# Edit .env with your MONGODB_URI, JWT_SECRET, etc.
npm install
npm run dev
```

### Seed Sample Data (Optional)

Populate database with test users, tasks, and notifications:

```bash
npm run seed
```

This creates 5 test users with login credentials. See [SEEDING.md](./SEEDING.md) for details.

**Test Login:**
- Email: `john.doe@example.com`
- Password: `Password123`

## Scripts

- `npm run dev` — Start with nodemon
- `npm start` — Start production server
- `npm test` — Run tests with coverage
- `npm run lint` — Run ESLint
- `npm run seed` — Seed database with sample data (see [SEEDING.md](./SEEDING.md))

## API (v1)

Base: `/api/v1`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/signup | No | Sign up (email, password, name) |
| POST | /auth/login | No | Login |
| POST | /auth/refresh | Refresh token | New access + refresh tokens |
| POST | /auth/logout | No | Clear cookies |
| GET | /auth/google | No | Redirect to Google OAuth |
| GET | /auth/google/callback | No | Google callback |
| GET | /auth/github | No | Redirect to GitHub OAuth |
| GET | /auth/github/callback | No | GitHub callback |
| GET | /me | Yes | Get profile |
| PUT | /me | Yes | Update profile (name, avatar) |
| GET | /tasks | Yes | List tasks (pagination, search, filter) |
| POST | /tasks | Yes | Create task |
| POST | /tasks/upload | Yes | Upload image (multipart) |
| POST | /tasks/upload-base64 | Yes | Upload image (base64 body) |
| GET | /tasks/:id | Yes | Get task |
| PUT | /tasks/:id | Yes | Update task |
| DELETE | /tasks/:id | Yes | Delete task |

Query params for `GET /tasks`: `page`, `limit`, `search`, `status`, `priority`, `sort`, `order`.

## Docker

```bash
docker-compose up --build
```

## Env

See `.env.example` for all variables. Required: `MONGODB_URI`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`, `BACKEND_URL`. Optional: RabbitMQ, OAuth, ImageKit, email.
