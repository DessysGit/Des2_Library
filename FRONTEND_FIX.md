# Frontend API Endpoint Fix

## Issue
The frontend `script.js` is calling `/profile` and `/updateProfile` endpoints that don't exist in the new modular structure.

## Solution
Replace these endpoints in `public/script.js`:

### Old Endpoints → New Endpoints

1. **Profile fetch:**
   - OLD: `${API_BASE_URL}/profile`
   - NEW: `${API_BASE_URL}/users/profile`

2. **Update profile:**
   - OLD: `${API_BASE_URL}/updateProfile`
   - NEW: `${API_BASE_URL}/users/updateProfile`

3. **Upload profile picture:**
   - OLD: `${API_BASE_URL}/upload-profile-picture`
   - NEW: `${API_BASE_URL}/users/upload-profile-picture`

4. **Add book:**
   - OLD: `${API_BASE_URL}/addBook`
   - NEW: `${API_BASE_URL}/books` (POST method)

## Quick Fix Script

Run this find-and-replace in `public/script.js`:

```bash
# Find: ${API_BASE_URL}/profile
# Replace: ${API_BASE_URL}/users/profile

# Find: ${API_BASE_URL}/updateProfile
# Replace: ${API_BASE_URL}/users/updateProfile

# Find: ${API_BASE_URL}/upload-profile-picture
# Replace: ${API_BASE_URL}/users/upload-profile-picture

# Find: ${API_BASE_URL}/addBook
# Replace: ${API_BASE_URL}/books
```

## Locations to Update

**Line ~1414:** `refreshProfilePicture()` function
```javascript
const response = await fetch(`${API_BASE_URL}/users/profile`, { credentials: 'include' });
```

**Line ~1434:** `fetchProfile()` function  
```javascript
const response = await fetch(`${API_BASE_URL}/users/profile`, { credentials: 'include' });
```

**Line ~1353:** `updateProfile()` function
```javascript
const response = await fetch(`${API_BASE_URL}/users/updateProfile`, {
```

**Line ~1372:** `uploadProfilePicture()` function
```javascript
const response = await fetch(`${API_BASE_URL}/users/upload-profile-picture`, {
```

**Line ~1063:** `addBook()` function
```javascript
const response = await fetch(`${API_BASE_URL}/books`, {
```

## After Fix
Restart your server and refresh the browser. The 404 errors should be resolved.
