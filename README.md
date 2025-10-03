# Des2 Library Management System

A full-stack library management application built with Node.js, Express, PostgreSQL, and vanilla JavaScript.

## Quick Start

```bash
# Install dependencies
npm install

# Set up your .env file with DATABASE_URL
# Then start the server
npm start
```

Server runs on: http://localhost:3000

## Available Scripts

- `npm start` - Start the server
- `npm run test:connection` - Test database connection
- `npm run diagnose` - Run connection diagnostics (if issues occur)

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=your_supabase_connection_string
SESSION_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
ADMIN_EMAIL=admin@des2library.com
FRONTEND_URL=http://localhost:3000
```

## Features

- User authentication & authorization
- Book management (CRUD operations)
- AI-powered book recommendations
- Review and rating system
- Book search and filtering
- Admin dashboard

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Passport.js, bcrypt
- **AI**: HuggingFace API for recommendations
- **Frontend**: Vanilla JavaScript, HTML, CSS

## Project Structure

```
├── src/
│   ├── config/         # Database & environment config
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Authentication & validation
│   ├── routes/         # API routes
│   └── services/       # Business logic
├── public/             # Static frontend files
└── server.js          # Entry point
```

## Default Admin Credentials

- Username: `admin`
- Password: Set in `.env` file

## Troubleshooting

If you encounter database connection issues:

1. Ensure you're using **Session Mode** (port 5432) in Supabase
2. Run `npm run diagnose` to test your connection
3. Check that your Supabase project is active (not paused)

## License

ISC
