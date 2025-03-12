# VRHub - VR Video Platform

A YouTube-like platform tailored for virtual reality (VR) videos, featuring an admin panel for managing content, user authentication, and a VR video player powered by the Delight VR API.

## Features

- **Admin Panel**: Upload and manage VR videos, tags, and studios
- **User Authentication**: Register, login, and manage liked videos
- **VR Video Player**: Integrated with Delight VR API for immersive playback
- **Responsive Design**: Modern UI with dark and light theme options
- **Video Management**: External video hosting with metadata management
- **Tag System**: Filter videos by customizable tags
- **Studio System**: Organize videos by creator studios

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- RESTful API design

### Frontend
- React with React Router
- Responsive CSS with theme support
- Delight VR API integration

## Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/vrhub.git
   cd vrhub
   ```

2. Install server dependencies:
   ```
   npm install
   ```

3. Install client dependencies:
   ```
   cd client
   npm install
   cd ..
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=vrhub
   DB_PASSWORD=postgres
   DB_PORT=5432
   ```

5. Initialize the database:
   ```
   npm run db:init
   ```

6. Start the development server:
   ```
   npm run dev
   ```

7. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get JWT token
- `GET /api/auth/me`: Get current user info

### Videos
- `GET /api/videos`: Get all videos with pagination and search
- `GET /api/videos/:id`: Get a single video
- `POST /api/videos`: Create a new video (admin only)
- `PUT /api/videos/:id`: Update a video (admin only)
- `DELETE /api/videos/:id`: Delete a video (admin only)

### Tags
- `GET /api/tags`: Get all tags
- `GET /api/tags/:id`: Get a single tag
- `POST /api/tags`: Create a new tag (admin only)
- `PUT /api/tags/:id`: Update a tag (admin only)
- `DELETE /api/tags/:id`: Delete a tag (admin only)

### Studios
- `GET /api/studios`: Get all studios
- `GET /api/studios/:id`: Get a single studio
- `POST /api/studios`: Create a new studio (admin only)
- `PUT /api/studios/:id`: Update a studio (admin only)
- `DELETE /api/studios/:id`: Delete a studio (admin only)

### Likes
- `POST /api/likes/videos/:id`: Toggle like on a video
- `GET /api/likes`: Get all videos liked by the current user

## Default Admin Account

- Email: admin@vrhub.com
- Password: admin123

## License

This project is licensed under the MIT License - see the LICENSE file for details. 