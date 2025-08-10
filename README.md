# SAIY Coffee App - Order Management System

A modern, real-time coffee ordering and management system built with React, TypeScript, and Supabase.

## 🚀 Current Features

### ☕ Mobile App (Customer-Facing)
- **Order Placement**: Browse menu and place orders with customization
- **Real-time Order Tracking**: Live status updates (Pending → Preparing → Ready → Collected)
- **User Profiles**: Account management and order history
- **Location Sharing**: Optional live location for pickup coordination
- **Push Notifications**: Order status updates via Capacitor
- **Cart Management**: Add/remove items with quantity controls

### 📊 Admin Dashboard (Staff-Facing)
- **Real-time Order Board**: Live kanban-style order management
- **Order Status Management**: Update orders through workflow stages
- **Dashboard Analytics**: Order counts by status with visual indicators
- **Profile Management**: Admin user dropdown with settings
- **Responsive Design**: Works on desktop and mobile devices
- **Tab Navigation**: Active orders, completed orders, and all orders views

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS v4** for styling
- **Shadcn/ui** components for admin dashboard
- **Ionic React** for mobile app
- **Capacitor** for native mobile features

### Backend & Database
- **Supabase** for database and real-time subscriptions
- **PostgreSQL** with PostGIS for location data
- **Row Level Security (RLS)** for data protection
- **Edge Functions** for order processing

### Authentication
- **Clerk** for user authentication and management
- **JWT integration** with Supabase
- **Role-based access control** (admin vs customer)

### Development
- **npm Workspaces** monorepo structure
- **TypeScript** throughout
- **ESLint** for code quality
- **Git** with feature branch workflow

## 📁 Project Structure

```
coffee-app/
├── apps/
│   ├── admin/           # Admin dashboard (React + Shadcn)
│   │   ├── src/
│   │   │   ├── pages/AdminPage.tsx      # Main dashboard
│   │   │   ├── layout/AdminLayout.tsx   # Header with profile
│   │   │   ├── components/ui/           # Shadcn components
│   │   │   └── lib/utils.ts            # Utilities
│   │   └── package.json
│   └── mobile/          # Customer mobile app (Ionic React)
│       ├── src/
│       │   ├── pages/                  # Cart, Menu, Orders, etc.
│       │   ├── components/             # Reusable components
│       │   └── store/                  # State management
│       └── package.json
├── packages/
│   ├── lib/             # Shared utilities and hooks
│   │   └── src/
│   │       ├── hooks/useRealtimeOrders.ts
│   │       └── supabaseClient.ts
│   └── ui/              # Shared UI components
└── supabase/
    ├── migrations/      # Database schema
    ├── functions/       # Edge functions
    └── seed.sql        # Sample data
```

## 🔄 Real-time Order Flow

1. **Customer** places order via mobile app
2. **Order** appears instantly on admin dashboard
3. **Staff** updates status: Pending → Preparing → Ready
4. **Customer** receives real-time notifications
5. **Staff** marks as collected when picked up

## 🚦 Order Status Workflow

```
Pending → Preparing → Ready → Collected
    ↓         ↓         ↓
 Cancelled  Cancelled    ✓
```

## 🗄 Database Schema

### Tables
- **users**: Customer profiles and preferences
- **menu_items**: Coffee menu with categories and pricing
- **orders**: Order records with items and status
- **order_events**: Audit trail for status changes

### Key Features
- **Real-time subscriptions** for live updates
- **Geographic data** for location sharing
- **JSONB storage** for flexible order items
- **Row Level Security** for data isolation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Supabase account
- Clerk account (optional, has local dev mode)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bucklemeshoe/saiy-coffee-app.git
   cd saiy-coffee-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Admin app (.env in apps/admin/)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key # or 'disabled_for_local_dev'
   
   # Mobile app (.env in apps/mobile/)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   ```

4. **Set up Supabase**
   ```bash
   # Run migrations
   npx supabase db reset
   
   # Seed with sample data
   npx supabase db seed
   ```

### Development

```bash
# Start admin dashboard
npm run dev:admin      # http://localhost:5174

# Start mobile app  
npm run dev:mobile     # http://localhost:5173

# Start both
npm run dev
```

### Production Build

```bash
# Build all apps
npm run build

# Build specific app
npm run build:admin
npm run build:mobile
```

## 🎨 Design System

### Admin Dashboard
- **Shadcn/ui** components with Tailwind CSS
- **Neutral color palette** with status-specific colors
- **Clean, professional interface** for staff efficiency
- **Responsive design** for various screen sizes

### Mobile App
- **Ionic components** for native feel
- **Coffee shop branding** with warm colors
- **Touch-friendly interface** optimized for mobile
- **Smooth animations** and transitions

## 🔧 Development Features

### Hot Reload
- **Vite HMR** for instant development feedback
- **Real-time Supabase** subscriptions for live data
- **Local development mode** without authentication

### Code Quality
- **TypeScript** for type safety
- **ESLint** for consistent code style
- **Prettier** for code formatting
- **Git hooks** for pre-commit checks

## 🌟 Recent Updates

### ✅ Completed Features
- **Admin dashboard redesign** with Shadcn UI
- **Real-time order management** with status buttons
- **Profile dropdown** with settings and sign out
- **Clean layout structure** with proper background
- **Order status workflow** with visual feedback
- **Responsive design** improvements
- **V0 styling branch** for design iterations

### 🔄 In Progress
- Mobile app UI polish
- Push notification setup
- Location sharing features
- Payment integration

## 🚀 Deployment

### Mobile App
```bash
# Build for iOS
npx cap build ios

# Build for Android  
npx cap build android
```

### Admin Dashboard
- Deploy to Vercel, Netlify, or any static hosting
- Set environment variables in hosting platform
- Connect to production Supabase instance

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes and test thoroughly
3. Create pull request with description
4. Ensure all checks pass

### Branch Strategy
- **main**: Production-ready code
- **v0-admin-styling**: Clean branch for V0 design work
- **feature/***: New features and improvements

## 📱 Mobile Features

### Current
- Order placement and tracking
- User authentication
- Cart management
- Order history

### Planned
- Push notifications
- Location sharing
- Offline support
- Apple Pay / Google Pay

## 🔐 Security

- **Row Level Security** on all database tables
- **JWT authentication** with Clerk
- **API key protection** for Supabase
- **HTTPS-only** in production

## 📄 License

This project is private and proprietary to SAIY Coffee.

## 🆘 Support

For questions or issues:
1. Check existing GitHub issues
2. Create new issue with detailed description
3. Include steps to reproduce any bugs

---

**Built with ❤️ for the coffee community**