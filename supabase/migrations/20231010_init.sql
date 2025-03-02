-- First drop existing tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS qr_visits;
DROP TABLE IF EXISTS artworks;
DROP TABLE IF EXISTS students;

-- Then create tables fresh
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

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    folder_name TEXT NOT NULL,
    grade TEXT DEFAULT '1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qr_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id TEXT REFERENCES artworks(id),
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Now insert all students
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
    ('Sarolt Szofia Papdi', 'sarolt-szofia-papdi', '1');

-- Insert portfolios for all students
INSERT INTO artworks (id, title, student, student_id, image_url, type) 
VALUES 
    ('adrian-arnes-artwork1', 'Portfolio', 'Adrian Årnes', 'adrian-arnes', '', 'portfolio'),
    ('aisha-adde-artwork1', 'Portfolio', 'Aisha Adde', 'aisha-adde', '', 'portfolio'),
    ('angel-joshua-citegetse-artwork1', 'Portfolio', 'Angel Joshua Citegetse', 'angel-joshua-citegetse', '', 'portfolio'),
    ('aron-joele-stevenson-artwork1', 'Portfolio', 'Aron Joele Stevenson', 'aron-joele-stevenson', '', 'portfolio'),
    ('elisei-cercea-artwork1', 'Portfolio', 'Elisei Cercea', 'elisei-cercea', '', 'portfolio'),
    ('emi-bella-mnichowska-artwork1', 'Portfolio', 'Emi Bella Mnichowska', 'emi-bella-mnichowska', '', 'portfolio'),
    ('enos-iraguha-artwork1', 'Portfolio', 'Enos Iraguha', 'enos-iraguha', '', 'portfolio'),
    ('heman-mohamed-abdulah-artwork1', 'Portfolio', 'Heman Mohamed Abdulah', 'heman-mohamed-abdulah', '', 'portfolio'),
    ('israel-boadi-artwork1', 'Portfolio', 'Israel Boadi Nyamedo Appiagyei', 'israel-boadi-nyamedo-appiagyei', '', 'portfolio'),
    ('jacob-mellingen-carpio-artwork1', 'Portfolio', 'Jacob Mellingen Carpio', 'jacob-mellingen-carpio', '', 'portfolio'),
    ('julie-stevenson-artwork1', 'Portfolio', 'Julie Stevenson', 'julie-stevenson', '', 'portfolio'),
    ('lukas-abemyil-olaisen-artwork1', 'Portfolio', 'Lukas Abemyil-Olaisen', 'lukas-abemyil-olaisen', '', 'portfolio'),
    ('martine-nkwano-sebagenzi-artwork1', 'Portfolio', 'Martine Nkwano Sebagenzi', 'martine-nkwano-sebagenzi', '', 'portfolio'),
    ('mawadah-ibrahim-mohammed-artwork1', 'Portfolio', 'Mawadah Ibrahim Mohammed', 'mawadah-ibrahim-mohammed', '', 'portfolio'),
    ('minja-aklilu-samuel-artwork1', 'Portfolio', 'Minja Aklilu Samuel', 'minja-aklilu-samuel', '', 'portfolio'),
    ('mulki-mohammed-artwork1', 'Portfolio', 'Mulki Mohammed', 'mulki-mohammed', '', 'portfolio'),
    ('sara-petruta-ionas-artwork1', 'Portfolio', 'Sara-Petruta Ionas', 'sara-petruta-ionas', '', 'portfolio'),
    ('sarolt-szofia-papdi-artwork1', 'Portfolio', 'Sarolt Szofia Papdi', 'sarolt-szofia-papdi', '', 'portfolio');