# Party Jam Documentation

## Overview

Party Jam is a real-time collaborative music queue application that lets a group create a shared listening experience using Spotify recommendations, group voting, and real-time updates.

## Documentation Files

- [party-session-spec.md](./party-session-spec.md) - Party session rules and behavior
- [api-contract.md](./api-contract.md) - REST API endpoints
- [socket-events.md](./socket-events.md) - Real-time socket events

## Current Status

### Spotify Integration

**Status:** Temporarily disabled due to Spotify Developer Dashboard restrictions.

The app currently uses a **MockMusicProvider** for testing and development, which provides:
- 15 hardcoded mock tracks with placeholder images
- Basic search functionality
- Track recommendations by mood
- Mix of explicit and clean tracks for kid-friendly testing

**To enable Spotify integration later:**

1. Get a Spotify Client ID from https://developer.spotify.com/dashboard
2. Add redirect URI: `http://127.0.0.1:5173/callback`
3. Set environment variables in `frontend/.env`:
   ```bash
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
   ```
4. The Spotify OAuth PKCE flow code is already implemented and ready to use

**Features working with MockProvider:**
- Queue seeding (Host can add 10 random tracks)
- Voting on tracks
- Kid-friendly mode (filters explicit tracks)
- Guest suggestions
- Real-time updates

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Architecture

- **Backend:** Node.js, TypeScript, Express.js, Socket.io
- **Frontend:** React, TypeScript, Vite, Socket.io-client
- **Data Storage:** In-memory Maps (MVP - no database)
- **Real-time:** Socket.io with room-based broadcasting

## Key Features

- **Party Lifecycle:** Create → Live → Ended
- **Voting System:** Real-time voting with 40% thresholds
- **Guest Suggestions:** Sampling system (5% of active members, min 3, max 15)
- **Active Tracking:** 10-minute activity window with heartbeats
- **Settings:** Mood, kid-friendly mode, guest suggestions toggle
- **Real-time Updates:** Instant sync across all connected clients

## Testing End-to-End

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. Click "Create Party (Host)" to create a party
5. Copy the party ID from the top bar
6. Open a second browser window/tab
7. Click "Join Party (Guest)" and paste the party ID
8. As Host: Click "Start Party" then "Seed Queue" to add 10 mock tracks
9. As Guest: Vote on tracks to test voting thresholds
10. Watch real-time updates sync between Host and Guest views

## Next Steps

After Spotify integration is enabled:
- Implement join by code (GET /party/resolve?joinCode=XXXXXX)
- Add track search UI for guests
- Real song metadata from Spotify
- Kid-friendly enforcement for explicit tracks
