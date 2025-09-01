# Professional Notes App

A full-stack note-taking application with secure authentication and CRUD operations. Built with React frontend and FastAPI backend.

## Features

- 🔐 JWT-based authentication (register/login)
- 📝 Create, read, update, delete notes
- 🔍 Search notes by title and content
- 👤 User-specific note management
- 🎨 Modern dark theme UI
- 📱 Responsive design

## Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS
- Lucide React icons

**Backend:**
- FastAPI
- SQLite database
- JWT authentication
- bcrypt password hashing

## Quick Start

### Option 1: Docker (Recommended)

1. Clone the repository
```bash
git clone https://github.com/vikas-kansotiyanew/quick-notes.git
cd notes-app
```

2. Run with Docker Compose
```bash
chmod +x deploy.sh
./deploy.sh
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Local Development

#### Prerequisites
- Node.js 18+
- Python 3.11+
- pip

#### Backend Setup

1. Navigate to backend directory
```bash
cd backend
```

2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create environment file
```bash
echo "SECRET_KEY=your-secret-key-change-in-production" > .env
```

5. Run the backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup

1. Open new terminal and navigate to frontend directory
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Access the application at http://localhost:3000

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Notes
- `GET /notes` - Get all user notes
- `POST /notes` - Create new note
- `GET /notes/{id}` - Get specific note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note
- `GET /notes/search?q={query}` - Search notes

### Health
- `GET /health` - Health check
- `GET /` - API info

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notes Table
```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## Authentication

- Uses JWT tokens with HS256 algorithm
- Tokens expire in 30 minutes
- Passwords hashed with bcrypt
- Bearer token authentication for protected routes

## Failure Mode & Mitigation

**Race Condition in Note Updates:**
- **Problem:** Multiple simultaneous updates to the same note could cause data loss
- **Mitigation:** Implement optimistic locking with version numbers or timestamps, return HTTP 409 on conflicts

## Project Structure

```
notes-app/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Backend container config
│   └── .env                # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Tailwind styles
│   ├── package.json        # Node dependencies
│   ├── vite.config.js      # Vite configuration
│   └── Dockerfile          # Frontend container config
├── docker-compose.yml      # Multi-container setup
├── deploy.sh              # Deployment script
└── README.md              # This file
```

## Development

### Backend Development
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Docker
docker-compose build --no-cache
```

## Environment Variables

Create `.env` file in backend directory:
```
SECRET_KEY=your-super-secret-key-change-in-production
DATABASE_URL=notes.db
```

## License

This project is for educational purposes.