import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from './models/User.js';

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/project2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'project2_secret',
  resave: false,
  saveUninitialized: true
}));

// Serve static files
app.use(express.static(path.resolve('../')));

// =======================
// Registration
// =======================
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ success: false, error: 'Username or email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =======================
// User login
// =======================
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, role: 'user' });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    req.session.user = username;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =======================
// Admin login
// =======================
app.post('/api/admin-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await User.findOne({ username, role: 'admin' });
    if (!admin) return res.status(401).json({ success: false, error: 'Invalid admin credentials' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ success: false, error: 'Invalid admin credentials' });

    req.session.admin = username;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =======================
// Logout
// =======================
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, error: 'Logout failed' });
    res.json({ success: true });
  });
});

// =======================
// Auth status
// =======================
app.get('/api/auth-status', async (req, res) => {
  try {
    if (req.session.admin) return res.json({ type: 'admin', username: req.session.admin });
    if (req.session.user) {
      const user = await User.findOne({ username: req.session.user });
      if (user) return res.json({ type: 'user', username: user.username, email: user.email, registrationDate: user.registrationDate });
    }
    res.json({ type: 'none' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ type: 'none' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
