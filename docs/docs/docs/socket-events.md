Here’s the **full single-copy/paste** for the third doc:

**File:** `docs/socket-events.md`
**Steps:** open `docs/socket-events.md` → `⌘ + A` → paste → `⌘ + S`

````md
# Party Jam — Socket Events (MVP)

We use sockets to push real-time updates: votes, queue, now playing, settings.
REST endpoints are the source of truth. Sockets broadcast changes instantly.

Namespace (suggested): `/party`  
Room naming: `party:<partyId>`

---

## 0) Conventions

### Client identity
All client events include:
- `partyId`
- `userId`

### Rooms
Server should put each socket into:
- `party:<partyId>` room

### Notes
- Votes + suggestions are submitted via REST
- Server broadcasts results via sockets

---

## 1) Connection

### Client → Server: `party:join`
Payload:
```json
{
  "partyId": "string",
  "userId": "string"
}
````

### Server → Client: `party:joined`

Payload:

```json
{
  "partyId": "string",
  "activeMembersCount": 0
}
```

### Server → Clients (room): `party:memberJoined`

Payload:

```json
{
  "userId": "string",
  "activeMembersCount": 0
}
```

---

## 2) Presence (Active Tracking)

Client sends a heartbeat while the party page is open.

### Client → Server: `party:heartbeat`

Payload:

```json
{
  "partyId": "string",
  "userId": "string"
}
```

### Server → Clients (room): `party:presence`

Payload:

```json
{
  "activeMembersCount": 0
}
```

---

## 3) Voting Updates

Voting happens via REST (`POST /party/:partyId/vote`).
Server broadcasts vote counts and status.

### Server → Clients (room): `party:voteUpdate`

Payload:

```json
{
  "trackId": "string",
  "upvotes": 0,
  "downvotes": 0,
  "status": "QUEUED | TESTING | PROMOTED | REMOVED | EXPIRED",
  "context": "QUEUE | TESTING"
}
```

---

## 4) Suggestions (Sampling + Promotion)

Suggestions happen via REST (`POST /party/:partyId/suggest`).
Backend picks a sample group and only pushes the testing prompt to them.

### Server → Sampled Users: `party:suggestionTesting`

Payload:

```json
{
  "trackId": "string",
  "status": "TESTING",
  "expiresAt": 0
}
```

If a suggestion gets promoted:

### Server → Clients (room): `party:suggestionPromoted`

Payload:

```json
{
  "trackId": "string",
  "status": "PROMOTED"
}
```

If a suggestion expires:

### Server → Clients (room): `party:suggestionExpired`

Payload:

```json
{
  "trackId": "string",
  "status": "EXPIRED"
}
```

---

## 5) Queue + Now Playing

### Server → Clients (room): `party:queueUpdated`

Send when queue changes (song added, removed, promoted, reordered).
Payload:

```json
{
  "queue": [
    {
      "trackId": "string",
      "source": "SPOTIFY_REC | GUEST_SUGGESTION",
      "status": "QUEUED | PROMOTED"
    }
  ]
}
```

### Server → Clients (room): `party:nowPlaying`

Payload:

```json
{
  "trackId": "string",
  "startedAt": 0
}
```

### Server → Clients (room): `party:songRemoved`

Payload:

```json
{
  "trackId": "string",
  "reason": "DOWNVOTE_THRESHOLD | HOST_REMOVE"
}
```

---

## 6) Settings Updates

Settings changes can happen via REST and broadcast to everyone.

### Server → Clients (room): `party:settingsUpdated`

Payload:

```json
{
  "mood": "string",
  "kidFriendly": true,
  "allowSuggestions": true
}
```

---

## 7) Error Events (Optional MVP)

### Server → Client: `party:error`

Payload:

```json
{
  "code": "string",
  "message": "string"
}
```

---

## 8) Fallback (If sockets fail)

Frontend can poll party state:

* `GET /party/:partyId/state`

Sockets = instant UI
Polling = safety backup

````

