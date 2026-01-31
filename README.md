# Video to Blog - AI-Powered SaaS Platform

Transform your videos into high-quality blog posts with AI-powered transcription and content generation.

## 🚀 Features

- **Video Transcription**: Upload videos and get accurate transcriptions using Deepgram AI
- **Blog Generation**: Transform transcripts into well-structured blog posts using OpenAI GPT
- **WordPress Integration**: Publish directly to WordPress with one click
- **User Authentication**: Secure JWT-based authentication with password hashing
- **Protected Routes**: User-scoped data (jobs, blog posts, WordPress configs)
- **Dashboard**: Track all your video-to-blog conversions in one place

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Runtime**: React 19
- **AI Services**: 
  - OpenAI GPT (Blog generation)
  - Deepgram (Video transcription)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn
- PostgreSQL 13.x or higher

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd video-to-blog-saas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/video_to_blog?schema=public"

# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key-here"
OPENAI_MODEL="gpt-4o-mini"
OPENAI_TIMEOUT="60000"
OPENAI_MAX_RETRIES="3"

# Deepgram Configuration
DEEPGRAM_API_KEY="your-deepgram-api-key-here"
DEEPGRAM_MODEL="nova-2"
DEEPGRAM_LANGUAGE="en-US"
DEEPGRAM_TIMEOUT="30000"

# WordPress Configuration (Optional)
WORDPRESS_SITE_URL="https://your-wordpress-site.com"
WORDPRESS_USERNAME="your-username"
WORDPRESS_APP_PASSWORD="your-wordpress-app-password"

# Application
NODE_ENV="development"
LOG_LEVEL="info"
API_TIMEOUT="30000"
MAX_VIDEO_SIZE="500MB"
```

See the [Environment Configuration](#environment-configuration) section below for detailed descriptions.

### 4. Set up the database

#### Option A: Using Local PostgreSQL

1. Create a new PostgreSQL database:
```bash
createdb video_to_blog
```

2. Update your `DATABASE_URL` in `.env.local` with your PostgreSQL credentials

#### Option B: Using Docker

```bash
docker run --name video-to-blog-db -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=video_to_blog -p 5432:5432 -d postgres:15
```

### 5. Run database migrations

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This will create all necessary tables in your database.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
video-to-blog-saas/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                     # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   │   ├── signup/   # User registration
│   │   │   │   ├── login/    # User login
│   │   │   │   ├── logout/   # User logout
│   │   │   │   └── me/       # Get current user
│   │   │   ├── videos/       # Video processing endpoints
│   │   │   ├── blog/         # Blog generation endpoints
│   │   │   ├── jobs/         # Job status endpoints
│   │   │   ├── workflow/     # Workflow orchestration
│   │   │   └── wordpress/    # WordPress publishing endpoints
│   │   ├── jobs/             # Job details pages
│   │   │   └── [jobId]/      # Dynamic job detail page
│   │   │       └── page.tsx  # Job status & blog preview page
│   │   ├── login/            # Login page
│   │   │   └── page.tsx
│   │   ├── signup/           # Sign up page
│   │   │   └── page.tsx
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── loading.tsx       # Loading state
│   │   ├── error.tsx         # Error boundary
│   │   └── globals.css       # Global styles & prose
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   │   ├── SignUpForm.tsx # User registration form
│   │   │   └── LoginForm.tsx   # User login form
│   │   ├── VideoInputForm.tsx    # Video URL input form
│   │   ├── ProcessingStatus.tsx  # Processing step indicators
│   │   ├── BlogPreview.tsx       # Blog post preview component
│   │   ├── WordPressPublishPanel.tsx # WordPress publishing UI
│   │   ├── WordPressConfigModal.tsx # WordPress config modal
│   │   ├── ProtectedRoute.tsx   # Route protection wrapper
│   │   ├── Header.tsx            # Site header
│   │   ├── Footer.tsx            # Site footer
│   │   ├── Button.tsx            # Reusable button component
│   │   ├── Input.tsx             # Reusable input component
│   │   ├── Modal.tsx             # Modal/dialog component
│   │   ├── Spinner.tsx           # Loading spinner
│   │   └── Toast.tsx             # Toast notifications
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/                # React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   └── useJobStatus.ts  # Job status polling hook
│   ├── lib/                  # Library code
│   │   ├── prisma.ts         # Prisma client instance
│   │   ├── config.ts         # Centralized configuration
│   │   ├── openai.ts         # OpenAI client (blog generation)
│   │   ├── deepgram.ts       # Deepgram client (transcription)
│   │   ├── wordpress.ts      # WordPress REST API client
│   │   ├── wordpress-helper.ts # WordPress database integration
│   │   └── video-fetcher.ts  # Video download & audio extraction
│   ├── types/                # TypeScript types
│   │   ├── index.ts          # Shared type definitions
│   │   ├── api.ts            # API response types
│   │   └── auth.ts          # Authentication types
│   └── utils/                # Utility functions
│       ├── api-response.ts   # API response formatters
│       ├── error-handler.ts  # Custom error classes
│       ├── api-middleware.ts # Request/response middleware
│       ├── logger.ts         # Logging utilities
│       ├── auth-middleware.ts # Authentication middleware
│       ├── jwt.ts            # JWT token utilities
│       ├── password.ts        # Password hashing utilities
│       ├── token.ts          # Client-side token management
│       └── fetch-helper.ts   # API fetch helper
├── .env.example              # Example environment variables
├── .env.local                # Local environment variables (git-ignored)
├── .gitignore
├── API.md                    # API documentation
├── package.json
├── tsconfig.json
└── README.md
```

## 📚 External Service Integration

### OpenAI Client (`src/lib/openai.ts`)
Functions for AI-powered blog generation:
- `generateBlogPost()` - Transform transcripts into blog posts
- `enhanceBlogContent()` - Improve readability and structure
- `generateSEOMetadata()` - Generate SEO-optimized metadata
- `validateOpenAIKey()` - Validate API credentials

### Deepgram Client (`src/lib/deepgram.ts`)
Functions for audio/video transcription:
- `transcribeFromUrl()` - Transcribe audio from URL
- `transcribeFromFile()` - Transcribe audio file buffer
- `validateDeepgramKey()` - Validate API credentials

### WordPress Client (`src/lib/wordpress.ts`)
WordPress REST API integration:
- `publishPost()` - Publish blog posts
- `updatePost()` - Update existing posts
- `deletePost()` - Delete posts
- `uploadMedia()` - Upload featured images
- `getCategories()` / `getTags()` - Fetch taxonomies
- `testConnection()` - Verify credentials

### Video Fetcher (`src/lib/video-fetcher.ts`)
Video processing utilities:
- `downloadVideo()` - Download videos from URLs
- `extractAudio()` - Extract audio from video files
- `fetchVideoWithAudio()` - Combined download and extraction
- `cleanupTempFile()` - Clean up temporary files

## 🎨 Frontend Components

### Core Components

#### VideoInputForm (`src/components/VideoInputForm.tsx`)
Video URL submission form with validation:
- URL format validation
- Character limit enforcement (500 characters)
- Loading states during submission
- Error handling with retry
- Auto-redirect to job details on success
- WordPress configuration warnings

#### ProcessingStatus (`src/components/ProcessingStatus.tsx`)
Visual progress indicators for video processing:
- Step-by-step progress display
- Status badges (pending, active, completed, failed)
- Real-time updates via polling
- Color-coded states (gray, blue, green, red)
- Error display with details
- Completion message

#### BlogPreview (`src/components/BlogPreview.tsx`)
Blog post preview with metadata:
- Title and content display
- Word count and reading time
- Copy content to clipboard
- Responsive typography with prose styles
- AdSense placement markers
- Loading skeleton state

#### WordPressPublishPanel (`src/components/WordPressPublishPanel.tsx`)
WordPress integration and publishing UI:
- Configuration status display
- Publish button with confirmation dialog
- WordPress post URL display after publishing
- Copy post URL functionality
- Configuration modal integration
- Error handling with retry

#### WordPressConfigModal (`src/components/WordPressPublishPanel.tsx`)
WordPress connection configuration modal:
- Site URL, username, and app password fields
- Connection testing before saving
- Edit existing configuration
- Helpful links to WordPress documentation
- Success/error messages

### Reusable UI Components

#### Button (`src/components/Button.tsx`)
Versatile button component:
- Variants: primary, secondary, danger, ghost
- Sizes: sm, md, lg
- Loading state with spinner
- Full width option
- Disabled state handling

#### Input (`src/components/Input.tsx`)
Form input component with validation:
- Label and help text support
- Error state display
- Full width option
- ARIA attributes for accessibility

#### Modal (`src/components/Modal.tsx`)
Modal/dialog component:
- Backdrop with click-to-close
- Keyboard escape support
- Multiple size options (sm, md, lg, xl)
- ModalActions component for button groups
- Focus management

#### Spinner (`src/components/Spinner.tsx`)
Loading spinner component:
- Multiple sizes (sm, md, lg)
- Color options (blue, gray, white)
- Accessible with ARIA labels

#### Toast (`src/components/Toast.tsx`)
Toast notification system:
- Success, error, and info types
- Auto-dismiss after 4-5 seconds
- ToastContainer for multiple toasts
- Close button
- Smooth animations

### Custom Hooks

#### useJobStatus (`src/hooks/useJobStatus.ts`)
Job status polling hook:
- Automatic polling every 3 seconds
- Stops when job completes or fails
- Configurable poll interval
- Max retry attempts
- Current step detection
- Manual refetch control

### Utility Functions

#### Fetch Helper (`src/utils/fetch-helper.ts`)
API request wrapper:
- Consistent error handling
- Timeout support (default: 30s)
- Request/response logging
- Auth token support
- HTTP method helpers (get, post, put, delete, patch)
- ApiError class for error handling

### Pages

#### Home Page (`src/app/page.tsx`)
Landing page with:
- Hero section with value proposition
- VideoInputForm component
- Feature highlights
- Benefits section
- AdSense placement zones
- Responsive layout

#### Job Details Page (`src/app/jobs/[jobId]/page.tsx`)
Complete job tracking page:
- ProcessingStatus component
- BlogPreview component
- WordPressPublishPanel component
- Back button to home
- Share job URL functionality
- Real-time updates via polling
- Error handling

### Styling

#### Global CSS (`src/app/globals.css`)
Enhanced with:
- Prose styles for blog content (Markdown/HTML rendering)
- Responsive typography
- Typography scale for headings, paragraphs, lists
- Code block and preformatted text styles
- Table styling
- Blockquote and link styles
- Mobile-responsive adjustments

## 🔧 Shared Utilities

### Configuration (`src/lib/config.ts`)
Centralized configuration management:
- Environment variable validation
- Configuration loading and caching
- Helper functions for environment checks

### Error Handler (`src/utils/error-handler.ts`)
Custom error classes for consistent error handling:
- `ValidationError` - Input validation failures
- `AuthenticationError` - Auth failures
- `ExternalServiceError` - API failures
- `VideoProcessingError` - Video processing failures
- `NotFoundError` - Resource not found
- `RateLimitError` - Rate limit exceeded

### API Response Formatter (`src/utils/api-response.ts`)
Standardized API responses:
- `successResponse()` - Success (200)
- `createdResponse()` - Created (201)
- `noContentResponse()` - No content (204)
- Consistent response format with timestamps

### API Middleware (`src/utils/api-middleware.ts`)
Request/response middleware:
- `withErrorHandler()` - Catch and handle errors
- `withJsonBodyValidation()` - Validate JSON requests
- `withBodyValidation()` - Validate required fields
- `withLogging()` - Log all requests
- `withRateLimit()` - Rate limiting (in-memory)

### Logger (`src/utils/logger.ts`)
Structured logging with Winston:
- `logError()` - Error level logging
- `logWarn()` - Warning level logging
- `logInfo()` - Info level logging
- `logDebug()` - Debug level logging
- Service-specific logging functions
- Request/response logging

## 🗄 Database Schema

### User
- id (String, Primary Key)
- email (String, Unique)
- password (String) - bcrypt hashed
- name (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
- Relations: videoJobs, wordpressConfigs, blogPosts

### VideoJob
- id (String, Primary Key)
- userId (String, Foreign Key)
- videoUrl (String)
- status (String: pending, processing, completed, failed)
- transcription (Text, Optional)
- blogPost (Text, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### BlogPost
- id (String, Primary Key)
- userId (String, Foreign Key)
- videoJobId (String, Foreign Key)
- title (String)
- content (Text)
- wordCount (Int)
- status (String: draft, published, failed)
- wordpressPostId (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
- Relations: user, videoJob

### WordPressConfig
- id (String, Primary Key)
- userId (String, Foreign Key)
- siteUrl (String)
- username (String)
- appPassword (String)
- createdAt (DateTime)
- updatedAt (DateTime)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Videos
- `GET /api/videos` - Get all video jobs
- `POST /api/videos` - Create new video job (placeholder)

### Blog Posts
- `GET /api/blog` - Get all blog posts
- `POST /api/blog` - Create new blog post (placeholder)

### WordPress
- `GET /api/wordpress/config` - Get WordPress configuration
- `POST /api/wordpress/config` - Save WordPress configuration
- `POST /api/wordpress/publish` - Publish to WordPress

**Note**: All API endpoints (except auth) require authentication via JWT token.

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:generate  # Generate Prisma client
npm run db:push          # Push schema changes without migration
npm run db:seed          # Seed the database

# Code Quality
npm run lint             # Run ESLint
```

## 🔑 Getting API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to [API Keys section](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Give your key a name (e.g., "Video-to-Blog SaaS")
6. Copy the key immediately (you won't see it again)
7. Add to `.env.local`: `OPENAI_API_KEY="sk-..."`

**Recommended Models:**
- `gpt-4o-mini` - Fast and cost-effective for blog generation (recommended)
- `gpt-4o` - Higher quality, more expensive
- `gpt-4-turbo` - Good balance of quality and cost
- `gpt-3.5-turbo` - Fastest, lowest cost, lower quality

### Deepgram API Key
1. Go to [Deepgram Console](https://console.deepgram.com)
2. Sign up for free account (includes 200 hours/month free)
3. Navigate to API Keys in the sidebar
4. Click "Create API Key"
5. Give your key a name and optional expiration
6. Copy the key
7. Add to `.env.local`: `DEEPGRAM_API_KEY="..."`

**Recommended Models:**
- `nova-2` - Most accurate and fastest (recommended)
- `nova` - Good balance of speed and accuracy
- `enhance` - Enhanced accuracy, slower processing
- `base` - Fastest, basic accuracy

### WordPress Application Password
1. Log in to your WordPress admin dashboard
2. Go to **Users > Profile**
3. Scroll down to "Application Passwords" section
4. Enter a name for your application (e.g., "Video-to-Blog SaaS")
5. Click "Add New Application Password"
6. Copy the generated password immediately (format: `abcd 1234 efgh 5678 ijkl 8901`)
7. Add to `.env.local`:
   ```
   WORDPRESS_SITE_URL="https://your-wordpress-site.com"
   WORDPRESS_USERNAME="your-username"
   WORDPRESS_APP_PASSWORD="abcd 1234 efgh 5678 ijkl 8901"
   ```

**Note:** Keep a copy of your application passwords - WordPress won't show them again after generation.

## ⚙️ Environment Configuration

### Database Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |

Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA`

### OpenAI Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API authentication key | Yes | - |
| `OPENAI_MODEL` | GPT model to use | No | `gpt-4o-mini` |
| `OPENAI_TIMEOUT` | API timeout in milliseconds | No | `60000` |
| `OPENAI_MAX_RETRIES` | Maximum retry attempts | No | `3` |

### Deepgram Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DEEPGRAM_API_KEY` | Deepgram API authentication key | Yes | - |
| `DEEPGRAM_MODEL` | Transcription model | No | `nova-2` |
| `DEEPGRAM_LANGUAGE` | Transcription language | No | `en-US` |
| `DEEPGRAM_TIMEOUT` | API timeout in milliseconds | No | `30000` |

### Authentication Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JWT_SECRET` | Secret key for JWT signing | Yes | - |
| `JWT_EXPIRY` | Token expiration time | No | `7d` |

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

**Important:** Never use the example JWT_SECRET in production. Use a strong, unique value.

### WordPress Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `WORDPRESS_SITE_URL` | WordPress site URL | No* | - |
| `WORDPRESS_USERNAME` | WordPress username | No* | - |
| `WORDPRESS_APP_PASSWORD` | WordPress application password | No* | - |

*WordPress configuration is optional for MVP. Required only if publishing to WordPress.

### Application Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development` |
| `LOG_LEVEL` | Logging verbosity | No | `info` |
| `API_TIMEOUT` | Default API timeout (ms) | No | `30000` |
| `MAX_VIDEO_SIZE` | Maximum video file size | No | `500MB` |

**Log Levels:** `error`, `warn`, `info`, `debug`

## 🔐 Authentication

The application includes a complete JWT-based authentication system:

### Features
- Secure password hashing with bcrypt
- JWT token-based authentication
- Sign up and login endpoints
- Protected API routes
- User-scoped data (jobs, blog posts, WordPress configs)
- Password strength validation
- Rate limiting on authentication attempts

### Getting Started

1. **Set up environment variables** (see Authentication Configuration above)
2. **Generate a JWT secret**: `openssl rand -base64 32`
3. **Run database migrations**: `npm run prisma:migrate`

### Usage

**Sign Up:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!","name":"John Doe"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

**Protected API Request:**
```bash
curl -X GET http://localhost:3000/api/jobs/abc123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Integration

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={() => login('email', 'password')}>Login</button>;
  }

  return <div>Welcome, {user?.email}</div>;
}
```

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

### Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- Rate limiting: 5 login attempts per 15 minutes
- Resource ownership verification on all protected routes

For detailed documentation, see [AUTHENTICATION.md](AUTHENTICATION.md).

## 🎨 AdSense Compatibility

The application is built with Google AdSense compatibility in mind:
- Clean, semantic HTML structure
- Proper heading hierarchy
- No inline styles that conflict with ad placement
- Designated ad placement areas in layout components

Future implementation will include:
- Ad slots in header, sidebar, and footer
- Content ads between blog sections
- Responsive ad units

## 🚧 Development Roadmap

### Phase 1: Foundation ✅
- ✅ Next.js 15 setup with App Router
- ✅ Prisma ORM with PostgreSQL
- ✅ Basic UI structure
- ✅ API route scaffolding
- ✅ OpenAI client integration
- ✅ Deepgram client integration
- ✅ WordPress REST API client
- ✅ Video fetcher utilities
- ✅ Error handling system
- ✅ API response formatters
- ✅ Request/response middleware
- ✅ Logging infrastructure
- ✅ Configuration management
- ✅ TypeScript type definitions

### Phase 2: Core Features ✅
- ✅ Video processing API endpoints
- ✅ Blog generation API endpoints
- ✅ WordPress publishing API endpoints
- ✅ Job status tracking API
- ✅ Complete workflow orchestration
- ✅ User authentication system (JWT, bcrypt)
- ✅ Sign up and login pages
- ✅ Protected API routes
- ✅ Resource ownership verification
- ⏳ User dashboard UI

### Phase 2.5: Frontend UI ✅
- ✅ VideoInputForm component
- ✅ ProcessingStatus component with real-time polling
- ✅ BlogPreview component
- ✅ WordPressPublishPanel component
- ✅ WordPressConfigModal component
- ✅ Job details page with complete workflow
- ✅ Updated home page with form integration
- ✅ Header and navigation components
- ✅ Custom hook for job status polling
- ✅ API fetch helper
- ✅ Reusable UI components (Button, Input, Modal, Spinner, Toast)
- ✅ TypeScript types for API responses
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Error handling and user feedback
- ✅ Loading states and spinners
- ✅ Toast notification system
- ✅ Prose styles for blog content
- ✅ Authentication components (SignUpForm, LoginForm)
- ✅ AuthContext and useAuth hook
- ✅ ProtectedRoute component
- ✅ Login and signup pages

### Phase 3: Enhancement
- ⏳ Payment integration (Stripe)
- ⏳ Advanced editing tools
- ⏳ Analytics and reporting
- ⏳ Bulk processing capabilities
- ⏳ Custom prompt templates
- ⏳ Video preview player
- ⏳ User dashboard with job history
- ⏳ Download blog as PDF/Markdown
- ⏳ Blog post editing interface
- ⏳ Category and tag management

### Phase 4: Production Ready
- ⏳ Performance optimization
- ⏳ Comprehensive testing
- ⏳ CI/CD pipeline
- ⏳ Monitoring and alerting
- ⏳ Scalability improvements
- ⏳ Advanced rate limiting
- ⏳ Redis caching
- ⏳ Email notifications
- ⏳ SEO optimization
- ⏳ Security hardening

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 💬 Support

For support, email support@videotoblog.com or open an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- OpenAI for GPT API
- Deepgram for transcription services
