import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// In-memory user store (for demo)
const users = [];
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'project2_secret',
  resave: false,
  saveUninitialized: true,
}));

// Serve static files from Project2 folder (frontend HTML)
app.use(express.static(path.resolve(__dirname, '..')));

// ===== API Endpoints =====

// Auth status
app.get('/api/auth-status', (req, res) => {
  if (req.session.admin) {
    return res.json({ type: 'admin', username: req.session.admin });
  }
  if (req.session.user) {
    const user = users.find(u => u.username === req.session.user);
    if (user) {
      return res.json({ type: 'user', username: user.username, email: user.email, registrationDate: user.registrationDate });
    }
  }
  res.json({ type: 'none' });
});

// Registration endpoint
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;

  // Check for existing username/email
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'Username or email already exists' });
  }

  const newUser = {
    username,
    email,
    password,
    registrationDate: new Date().toISOString()
  };
  users.push(newUser);

  res.json({ success: true });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Admin login
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = username;
    return res.json({ success: true });
  }

  // User login
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = username;
    return res.json({ success: true });
  }

  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// Admin login
app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = username;
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, error: 'Invalid admin credentials' });
});

// Logout (for both admin and user)
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, error: 'Logout failed' });
    res.json({ success: true });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});