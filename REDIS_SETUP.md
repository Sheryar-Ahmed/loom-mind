# Background Processing Setup

## How It Works

MemoryLayer processes captures in the background to:
- Fetch URL metadata, titles, and summaries
- Extract text from images using OCR
- Generate thumbnails
- Analyze and enrich content

## Current Status: ✅ **Works WITHOUT Redis**

Your app now has **automatic fallback**:
- **Without Redis**: Processes captures immediately (synchronous)
- **With Redis**: Processes captures in background queue (better performance)

## Redis Options

### Option 1: Local Redis (100% Free, Recommended)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server -y
sudo systemctl start redis
sudo systemctl enable redis
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

Then add to your `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Option 2: Free Cloud Redis

#### Upstash Redis (Best Free Tier)
- **Free**: 10,000 commands/day
- **No credit card required**
- **Setup**: https://upstash.com

1. Create free account at upstash.com
2. Create Redis database
3. Copy connection details to `.env`:
```env
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_TLS=true
```

#### Redis Cloud
- **Free**: 30MB storage
- **Setup**: https://redis.com/try-free

#### Railway.app
- **Free**: $5 credit/month (enough for Redis)
- **Setup**: https://railway.app

### Option 3: No Redis (Current Setup)

✅ Already works! Just keep using the app without Redis.

**Trade-offs:**
- ✅ No installation needed
- ✅ Simple setup
- ❌ URL processing blocks response slightly
- ❌ No retry on failures
- ❌ Less scalable

## Checking Status

When your backend starts, you'll see:
```
✅ Bull queue initialized successfully  # Redis working
⚠️  Redis not configured. Background processing disabled.  # No Redis, using sync
```

Both modes work fine!

## Recommendation

- **Development**: No Redis needed (what you have now)
- **Production**: Install local Redis (`sudo apt install redis-server`)
- **Hosted**: Use Upstash free tier

Your app is already production-ready without Redis! 🚀
