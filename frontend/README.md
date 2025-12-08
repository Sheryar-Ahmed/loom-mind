# MemoryLayer Frontend

Modern, production-ready Next.js 14 frontend for MemoryLayer - a personal knowledge capture and search application.

## 🚀 Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Beautiful UI**: shadcn/ui components with Radix UI primitives
- **State Management**: Zustand for global state, TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: JWT-based auth with automatic token refresh
- **Responsive Design**: Mobile-first, works on all devices
- **Type Safety**: Full TypeScript support throughout

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

## ⚙️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/          # Dashboard pages
│   │   │   ├── search/
│   │   │   ├── collections/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/               # Layout components
│   │   ├── features/             # Feature-specific components
│   │   └── shared/               # Shared components
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCaptures.ts
│   │   └── useSearch.ts
│   ├── lib/                      # Utilities
│   │   ├── api.ts                # Axios client
│   │   ├── queryClient.ts        # React Query config
│   │   └── utils.ts              # Helper functions
│   ├── store/                    # Zustand stores
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/                    # TypeScript types
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   └── capture.types.ts
│   └── validations/              # Zod schemas
│       ├── auth.schema.ts
│       └── capture.schema.ts
├── public/
├── .env.local.example
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

## 🎨 Key Technologies

### Core Framework
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

### UI Components
- **shadcn/ui**: Beautiful, accessible component library
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library

### Data Management
- **TanStack Query (React Query)**: Server state management
- **Zustand**: Client state management
- **Axios**: HTTP client with interceptors

### Forms & Validation
- **React Hook Form**: Performant form library
- **Zod**: TypeScript-first schema validation

## 📱 Pages & Routes

### Public Routes
- `/` - Landing (redirects to dashboard or login)
- `/login` - Login page
- `/signup` - Signup page

### Protected Routes (Requires Auth)
- `/dashboard` - Main dashboard with recent captures
- `/search` - Advanced search interface
- `/collections` - Collections management
- `/collections/[id]` - Collection detail
- `/settings` - User settings

## 🔐 Authentication Flow

1. User logs in via `/login`
2. JWT access token stored in localStorage
3. Refresh token stored in httpOnly cookie
4. API client automatically adds token to requests
5. Token auto-refreshes before expiry
6. Protected routes redirect to login if unauthenticated

## 🎯 Features Implemented

### ✅ Authentication
- Login with email/password
- Signup with validation
- Auto token refresh
- Protected routes
- Logout functionality

### ✅ Captures
- Create captures (URL, text, image, file)
- View recent captures
- Search captures
- Update captures (title, tags)
- Delete captures
- Tag management

### ✅ UI Components
- Button, Input, Label
- Card components
- Toast notifications
- Loading states
- Error boundaries

### ✅ State Management
- Auth state (Zustand)
- UI state (Zustand)
- Server state (React Query)
- Form state (React Hook Form)

## 🔧 Development

### Running Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Starting Production Server

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "@tanstack/react-query": "^5.17.19",
    "axios": "^1.6.5",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "lucide-react": "^0.307.0",
    "tailwindcss": "^3.4.1"
  }
}
```

## 🎨 Styling

### Tailwind Configuration
- Custom color palette
- Dark mode support (class-based)
- Responsive breakpoints
- Custom animations

### Theme Variables
Defined in `globals.css`:
- Primary, secondary colors
- Background, foreground
- Muted, accent colors
- Border radius

## 🚦 API Integration

### API Client (`lib/api.ts`)
- Centralized Axios instance
- Request/response interceptors
- Auto token attachment
- Token refresh logic
- Error handling

### React Query Hooks
- **useAuth**: Login, signup, logout, current user
- **useCaptures**: List, create, update, delete captures
- **useSearch**: Search captures, suggestions, popular tags

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components are mobile-first and fully responsive.

## 🔒 Security

- XSS protection via React
- CSRF protection via SameSite cookies
- Secure token storage
- Input validation with Zod
- Type safety with TypeScript

## 🐛 Error Handling

- Global error boundaries
- Toast notifications for errors
- Form validation errors
- API error messages
- Loading states

## 🚀 Deployment

### Environment Variables

Set in production:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

### Recommended Platforms
- **Vercel**: Optimal for Next.js (zero-config)
- **Netlify**: Great alternative
- **AWS Amplify**: Full AWS integration
- **Docker**: Container deployment

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

## 🤝 Support

For issues or questions, check the main README or create an issue.

---

**MemoryLayer Frontend** - Built with Next.js 14, TypeScript, and Tailwind CSS
