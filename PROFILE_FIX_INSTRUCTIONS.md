# Profile Picture Fix Instructions

## Problem
The profile picture in the sidebar is not displaying because:
1. The `refreshProfilePicture()` function doesn't set a default image
2. The toggle menu doesn't refresh the profile picture when opened

## Solution

Find and replace these functions in `public/script.js`:

### 1. Update the `toggleMenu` function (around line 427)

**FIND:**
```javascript
// Function to toggle the sidebar menu
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');

    if (sidebar.classList.contains('active')) {
        document.addEventListener('click', closeMenuOnClickOutside);
    } else {
        document.removeEventListener('click', closeMenuOnClickOutside);
    }
}
```

**REPLACE WITH:**
```javascript
// Function to toggle the sidebar menu
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');

    if (sidebar.classList.contains('active')) {
        // Refresh profile picture when sidebar opens
        refreshProfilePicture();
        document.addEventListener('click', closeMenuOnClickOutside);
    } else {
        document.removeEventListener('click', closeMenuOnClickOutside);
    }
}
```

### 2. Update the `refreshProfilePicture` function (around line 1260)

**FIND:**
```javascript
// function to refresh profile picture from database
async function refreshProfilePicture() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            if (user.profilePicture) {
                const timestamp = '?timestamp=' + new Date().getTime();
                const profilePic = document.getElementById('profile-picture');
                const burgerProfilePic = document.getElementById('burger-profile-picture');
                
                if (profilePic) profilePic.src = user.profilePicture + timestamp;
                if (burgerProfilePic) burgerProfilePic.src = user.profilePicture + timestamp;
            }
        }
    } catch (error) {
        console.error('Error refreshing profile picture:', error);
    }
}
```

**REPLACE WITH:**
```javascript
// function to refresh profile picture from database
async function refreshProfilePicture() {
    // Default image SVG - user icon
    const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23444" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="32" font-family="Arial"%3E👤%3C/text%3E%3C/svg%3E';
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            const timestamp = '?t=' + new Date().getTime();
            
            let profilePictureUrl = user.profilePicture || defaultImage;
            
            // Handle relative URLs
            if (profilePictureUrl && profilePictureUrl.startsWith('/uploads/')) {
                profilePictureUrl = API_BASE_URL + profilePictureUrl;
            }
            
            const profilePic = document.getElementById('profile-picture');
            const burgerProfilePic = document.getElementById('burger-profile-picture');
            
            if (profilePic) {
                profilePic.src = profilePictureUrl.includes('data:') ? profilePictureUrl : profilePictureUrl + timestamp;
                profilePic.onerror = function() {
                    this.src = defaultImage;
                };
            }
            
            if (burgerProfilePic) {
                burgerProfilePic.src = profilePictureUrl.includes('data:') ? profilePictureUrl : profilePictureUrl + timestamp;
                burgerProfilePic.onerror = function() {
                    this.src = defaultImage;
                };
            }
        } else {
            // Set default if request fails
            setDefaultProfilePictures();
        }
    } catch (error) {
        console.error('Error refreshing profile picture:', error);
        // Set default on error
        setDefaultProfilePictures();
    }
}

// Helper function to set default profile pictures
function setDefaultProfilePictures() {
    const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23444" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="32" font-family="Arial"%3E👤%3C/text%3E%3C/svg%3E';
    const defaultImageLarge = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect fill="%23444" width="120" height="120"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="48" font-family="Arial"%3E👤%3C/text%3E%3C/svg%3E';
    
    const profilePic = document.getElementById('profile-picture');
    const burgerProfilePic = document.getElementById('burger-profile-picture');
    
    if (profilePic) profilePic.src = defaultImageLarge;
    if (burgerProfilePic) burgerProfilePic.src = defaultImage;
}
```

## Quick Fix Command

Or run this script to do it automatically:

```bash
node cleanup.js
```

This will clean up all the redundant files AND you can manually apply the fixes above.

## Test

After applying fixes:
1. Refresh the page
2. Log in
3. Click the hamburger menu
4. Profile picture should show (either your uploaded image or a default user icon)

---

**Note:** The profile picture also shows in the HTML as:
```html
<img id="burger-profile-picture" src="" alt="Profile Picture" loading="lazy" style="width: 80px; height: 80px; border-radius: 50%;">
```

The `src=""` is empty by default, which is why you see nothing. The fix above ensures it always has a fallback image.
