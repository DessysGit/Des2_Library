const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

// Initialize Passport and session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } //set to true if using HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Set up SQLite database
let db = new sqlite3.Database(path.join(__dirname, 'library.db'), (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create Users table
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    email TEXT,
    profilePicture TEXT,
    favoriteGenres TEXT,
    favoriteAuthors TEXT,
    favoriteBooks TEXT
)`);

// Create Books table
db.run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    description TEXT,
    genres TEXT,
    cover TEXT,
    file TEXT
)`);

// Add likes and dislikes columns to the Books table if they don't exist
db.run(`ALTER TABLE books ADD COLUMN likes INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding likes column:', err.message);
    }
});
db.run(`ALTER TABLE books ADD COLUMN dislikes INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding dislikes column:', err.message);
    }
});

// Add summary column to the Books table if it doesn't exist
db.run(`ALTER TABLE books ADD COLUMN summary TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding summary column:', err.message);
    }
});

// Create Likes table to track user likes and dislikes
db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    bookId INTEGER,
    action TEXT,
    UNIQUE(userId, bookId)
)`);

// Seed admin user if not exists
const seedAdmin = async () => {
    db.get('SELECT COUNT(*) AS count FROM users WHERE username = ?', ['admin'], async (err, row) => {
        if (err) {
            console.error('Error checking admin existence:', err.message);
        } else if (row.count === 0) {
            const hashedPassword = await bcrypt.hash('adminpassword', 10);
            db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin'], (err) => {
                if (err) {
                    console.log('Error creating admin:', err.message);
                } else {
                    console.log('Admin user seeded successfully.');
                }
            });
        } else {
            console.log('Admin user already exists.');
        }
    });
};
seedAdmin();

// Configure Passport.js for authentication
passport.use(new LocalStrategy((username, password, done) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return done(err);
        if (!user || !bcrypt.compareSync(password, user.password)) return done(null, false, { message: 'Incorrect username or password.' });
        return done(null, user);
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) return done(err);
        done(null, user);
    });
});

// Middleware to parse JSON
app.use(express.json());

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Authentication check middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).send('You must be logged in to perform this action.');
};

// Verify the user role is set correctly
app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
            if (user) {
                req.user.role = user.role; // Ensure the role is set correctly
            }
            next();
        });
    } else {
        next();
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Save file with its original name
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 50000000 } }); // 50 MB limit

// Profile picture upload endpoint
app.post('/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
    const profilePictureUrl = `/uploads/${req.file.filename}`;
    const userId = req.user.id; // Assuming user ID is available in the request

    // Update the user's profile picture URL in the database
    db.run('UPDATE users SET profilePicture = ? WHERE id = ?', [profilePictureUrl, userId], function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json({ profilePictureUrl });
    });
});

// Endpoint to get user profile
app.get('/profile', isAuthenticated, (req, res) => {
    const { id } = req.user;
    db.get('SELECT username, email, role, profilePicture, favoriteGenres, favoriteAuthors, favoriteBooks FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(user);
    });
});

// Endpoint to update user profile
app.post('/updateProfile', isAuthenticated, (req, res) => {
    const { id } = req.user;
    const { email, password, favoriteGenres, favoriteAuthors, favoriteBooks } = req.body;

    let updateQuery = 'UPDATE users SET email = ?, favoriteGenres = ?, favoriteAuthors = ?, favoriteBooks = ?';
    let params = [email, favoriteGenres, favoriteAuthors, favoriteBooks, id];

    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        updateQuery = 'UPDATE users SET email = ?, password = ?, favoriteGenres = ?, favoriteAuthors = ?, favoriteBooks = ?';
        params = [email, hashedPassword, favoriteGenres, favoriteAuthors, favoriteBooks, id];
    }

    db.run(updateQuery + ' WHERE id = ?', params, function (err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.send('Profile updated successfully.');
    });
});

// Path to the file where email addresses will be stored
const subscribersFilePath = path.join(__dirname, 'subscribers.txt');

// Newsletter subscription endpoint
app.post('/subscribe', isAuthenticated, (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send('Email is required');
    }

    let subscribers = [];
    if (fs.existsSync(subscribersFilePath)) {
        subscribers = fs.readFileSync(subscribersFilePath, 'utf-8').split('\n').filter(Boolean);
    }

    if (subscribers.includes(email)) {
        return res.status(400).send('Email is already subscribed');
    }

    fs.appendFileSync(subscribersFilePath, email + '\n');
    res.send('Subscribed successfully');
});

// Endpoint to fetch books
app.get('/books', (req, res) => {
    const title = req.query.title || "";
    const author = req.query.author || "";
    const genre = req.query.genre || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const isAdmin = req.isAuthenticated() && req.user.role === 'admin';

    let query = 'SELECT * FROM books WHERE title LIKE ? AND author LIKE ?';
    let params = [`%${title}%`, `%${author}%`];

    if (genre) {
        query += ' AND genres LIKE ?';
        params.push(`%${genre}%`);
    }
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).send('Failed to fetch books');
        } else {
            db.get('SELECT COUNT(*) AS total FROM books WHERE title LIKE ? AND author LIKE ?', [`%${title}%`, `%${author}%`], (err, count) => {
                if (err) {
                    res.status(500).send('Failed to fetch book count');
                } else {
                    const booksWithAdminFlag = rows.map(book => ({
                        ...book,
                        isAdmin: isAdmin
                    }));
                    res.json({ books: booksWithAdminFlag, total: count.total });
                }
            });
        }
    });
});

// Endpoint to fetch book details by ID
app.get('/books/:id', (req, res) => {
    const bookId = req.params.id;
    db.get('SELECT id, title, author, genres, summary, description, cover, file FROM books WHERE id = ?', [bookId], (err, row) => {
        if (err) {
            console.error('Error fetching book details:', err);
            return res.status(500).send('Failed to fetch book details');
        }
        if (!row) {
            return res.status(404).send('Book not found');
        }
        res.json(row);
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, "user")', [username, hashedPassword], (err) => {
        if (err) {
            res.status(400).send(err.message);
            return;
        }
        res.send('User registered successfully.');
    });
});

// Login route
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.status(401).send('Incorrect username or password'); }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            res.json(user); // Send the user info including the role
        });
    })(req, res, next);
});

// Logout route
app.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.send('Logged out successfully.');
    });
});

// Current user route
app.get('/current-user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).send('Not authenticated');
    }
});

// Seed admin username
const seedAdminUsername = 'admin';

// Seed admin check middleware
const isSeedAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.username === seedAdminUsername) return next();
    res.status(403).send('Only the seeded admin can perform this action.');
};

// Admin check middleware
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    res.status(403).send('Only admin can perform this action.');
};

// Check authentication status
app.get('/checkAuthStatus', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(true);
    } else {
        res.json(false);
    }
});

// Add book endpoint (admin only)
app.post('/addBook', isAdmin, upload.fields([{ name: 'bookCover', maxCount: 1 }, { name: 'bookFile', maxCount: 1 }]), (req, res) => {
    const { title, author, description } = req.body;
    const genres = JSON.parse(req.body.genres);
    const cover = req.files['bookCover'] ? req.files['bookCover'][0].originalname : null;
    const file = req.files['bookFile'] ? req.files['bookFile'][0].originalname : null;
    const genresString = genres.join(",");

    if (!title || !author || !description || !genresString) {
        res.status(400).send('Missing required fields');
        return;
    }

    db.run('INSERT INTO books (title, author, description, genres, cover, file) VALUES (?, ?, ?, ?, ?, ?)', [title, author, description, genresString, cover, file], function (err) {
        if (err) {
            console.error('Error adding book:', err);
            res.status(500).send('Failed to add book');
        } else {
            res.status(200).send('Book added successfully');
        }
    });
});

// Endpoint to download a book file
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, filename); // Serve the file with its original name
    } else {
        res.status(404).send('File not found');
    }
});

// Grant admin role (seeded admin only)
app.post('/users/:id/grant-admin', isSeedAdmin, (req, res) => {
    const { id } = req.params;
    db.run('UPDATE users SET role = "admin" WHERE id = ?', id, function (err) {
        if (err) {
            res.status(400).send(err.message);
            return;
        }
        res.send(`User with ID ${id} granted admin role.`);
    });
});

// Revoke admin role (seeded admin only)
app.post('/users/:id/revoke-admin', isSeedAdmin, (req, res) => {
    const { id } = req.params;
    db.run('UPDATE users SET role = "user" WHERE id = ? AND role = "admin"', id, function (err) {
        if (err) {
            res.status(400).send(err.message);
            return;
        }
        res.send(`User with ID ${id} revoked admin role.`);
    });
});

// Edit book endpoint (admin only)
app.put('/books/:id', isAdmin, (req, res) => {
    const bookId = req.params.id;
    const { title, author, genres, summary, description } = req.body;
    db.run(
        'UPDATE books SET title = ?, author = ?, genres = ?, summary = ?, description = ? WHERE id = ?',
        [title, author, genres, summary, description, bookId],
        function (err) {
            if (err) {
                console.error('Error editing book:', err);
                res.status(500).send('Failed to edit book');
            } else {
                res.status(200).send('Book edited successfully');
            }
        }
    );
});

// Delete book endpoint (admin only)
app.delete('/books/:id', isAdmin, (req, res) => {
    const bookId = req.params.id;

    // Fetch book details to get the file names
    db.get('SELECT cover, file FROM books WHERE id = ?', [bookId], (err, row) => {
        if (err) {
            console.error('Error fetching book details:', err);
            return res.status(500).send('Failed to fetch book details');
        }

        const { cover, file } = row;
        const coverPath = path.join(__dirname, 'uploads', cover);
        const filePath = path.join(__dirname, 'uploads', file);

        // Delete the book record from the database
        db.run('DELETE FROM books WHERE id = ?', [bookId], function (err) {
            if (err) {
                console.error('Error deleting book:', err);
                return res.status(500).send('Failed to delete book');
            }

            // Delete the cover image file
            if (fs.existsSync(coverPath)) {
                fs.unlink(coverPath, (err) => {
                    if (err) {
                        console.error('Error deleting cover image:', err);
                    }
                });
            }

            // Delete the book file
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting book file:', err);
                    }
                });
            }

            res.status(200).send('Book deleted successfully');
        });
    });
});

// Endpoint to handle like action
app.post('/books/:id/like', isAuthenticated, (req, res) => {
    const bookId = req.params.id;
    const userId = req.user.id;

    db.serialize(() => {
        db.get('SELECT action FROM likes WHERE userId = ? AND bookId = ?', [userId, bookId], (err, row) => {
            if (err) {
                console.error('Error checking like status:', err);
                return res.status(500).send('Failed to like book');
            }

            if (row && row.action === 'like') {
                return res.status(400).send('You have already liked this book');
            }

            db.run('BEGIN TRANSACTION');
            if (row && row.action === 'dislike') {
                db.run('UPDATE books SET dislikes = dislikes - 1 WHERE id = ?', [bookId]);
            }
            db.run('UPDATE books SET likes = likes + 1 WHERE id = ?', [bookId]);
            db.run('INSERT OR REPLACE INTO likes (userId, bookId, action) VALUES (?, ?, ?)', [userId, bookId, 'like']);
            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('Error committing transaction:', err);
                    return res.status(500).send('Failed to like book');
                }
                db.get('SELECT likes, dislikes FROM books WHERE id = ?', [bookId], (err, row) => {
                    if (err) {
                        console.error('Error fetching book likes/dislikes:', err);
                        return res.status(500).send('Failed to fetch book likes/dislikes');
                    }
                    res.json(row);
                });
            });
        });
    });
});

// Endpoint to handle dislike action
app.post('/books/:id/dislike', isAuthenticated, (req, res) => {
    const bookId = req.params.id;
    const userId = req.user.id;

    db.serialize(() => {
        db.get('SELECT action FROM likes WHERE userId = ? AND bookId = ?', [userId, bookId], (err, row) => {
            if (err) {
                console.error('Error checking dislike status:', err);
                return res.status(500).send('Failed to dislike book');
            }

            if (row && row.action === 'dislike') {
                return res.status(400).send('You have already disliked this book');
            }

            db.run('BEGIN TRANSACTION');
            if (row && row.action === 'like') {
                db.run('UPDATE books SET likes = likes - 1 WHERE id = ?', [bookId]);
            }
            db.run('UPDATE books SET dislikes = dislikes + 1 WHERE id = ?', [bookId]);
            db.run('INSERT OR REPLACE INTO likes (userId, bookId, action) VALUES (?, ?, ?)', [userId, bookId, 'dislike']);
            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('Error committing transaction:', err);
                    return res.status(500).send('Failed to dislike book');
                }
                db.get('SELECT likes, dislikes FROM books WHERE id = ?', [bookId], (err, row) => {
                    if (err) {
                        console.error('Error fetching book likes/dislikes:', err);
                        return res.status(500).send('Failed to fetch book likes/dislikes');
                    }
                    res.json(row);
                });
            });
        });
    });
});

// Search books
app.get('/books/search', (req, res) => {
    const { query } = req.query;
    db.all('SELECT * FROM books WHERE title LIKE ? OR author LIKE ?', [`%${query}%`, `%${query}%`], (err, rows) => {
        if (err) {
            res.status(400).send(err.message);
            return;
        }
        res.json(rows);
    });
});

// Get all users (admin only)
app.get('/users', isAdmin, (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(400).send(err.message);
            return;
        }
        res.json(rows);
    });
});

// Delete a specific user (admin only)
app.delete('/users/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM users WHERE id = ? AND role != "admin"', id, function (err) {
        if (err) {
            res.status(400).send(err.message);
            return;
        }
        res.send('User deleted successfully.');
    });
});

// Endpoint for recommended books
app.get("/recommendations", isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    try {
        const response = await axios.get(`http://127.0.0.1:5000/recommendations?user_id=${encodeURIComponent(userId)}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching recommendations:', error.response ? error.response.data : error.message); // Log detailed error
        res.status(500).json({ error: "Error fetching recommendations" });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});