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

-- Insert sample artwork data
INSERT INTO artworks (id, title, student, student_id, image_url) VALUES
('student1-artwork1', 'Sunset Landscape', 'John Doe', 'student1', 'https://example.com/artwork1.jpg'),
('student2-artwork1', 'Abstract Composition', 'Jane Smith', 'student2', 'https://example.com/artwork2.jpg'),
('student3-artwork1', 'Portrait Study', 'Mike Johnson', 'student3', 'https://example.com/artwork3.jpg')
ON CONFLICT (id) DO NOTHING;