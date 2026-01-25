/**
 * Party Jam Backend Configuration
 * All constants from party-session-spec.md
 */

export const CONFIG = {
  // Active member window (10 minutes)
  ACTIVE_WINDOW_MIN: 10,

  // Voting thresholds (40%)
  PROMOTE_THRESHOLD: 0.40,
  REMOVE_THRESHOLD: 0.40,

  // Suggestion sampling
  SAMPLE_PERCENT: 0.05,
  SAMPLE_MIN: 3,
  SAMPLE_CAP: 15,

  // Suggestion timeouts
  SUGGEST_EXPAND_AT_MS: 120000,  // 2 minutes
  SUGGEST_EXPIRE_AT_MS: 300000,  // 5 minutes

  // Skip grace window
  SKIP_GRACE_SECONDS: 30,
} as const;

export const ENV = {
  PORT: process.env.PORT || 3001,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
} as const;
