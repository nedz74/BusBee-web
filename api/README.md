# BusBee API Backend

A Node.js Express server with PostgreSQL database integration for the BusBee web application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `api` directory with the following variables:
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_DATABASE=busbee_db
   PORT=3001
   ```

3. **Start the server:**
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-restart)
   npm run dev
   ```

## 📡 API Endpoints

### Base URL
```
http://localhost:3001
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/`      | Health check - Returns "BusBee API is running" |
| GET    | `/users` | Fetch all users from database |

### Example Requests

**Health Check:**
```bash
curl http://localhost:3001/
```

**Get Users:**
```bash
curl http://localhost:3001/users
```

## 🗄️ Database Setup

### PostgreSQL Configuration
- **Host:** localhost
- **Port:** 5432
- **Database:** busbee_db
- **User:** postgres

### Database Connection
The API automatically connects to PostgreSQL using a connection pool. You'll see a connection confirmation message when the server starts:
```
Database connected at: 2025-09-12T20:12:53.815Z
```

## 🛠️ Development

### Scripts
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run tests (placeholder)

### Dependencies
- **express** - Web framework
- **pg** - PostgreSQL client
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing

### Project Structure
```
api/
├── index.js          # Main server file
├── package.json      # Dependencies and scripts
├── .env             # Environment variables
└── README.md        # This file
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | postgres |
| `DB_PASSWORD` | PostgreSQL password | - |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_DATABASE` | Database name | busbee_db |
| `PORT` | Server port | 3001 |

### CORS Configuration
The API includes CORS middleware to allow cross-origin requests from your frontend application.

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error:**
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database `busbee_db` exists

**Port Already in Use:**
- Change the `PORT` in `.env` file
- Kill existing processes on port 3001

**Dependencies Not Found:**
- Run `npm install` in the `api` directory
- Check Node.js version compatibility

## 🔗 Integration with Frontend

From the root directory, you can start both frontend and backend:

```bash
# Terminal 1 - Start backend
npm run api:dev

# Terminal 2 - Start frontend
npm run dev
```

The frontend (Next.js) will run on `http://localhost:3000`
The backend API will run on `http://localhost:3001`

## 📝 Next Steps

- [ ] Create database tables for users, routes, bookings
- [ ] Add authentication middleware
- [ ] Implement CRUD operations for all entities
- [ ] Add input validation
- [ ] Set up error handling middleware
- [ ] Add API documentation with Swagger
- [ ] Implement logging system

## 📞 Support

For issues or questions, check the main project documentation or contact the development team.
