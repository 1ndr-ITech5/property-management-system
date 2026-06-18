# Property Management System

A modern property management dashboard built with Next.js 14, Firebase, and Tailwind CSS. Features a glassmorphism UI with animated backgrounds, real-time property CRUD, analytics charts, and secure authentication.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Auth & DB:** Firebase Authentication + Cloud Firestore
- **Styling:** Tailwind CSS with custom glassmorphism design system
- **Charts:** Recharts
- **Animations:** Framer Motion, Three.js (3D dotted surface background)
- **Icons:** Lucide React
- **Font:** Outfit (Google Fonts)

## Features

- **Authentication** — Email/password login and signup with protected routes
- **Dashboard** — Overview stats, revenue/occupancy charts, property grid with live Firestore data
- **Properties** — Full CRUD: add, view details, edit, delete properties in real-time
- **Analytics** — Revenue trends, occupancy rates, property type distribution with interactive charts
- **Settings** — Profile management and preferences
- **Visual Design** — Dark purple gradient theme with animated 3D particle background, cursor-reactive gradient on auth pages, frosted glass panels throughout

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add your Firebase environment variables in the Vercel project settings under **Environment Variables**
4. Deploy — Vercel handles the build automatically

## Project Structure

```
app/
├── login/          # Login page with animated gradient
├── signup/         # Signup page
├── dashboard/      # Protected dashboard layout
│   ├── page.tsx    # Main dashboard overview
│   ├── properties/ # Property directory with CRUD
│   ├── analytics/  # Charts and data visualization
│   └── settings/   # User settings
components/
├── AnimatedBackground.tsx   # Global animated background
├── GlassSidebar.tsx         # Navigation sidebar
├── GlassHeader.tsx          # Top header bar
├── AddPropertyModal.tsx     # Add property form modal
├── EditPropertyModal.tsx    # Edit property form modal
├── PropertyDetailsModal.tsx # Property detail view
├── Toast.tsx                # Notification toasts
└── ui/
    ├── dotted-surface.tsx                # Three.js 3D particle animation
    └── background-gradient-animation.tsx # Cursor-reactive gradient
lib/
├── firebase.ts  # Firebase initialization
└── utils.ts     # Utility functions
context/
└── AuthContext.tsx # Auth state provider
```
