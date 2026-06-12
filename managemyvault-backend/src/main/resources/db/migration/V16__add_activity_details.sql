-- Add details column to activity_events table for rich timeline messages
ALTER TABLE activity_events ADD COLUMN details VARCHAR(255);
