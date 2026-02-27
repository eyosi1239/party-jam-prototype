# Party Jam Backend (MVP)

Node.js + TypeScript + Express + Socket.io backend for Party Jam.

## Setup

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file (optional):

```bash
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
```

Defaults are provided if not set.

## Running

### Development (with hot reload)
```bash
npm run dev
```

### Production build
```bash
npm run build
npm start
```

## Testing

Health check:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"ok": true}
```

## API Documentation

See project docs:
- `docs/api-contract.md` - REST API endpoints
- `docs/socket-events.md` - Socket.io events
- `docs/party-session-spec.md` - Business logic & rules
