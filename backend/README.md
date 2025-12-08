# MemoryLayer Backend API

Production-ready Node.js backend API for MemoryLayer - a personal knowledge capture and search application.

## 🚀 Features

- **User Authentication**: JWT-based auth with refresh tokens
- **Capture System**: Support for URLs, text, images, files, and notes
- **Full-Text Search**: PostgreSQL-powered search with relevance ranking
- **Background Processing**: Bull queue for async URL fetching and OCR
- **File Storage**: Local storage with S3 fallback
- **Rate Limiting**: Protection against abuse
- **Comprehensive Error Handling**: Standardized error responses
- **Request Validation**: express-validator schemas
- **Logging**: Winston-based logging system

## 📋 Prerequisites

- Node.js 16+ and npm
- PostgreSQL 12+
- Redis (optional, for background jobs)
- AWS S3 account (optional, for cloud storage)

## ⚙️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE memorylayer;
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
NODE_ENV=development
PORT=5000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=memorylayer

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Storage
STORAGE_TYPE=local
# For S3: set to 's3' and configure AWS credentials
```

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:5000`

## 🗄️ Database

TypeORM automatically creates tables on first run in development mode (`synchronize: true`).

For production, disable synchronize and use migrations.

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "plan": "free"
    },
    "accessToken": "jwt-token"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access-token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

### Capture Endpoints

#### Create Capture (URL)
```http
POST /api/captures
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "type": "url",
  "url": "https://example.com/article",
  "tags": ["tech", "article"],
  "collectionIds": ["collection-uuid"]
}
```

#### Create Capture (Text)
```http
POST /api/captures
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "type": "text",
  "title": "My Note",
  "text": "This is my note content",
  "tags": ["personal"]
}
```

#### Create Capture (Image)
```http
POST /api/captures
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

type: image
file: <image-file>
tags: ["screenshot"]
```

#### List Captures
```http
GET /api/captures?page=1&limit=20&type=url&sortBy=createdAt&order=DESC
Authorization: Bearer <access-token>
```

#### Get Single Capture
```http
GET /api/captures/:id
Authorization: Bearer <access-token>
```

#### Update Capture
```http
PUT /api/captures/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "tags": ["new-tag"]
}
```

#### Delete Capture
```http
DELETE /api/captures/:id
Authorization: Bearer <access-token>
```

### Search Endpoints

#### Search Captures
```http
POST /api/search
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "query": "search term",
  "types": ["url", "text"],
  "tags": ["tech"],
  "dateFrom": "2024-01-01",
  "sortBy": "relevance",
  "page": 1,
  "limit": 20
}
```

#### Get Search Suggestions
```http
GET /api/search/suggestions?q=partial
Authorization: Bearer <access-token>
```

#### Get Popular Tags
```http
GET /api/search/popular-tags?limit=10
Authorization: Bearer <access-token>
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with 10 salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: All inputs validated with express-validator
- **SQL Injection Prevention**: TypeORM parameterized queries
- **XSS Protection**: Helmet middleware
- **CORS Configuration**: Controlled origin access

## 📝 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `BAD_REQUEST` | 400 | Malformed request |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## 🔧 Configuration Options

### Storage

**Local Storage** (default):
```env
STORAGE_TYPE=local
```
Files stored in `uploads/` directory.

**AWS S3**:
```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=your-bucket
AWS_REGION=us-east-1
```

### Background Jobs

Requires Redis for Bull queue:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

Without Redis, captures are created but background processing (URL fetch, OCR) won't run.

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis, S3 configs
│   ├── entities/        # TypeORM entities
│   ├── middleware/      # Express middleware
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── jobs/            # Background jobs
│   ├── validators/      # Input validators
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── logs/                # Log files
├── uploads/             # Uploaded files (local storage)
├── .env                 # Environment variables
└── package.json
```

## 🚦 Health Check

```http
GET /health
```

Response:
```json
{
  "success": true,
  "message": "MemoryLayer API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 🐛 Debugging

Logs are stored in `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## 📦 Dependencies

Key dependencies:
- `express` - Web framework
- `typeorm` - ORM for PostgreSQL
- `pg` - PostgreSQL driver
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `bull` - Background job processing
- `axios` - HTTP client
- `cheerio` - HTML parsing
- `tesseract.js` - OCR
- `sharp` - Image processing
- `winston` - Logging

## 🐛 Troubleshooting

### Redis Connection Errors

If you see `Queue error: connect ECONNREFUSED 127.0.0.1:6379`:

**This is normal and expected if Redis is not installed!**

The backend works fine without Redis - background jobs are simply disabled. To enable background processing (URL fetching, OCR):

```bash
# Install Redis
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Start Redis
redis-server

# Restart backend
npm run dev
```

### Database Connection Errors

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Check database exists
psql -U postgres -c "\l" | grep memorylayer

# Create if missing
createdb memorylayer
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=5001

# Or kill process
lsof -ti:5000 | xargs kill
```

### AWS SDK Warning

The warning about AWS SDK v2 is harmless. The app uses local storage by default - AWS is optional.

## 🤝 Support

For issues or questions, please check the main README or create an issue.

---

**MemoryLayer Backend** - Built with Node.js, Express, and PostgreSQL
