Here’s the **entire** `docs/api-contract.md` as a **single copy/paste**.

**Steps:** open `docs/api-contract.md` → `⌘ + A` → paste → `⌘ + S`.

# Party Jam — API Contract (MVP)

This document defines the REST API the frontend uses to talk to the backend.
Backend is responsible for party state, votes, suggestions, and real-time events.

Base URL (dev): `http://localhost:<PORT>`

---

## 1) Auth (MVP)
Auth is handled with Spotify OAuth on the frontend.
Backend receives a user identity token or a spotify user id from the frontend.

**MVP assumption:** frontend includes a `userId` (and optional `spotifyId`) in requests.
Later we can replace this with JWT sessions.

Common headers (optional for now):
- `Authorization: Bearer <token>`

---

## 2) Core Types (JSON)

### Party
```json
{
  "partyId": "string",
  "hostId": "string",
  "status": "CREATED | LIVE | ENDED",
  "mood": "string",
  "kidFriendly": true,
  "allowSuggestions": true,
  "createdAt": 0
}
````

### PartyMember

```json
{
  "userId": "string",
  "role": "HOST | GUEST",
  "joinedAt": 0,
  "lastActiveAt": 0
}
```

### Song

```json
{
  "trackId": "string",
  "title": "string",
  "artist": "string",
  "albumArtUrl": "string",
  "explicit": false,
  "source": "SPOTIFY_REC | GUEST_SUGGESTION",
  "status": "QUEUED | TESTING | PROMOTED | REMOVED | EXPIRED",
  "upvotes": 0,
  "downvotes": 0
}
```

### PartyState (returned by GET /party/:partyId/state)

```json
{
  "party": { "...Party": "..." },
  "activeMembersCount": 0,
  "members": [ { "...PartyMember": "..." } ],
  "nowPlaying": { "...Song": "..." },
  "queue": [ { "...Song": "..." } ],
  "testingSuggestions": [ { "...Song": "..." } ]
}
```

---

## 3) Endpoints

### Health

#### GET /health

Response:

```json
{ "ok": true }
```

---

## Party Lifecycle

### Create party (host)

#### POST /party

Body:

```json
{
  "hostId": "string",
  "mood": "chill",
  "kidFriendly": false,
  "allowSuggestions": true
}
```

Response:

```json
{
  "partyId": "string",
  "joinCode": "string",
  "party": { "...Party": "..." }
}
```

---

### Start party

#### POST /party/:partyId/start

Body:

```json
{ "hostId": "string" }
```

Response:

```json
{ "status": "LIVE" }
```

---

### End party

#### POST /party/:partyId/end

Body:

```json
{ "hostId": "string" }
```

Response:

```json
{ "status": "ENDED" }
```

---

## Join + Presence

### Join party

#### POST /party/:partyId/join

Body:

```json
{
  "userId": "string",
  "role": "GUEST"
}
```

Response:

```json
{
  "partyId": "string",
  "member": { "...PartyMember": "..." }
}
```

---

### Heartbeat (active tracking)

Frontend should call this every ~30s while the party page is open.

#### POST /party/:partyId/heartbeat

Body:

```json
{ "userId": "string" }
```

Response:

```json
{ "active": true }
```

---

## Settings

### Update mood

#### POST /party/:partyId/settings/mood

Body:

```json
{
  "hostId": "string",
  "mood": "prom"
}
```

Response:

```json
{ "mood": "prom" }
```

---

### Toggle kid-friendly

#### POST /party/:partyId/settings/kidFriendly

Body:

```json
{
  "hostId": "string",
  "kidFriendly": true
}
```

Response:

```json
{ "kidFriendly": true }
```

---

### Toggle guest suggestions

#### POST /party/:partyId/settings/allowSuggestions

Body:

```json
{
  "hostId": "string",
  "allowSuggestions": true
}
```

Response:

```json
{ "allowSuggestions": true }
```

---

## State

### Get party state (poll fallback)

#### GET /party/:partyId/state?userId=...

Response:

```json
{ "...PartyState": "..." }
```

---

## Voting

### Vote on a song (queue or testing)

Vote overwrites previous vote for that user+track.

#### POST /party/:partyId/vote

Body:

```json
{
  "userId": "string",
  "trackId": "string",
  "vote": "UP | DOWN | NONE",
  "context": "QUEUE | TESTING"
}
```

Response:

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

## Suggestions

### Suggest a song

If suggestions are disabled, return 403.

#### POST /party/:partyId/suggest

Body:

```json
{
  "userId": "string",
  "trackId": "string"
}
```

Response:

```json
{
  "suggestion": { "...Song": "..." },
  "sampleUserIds": ["string"]
}
```

---

## Now Playing (MVP stub)

In MVP, backend can accept updates from the host client when a track starts.

### Update now playing

#### POST /party/:partyId/nowPlaying

Body:

```json
{
  "hostId": "string",
  "trackId": "string",
  "startedAt": 0
}
```

Response:

```json
{ "ok": true }
```

---

## 4) Error Format

All errors should use:

```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

Common codes:

* `PARTY_NOT_FOUND`
* `NOT_HOST`
* `SUGGESTIONS_DISABLED`
* `INVALID_VOTE`
* `PARTY_NOT_LIVE`


