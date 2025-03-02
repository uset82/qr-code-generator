# QR Møllebakken Art Project - Detailed Documentation

## Project Overview

QR Møllebakken is a digital art gallery platform designed specifically for Møllebakken school, enabling seamless sharing of student artwork between teachers and parents. The platform creates a bridge between the classroom and home, allowing parents to stay connected with their children's artistic development through modern QR code technology.

## Core Features

### 1. Dual Access System
- **Teacher Portal**
  - Secure upload interface for student artwork
  - Media management dashboard
  - Student portfolio overview
  - Upload progress tracking
  - Storage quota monitoring

- **Parent Portal**
  - QR code-based authentication
  - Personal gallery view of their child's artwork
  - Offline viewing capability
  - Chronological artwork timeline

### 2. Media Support
- **Images**
  - Quota: 3 images per student
  - Supported formats: PNG, JPG, GIF
  - Size limit: 10MB per image
  - High-quality image optimization

- **Videos**
  - Quota: 1 video per student
  - Maximum duration: 20 seconds
  - Size limit: 50MB
  - Automatic format validation

- **Audio Recordings**
  - Quota: 1 audio recording per student
  - Maximum duration: 1 minute
  - Size limit: 10MB
  - Voice recording support

### 3. Student Management
- Individual portfolios for each student
- Organized storage structure
- Automatic folder creation
- Custom naming conventions

### 4. Security Features
- Supabase Authentication
- Secure QR code generation
- Parent-specific access control
- Data encryption
- Offline data protection

### 5. Technical Architecture

#### Frontend
- React 18 with TypeScript
- Vite build system
- Tailwind CSS for styling
- Responsive design
- Progressive Web App capabilities

#### Backend (Supabase)
- PostgreSQL database
- Supabase Storage for media
- Supabase Auth
- Row Level Security (RLS)
- Real-time subscriptions

#### Performance Features
- Lazy loading of images
- Optimized media delivery
- Offline-first architecture
- Automatic retry mechanisms

## Student List Management
Currently supporting 18 students:
1. Adrian Årnes
2. Aisha Adde
3. Angel Joshua Citegetse
4. Aron Joele Stevenson
5. Elisei Cercea
6. Emi Bella Mnichowska
7. Enos Iraguha
8. Heman Mohamed Abdulah
9. Israel Boadi Nyamedo Appiagyei
10. Jacob Mellingen Carpio
11. Julie Stevenson
12. Lukas Abemyil-Olaisen
13. Martine Nkwano Sebagenzi
14. Mawadah Ibrahim Mohammed
15. Minja Aklilu Samuel
16. Mulki Mohammed
17. Sara-Petruta Ionas
18. Sarolt Szofia Papdi

## Implementation Details

### Database Schema
```sql
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

-- Insert all students
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
ON CONFLICT (id) DO NOTHING;

-- Insert sample artwork for each student
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
    ('sarolt-szofia-papdi-artwork1', 'Portfolio', 'Sarolt Szofia Papdi', 'sarolt-szofia-papdi', '', 'portfolio')
ON CONFLICT (id) DO NOTHING;
```

### Storage Structure
```
students/
  ├── [student-folder-name]/
  │   ├── images/
  │   │   ├── [timestamp]-image1.jpg
  │   │   ├── [timestamp]-image2.jpg
  │   │   └── [timestamp]-image3.jpg
  │   ├── videos/
  │   │   └── [timestamp]-video1.mp4
  │   └── audio/
  │       └── [timestamp]-audio1.mp3
```

### Supabase Integration
- **Authentication**: Email/password and custom QR code auth
- **Database**: PostgreSQL with RLS policies
- **Storage**: Bucket-based file storage with access controls
- **Real-time**: Live updates for new artwork uploads

### Error Handling
- Network failure recovery
- Upload retry mechanism
- Quota violation prevention
- Format validation
- Size restriction enforcement

## Future Enhancements
1. Multi-language support
2. Parent commenting system
3. Teacher annotation tools
4. Artwork timeline view
5. Exhibition mode for school events
6. Bulk upload capabilities
7. Advanced media editing tools
8. Integration with school management system

## Technical Requirements

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure
```
src/
  ├── components/      # Reusable UI components
  │   ├── artwork/    # Artwork-specific components
  │   └── ui/         # Generic UI components
  ├── lib/            # Core functionality
  │   ├── api/        # API integration layer
  │   ├── supabase/   # Supabase client and queries
  │   └── utils/      # Utility functions
  ├── pages/          # Main application pages
  └── types/          # TypeScript type definitions
```

## Deployment
The application is designed to be deployed on any static hosting platform, with:
- Global CDN
- SSL certification
- Custom domain support
- Automatic builds
- Version control
- Rollback capabilities

## Data Insertion

### Insert all students
```sql
-- Insert all students
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
ON CONFLICT (id) DO NOTHING;
```

### Insert sample artwork for each student
```sql
-- Insert sample artwork for each student
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
    ('sarolt-szofia-papdi-artwork1', 'Portfolio', 'Sarolt Szofia Papdi', 'sarolt-szofia-papdi', '', 'portfolio')
ON CONFLICT (id) DO NOTHING;
```