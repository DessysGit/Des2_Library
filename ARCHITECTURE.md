# Des2 Library - Architecture Overview

## Request Flow

Client Request
  -> server.js (entry point)
  -> src/app.js (Express app)
  -> Middleware (CORS, sessions, auth)
  -> Routes (handle specific endpoints)
  -> Services (business logic)
  -> Database/External APIs
  -> Response back to client

## Module Dependencies

- server.js depends on: app.js, database config, services
- app.js depends on: all routes, middleware, config
- routes depend on: middleware, services, database
- services depend on: config, external APIs

## Security Flow

Request -> CORS Check -> Rate Limiter -> Session Check -> Auth Check -> Authorization -> Business Logic -> Response

## Database Schema

Tables: users, books, reviews, likes, session
Relationships: 
- reviews.userId references users.id
- reviews.bookId references books.id  
- likes.userId references users.id
- likes.bookId references books.id
