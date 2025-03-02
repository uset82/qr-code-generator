# QR Code Generator for Møllebakken Art Project

An interactive web application for teachers to manage student artwork and generate QR codes that link to student portfolios or individual artwork pieces. This project is designed specifically for educational institutions to showcase student work through modern web technology.

![QR Code Generator](https://via.placeholder.com/800x400?text=QR+Code+Generator+Screenshot)

## 🌟 Features

### QR Code Generation System
- **Dynamic QR Codes** - Generate QR codes for both student portfolios and individual artworks
- **Direct URL Links** - Create shareable links alongside QR codes
- **Customizable QR Codes** - Adjust size and download options
- **Instant Preview** - See QR codes and test links in real-time

### Teacher Portal
- **Media Upload** - Upload images, videos, and audio files for students
- **Student Management** - Organize content by student
- **Content Organization** - Add descriptions and metadata to uploads
- **Media Library** - View and manage all uploaded content

### Authentication & Security
- **Supabase Auth Integration** - Secure login/signup with email/password
- **Role-Based Access** - Specific controls for teacher roles 
- **Protected Routes** - Teacher portal restricted to authenticated users with proper role

### Offline Support
- **Local Storage Caching** - Artwork and student data are cached for offline access
- **Sync Indicator** - Clear visual indicators show which content is pending sync
- **Automatic Sync** - Content is automatically synced when connectivity is restored

### Modern UI/UX
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Dark Theme** - Modern dark theme with accent colors
- **Intuitive Interface** - User-friendly design for teachers and students

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/qr-code-generator.git
   cd qr-code-generator
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 🌐 Deployment

### Build for Production

1. Create a production build
   ```bash
   npm run build
   # or
   yarn build
   ```

2. The build files will be in the `dist` directory, which can be deployed to any static hosting service.

### Important: Setting the Base URL for QR Codes

When deploying to production, you must set the `VITE_APP_URL` environment variable to your actual domain to ensure QR codes work correctly:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_URL=https://your-actual-domain.com
```

Without this setting, QR codes will use the browser's current URL, which won't work when scanned from other devices.

### Deployment Options

#### Netlify
1. Create a new site from Git in Netlify
2. Connect to your GitHub repository
3. Set build command to `npm run build` or `yarn build`
4. Set publish directory to `dist`
5. Add environment variables for Supabase in the Netlify dashboard

#### Vercel
1. Import your GitHub repository in Vercel
2. Vercel will automatically detect Vite configuration
3. Add environment variables for Supabase in the Vercel dashboard
4. Deploy

#### GitHub Pages
1. Install gh-pages package
   ```bash
   npm install --save-dev gh-pages
   # or
   yarn add --dev gh-pages
   ```

2. Add these scripts to your package.json
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. Deploy to GitHub Pages
   ```bash
   npm run deploy
   # or
   yarn deploy
   ```

## 🗄️ Database Setup

This project uses Supabase for backend services. Here's how to set up your database:

1. Create a new project in Supabase
2. Set up the following tables:
   - `students` - Store student information
   - `artworks` - Store artwork metadata and references
   - `users` - Managed by Supabase Auth

3. Create the necessary storage buckets:
   - `artwork-images` - For image uploads
   - `artwork-videos` - For video uploads
   - `artwork-audio` - For audio uploads

4. Set up Row Level Security (RLS) policies to secure your data

## 🧩 Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utility functions and hooks
│   ├── pages/           # Page components
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   └── TraeTheme.css    # Global styles
├── .env                 # Environment variables (create this)
├── index.html           # HTML template
├── package.json         # Project dependencies
└── vite.config.js       # Vite configuration
```

## 🔧 Customization

### Styling
The project uses a custom CSS theme defined in `src/TraeTheme.css`. You can modify this file to change colors, spacing, and other design elements.

### Adding Students
Update the student data in the application by modifying the `students` array in the appropriate component or by connecting to your database.

### Environment Variables
Create a `.env` file with the following variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_TITLE=QR Code Generator
VITE_APP_URL=https://your-actual-domain.com  # Required for QR codes to work on other devices
```

## 📱 Using the Application

### For Teachers
1. Log in to access the Teacher Portal
2. Select a student from the list
3. Upload media (images, videos, audio) for the selected student
4. Add descriptions and metadata to the uploads
5. Generate QR codes for student portfolios or individual artworks
6. Download QR codes or copy direct links for sharing

### For Viewers
1. Scan a QR code or follow a share link
2. View the student's portfolio or individual artwork
3. Navigate between different media types
4. Works offline if previously cached

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.io/)
- [QRCode.react](https://github.com/zpao/qrcode.react)
- [React Router](https://reactrouter.com/)

---

Developed with ❤️ for Møllebakken Art Project