# Quick Start Guide - MemoryLayer

Get up and running with MemoryLayer in 5 minutes!

## Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **npm** (comes with Node.js)

## Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

Then follow the on-screen instructions.

## Option 2: Manual Setup

### Step 1: Clone & Install

```bash
# Navigate to project
cd loom-mind

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment

**Backend Configuration:**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:

```env
# Minimum required configuration
NODE_ENV=development
PORT=5000
DATABASE_HOST=localhost
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=memorylayer
JWT_SECRET=change-this-to-random-secret
JWT_REFRESH_SECRET=change-this-to-another-random-secret
STORAGE_TYPE=local
```

**Frontend Configuration:**

```bash
cd ../frontend
cp .env.local.example .env.local
```

The default settings should work:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3: Setup Database

Create the PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE memorylayer;

# Exit
\q
```

Tables will be created automatically when you start the backend.

### Step 4: Start the Application

**Terminal 1 - Start Backend:**

```bash
cd backend
npm run dev
```

You should see:
```
✓ Database connected successfully
✓ Server running on port 5000
✓ API available at http://localhost:5000
```

**Terminal 2 - Start Frontend:**

```bash
cd frontend
npm run dev
```

You should see:
```
✓ Ready in 2s
✓ Local: http://localhost:3000
```

### Step 5: Open Application

Open your browser to `http://localhost:3000`

## First Steps

### 1. Create Account

- Click "Sign up"
- Enter your name, email, and password
- Click "Create Account"

### 2. Create Your First Capture

- Click the "New Capture" button
- Choose a capture type:
  - **URL**: Paste any web URL
  - **Text**: Write a quick note
  - **Image**: Upload an image
  - **File**: Upload a document
- Add tags (optional)
- Click "Create Capture"

### 3. Search Your Captures

- Use the search bar in the header
- Or visit the Search page from the sidebar
- Filter by type, tags, or date

### 4. Organize with Collections

- Navigate to Collections
- Click "New Collection"
- Add captures to organize them

## Troubleshooting

### Backend won't start

**Database connection failed:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Verify credentials in backend/.env
# Make sure database exists
psql -U postgres -c "\l" | grep memorylayer
```

**Port 5000 already in use:**
```bash
# Change PORT in backend/.env
PORT=5001

# Update frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### Frontend won't start

**Port 3000 already in use:**
```bash
# Next.js will prompt to use port 3001
# Press 'y' to accept
```

**API connection errors:**
```bash
# Verify backend is running
curl http://localhost:5000/health

# Check NEXT_PUBLIC_API_URL in frontend/.env.local
```

### Can't create account

**TypeORM error:**
```bash
# Make sure database exists and backend started successfully
# Check backend terminal for errors
# Tables should auto-create on first run
```

## Optional: Redis for Background Jobs

Background jobs (URL fetching, OCR) require Redis:

```bash
# Install Redis
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Start Redis
redis-server

# Restart backend
cd backend
npm run dev
```

Without Redis, captures will be created but background processing won't work.

## Optional: AWS S3 for Cloud Storage

By default, files are stored locally in `backend/uploads/`.

To use AWS S3:

1. Get AWS credentials from AWS Console
2. Update `backend/.env`:

```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1
```

3. Restart backend

## Development Commands

### Backend

```bash
npm run dev       # Start dev server
npm start         # Start production server
npm run lint      # Run ESLint
```

### Frontend

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run ESLint
```

## What's Next?

- Explore the Search page
- Create collections to organize captures
- Try different capture types
- Check Settings to manage your account
- Read the full README.md for advanced features

## Need Help?

- Check `README.md` in the root directory
- Read `backend/README.md` for API documentation
- Read `frontend/README.md` for frontend details
- Review code comments for implementation details

---

**Welcome to MemoryLayer!** 🎉

Your personal knowledge capture and search system is ready to use.
