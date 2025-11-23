# WorkFlow ID Application Plan

## Overview

WorkFlow ID is a Progressive Web App (PWA) designed for office management, focusing on modern workplace efficiency with innovative features for attendance and task management. The application leverages face recognition technology for secure authentication and streamlined attendance tracking.

## Current Status (Phase 2 Complete)

✅ **Infrastructure**: Backend API, database, and frontend foundation fully operational  
✅ **Face Recognition**: Complete implementation of face-based authentication system  
✅ **User Registration**: Multi-step form with face capture and 128D embedding storage  
✅ **Login System**: Face recognition authentication with euclidean distance matching (threshold < 0.6)  
🚧 **Dashboard**: Next priority - user dashboard with session management  
🚧 **Attendance**: Face recognition attendance marking to be implemented  
🚧 **Tasks**: Task management interface to be added

## Core Features

### 1. Face-Based Attendance System
- **Technology**: face-api.js (SSD MobileNet V1, 68-point landmarks, 128D face descriptors)
- **Backend**: FastAPI with face embedding storage in SQLite as JSON strings
- **Purpose**: Secure and convenient attendance tracking without physical cards
- **Implementation**: 
  - ✅ Camera access and face detection
  - ✅ Face embedding extraction (Float32Array → JSON)
  - ✅ Registration: Multi-step form with countdown timer (3-2-1) and face capture
  - ✅ Login: Face matching algorithm with best-match selection (lowest distance < 0.6)
  - 🚧 Attendance marking: Quick check-in/check-out with face verification
  - 🚧 Attendance history: View and export attendance records

### 2. User Authentication
- **Registration**: 
  - ✅ Three-step process: Personal info → Face capture → Confirmation
  - ✅ Real-time face detection with visual feedback
  - ✅ Countdown timer before automatic capture
  - ✅ Face embedding saved to backend via PUT /users/{id}
  
- **Login System**:
  - ✅ Face recognition authentication (alternative to email/password)
  - ✅ Euclidean distance calculation for face matching
  - ✅ Best-match algorithm selecting user with lowest distance
  - ✅ Threshold validation (distance < 0.6 required for match)
  - ✅ Progress indicator showing detection → matching → success flow
  - 🚧 Session management with JWT tokens
  - 🚧 Protected routes for authenticated users

- **Profiles**: 
  - ✅ Basic user information (name, email, position, department)
  - 🚧 Profile editing and avatar management
  - 🚧 User settings and preferences

### 3. Task Management
- **Interface**: Simple card-based task lists
- **Backend**: ✅ RESTful API for task CRUD operations (GET, POST, PUT, DELETE /tasks)
- **Features**: 
  - 🚧 Create, edit, mark complete, assign to users
  - 🚧 Task filtering and sorting
  - 🚧 Due date reminders

## Technical Stack

### Frontend
- **Framework**: Next.js 16.0.3 with App Router
- **UI**: React 19.2.0, TypeScript, Tailwind CSS v4, Shadcn UI
- **Face Recognition**: face-api.js 0.22.2
- **Build Tool**: Turbopack (next dev --turbopack)
- **Development Server**: Port 3000

### Backend
- **Framework**: FastAPI 0.104.1 with Uvicorn
- **Database**: SQLAlchemy 2.0.23 + SQLite (workflow.db)
- **Development Server**: Port 8001 (changed from 8000 due to Windows conflict)
- **Logging**: RotatingFileHandler with UTF-8 encoding (backend.log)

### Development Tools
- **Automation**: PowerShell scripts (scripts/dev.ps1)
- **Environment**: Python 3.11.x virtual environment (.venv)
- **Package Management**: Yarn (frontend), pip (backend)
- **API Configuration**: Centralized in lib/api.ts with environment variables

### Infrastructure
- **PWA Capabilities**: To be implemented
- **Mobile-First Design**: Responsive layouts with Tailwind
- **Cross-Platform**: Windows development with PowerShell

## Technical Challenges Solved

1. **Port Conflict**: Windows System using port 8000 → Changed backend to port 8001
2. **React Closures**: State not updating in async face detection loop → Used useRef pattern
3. **API Integration**: Network errors during registration → Created centralized API config
4. **Windows Encoding**: Emoji errors in logs → UTF-8 files, ASCII console output
5. **Face Matching**: Implementing euclidean distance algorithm with threshold validation

## Development Workflow

1. **Start Development**: Run `scripts/dev.ps1` to launch both servers
2. **Backend**: Python virtual environment activated, FastAPI with hot-reload
3. **Frontend**: Yarn dev with Turbopack for fast refresh
4. **Logging**: Console logs in frontend, file logs in backend (backend.log)
5. **Database**: SQLite with SQLAlchemy ORM, migrations handled manually

## Target Users
- Small to medium business offices
- Organizations needing automated attendance
- Teams requiring efficient task tracking
- Companies wanting contactless authentication

## Project Goals

### Completed ✅
1. Provide secure face recognition authentication system
2. Create maintainable, scalable codebase with TypeScript
3. Implement comprehensive logging for debugging
4. Build responsive mobile-first interface

### In Progress 🚧
1. User dashboard with session management
2. Face-based attendance marking system
3. Task management interface
4. PWA deployment capabilities

### Future Enhancements 🔮
1. JWT authentication with refresh tokens
2. Real-time notifications
3. Admin panel for user management
4. Attendance reports and analytics
5. Task assignment notifications
6. Dark mode support
7. Multi-language support

## Next Development Phase (Phase 3)

### Priority 1: Dashboard
- Protected route after successful login
- User profile display with avatar
- Quick access to attendance marking
- Recent tasks overview
- Navigation to main features

### Priority 2: Attendance Feature
- Face recognition attendance marking (check-in/check-out)
- Attendance history view with calendar
- Status indicators (present, late, absent)
- Export attendance data

### Priority 3: Task Management UI
- Task list with filtering
- Task creation form
- Task assignment to users
- Due date management
- Completion tracking

### Priority 4: Session & Security
- JWT token implementation
- Secure HTTP-only cookies
- Auto-logout after inactivity
- Protected API endpoints
- CSRF protection
