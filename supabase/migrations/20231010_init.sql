-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    student TEXT NOT NULL,
    student_id TEXT NOT NULL,
    image_url TEXT,
    file_path TEXT,
    type TEXT DEFAULT 'image',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    folder_name TEXT NOT NULL,
    grade TEXT DEFAULT '1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create qr_visits table
CREATE TABLE IF NOT EXISTS qr_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id TEXT REFERENCES artworks(id),
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);