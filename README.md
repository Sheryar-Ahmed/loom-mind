# MemoryLayer - Personal Knowledge Capture & Search

A complete, production-ready full-stack application for capturing, organizing, and searching personal knowledge. Built with modern technologies and best practices.

## 🌟 Overview

MemoryLayer allows you to capture any content (URLs, text, images, files) and makes it instantly searchable with powerful full-text search. Think of it as your personal knowledge base with intelligent organization.

### Key Features

- **Universal Capture**: URLs, text snippets, images, files, and notes
- **Smart Processing**: Automatic URL fetching, OCR for images, metadata extraction
- **Powerful Search**: Full-text search with filters, tags, and collections
- **Organization**: Tags, collections, and notes to organize your captures
- **Background Processing**: Async processing with Bull queue
- **Modern UI**: Beautiful, responsive interface with shadcn/ui
- **Production-Ready**: Comprehensive error handling, validation, and security

## 🏗️ Architecture

```
loom-mind/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Database, Redis, S3 configs
│   │   ├── entities/     # TypeORM entities
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── jobs/         # Background jobs
│   │   ├── middleware/   # Auth, validation, errors
│   │   ├── utils/        # Utilities
│   │   └── validators/   # Input validation
│   └── package.json
│
├── frontend/             # Next.js 14 + TypeScript
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   ├── store/        # Zustand stores
│   │   ├── types/        # TypeScript types
│   │   └── validations/  # Zod schemas
│   └── package.json
│
└── README.md             # This file
```

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT + bcrypt
- **File Storage**: Local storage (default) / AWS S3 (optional)
- **Background Jobs**: Bull + Redis
- **Validation**: express-validator
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **PostgreSQL** 12+
- **Redis** (optional, for background jobs)
- **AWS S3** (optional, for cloud storage)

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd loom-mind
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend runs on `http://localhost:5000`

See `backend/README.md` for detailed setup.

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with API URL
npm run dev
```

Frontend runs on `http://localhost:3000`

See `frontend/README.md` for detailed setup.

### 4. Database Setup

Create PostgreSQL database:

```sql
CREATE DATABASE memorylayer;
```

The backend will auto-create tables on first run (development mode).

## 🎯 Quick Start

### 1. Start Backend

```bash
cd backend
npm run dev
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Open Application

Navigate to `http://localhost:3000`

### 4. Create Account

1. Click "Sign up"
2. Fill in name, email, password
3. Start capturing!

## 📖 API Documentation

### Authentication

#### POST `/api/auth/signup`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### POST `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### GET `/api/auth/me`
Requires: `Authorization: Bearer <token>`

### Captures

#### POST `/api/captures`
```json
{
  "type": "url",
  "url": "https://example.com/article",
  "tags": ["tech", "article"]
}
```

#### GET `/api/captures`
Query params: `page`, `limit`, `type`, `tags`, `sortBy`, `order`

#### GET `/api/captures/:id`

#### PUT `/api/captures/:id`
```json
{
  "title": "Updated Title",
  "tags": ["new-tag"]
}
```

#### DELETE `/api/captures/:id`

### Search

#### POST `/api/search`
```json
{
  "query": "search term",
  "types": ["url", "text"],
  "tags": ["tech"],
  "sortBy": "relevance",
  "page": 1,
  "limit": 20
}
```

Full API documentation in `backend/README.md`

## 🎨 Features Overview

### ✅ Capture Types

1. **URL Capture**
   - Auto-fetch page content
   - Extract title, description, author
   - Capture favicon and images
   - Full-text indexing

2. **Text Capture**
   - Quick text notes
   - Full-text search
   - Tag support

3. **Image Capture**
   - Upload images
   - OCR text extraction
   - Thumbnail generation
   - Tag support

4. **File Capture**
   - Upload documents
   - Metadata extraction
   - Tag support

5. **Note Capture**
   - Quick notes
   - Attach to captures
   - Search support

### ✅ Organization

- **Tags**: Color-coded labels for categorization
- **Collections**: Group related captures
- **Notes**: Add context to captures
- **Search**: Full-text search with filters

### ✅ Search Features

- Full-text search across all content
- Filter by type, tags, date range
- Sort by relevance, date, title
- Search suggestions
- Highlighted snippets

### ✅ User Features

- Authentication with JWT
- User profiles
- Usage statistics
- Multiple plan tiers (free, pro, power)

## 🔒 Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt (10 rounds)
- Rate limiting on all endpoints
- Input validation on all requests
- SQL injection prevention
- XSS protection
- CORS configuration

## 🚀 Deployment

### Backend

1. Set environment variables
2. Set `NODE_ENV=production`
3. Disable `synchronize` in TypeORM
4. Use process manager (PM2, Docker)
5. Set up reverse proxy (Nginx)
6. Enable HTTPS

```bash
npm run build
npm start
```

### Frontend

1. Build production bundle
2. Deploy to Vercel/Netlify/AWS

```bash
npm run build
npm start
```

### Recommended Services

- **Backend**: AWS EC2, DigitalOcean, Heroku
- **Frontend**: Vercel, Netlify
- **Database**: AWS RDS, DigitalOcean Managed
- **Redis**: AWS ElastiCache, Redis Cloud
- **Storage**: AWS S3

## 📊 Performance

- Pagination on all list endpoints
- Database indexes on frequently queried fields
- Image thumbnails for fast loading
- React Query caching
- Lazy loading
- Code splitting

## 🧪 Testing

### Backend Test

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test1234"}'
```

### Frontend Test

Navigate to `http://localhost:3000` and test:
- Signup flow
- Login flow
- Create capture
- Search captures

## 📁 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_HOST=localhost
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=memorylayer
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_HOST=localhost
STORAGE_TYPE=local  # Uses local storage by default (uploads/ folder)
# AWS S3 is optional - leave AWS keys empty to use local storage
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

This is a complete, production-ready codebase. To extend:

1. Backend: Add new routes in `backend/src/routes/`
2. Frontend: Add new pages in `frontend/src/app/`
3. Follow existing patterns
4. Maintain type safety
5. Add proper error handling

## 📝 License

MIT License - See LICENSE file

## 🆘 Support

For issues, questions, or feature requests:
1. Check README files in backend/ and frontend/
2. Review code comments
3. Check API documentation
4. Create an issue

## 🎯 Roadmap

### Phase 1 (Complete) ✅
- User authentication
- Capture creation (all types)
- Full-text search
- Tags and collections
- Background processing
- Responsive UI

### Phase 2 (Future)
- Browser extension
- Mobile apps
- AI-powered summaries
- Collaborative collections
- Email import
- Advanced analytics

## 📚 Documentation

- `backend/README.md` - Backend API documentation
- `frontend/README.md` - Frontend documentation
- Code comments throughout

## ⚡ Performance Tips

1. **Database**: Add indexes for custom queries
2. **Redis**: Required for background jobs
3. **S3**: Use for production file storage
4. **CDN**: Use for static frontend assets
5. **Caching**: React Query handles most caching

## 🔧 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in .env
- Check port 5000 is available

### Frontend won't start
- Check backend is running
- Verify API_URL in .env.local
- Check port 3000 is available

### Database errors
- Ensure PostgreSQL 12+ is installed
- Check database exists
- Verify user permissions

### Redis errors
- Redis is optional (for background jobs)
- Install Redis or continue without it

## 🎉 You're Ready!

You now have a complete, production-ready personal knowledge management system. Start by:

1. Creating an account
2. Capturing your first URL
3. Adding tags and organizing
4. Searching your knowledge base

---

**Built with ❤️ using Node.js, Next.js, PostgreSQL, and modern web technologies**
