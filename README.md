# Video to Blog - AI-Powered SaaS Platform

Transform your videos into high-quality blog posts with AI-powered transcription and content generation.

## 🚀 Features

- **Video Transcription**: Upload videos and get accurate transcriptions using Deepgram AI
- **Blog Generation**: Transform transcripts into well-structured blog posts using OpenAI GPT
- **WordPress Integration**: Publish directly to WordPress with one click
- **User Management**: Secure authentication and user profiles
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

# OpenAI API Key
OPENAI_API_KEY="your-openai-api-key-here"

# Deepgram API Key
DEEPGRAM_API_KEY="your-deepgram-api-key-here"

# WordPress Configuration (Optional)
WORDPRESS_SITE_URL="https://your-wordpress-site.com"

# Environment
NODE_ENV="development"
```

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
│   │   │   ├── videos/       # Video processing endpoints
│   │   │   ├── blog/         # Blog generation endpoints
│   │   │   └── wordpress/    # WordPress publishing endpoints
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── loading.tsx       # Loading state
│   │   └── error.tsx         # Error boundary
│   ├── components/           # React components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── lib/                  # Library code
│   │   └── prisma.ts         # Prisma client instance
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── utils/                # Utility functions
│       ├── api-response.ts   # API response helpers
│       ├── error-handler.ts  # Error handling utilities
│       └── auth-middleware.ts # Authentication middleware
├── .env.example              # Example environment variables
├── .env.local                # Local environment variables (git-ignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄 Database Schema

### User
- id (String, Primary Key)
- email (String, Unique)
- password (String)
- createdAt (DateTime)
- updatedAt (DateTime)

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
- videoJobId (String, Foreign Key)
- title (String)
- content (Text)
- wordCount (Int)
- status (String: draft, published, failed)
- wordpressPostId (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

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
- `POST /api/auth` - User authentication (placeholder)

### Videos
- `GET /api/videos` - Get all video jobs
- `POST /api/videos` - Create new video job (placeholder)

### Blog Posts
- `GET /api/blog` - Get all blog posts
- `POST /api/blog` - Create new blog post (placeholder)

### WordPress
- `GET /api/wordpress` - Get WordPress configuration (placeholder)
- `POST /api/wordpress` - Publish to WordPress (placeholder)

**Note**: Placeholder endpoints return mock responses. Full implementation will be completed in Task 2.

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
3. Navigate to API Keys section
4. Create a new API key
5. Copy and add to `.env.local`

### Deepgram API Key
1. Go to [Deepgram Console](https://console.deepgram.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and add to `.env.local`

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

### Phase 1: Foundation (Current)
- ✅ Next.js 15 setup with App Router
- ✅ Prisma ORM with PostgreSQL
- ✅ Basic UI structure
- ✅ API route scaffolding

### Phase 2: Core Features (Next)
- 🔄 Video download and processing
- 🔄 Deepgram integration for transcription
- 🔄 OpenAI integration for blog generation
- 🔄 User authentication
- 🔄 WordPress publishing

### Phase 3: Enhancement
- ⏳ User dashboard
- ⏳ Payment integration
- ⏳ Advanced editing tools
- ⏳ Analytics and reporting

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
