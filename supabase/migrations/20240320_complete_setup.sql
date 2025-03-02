-- First drop existing tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS qr_visits;
DROP TABLE IF EXISTS artworks;
DROP TABLE IF EXISTS students;

-- Create tables
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    folder_name TEXT NOT NULL UNIQUE,
    grade TEXT DEFAULT '1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artworks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    student TEXT NOT NULL,
    student_id TEXT NOT NULL,
    image_url TEXT,
    file_path TEXT,
    type TEXT DEFAULT 'image',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT fk_student
        FOREIGN KEY(student_id) 
        REFERENCES students(folder_name)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS qr_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id TEXT REFERENCES artworks(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Insert initial student data
INSERT INTO students (name, folder_name, grade) 
VALUES 
    ('Adrian Årnes', 'adrian-arnes', '1'),
    ('Aisha Adde', 'aisha-adde', '1'),
    ('Angel Joshua Citegetse', 'angel-joshua-citegetse', '1'),
    ('Aron Joele Stevenson', 'aron-joele-stevenson', '1'),
    ('Elisei Cercea', 'elisei-cercea', '1'),
    ('Emi Bella Mnichowska', 'emi-bella-mnichowska', '1'),
    ('Enos Iraguha', 'enos-iraguha', '1'),
    ('Heman Mohamed Abdulah', 'heman-mohamed-abdulah', '1'),
    ('Israel Boadi Nyamedo Appiagyei', 'israel-boadi-nyamedo-appiagyei', '1'),
    ('Jacob Mellingen Carpio', 'jacob-mellingen-carpio', '1'),
    ('Julie Stevenson', 'julie-stevenson', '1'),
    ('Lukas Abemyil-Olaisen', 'lukas-abemyil-olaisen', '1'),
    ('Martine Nkwano Sebagenzi', 'martine-nkwano-sebagenzi', '1'),
    ('Mawadah Ibrahim Mohammed', 'mawadah-ibrahim-mohammed', '1'),
    ('Minja Aklilu Samuel', 'minja-aklilu-samuel', '1'),
    ('Mulki Mohammed', 'mulki-mohammed', '1'),
    ('Sara-Petruta Ionas', 'sara-petruta-ionas', '1'),
    ('Sarolt Szofia Papdi', 'sarolt-szofia-papdi', '1')
ON CONFLICT (folder_name) DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_visits ENABLE ROW LEVEL SECURITY;

-- Storage policies
CREATE POLICY "Give users access to own folder" ON storage.objects
    FOR ALL USING (
        bucket_id = 'artworks' AND 
        (auth.role() = 'authenticated' OR auth.role() = 'anon')
    );

CREATE POLICY "Allow public viewing of images" ON storage.objects
    FOR SELECT USING (bucket_id = 'artworks');

CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'artworks' AND 
        auth.role() = 'authenticated'
    );

-- RLS Policies for students table
CREATE POLICY "Anyone can view students"
ON students FOR SELECT
USING (true);

-- RLS Policies for artworks table
CREATE POLICY "Anyone can view artworks"
ON artworks FOR SELECT
USING (true);

CREATE POLICY "Users can insert artworks"
ON artworks FOR INSERT
TO authenticated
WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = auth.uid()
);

CREATE POLICY "Users can update their artworks"
ON artworks FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their artworks"
ON artworks FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- RLS Policies for qr_visits table
CREATE POLICY "Anyone can insert visits"
ON qr_visits FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view visits"
ON qr_visits FOR SELECT
USING (true);

-- Create updated_at trigger for artworks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artworks_updated_at
    BEFORE UPDATE ON artworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artworks_student_id ON artworks(student_id);
CREATE INDEX IF NOT EXISTS idx_artworks_created_by ON artworks(created_by);
CREATE INDEX IF NOT EXISTS idx_qr_visits_artwork_id ON qr_visits(artwork_id); 