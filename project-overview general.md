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
-- Artworks table
create table artworks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  url text not null,
  file_path text not null,
  type text not null,
  student_id text not null,
  student_name text not null
);

-- Students table
create table students (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  folder_name text not null,
  grade text not null
);
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