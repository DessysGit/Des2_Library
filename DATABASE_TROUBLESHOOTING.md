# Database Connection Troubleshooting Guide

## Quick Fix Steps

If you're experiencing `ECONNRESET` errors, follow these steps in order:

### Step 1: Check Your Connection Mode
```bash
node connection-guide.js
```

This will analyze your current database connection and provide specific recommendations.

### Step 2: Run Diagnostics
```bash
node diagnose-connection.js
```

This will test different connection configurations and identify which one works best.

### Step 3: Apply the Fix

Based on the diagnostic results, the issue is likely one of these:

## Common Issues and Solutions

### Issue 1: Using Wrong Supabase Connection Mode

**Symptoms:**
- `ECONNRESET` errors during table creation
- Connection works but CREATE TABLE fails
- "Uncaught Exception: Error: read ECONNRESET"

**Solution:**

You need to use **Session Mode** (port 5432) instead of **Transaction Mode** (port 6543).

**How to fix:**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Click on **Session mode** tab
6. Copy the connection string
7. Update your `.env` file:

```env
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

### Issue 2: SSL Configuration

**Symptoms:**
- "self signed certificate" errors
- Connection timeouts

**Solution:**

Make sure your database config has SSL enabled with `rejectUnauthorized: false`:

```javascript
ssl: {
  rejectUnauthorized: false
}
```

This is already configured in the updated `src/config/database.js`.

### Issue 3: Connection Timeout

**Symptoms:**
- Long delays before errors
- Intermittent connection failures

**Solution:**

Increase timeout values (already done in the updated config):

```javascript
connectionTimeoutMillis: 15000,
idleTimeoutMillis: 60000,
statement_timeout: 60000,
```

### Issue 4: Supabase Project Paused

**Symptoms:**
- Connections fail completely
- "Connection refused" errors

**Solution:**

1. Check your [Supabase Dashboard](https://supabase.com/dashboard)
2. Verify your project is **active** (not paused)
3. Free tier projects pause after 1 week of inactivity
4. Click "Resume Project" if paused

## Testing Your Fix

After making changes:

```bash
# Test the database connection
node check-database.js

# If successful, start your server
node server.js
```

## Understanding Connection Modes

### Session Mode (Port 5432) - RECOMMENDED
- ✅ Supports all SQL operations (CREATE TABLE, ALTER, etc.)
- ✅ Better for long-running queries
- ✅ Suitable for migrations and DDL operations
- Use this for development and when creating tables

### Transaction Mode (Port 6543)
- ❌ Limited SQL support
- ❌ Cannot run CREATE TABLE reliably
- ❌ May cause ECONNRESET with DDL operations
- Only use for simple SELECT/INSERT/UPDATE queries

### Direct Connection (Port 5432, no pooler)
- ✅ Full SQL support
- ⚠️  Limited number of connections (60-100 max)
- ⚠️  Less scalable for production
- Good for development, but prefer pooler for production

## What Changed

The updated configuration includes:

1. **Dual connection pools**: One for regular queries, one for DDL operations
2. **Better error handling**: Prevents uncaught exceptions from crashing the server
3. **Optimized timeouts**: Longer timeouts for DDL operations
4. **Keep-alive**: Prevents idle connection drops
5. **Graceful shutdown**: Properly closes connections on exit

## Still Having Issues?

If you're still experiencing problems:

1. **Check Supabase status**: https://status.supabase.com/
2. **Review connection limits**: Free tier has limits on concurrent connections
3. **Check network**: Corporate firewalls may block database connections
4. **Verify credentials**: Ensure your password is correct in DATABASE_URL
5. **Try direct connection**: Temporarily use direct connection string (without `.pooler.`)

## Files Modified

- ✅ `src/config/database.js` - Updated connection configuration
- ✅ `server.js` - Improved error handling
- ✅ `diagnose-connection.js` - New diagnostic tool
- ✅ `connection-guide.js` - New connection analyzer

## Support

If you need help:
1. Run `node diagnose-connection.js` and share the output
2. Check the Supabase dashboard for any alerts
3. Verify your project hasn't been paused (free tier limitation)

---

**Last Updated:** October 2, 2025
