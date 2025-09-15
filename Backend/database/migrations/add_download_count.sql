-- Add download_count column to files table if it doesn't exist
ALTER TABLE files ADD COLUMN IF NOT EXISTS download_count INT DEFAULT 0;