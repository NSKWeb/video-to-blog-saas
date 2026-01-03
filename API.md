# Video-to-Blog SaaS API Documentation

## Overview

This API provides endpoints for converting video content into blog posts using AI-powered transcription and content generation.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a valid user session. Include authentication credentials in the request headers.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "details": { ... }
  }
}
```

## Error Codes

| Code | Description | Status Code |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `AUTH_ERROR` | Authentication failed | 401 |
| `NOT_FOUND` | Resource not found | 404 |
| `VIDEO_PROCESSING_ERROR` | Video processing failed | 422 |
| `RATE_LIMIT_ERROR` | Rate limit exceeded | 429 |
| `OPENAI_SERVICE_ERROR` | OpenAI API error | 502 |
| `DEEPGRAM_SERVICE_ERROR` | Deepgram API error | 502 |
| `WORDPRESS_SERVICE_ERROR` | WordPress API error | 502 |
| `INTERNAL_ERROR` | Internal server error | 500 |

## Endpoints

### Authentication

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "email": "user@example.com"
  },
  "message": "User registered successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### POST `/auth/login`
Authenticate a user and create a session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid",
      "email": "user@example.com"
    },
    "token": "session-token"
  },
  "message": "Login successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Video Jobs

#### POST `/videos/jobs`
Create a new video processing job.

**Request Body:**
```json
{
  "videoUrl": "https://example.com/video.mp4"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "userId": "cuid",
    "videoUrl": "https://example.com/video.mp4",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Video job created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET `/videos/jobs`
Get all video jobs for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `processing`, `completed`, `failed`)
- `limit` (optional): Number of results to return (default: 20)
- `offset` (optional): Number of results to skip (default: 0)

**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "videoUrl": "https://example.com/video.mp4",
      "status": "completed",
      "transcription": "Video transcript text...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET `/videos/jobs/:id`
Get a specific video job by ID.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "userId": "cuid",
    "videoUrl": "https://example.com/video.mp4",
    "status": "completed",
    "transcription": "Video transcript text...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "blogPosts": [
      {
        "id": "cuid",
        "title": "Blog Post Title",
        "status": "draft"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Blog Posts

#### POST `/blog/posts`
Create a new blog post from a video job.

**Request Body:**
```json
{
  "videoJobId": "cuid",
  "title": "Blog Post Title",
  "content": "<p>Blog post content...</p>"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "videoJobId": "cuid",
    "title": "Blog Post Title",
    "content": "<p>Blog post content...</p>",
    "wordCount": 500,
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Blog post created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET `/blog/posts`
Get all blog posts for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `published`, `failed`)
- `videoJobId` (optional): Filter by video job ID
- `limit` (optional): Number of results to return (default: 20)
- `offset` (optional): Number of results to skip (default: 0)

**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "videoJobId": "cuid",
      "title": "Blog Post Title",
      "content": "<p>Blog post content...</p>",
      "wordCount": 500,
      "status": "draft",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET `/blog/posts/:id`
Get a specific blog post by ID.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "videoJobId": "cuid",
    "title": "Blog Post Title",
    "content": "<p>Blog post content...</p>",
    "wordCount": 500,
    "status": "draft",
    "wordpressPostId": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "videoJob": {
      "id": "cuid",
      "videoUrl": "https://example.com/video.mp4",
      "status": "completed"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### WordPress Configuration

#### POST `/wordpress/config`
Save or update WordPress site configuration.

**Request Body:**
```json
{
  "siteUrl": "https://mywordpresssite.com",
  "username": "admin",
  "appPassword": "abcd 1234 efgh 5678 ijkl 8901"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "userId": "cuid",
    "siteUrl": "https://mywordpresssite.com",
    "username": "admin",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "WordPress configuration saved",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET `/wordpress/config`
Get WordPress configuration for the authenticated user.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "userId": "cuid",
    "siteUrl": "https://mywordpresssite.com",
    "username": "admin",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### DELETE `/wordpress/config`
Delete WordPress configuration.

**Response:** 204 No Content

## AdSense Integration

Generated blog posts include semantic HTML comments for ad placement:

```html
<!-- ADSENSE_TOP_BANNER -->
<p>Blog introduction paragraph...</p>

<!-- ADSENSE_IN_ARTICLE -->
<p>Article content continues...</p>

<!-- ADSENSE_BOTTOM_BANNER -->
<p>Conclusion paragraph...</p>
```

These markers can be used to programmatically insert Google AdSense code.

## Rate Limiting

API endpoints have rate limiting applied to prevent abuse.

- Default: 100 requests per minute per IP
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## Logging

All API requests and errors are logged with:
- Timestamp
- Request ID (in `X-Request-ID` header)
- HTTP method and URL
- Status code
- Duration

## External Service Integration

The API integrates with the following services:

### OpenAI
- Used for AI-powered blog post generation
- Generates SEO-optimized content from transcripts
- Provides metadata for better search visibility

### Deepgram
- Provides accurate speech-to-text transcription
- Supports multiple languages and audio formats
- Returns timestamps for better content alignment

### WordPress
- REST API integration for publishing blog posts
- Supports draft and published statuses
- Includes media upload capabilities

## Video Processing

Supported video formats:
- MP4
- MOV
- WebM
- AVI
- MKV
- FLV
- WMV

Maximum file size: 500MB (configurable via `MAX_VIDEO_SIZE` environment variable)
