# Node.js Express Backend for Project2

## Features
- User registration and login (in-memory)
- Separate admin authentication
- Session management
- Serves static HTML files

## Usage

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser at [http://localhost:3000/index.html](http://localhost:3000/index.html)

## Endpoints
- `POST /api/register` — Register a new user
- `POST /api/login` — User login
- `POST /api/admin-login` — Admin login
- `POST /api/logout` — Logout
- `GET /api/auth-status` — Get current authentication status

## Note
- This backend uses in-memory storage for demo purposes. For production, use a database and proper password hashing.
