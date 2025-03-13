-- Add thumbnail_url column to tags table
ALTER TABLE tags ADD COLUMN thumbnail_url VARCHAR(255);

-- Update existing tags with placeholder thumbnails
UPDATE tags SET thumbnail_url = 'https://placehold.co/400x225/' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6) || '/ffffff?text=' || name WHERE thumbnail_url IS NULL; 