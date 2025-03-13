-- Create anonymous_views table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'anonymous_views'
    ) THEN
        CREATE TABLE anonymous_views (
            id SERIAL PRIMARY KEY,
            ip_address VARCHAR(45) NOT NULL,
            video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
            viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(ip_address, video_id)
        );
        
        -- Create index for faster lookups
        CREATE INDEX idx_anonymous_views_ip_video 
        ON anonymous_views(ip_address, video_id);
        
        -- Create index for timestamp-based queries
        CREATE INDEX idx_anonymous_views_viewed_at 
        ON anonymous_views(viewed_at);
    END IF;
END $$; 