# Video-to-Blog SaaS API Documentation

## Overview

This API provides endpoints for converting video content into blog posts using AI-powered transcription and content generation. The API supports a complete workflow from video download to WordPress publishing.

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

## Video Processing Endpoints

### POST `/videos/process`
Create a new video processing job and process video immediately (download, extract audio, and transcribe).

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
    "jobId": "clq7z3q2v0001jz6z9z6z9z6z",
    "status": "completed",
    "videoUrl": "https://example.com/video.mp4",
    "transcript": "Complete transcript text...",
    "language": "en",
    "duration": 120.5
  },
  "message": "Video processing completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid video URL or missing required fields
- `422 VIDEO_PROCESSING_ERROR`: Failed to download or process video
- `502 DEEPGRAM_SERVICE_ERROR`: Transcription service failure

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/videos/process \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://example.com/video.mp4"}'
```

---

### POST `/videos/transcribe`
Transcribe audio for an existing job or from an audio file path.

**Request Body:**
```json
{
  "jobId": "clq7z3q2v0001jz6z9z6z9z6z",
  "audioPath": "/tmp/audio-extract.mp3"
}
```

**Notes:**
- Either `jobId` OR `audioPath` is required
- If `jobId` is provided and transcript already exists, returns cached version

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "jobId": "clq7z3q2v0001jz6z9z6z9z6z",
    "transcript": "Complete transcript text...",
    "language": "en",
    "confidence": 0.95,
    "duration": 120.5,
    "words": [
      {
        "word": "hello",
        "start": 0.0,
        "end": 0.5,
        "confidence": 0.98
      }
    ]
  },
  "message": "Transcription completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Missing required fields or invalid job ID
- `404 NOT_FOUND`: Job ID not found
- `502 DEEPGRAM_SERVICE_ERROR`: Transcription service failure

---

## Blog Generation Endpoints

### POST `/blog/generate`
Generate a blog post from a transcript.

**Request Body:**
```json
{
  "jobId": "clq7z3q2v0001jz6z9z6z9z6z",
  "transcript": "Optional: provide transcript directly",
  "titleSuggestion": "Optional: suggested blog title"
}
```

**Notes:**
- Either `jobId` OR `transcript` is required
- If `jobId` is provided and blog post already exists, returns existing blog
- `titleSuggestion` is optional and used as a hint for AI generation

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "blogId": "clq8a4r3w0002ka8a0a1b1c1d",
    "title": "Generated Blog Post Title",
    "content": "<h1>Generated Blog Post Title</h1><p>Blog content with HTML markup...</p>",
    "wordCount": 1500,
    "seoMetadata": {
      "description": "SEO-friendly description of the blog post",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "ogTitle": "Open Graph title for social media",
      "ogDescription": "Open Graph description for social media"
    }
  },
  "message": "Blog post generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Missing transcript or invalid input
- `404 NOT_FOUND`: Job ID not found
- `502 OPENAI_SERVICE_ERROR`: Content generation service failure

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/blog/generate \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Your video transcript text here...", "titleSuggestion": "How to Build Amazing Apps"}'
```

---

## WordPress Endpoints

### POST `/wordpress/publish`
Publish a blog post to WordPress.

**Request Body:**
```json
{
  "blogId": "clq8a4r3w0002ka8a0a1b1c1d",
  "wordpressConfig": {
    "siteUrl": "https://mywordpresssite.com",
    "username": "admin",
    "appPassword": "abcd 1234 efgh 5678 ijkl 8901"
  }
}
```

**Notes:**
- `wordpressConfig` is optional if already saved in database
- If no config provided, uses saved configuration for authenticated user
- Content is published with status "publish" (live immediately)

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "blogId": "clq8a4r3w0002ka8a0a1b1c1d",
    "wordpressPostId": 12345,
    "wordpressUrl": "https://mywordpresssite.com/2024/01/generated-blog-post/",
    "status": "published"
  },
  "message": "Blog post published to WordPress successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Missing blog ID or invalid config
- `401 AUTH_ERROR`: WordPress authentication failed
- `404 NOT_FOUND`: Blog post not found
- `502 WORDPRESS_SERVICE_ERROR`: WordPress API error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/wordpress/publish \
  -H "Content-Type: application/json" \
  -d '{
    "blogId": "clq8a4r3w0002ka8a0a1b1c1d",
    "wordpressConfig": {
      "siteUrl": "https://mywordpresssite.com",
      "username": "admin",
      "appPassword": "abcd 1234 efgh 5678 ijkl 8901"
    }
  }'
```

---

### POST `/wordpress/config`
Save or update WordPress configuration.

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
    "configId": "clq8b5s4x0003lb9b1b2c2d2e",
    "siteUrl": "https://mywordpresssite.com",
    "username": "admin",
    "message": "WordPress config saved and verified"
  },
  "message": "WordPress config saved and verified",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Missing required fields or invalid URL format
- `401 AUTH_ERROR`: WordPress credentials invalid
- `502 WORDPRESS_SERVICE_ERROR`: Cannot connect to WordPress site

---

### GET `/wordpress/config`
Get current WordPress configuration for the authenticated user.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "hasConfig": true,
    "config": {
      "id": "clq8b5s4x0003lb9b1b2c2d2e",
      "siteUrl": "https://mywordpresssite.com",
      "username": "admin",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:31:00.000Z"
    }
  }
}
```

---

## Job Status & Workflow Endpoints

### GET `/jobs/:jobId`
Get status and details of a video processing job.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "jobId": "clq7z3q2v0001jz6z9z6z9z6z",
    "videoUrl": "https://example.com/video.mp4",
    "status": "completed",
    "transcription": "Complete transcript text...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z",
    "blog": {
      "id": "clq8a4r3w0002ka8a0a1b1c1d",
      "title": "Generated Blog Post Title",
      "content": "<p>Blog content...</p>",
      "wordCount": 1500,
      "status": "published",
      "wordpressPostId": "12345",
      "createdAt": "2024-01-15T10:32:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

---

### POST `/workflow/process`
Complete one-shot workflow: video download → transcription → blog generation → WordPress publishing.

**Request Body:**
```json
{
  "videoUrl": "https://example.com/video.mp4",
  "publishToWordPress": true,
  "wordpressConfig": {
    "siteUrl": "https://mywordpresssite.com",
    "username": "admin",
    "appPassword": "abcd 1234 efgh 5678 ijkl 8901"
  }
}
```

**Notes:**
- `publishToWordPress`: Optional flag to auto-publish to WordPress
- `wordpressConfig`: Optional config (uses saved config if not provided)
- This is a synchronous endpoint that completes all steps
- May take several minutes depending on video length

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "jobId": "clq7z3q2v0001jz6z9z6z9z6z",
    "status": "completed",
    "videoUrl": "https://example.com/video.mp4",
    "transcript": "Complete transcript text...",
    "blog": {
      "id": "clq8a4r3w0002ka8a0a1b1c1d",
      "title": "Generated Blog Post Title",
      "content": "<p>Blog content...</p>",
      "wordCount": 1500,
      "status": "published"
    },
    "wordpress": {
      "postId": 12345,
      "url": "https://mywordpresssite.com/2024/01/generated-blog-post/",
      "status": "published"
    }
  },
  "message": "Complete workflow completed successfully",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid input data
- `422 VIDEO_PROCESSING_ERROR`: Video processing failed at any step
- `502 EXTERNAL_SERVICE_ERROR`: Third-party service (OpenAI, Deepgram, WordPress) error

---

## Status Tracking

### VideoJob Status Flow

```
pending → processing → completed
              ↓
            failed
```

**Status Definitions:**
- `pending`: Job created, not started processing
- `processing`: Video being downloaded, audio being transcribed
- `completed`: Processing completed successfully
- `failed`: Processing failed (check error details)

### BlogPost Status Flow

```
draft → published
```

**Status Definitions:**
- `draft`: Blog post generated, not published to WordPress
- `published`: Successfully published to WordPress

---

## AdSense Integration

Generated blog posts include semantic HTML comments for ad placement:

```html
<!-- ADSENSE_TOP_BANNER -->
<h1>Your Blog Post Title</h1>
<p>Introduction paragraph...</p>

<!-- ADSENSE_IN_ARTICLE -->
<p>Main article content continues...</p>

<!-- ADSENSE_BOTTOM_BANNER -->
<p>Conclusion paragraph...</p>
```

These markers can be used to programmatically insert Google AdSense code when rendering or publishing blog content.

**Best Practices:**
- Place display ads at top of article for maximum visibility
- Use in-article ads for longer content (typically after 2-3 paragraphs)
- Bottom ads work well for engagement with readers who finish articles
- Maintain good ad-to-content ratio (avoid excessive ads)

---

## Video Processing Specifications

### Supported Formats
- MP4, MOV, WebM, AVI, MKV, FLV, WMV
- Most common codecs supported (H.264, H.265, VP8, VP9)

### File Size Limits
- Default: 500MB maximum
- Configurable via `MAX_VIDEO_SIZE` environment variable

### Audio Extraction
- Audio extracted to MP3 format for transcription
- Sampling rate optimized for speech recognition
- Temporary files automatically cleaned up after processing

### Transcription Features
- Support for 30+ languages
- Speaker diarization (speaker separation)
- Timestamps for each word
- Confidence scores
- Smart formatting (punctuation, capitalization)

---

## Rate Limiting

API endpoints have rate limiting applied:

- **Standard endpoints**: 100 requests per minute per IP
- **Processing endpoints**: 10 requests per minute per IP (due to resource intensity)
- **External service calls**: Limited by individual service quotas

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705321800
```

---

## API Migration Notes

This documentation reflects the **Task 2: Core API Implementation** update. Key changes from placeholders:

### Before (Task 1)
- Placeholder endpoints returning static responses
- No external service integration
- Manual database operations required
- Basic error handling only

### After (Task 2)
- ✅ Full video downloading and audio extraction
- ✅ Deepgram integration for transcription
- ✅ OpenAI integration for blog generation
- ✅ WordPress publishing with config management
- ✅ Complete workflow automation
- ✅ Comprehensive error handling and status tracking
- ✅ Structured logging and monitoring
- ✅ AdSense-aware content generation

---

## Testing Examples

Complete workflow test:
```bash
# 1. Configure WordPress
curl -X POST http://localhost:3000/api/wordpress/config \
  -H "Content-Type: application/json" \
  -d '{
    "siteUrl": "https://mywordpresssite.com",
    "username": "admin",
    "appPassword": "your-app-password"
  }'

# 2. Process video and generate blog
curl -X POST http://localhost:3000/api/videos/process \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://example.com/video.mp4"}'

# 3. Note the jobId from response, then generate blog
curl -X POST http://localhost:3000/api/blog/generate \
  -H "Content-Type: application/json" \
  -d '{"jobId": "your-job-id"}'

# 4. Publish to WordPress
curl -X POST http://localhost:3000/api/wordpress/publish \
  -H "Content-Type: application/json" \
  -d '{"blogId": "your-blog-id"}'

# Or all in one step:
curl -X POST http://localhost:3000/api/workflow/process \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://example.com/video.mp4",
    "publishToWordPress": true
  }'
```

---

## External Service Integration

### OpenAI (GPT-4o-mini)
- **Purpose**: Blog post generation, SEO optimization
- **Features**: Structured content, semantic HTML, AdSense markers, metadata
- **Rate Limits**: Tier-based, typically 3,500 RPM for GPT-4
- **Cost**: ~$0.00015 per 1K tokens (input), ~$0.0006 per 1K tokens (output)

### Deepgram (nova-2)
- **Purpose**: Speech-to-text transcription
- **Features**: 30+ languages, speaker separation, timestamps, confidence scores
- **Rate Limits**: Scales with plan, generous free tier
- **Cost**: ~$0.0043 per minute (pay-as-you-go)

### WordPress REST API
- **Purpose**: Publishing and managing blog posts
- **Features**: Create, update, delete posts, media upload, taxonomy management
- **Authentication**: Application Passwords (Basic Auth)
- **Requirements**: WordPress 4.7+ with REST API enabled