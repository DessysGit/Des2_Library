# Des2 Library - Refactored Backend Structure

## 📁 New Project Structure

```
Library_Project/
├── server.js                    # Main entry point
├── public/                      # Frontend files
│   ├── index.html
│   ├── book-details.html
│   ├── reset-password.html
│   ├── script.js
│   ├── style.css
│   └── chatbot/
│       ├── chat.css
│       └── chat.js
├── src/                         # Backend source code
│   ├── app.js                   # Express app configuration
│   ├── config/                  # Configuration files
│   │   ├── database.js          # Database connection & setup
│   │   ├── environment.js       # Environment variables
│   │   ├── cloudinary.js        # Cloudinary configuration
│   │   └── passport.js          # Passport authentication config
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js              # Authentication middleware
│   │   └── rateLimiter.js       # Rate limiting middleware
│   ├── routes/                  # Route handlers
│   │   ├── auth.js              # Authentication routes
│   │   ├── books.js             # Book CRUD operations
│   │   ├── reviews.js           # Book reviews
│   │   ├── users.js             # User management
│   │   ├── recommendations.js   # Book recommendations
│   │   ├── newsletter.js        # Newsletter subscription
│   │   ├── download.js          # File download
│   │   └── chatbot.js           # AI chatbot
│   ├── services/                # Business logic services
│   │   ├── emailService.js      # Email sending (SendGrid)
│   │   └── databaseService.js   # Database operations
│   └── utils/                   # Utility functions (for future use)
├── uploads/                     # Local file uploads (dev only)
├── recommend.py                 # Python recommendation system
├── package.json
└── .env                         # Environment variables
```

## 🎯 Key Improvements

### 1. **Separation of Concerns**
- Each module has a single, well-defined responsibility
- Easy to locate and modify specific functionality
- Reduced coupling between components

### 2. **Modular Routes**
- **auth.js**: Registration, login, logout, email verification, password reset
- **books.js**: CRUD operations, like/dislike functionality
- **reviews.js**: Fetch and submit book reviews
- **users.js**: User profile management, admin operations
- **recommendations.js**: AI-powered book recommendations
- **newsletter.js**: Newsletter subscriptions
- **download.js**: Book file downloads
- **chatbot.js**: AI chatbot integration

### 3. **Configuration Management**
- **database.js**: Centralized database configuration
- **environment.js**: Environment-specific settings
- **cloudinary.js**: Cloud storage configuration
- **passport.js**: Authentication strategy configuration

### 4. **Reusable Middleware**
- **auth.js**: `isAuthenticated`, `isAdmin`, `isSeedAdmin`
- **rateLimiter.js**: Rate limiting for sensitive endpoints

### 5. **Service Layer**
- **emailService.js**: Email templates and sending logic
- **databaseService.js**: Database initialization and maintenance

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Server
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secret-key

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
FRONTEND_DEV_URL=http://localhost:3000

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FORCE_CLOUDINARY=false

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Hugging Face (for chatbot)
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

## 🛣️ API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /verify-email?token=xxx` - Verify email
- `POST /resend-verification` - Resend verification email
- `POST /request-password-reset` - Request password reset
- `GET /validate-reset-token/:token` - Validate reset token
- `POST /reset-password` - Reset password
- `GET /current-user` - Get current user info
- `GET /checkAuthStatus` - Check if user is authenticated

### Books
- `GET /books` - Get all books (with filters & pagination)
- `GET /books/:id` - Get book by ID
- `POST /books` - Add new book (admin)
- `PUT /books/:id` - Update book (admin)
- `DELETE /books/:id` - Delete book (admin)
- `POST /books/:id/like` - Like a book
- `POST /books/:id/dislike` - Dislike a book

### Reviews
- `GET /books/:bookId/reviews` - Get book reviews
- `POST /books/:bookId/reviews` - Submit a review

### Users
- `GET /users` - Get all users (admin)
- `GET /users/profile` - Get user profile
- `POST /users/updateProfile` - Update profile
- `POST /users/upload-profile-picture` - Upload profile picture
- `POST /users/:id/grant-admin` - Grant admin role (seed admin)
- `POST /users/:id/revoke-admin` - Revoke admin role (seed admin)
- `DELETE /users/:id` - Delete user (seed admin)

### Other
- `GET /recommendations` - Get book recommendations
- `POST /subscribe` - Subscribe to newsletter
- `GET /download/:bookId` - Download book file
- `POST /api/chat` - Chat with AI

### Health Checks
- `GET /health` - Server health check
- `GET /email-health` - Email service health check

## 🔧 Adding New Features

### Adding a New Route

1. Create a new file in `src/routes/`:
```javascript
// src/routes/myNewRoute.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, (req, res) => {
  res.json({ message: 'My new route' });
});

module.exports = router;
```

2. Register the route in `src/app.js`:
```javascript
const myNewRoute = require('./routes/myNewRoute');
app.use('/my-new-route', myNewRoute);
```

### Adding New Middleware

1. Create a new file in `src/middleware/`:
```javascript
// src/middleware/myMiddleware.js
const myMiddleware = (req, res, next) => {
  // Your middleware logic
  next();
};

module.exports = { myMiddleware };
```

2. Use it in your routes:
```javascript
const { myMiddleware } = require('../middleware/myMiddleware');
router.get('/', myMiddleware, (req, res) => {
  // ...
});
```

### Adding New Services

1. Create a new file in `src/services/`:
```javascript
// src/services/myService.js
async function myServiceFunction() {
  // Your service logic
}

module.exports = { myServiceFunction };
```

2. Import and use in routes:
```javascript
const { myServiceFunction } = require('../services/myService');
```

## 🐛 Troubleshooting

### Database Connection Issues
- Check DATABASE_URL format
- Ensure SSL is configured correctly
- Verify firewall allows connections

### Email Not Sending
- Verify SENDGRID_API_KEY is correct
- Check SENDGRID_FROM_EMAIL is verified
- Look at logs for specific errors

### File Upload Issues
- In production: Check Cloudinary credentials
- In development: Ensure uploads/ folder exists

### CORS Issues
- Add your frontend URL to allowedOrigins in `src/config/environment.js`
- Check that credentials: true is set on frontend fetch requests

## 📚 Module Responsibilities

### Config Files
- **database.js**: Database pool, connection testing, table creation
- **environment.js**: Environment detection, URL configuration
- **cloudinary.js**: Cloudinary client setup
- **passport.js**: Passport strategies and serialization

### Middleware
- **auth.js**: Authentication checks (isAuthenticated, isAdmin, isSeedAdmin)
- **rateLimiter.js**: Rate limiting configuration

### Routes
- **auth.js**: All authentication-related endpoints
- **books.js**: Book CRUD and interactions
- **reviews.js**: Review management
- **users.js**: User profile and admin operations
- **recommendations.js**: AI book recommendations
- **newsletter.js**: Newsletter subscriptions
- **download.js**: File streaming and downloads
- **chatbot.js**: AI chatbot integration

### Services
- **emailService.js**: Email templates and SendGrid integration
- **databaseService.js**: Admin seeding, rating calculations

## 🔄 Migration from Old Structure

Your old `server.js` file has been split into:

1. **server.js** (new) - Entry point, database setup
2. **src/app.js** - Express app configuration
3. **src/config/** - All configuration
4. **src/routes/** - All route handlers
5. **src/services/** - Business logic
6. **src/middleware/** - Reusable middleware

All functionality remains the same, just better organized!

## 📖 Benefits of This Structure

1. **Maintainability**: Easy to find and fix bugs
2. **Scalability**: Simple to add new features
3. **Testability**: Each module can be tested independently
4. **Readability**: Clear separation of concerns
5. **Collaboration**: Multiple developers can work on different modules
6. **Reusability**: Services and middleware can be reused

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the structure
4. Test your changes
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
