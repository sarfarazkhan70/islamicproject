# Islamic Prayer — Backend REST API

Production-ready Node.js, Express, TypeScript, and MongoDB backend foundation for the **Islamic Prayer** web application.

---

## Architecture

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Mongoose connection manager & health checks
│   │   ├── env.ts               # Zod-validated environment variables
│   │   └── constants.ts         # Application defaults
│   ├── controllers/
│   │   ├── auth.controller.ts   # /api/v1/auth/* request handlers
│   │   └── user.controller.ts   # /api/v1/user/* request handlers
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification & req.user attachment
│   │   ├── error.middleware.ts  # Centralized error handler & AppError
│   │   ├── notFound.middleware.ts# 404 handler
│   │   ├── rateLimiter.middleware.ts # API & Auth rate limiting
│   │   └── validation.middleware.ts  # Zod schema request validation
│   ├── models/
│   │   ├── User.ts              # User schema (email, passwordHash, guestId, isActive)
│   │   ├── UserPreferences.ts   # UserPreferences schema (location, madhhab, calculationMethod, theme)
│   │   └── RefreshToken.ts      # RefreshToken schema (hashed tokens, TTL index, revocation)
│   ├── routes/
│   │   ├── auth.routes.ts       # Auth routes (/register, /login, /refresh, /logout, /me)
│   │   ├── user.routes.ts       # User routes (/, /preferences)
│   │   └── index.ts             # v1Router with /health check and route aggregation
│   ├── services/
│   │   ├── auth.service.ts      # Authentication business logic & token rotation
│   │   └── user.service.ts      # User profile & preferences management
│   ├── types/
│   │   ├── auth.types.ts        # Auth request/response interfaces
│   │   └── index.ts             # Shared backend types & ApiResponse<T>
│   ├── utils/
│   │   ├── apiResponse.ts       # Standardized response envelopes (sendSuccess, sendError)
│   │   ├── jwt.ts               # JWT generation, verification, and SHA-256 hashing
│   │   └── password.ts          # bcryptjs password hashing (12 salt rounds)
│   ├── validators/
│   │   ├── auth.validators.ts   # Zod validation schemas for auth
│   │   └── user.validators.ts   # Zod validation schemas for user
│   ├── app.ts                   # Express app factory with Helmet, CORS, parser middleware
│   └── server.ts                # Server bootstrap, MongoDB connection & graceful shutdown
├── tests/
│   ├── setup.ts                 # MongoMemoryServer test database harness
│   ├── health.test.ts           # Health endpoint & 404 integration tests
│   └── auth.test.ts             # Complete authentication & preferences integration tests
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## API Endpoints (v1)

### Health Check
- `GET /api/v1/health` — System status, MongoDB connection health, uptime, timestamp.

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Register a new account (`email`, `password`, optional `guestId`). Returns user profile, default preferences, and access/refresh tokens.
- `POST /api/v1/auth/login` — Login with credentials (`email`, `password`). Returns user profile, preferences, and tokens.
- `POST /api/v1/auth/refresh` — Rotate refresh token and obtain new access token. Protects against token reuse.
- `POST /api/v1/auth/logout` — Revoke active refresh token and clear session cookies.
- `GET /api/v1/auth/me` *(Protected)* — Retrieve current authenticated user profile and preferences.

### User Management (`/api/v1/user`)
- `GET /api/v1/user` *(Protected)* — Retrieve authenticated user account.
- `GET /api/v1/user/preferences` *(Protected)* — Retrieve user preferences (location, madhhab, calculation method, time format, theme).
- `PUT/PATCH /api/v1/user/preferences` *(Protected)* — Update user preferences.

---

## Security Features

1. **Password Hashing**: 12-round `bcryptjs` hashing. Passwords are never stored in plaintext and excluded by default (`select: false`).
2. **JWT Token Architecture**:
   - Short-lived access tokens (15m expiry).
   - Long-lived refresh tokens (7d expiry) stored as SHA-256 hashes in MongoDB with TTL auto-expiration.
   - Automatic token rotation upon refresh with token reuse detection (revokes all sessions if a compromised/revoked token is used).
3. **Rate Limiting**:
   - General API limiter: 100 requests / 15 minutes.
   - Strict Auth limiter: 15 requests / 15 minutes to prevent brute-force attacks.
4. **Security Headers & CORS**:
   - `helmet` protection.
   - Strict CORS configuration matching `FRONTEND_URL`.
5. **Input Validation**:
   - Strict Zod schemas validating request body, query, and params.
6. **Centralized Error Handling**:
   - Standardized JSON responses with no exposed stack traces in production.

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP Server port | `5000` |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017/islamic_prayer` |
| `JWT_SECRET` | Secret key for signing access tokens | Required (min 16 chars) |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | Required (min 16 chars) |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:3000` |

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run automated integration tests (with in-memory MongoDB)
npm test

# Build for production
npm run build

# Start production server
npm start
```
