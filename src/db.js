const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'library.db');

// Connect to the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create Users table if it does not exist
const createUsersTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            email TEXT,
            profilePicture TEXT,
            favoriteGenres TEXT,
            favoriteAuthors TEXT,
            favoriteBooks TEXT
        )
    `;
    db.run(query, (err) => {
        if (err) {
            console.error('Error creating Users table:', err.message);
        } else {
            console.log('Users table created successfully or already exists.');
        }
    });
};

// Create Books table if it does not exist
const createBooksTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            description TEXT,
            genres TEXT,
            cover TEXT,
            file TEXT,
            likes INTEGER DEFAULT 0,
            dislikes INTEGER DEFAULT 0
        )
    `;
    db.run(query, (err) => {
        if (err) {
            console.error('Error creating Books table:', err.message);
        } else {
            console.log('Books table created successfully or already exists.');
        }
    });
};

// Initialize the database by creating the necessary tables
const initializeDatabase = () => {
    createUsersTable();
    createBooksTable();
};

// Execute the initialization function
initializeDatabase();

module.exports = db;