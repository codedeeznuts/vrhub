-- Add views column to videos table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'videos' AND column_name = 'views'
    ) THEN
        ALTER TABLE videos ADD COLUMN views INTEGER DEFAULT 0;
        
        -- Update views count based on existing view_history data
        UPDATE videos v
        SET views = COALESCE(
            (SELECT SUM(view_count) 
             FROM view_history 
             WHERE video_id = v.id
             GROUP BY video_id),
            0
        );
    END IF;
END $$; 