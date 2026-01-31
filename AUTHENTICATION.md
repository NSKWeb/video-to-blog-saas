# Authentication System Documentation

Complete guide to the authentication system for the Video-to-Blog SaaS application.

## Overview

This application uses JWT (JSON Web Tokens) for authentication. Users sign up with email and password, receive a JWT token, and use that token to authenticate API requests.

## Features

- ✅ User registration with email/password
- ✅ Secure password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Protected API routes
- ✅ Token expiration (7 days default)
- ✅ Password strength validation
- ✅ Rate limiting on login attempts
- ✅ Resource ownership verification

## Getting Started

### 1. Set Up Environment Variables

Add these to your `.env.local` file:

```bash
# Required: Generate with: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"

# Optional: Token expiry (default: 7d)
JWT_EXPIRY="7d"
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Run Database Migrations

```bash
npm run prisma:migrate
```

## Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  videoJobs        VideoJob[]
  wordpressConfigs WordPressConfig[]
  blogPosts        BlogPost[]
}
```

## API Endpoints

### Sign Up

**POST** `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clxxxxxx",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "expiresIn": "7d"
  },
  "message": "Account created successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Invalid email format
- `422` - Password doesn't meet requirements
- `409` - Email already exists

### Login

**POST** `/api/auth/login`

Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clxxxxxx",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "expiresIn": "7d"
  },
  "message": "Login successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Invalid credentials format
- `401` - Invalid email or password
- `429` - Too many attempts (rate limited)

**Rate Limiting:**
- Max 5 login attempts per IP per 15 minutes

### Get Current User

**GET** `/api/auth/me`

Get the authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401` - Invalid or expired token

### Logout

**POST** `/api/auth/logout`

Logout the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" },
  "message": "Logged out",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Note:** Client should clear the token from localStorage after logout.

## Using Authentication in Frontend

### Auth Hook

The `useAuth` hook provides authentication state and methods:

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // Redirect to home
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Redirect to login
  };

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <button onClick={handleLogin}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Requests

Use the `includeAuth` option with the API helper:

```tsx
import { api } from '@/utils/fetch-helper';

// Make authenticated request
const response = await api.get('/api/jobs/abc123', { includeAuth: true });

// Or with mutations
const result = await api.post('/api/videos/process', { videoUrl }, { includeAuth: true });
```

The token is automatically added to the `Authorization` header.

### Protected Routes

Wrap components that require authentication:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Only authenticated users can see this</div>
    </ProtectedRoute>
  );
}
```

## JWT Token Structure

```typescript
{
  "userId": "clxxxxxx",
  "iat": 1234567890,  // Issued at timestamp
  "exp": 1234567890 + 604800  // Expiration timestamp (7 days)
}
```

### Token Expiry

- Default: 7 days
- Configurable via `JWT_EXPIRY` env variable
- Tokens are automatically verified on each API request
- Expired tokens return 401 Unauthorized

## Security Best Practices

### Password Security

1. **Hashing:** Passwords are hashed with bcrypt (10 salt rounds)
2. **Validation:** Passwords must meet strength requirements
3. **Storage:** Only hashed passwords stored in database
4. **Logging:** Passwords never logged

### Token Security

1. **Secret Key:** Use a strong, unique `JWT_SECRET`
2. **Expiry:** Tokens expire after 7 days
3. **Storage:** Stored in localStorage (client-side)
4. **HTTPS:** Required in production (Vercel handles this)
5. **Authorization Header:** Tokens sent via `Authorization: Bearer <token>`

### Rate Limiting

- Login: 5 attempts per IP per 15 minutes
- Sign up: 3 attempts per IP per hour
- Implemented in-memory (use Redis for production scaling)

### Resource Ownership

Users can only access their own resources:
- Video jobs belong to the user who created them
- Blog posts belong to the user who created them
- WordPress configs are user-specific

The `requireResourceOwner` helper enforces this:

```typescript
import { requireResourceOwner } from '@/utils/auth-middleware';

// Check if user owns the resource
requireResourceOwner(userId, resourceOwnerId);
// Throws 401 if not authorized
```

## Middleware

### `withAuth`

Protects API routes by requiring a valid JWT token:

```typescript
import { withAuth } from '@/utils/auth-middleware';

export async function GET(request: NextRequest) {
  const { userId, error } = await withAuth(request);
  if (error) return errorResponse(error, 401);

  // Use userId to fetch user data
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return successResponse(user);
}
```

### `withOptionalAuth`

Checks for token but doesn't fail if missing:

```typescript
import { withOptionalAuth } from '@/utils/auth-middleware';

export async function GET(request: NextRequest) {
  const { userId } = await withOptionalAuth(request);

  // userId is available if authenticated, undefined otherwise
  const data = userId
    ? await getPersonalizedData(userId)
    : await getPublicData();
  return successResponse(data);
}
```

## Error Handling

### Authentication Errors

```typescript
{
  "success": false,
  "error": {
    "code": "AUTH_ERROR",
    "message": "Authentication failed",
    "statusCode": 401,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Validation Errors

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password does not meet requirements",
    "statusCode": 422,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "details": {
      "errors": [
        "Password must be at least 8 characters long",
        "Password must contain at least 1 uppercase letter"
      ]
    }
  }
}
```

### Rate Limit Errors

```typescript
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "Too many requests. Please try again later.",
    "statusCode": 429,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "details": {
      "retryAfter": 900
    }
  }
}
```

## Testing

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

### Planned Enhancements

- [ ] Email verification after sign up
- [ ] Password reset functionality
- [ ] Refresh tokens for extended sessions
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Session management dashboard
- [ ] Redis-based rate limiting
- [ ] Token blacklisting for logout

### Multi-Tenant Support

Currently, each user has their own:
- Video jobs
- Blog posts
- WordPress configurations

For future multi-tenant SaaS:
- Add `tenantId` or `organizationId` to User model
- Update all queries to filter by tenant
- Add roles/permissions system

## Troubleshooting

### "JWT_SECRET is not set"

Ensure `JWT_SECRET` is set in your `.env.local` file:

```bash
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
```

### "Token has expired"

The JWT token has expired (default 7 days). User needs to login again.

### "Password does not meet requirements"

Ensure password meets all requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

### Rate limiting errors

Wait for the rate limit window to expire:
- Login: 15 minutes
- Sign up: 1 hour

## Support

For issues or questions:
1. Check the API endpoint responses
2. Review browser console for errors
3. Check server logs with `npm run dev`
4. Verify environment variables are set correctly
