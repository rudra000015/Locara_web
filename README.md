# Locara - Heritage Shop Discovery Platform

A modern web application for discovering and exploring heritage shops in Meerut, with features for browsing, reviewing, and wishlisting traditional stores.

## Features

✨ **Heritage Shop Discovery**
- Browse heritage shops by location and category
- View detailed shop profiles and products
- Interactive map view with shop locations
- Search and filter functionality

📱 **User Experience**
- Smooth animations and transitions
- Dark/Light theme support
- Multi-language support (English/Hindi)
- Responsive design for mobile and desktop

👥 **User Roles**
- **Explorers**: Browse and review heritage shops
- **Shop Owners**: Manage shop profiles, products, and analytics

🔐 **Authentication**
- Email/password login
- Google authentication integration
- JWT-based session management
- LocalStorage persistence

## Tech Stack

- **Frontend**: React 18 + Next.js 14
- **UI Framework**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **Database**: MongoDB (optional)
- **Authentication**: JWT
- **Maps**: Leaflet + React Leaflet
- **Animations**: Framer Motion

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/locara.git
cd locara
```

2. Install dependencies:
```bash
pnpm install
```

3. Create `.env.local` file (optional for local development):
```env
# MongoDB (optional - app works without it)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/locara

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── explorer/       # Explorer pages
│   ├── owner/          # Shop owner pages
│   └── page.tsx        # Home page
├── components/         # Reusable React components
│   ├── auth/           # Authentication components
│   ├── explorer/       # Explorer feature components
│   ├── owner/          # Owner feature components
│   └── ui/             # UI components
├── lib/                # Utility functions and libraries
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization
├── models/             # MongoDB models
├── store/              # Zustand store
└── types/              # TypeScript types
```

## Key Features Implementation

### Login Flow
1. **AuthScreen** - Email/password login or Google auth
2. **TextPortal** - Animated "Locara" logo transition
3. **PopupCard** - Welcome popup with user profile
4. **Explorer/Owner** - Redirects to appropriate dashboard

### Data Storage
- **Local Storage**: User session and preferences
- **MongoDB** (optional): Shop data, reviews, and profiles
- **Static Data**: Demo shops for fallback

### API Routes
- `/api/auth/` - Authentication endpoints
- `/api/shops/` - Shop data
- `/api/reviews/` - Review management
- `/api/photo/` - Image handling
- `/api/push/` - Push notifications

## Deployment

### Netlify Deployment

1. Push to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/locara.git
git push -u origin main
```

2. Connect to Netlify:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your repository
   - Use these settings:
     - **Build command**: `pnpm build`
     - **Publish directory**: `.next`

### Vercel Deployment (Recommended for Next.js)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Deploy (auto-configured for Next.js)

## Environment Variables

Required for full functionality:

```env
# Database (optional)
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_secret_key_for_jwt

# Optional: API Keys for Google Places, OSM, etc.
GOOGLE_PLACES_API_KEY=your_key
```

## Development

### Available Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Framer Motion for animations

## Features by User Role

### Explorer Interface
- Browse heritage shops
- View product listings
- Write and read reviews
- Wishlist management
- Map view of shops
- Festival browsing

### Shop Owner Dashboard
- Shop profile management
- Product catalog
- Analytics and insights
- Review management
- Customer notifications

## API Documentation

### Shop Endpoints
- `GET /api/shops` - List shops with filters
- `GET /api/shops/[placeId]` - Get shop details
- `POST /api/shops` - Create shop (owner only)

### Review Endpoints
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/[id]` - Update review
- `DELETE /api/reviews/[id]` - Delete review

### Auth Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Code splitting and lazy loading
- Image optimization
- CSS-in-JS optimization
- API response caching
- LocalStorage for session persistence



## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Made with ❤️ for heritage shop lovers**
