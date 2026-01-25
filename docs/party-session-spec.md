# Party Jam — Party Session Spec (MVP)
**Version:** v0.1 (MVP)  
**Last updated:** 2026-01-25  
**Owner:** Eyosi + team

## Rules Summary
- Active window: 10 minutes
- Promotion: upvotes ≥ 40% of active members
- Removal: downvotes ≥ 40% of active members
- Suggestion sampling: 5% (min 3, cap 15)
- Skip rule: <30s skip immediately, otherwise skip after track ends


## 1) Goal
Party Jam helps a group create a shared queue using Spotify recommendations, group taste, and real-time voting.
The host can set a mood and kid-friendly mode. Guests can vote and optionally suggest songs.

---

## 2) Roles
### Host
- Creates the party session
- Sets mood (ex: funeral, prom, gym, chill)
- Toggles kid-friendly mode (filters explicit tracks)
- Toggles guest suggestions (on/off)
- Can end the party session

### Guest
- Joins a party using a party code/link
- Votes up/down on songs
- Can suggest songs if host allows it

---

## 3) Key Definitions
### Active Member
A user is considered **active** if they have done any of the following in the last **10 minutes**:
- opened the party page (heartbeat/ping)
- voted
- suggested a song
- joined the party

`activeMembersCount` is used for all thresholds.

### Song Sources
- **Spotify Rec**: returned from Spotify recommendation endpoint
- **Guest Suggestion**: user-submitted track to test with a sample first

### Party State
- `CREATED` (host created but not started)
- `LIVE` (voting + recommendations active)
- `ENDED` (session closed)

---

## 4) Mood + Kid-Friendly (MVP Behavior)
### Mood
Mood affects how we call Spotify recommendations (seed selection + target audio features).
In MVP we can keep it simple:
- mood sets a preset (energy/valence/danceability targets)
- host can change mood anytime

### Kid-Friendly
- When enabled, the app avoids explicit tracks where possible.
- Any explicit track already in queue should be blocked from playing next (MVP) or replaced.

---

## 5) Voting Rules (Real Time)
### One Vote Per User Per Song
- Each user can have only one current vote on a song: `UP`, `DOWN`, or `NONE`
- If they change their vote, it overwrites the previous vote

### Promotion Rule (for Guest Suggestions)
A suggested song becomes eligible to be pushed into the main queue when:

**Upvotes ≥ 40% of activeMembersCount**

### Removal Rule (any song in the queue)
A song is removed from the queue when:

**Downvotes ≥ 40% of activeMembersCount**

---

## 6) Guest Suggestion Sampling (MVP)
When a guest suggests a song, it does NOT go to the main queue immediately.

### Sample Group Size
Pick a random sample of active members:

sampleSize = max(3, ceil(activeMembersCount * 0.05))
sampleSize cap = 15 (so it stays fast)

### Sampling Flow
1. Suggestion created with status `TESTING`
2. Only sampled users see it and can vote on it
3. If it hits the promotion rule, it becomes `PROMOTED`
4. Promoted suggestions are inserted into the main queue

### Not Enough Votes (Timeout)
If a suggestion is stuck in testing:
- After 2 minutes, expand sample group (ex: double it) once
- After 5 minutes total, mark it `EXPIRED` and stop showing it

(Timeout numbers can be tuned later.)

---

## 7) Removal While Playing (Anti-Chaos Rule)
If a song reaches removal threshold while it is currently playing:

- If the song has been playing for **< 30 seconds**, skip immediately
- Otherwise, mark it as removed and skip it **after it ends**
  (or allow host-only “skip now” if you want an override later)

---

## 8) Recommendation Loop (MVP)
We are not training our own model in MVP.
We use Spotify recommendations and adapt using party events.

Inputs:
- group taste (combined user top artists/tracks/genres)
- mood preset
- kid-friendly toggle
- recent votes (positive/negative signals)
- removed songs (avoid repeats)

Loop behavior:
- Maintain a buffer queue (ex: always keep next 10–20 songs ready)
- When queue gets low, fetch more recs from Spotify
- Avoid recently removed tracks and avoid repeating the same artists too much

---

## 9) Events (What the system logs)
These events drive real-time updates and help recommendations.

Required events:
- PARTY_CREATED
- PARTY_STARTED
- PARTY_ENDED
- USER_JOINED
- USER_LEFT (optional MVP)
- HEARTBEAT (active tracking)
- MOOD_UPDATED
- KID_FRIENDLY_UPDATED
- SUGGESTION_CREATED
- VOTE_UPDATED (up/down/none)
- SONG_PROMOTED
- SONG_REMOVED
- NOW_PLAYING_UPDATED
- QUEUE_UPDATED

---

## 10) MVP Non-Goals (not now)
- No custom ML model yet
- No perfect “kid friendly” filtering beyond Spotify explicit flag
- No advanced anti-cheat beyond one-vote-per-user-per-song
- No payments, premium tiers, or social features

---

## 11) Open Settings (easy to change later)
- active window: 10 minutes
- promotion/removal threshold: 40%
- sample size: 5% min 3 cap 15
- testing timeout: expand at 2 minutes, expire at 5 minutes
- skip grace window: 30 seconds
