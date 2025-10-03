// Fix for profile picture display in sidebar
// Add this after the refreshProfilePicture function in script.js

// Enhanced refreshProfilePicture with default image fallback
async function refreshProfilePicture() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            const timestamp = '?t=' + new Date().getTime();
            
            // Determine profile picture URL
            let profilePictureUrl = user.profilePicture || '';
            
            // If no profile picture, use default
            if (!profilePictureUrl) {
                profilePictureUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23333" width="80" height="80"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="32" font-family="Arial">👤</text></svg>';
            } else if (profilePictureUrl.startsWith('/uploads/')) {
                profilePictureUrl = API_BASE_URL + profilePictureUrl;
            }
            
            // Update both profile pictures
            const profilePic = document.getElementById('profile-picture');
            const burgerProfilePic = document.getElementById('burger-profile-picture');
            
            if (profilePic) {
                profilePic.src = profilePictureUrl + (profilePictureUrl.includes('data:') ? '' : timestamp);
                profilePic.onerror = function() {
                    this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect fill="%23333" width="120" height="120"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="48" font-family="Arial">👤</text></svg>';
                };
            }
            
            if (burgerProfilePic) {
                burgerProfilePic.src = profilePictureUrl + (profilePictureUrl.includes('data:') ? '' : timestamp);
                burgerProfilePic.onerror = function() {
                    this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23333" width="80" height="80"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="32" font-family="Arial">👤</text></svg>';
                };
            }
            
            return true;
        }
    } catch (error) {
        console.error('Error refreshing profile picture:', error);
        // Set default on error
        setDefaultProfilePicture();
    }
    return false;
}

// Helper function to set default profile picture
function setDefaultProfilePicture() {
    const defaultImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23333" width="80" height="80"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="32" font-family="Arial">👤</text></svg>';
    
    const profilePic = document.getElementById('profile-picture');
    const burgerProfilePic = document.getElementById('burger-profile-picture');
    
    if (profilePic) profilePic.src = defaultImage.replace('80', '120').replace('32', '48');
    if (burgerProfilePic) burgerProfilePic.src = defaultImage;
}

// Call this when opening sidebar
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
