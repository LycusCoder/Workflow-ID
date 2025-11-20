# WorkFlow ID

A Progressive Web App (PWA) for office management, featuring face-based attendance and task management.

## Project Structure

- `backend/`: FastAPI backend with SQLite database
- `interface/`: Next.js frontend
- `scripts/`: Development scripts

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

## Backend Setup

1. Navigate to the backend folder:
   ```
   cd backend
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the FastAPI server:
   ```
   uvicorn main:app --reload
   ```

   The API will be available at `http://127.0.0.1:8000`

## Frontend Setup

1. Navigate to the interface folder:
   ```
   cd interface
   ```

2. Install Node.js dependencies:
   ```
   yarn install
   ```

3. Run the Next.js development server:
   ```
   yarn dev
   ```

   The app will be available at `http://localhost:3000`

## Development

To run both the backend and frontend simultaneously, use the provided PowerShell script:

```
.\scripts\dev.ps1
```

This will start the FastAPI server on port 8000 and the Next.js app on port 3000.

## Features

- User registration and management
- Face-based attendance tracking (future integration with face-api.js)
- Task creation and management

## API Documentation

Once the backend is running, visit `http://127.0.0.1:8000/docs` for interactive API documentation using Swagger UI.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
