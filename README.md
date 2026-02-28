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

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Authentication and Firestore enabled

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/1ndr-ITech5/property-management-system.git
   cd property-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file from the example:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase config values from the Firebase Console.

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

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

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID (optional) |
