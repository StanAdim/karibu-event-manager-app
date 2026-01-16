# Karibu Event Management Application

A clean, minimal, and professional Events Management Application built with Vue 3, TailwindCSS, Pinia, and Vue Router. The UI is inspired by ChatGPT's design language - neutral, calm, and distraction-free.

## Features

- **Event Management**: Create, view, and manage events
- **Participant Management**: Add participants, track check-ins
- **Checkpoint Management**: Create and manage event checkpoints
- **Reports**: View comprehensive event reports and statistics
- **Authentication**: Secure login with JWT token management
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## Project Structure

```
src/
 ├─ app/
 │   ├─ layouts/
 │   │   └─ AdminLayout.vue      # Main admin layout with sidebar
 │   ├─ router/
 │   │   └─ index.ts              # Route configuration
 │   ├─ store/
 │   │   ├─ auth.ts               # Authentication store
 │   │   ├─ user.ts               # User store
 │   │   ├─ event.ts               # Event store
 │   │   ├─ participant.ts        # Participant store
 │   │   └─ checkpoint.ts         # Checkpoint store
 │   ├─ services/
 │   │   └─ api.ts                 # API service with interceptors
 │   └─ composables/
 │       └─ useAuth.ts             # Auth composable
 ├─ pages/
 │   ├─ LandingPage.vue
 │   ├─ Login.vue
 │   ├─ Dashboard.vue
 │   ├─ Events/                    # Event pages
 │   ├─ Participants/              # Participant pages
 │   ├─ Checkpoints/               # Checkpoint pages
 │   └─ Reports/                    # Report pages
 └─ components/
     └─ ui/
         └─ Breadcrumbs.vue        # Breadcrumb component
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Integration

The application expects a RESTful API with the following endpoints:

### Authentication
- `POST /api/v1/auth/login` - Login endpoint

### Events
- `GET /api/v1/events` - List all events
- `GET /api/v1/events/:id` - Get event by ID
- `POST /api/v1/events` - Create event
- `PUT /api/v1/events/:id` - Update event
- `DELETE /api/v1/events/:id` - Delete event

### Participants
- `GET /api/v1/participants` - List all participants
- `GET /api/v1/participants/:id` - Get participant by ID
- `POST /api/v1/participants` - Create participant
- `PUT /api/v1/participants/:id` - Update participant
- `DELETE /api/v1/participants/:id` - Delete participant
- `POST /api/v1/participants/:id/checkin` - Check in participant

### Checkpoints
- `GET /api/v1/checkpoints` - List all checkpoints
- `GET /api/v1/checkpoints/:id` - Get checkpoint by ID
- `POST /api/v1/checkpoints` - Create checkpoint
- `PUT /api/v1/checkpoints/:id` - Update checkpoint
- `DELETE /api/v1/checkpoints/:id` - Delete checkpoint

## Design Principles

The UI follows ChatGPT-inspired design principles:

- **Neutral Color Palette**: Soft grays, off-whites, subtle borders
- **Minimal Shadows**: Clean, flat design
- **Rounded Corners**: Modern, friendly appearance
- **Clear Typography**: Strong hierarchy and readability
- **Spacious Layouts**: Focus on usability and clarity

## Authentication Flow

1. User lands on the landing page
2. Clicks "Login" to navigate to login page
3. Enters credentials and submits
4. On success, token is stored in Pinia and localStorage
5. Token is automatically attached to all API requests
6. User is redirected to Dashboard
7. All protected routes require authentication

## Routing

- `/` - Landing page (public)
- `/login` - Login page (public, redirects if authenticated)
- `/dashboard` - Dashboard (protected)
- `/events` - Event list (protected)
- `/events/create` - Create event (protected)
- `/events/:id` - Event details (protected)
- `/participants` - Participant list (protected)
- `/participants/create` - Add participant (protected)
- `/participants/:id` - Participant details (protected)
- `/checkpoints` - Checkpoint list (protected)
- `/checkpoints/create` - Create checkpoint (protected)
- `/checkpoints/:id` - Checkpoint details (protected)
- `/reports` - Event reports (protected)

## State Management

The application uses Pinia for state management with the following stores:

- **auth**: Manages authentication state and token
- **user**: Manages user data
- **event**: Manages events data
- **participant**: Manages participants data
- **checkpoint**: Manages checkpoints data

## Contributing

This is a production-ready application following Vue 3 best practices. When extending:

1. Follow the existing folder structure
2. Use TypeScript for type safety
3. Use TailwindCSS for styling (no inline styles)
4. Keep components focused and reusable
5. Maintain the ChatGPT-inspired design language

## License

Copyright © 2024 Karibu Event Management. All rights reserved.
# karibu-event-manager-app
