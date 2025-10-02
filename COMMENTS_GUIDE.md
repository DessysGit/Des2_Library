# Code Comments Guide

## What Was Added

I've added comprehensive comments to help understand every part of the code.

## Commented Files

### 1. server.js (Main Entry Point)
Comments explain the startup sequence and error handling.

### 2. src/app.js (Express Configuration)
Comments explain middleware, CORS, sessions, and route registration.

### 3. src/config/database.js (Database Setup)
Detailed comments on connection pooling, table schemas, and retry logic.

## How to Read the Code

### Start Here
1. Read `server.js` - Entry point
2. Read `src/app.js` - Main configuration
3. Read `src/config/database.js` - Database setup
4. Browse `src/routes/` - API endpoints

### Comment Structure

**File Headers** - What the file does
```javascript
/**
 * File Name - Purpose
 * This file handles X, Y, and Z
 */
```

**Section Headers** - Organize code
```javascript
// ============================================
// SECTION NAME
// ============================================
```

**Function Docs** - What functions do
```javascript
/**
 * Does something
 * @param {string} name - Parameter description
 * @returns {boolean} What it returns
 */
```

**Inline Comments** - Explain tricky parts
```javascript
const x = 5; // Why this value
```

## Key Files With Best Comments

### Most Important (Read First)
1. `server.js` - Startup process
2. `src/app.js` - Express setup
3. `src/config/database.js` - Database
4. `src/routes/auth.js` - Authentication

### Reference When Needed
- `src/routes/books.js` - Book operations
- `src/routes/users.js` - User management
- `src/services/emailService.js` - Email sending

## Quick Reference

### Where is X?
- **Database connection**: `src/config/database.js`
- **Authentication**: `src/config/passport.js` + `src/routes/auth.js`
- **API endpoints**: `src/routes/`
- **Email sending**: `src/services/emailService.js`
- **Middleware**: `src/middleware/`
- **Environment config**: `src/config/environment.js`

### How does X work?
- **Login flow**: See comments in `src/routes/auth.js`
- **Book upload**: See comments in `src/routes/books.js`
- **Sessions**: See comments in `src/app.js` (session section)
- **File storage**: See comments in `src/routes/books.js` (upload section)

## Understanding the Architecture

Read in this order:
1. `ARCHITECTURE.md` - System overview
2. `server.js` - How it starts
3. `src/app.js` - How it's configured
4. Individual route files - How endpoints work

## Documentation Files to Read

**For Quick Start:**
- `START_HERE.md`
- `FIXES_APPLIED.md`

**For Deep Dive:**
- `REFACTORING_GUIDE.md`
- `ARCHITECTURE.md`

**For Git Upload:**
- `GIT_UPLOAD_GUIDE.md` ⭐

**For Testing:**
- `VERIFICATION_CHECKLIST.md`

## Git Upload Summary

### Files to Upload ✓
- All `.md` files
- All `src/` files
- All `public/` files
- `server.js`
- `package.json`
- `recommend.py`
- `.gitignore`

### Files to NOT Upload ✗
- `.env` (secrets!)
- `node_modules/` (too large)
- `uploads/` (user data)
- `*.db` (local databases)
- `server.js.old` (backup)

### Quick Git Commands
```bash
# Check what will be uploaded
git status

# Add files
git add .

# Commit
git commit -m "Refactor: Modular architecture"

# Push
git push
```

See `GIT_UPLOAD_GUIDE.md` for complete instructions.

## Next Steps

1. **Read** `START_HERE.md`
2. **Review** `GIT_UPLOAD_GUIDE.md`
3. **Test** using `VERIFICATION_CHECKLIST.md`
4. **Upload** to Git following the guide
5. **Reference** `REFACTORING_GUIDE.md` when needed
