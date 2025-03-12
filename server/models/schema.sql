-- Drop tables if they exist (for clean initialization)
DROP TABLE IF EXISTS view_history;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS video_tags;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS studios;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tags table
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- Create studios table
CREATE TABLE studios (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  website VARCHAR(255),
  logo_url VARCHAR(255)
);

-- Create videos table
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  studio_id INTEGER REFERENCES studios(id) ON DELETE SET NULL,
  video_url VARCHAR(255) NOT NULL,
  thumbnail_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create video_tags junction table
CREATE TABLE video_tags (
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, tag_id)
);

-- Create likes table
CREATE TABLE likes (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, video_id)
);

-- Create view history table
CREATE TABLE view_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 1,
  UNIQUE(user_id, video_id)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, name, is_admin) 
VALUES ('admin@vrhub.com', '$2b$10$mLZGHMYVX6JGQIk2N13n8eYfEICaf3Ot9XT4Iag1zBF12Oe2d0Jqm', 'Admin User', TRUE);

-- Insert some sample tags
INSERT INTO tags (name, description) VALUES 
('Adventure', 'Exciting outdoor and action-packed VR experiences'),
('Simulation', 'Realistic simulations of real-world activities'),
('Educational', 'Learning experiences and educational content'),
('Entertainment', 'Fun and engaging entertainment experiences'),
('Sports', 'Sports and athletic activities in VR'),
('Travel', 'Virtual tourism and travel experiences'),
('Gaming', 'VR gaming experiences and game-related content'),
('Music', 'Music videos and audio-visual experiences');

-- Insert some sample studios
INSERT INTO studios (name, description, website) VALUES 
('DreamVR', 'Creating immersive dream-like experiences', 'https://dreamvr.example.com'),
('VRealityStudios', 'Pushing the boundaries of virtual reality', 'https://vrealitystudios.example.com'),
('ImmerseTech', 'Technology-focused immersive experiences', 'https://immersetech.example.com'),
('360Visions', 'Specializing in 360-degree video content', 'https://360visions.example.com'),
('VirtualScapes', 'Beautiful virtual landscapes and environments', 'https://virtualscapes.example.com'); 