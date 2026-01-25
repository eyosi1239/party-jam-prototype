/**
 * Party routes
 */

import { Router, Request, Response } from 'express';
import type { Server } from 'socket.io';
import { store } from '../store.js';
import { generateId, generateJoinCode, createError } from '../utils.js';
import { CONFIG } from '../config.js';
import type { Party, PartyMember, VoteType, VoteContext } from '../types.js';

let io: Server;

export function setSocketIO(socketIO: Server) {
  io = socketIO;
}

const router = Router();

// POST /party - Create party
router.post('/party', (req: Request, res: Response) => {
  const { hostId, mood, kidFriendly, allowSuggestions } = req.body;

  if (!hostId) {
    return res.status(400).json(createError('INVALID_REQUEST', 'hostId is required'));
  }

  const partyId = generateId('party');
  const joinCode = generateJoinCode();
  const now = Date.now();

  const party: Party = {
    partyId,
    hostId,
    status: 'CREATED',
    mood: mood || 'chill',
    kidFriendly: kidFriendly ?? false,
    allowSuggestions: allowSuggestions ?? true,
    createdAt: now,
  };

  store.createParty(party);

  // Add host as first member
  const hostMember: PartyMember = {
    userId: hostId,
    role: 'HOST',
    joinedAt: now,
    lastActiveAt: now,
  };
  store.addMember(partyId, hostMember);

  res.json({
    partyId,
    joinCode,
    party,
  });
});

// POST /party/:partyId/join - Join party
router.post('/party/:partyId/join', (req: Request, res: Response) => {
  const { partyId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json(createError('INVALID_REQUEST', 'userId is required'));
  }

  const party = store.getParty(partyId);
  if (!party) {
    return res.status(404).json(createError('PARTY_NOT_FOUND', 'Party not found'));
  }

  // Check if already a member
  let member = store.getMember(partyId, userId);
  const now = Date.now();

  if (!member) {
    // New member
    member = {
      userId,
      role: 'GUEST',
      joinedAt: now,
      lastActiveAt: now,
    };
    store.addMember(partyId, member);
  } else {
    // Rejoining - update activity
    store.updateMemberActivity(partyId, userId);
    member = store.getMember(partyId, userId)!;
  }

  res.json({
    partyId,
    member,
  });
});

// GET /party/:partyId/state - Get party state
router.get('/party/:partyId/state', (req: Request, res: Response) => {
  const { partyId } = req.params;
  const { userId } = req.query;

  const state = store.getState(partyId);
  if (!state) {
    return res.status(404).json(createError('PARTY_NOT_FOUND', 'Party not found'));
  }

  // Update activity if userId provided
  if (userId && typeof userId === 'string') {
    store.updateMemberActivity(partyId, userId);
  }

  res.json(state);
});

// POST /party/:partyId/start - Start party
router.post('/party/:partyId/start', (req: Request, res: Response) => {
  const { partyId } = req.params;
  const { hostId } = req.body;

  const party = store.getParty(partyId);
  if (!party) {
    return res.status(404).json(createError('PARTY_NOT_FOUND', 'Party not found'));
  }

  if (party.hostId !== hostId) {
    return res.status(403).json(createError('NOT_HOST', 'Only host can start party'));
  }

  if (party.status !== 'CREATED') {
    return res.status(400).json(createError('INVALID_STATE', 'Party already started or ended'));
  }

  store.updateParty(partyId, { status: 'LIVE' });

  res.json({ status: 'LIVE' });
});

// POST /party/:partyId/end - End party
router.post('/party/:partyId/end', (req: Request, res: Response) => {
  const { partyId } = req.params;
  const { hostId } = req.body;

  const party = store.getParty(partyId);
  if (!party) {
    return res.status(404).json(createError('PARTY_NOT_FOUND', 'Party not found'));
  }

  if (party.hostId !== hostId) {
    return res.status(403).json(createError('NOT_HOST', 'Only host can end party'));
  }

  store.updateParty(partyId, { status: 'ENDED' });

  res.json({ status: 'ENDED' });
});

// POST /party/:partyId/heartbeat - Active tracking
router.post('/party/:partyId/heartbeat', (req: Request, res: Response) => {
  const { partyId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json(createError('INVALID_REQUEST', 'userId is required'));
  }

  const party = store.getParty(partyId);
  if (!party) {
    return res.status(404).json(createError('PARTY_NOT_FOUND', 'Party not found'));
  }

  const member = store.getMember(partyId, userId);
  if (!member) {
    return res.status(404).json(createError('MEMBER_NOT_FOUND', 'User is not a member of this party'));
  }

  // Update activity timestamp
  const updated = store.updateMemberActivity(partyId, userId);

  res.json({ active: updated });
});

// POST /party/:partyId/vote - Vote on a song
router.post('/party/:partyId/vote', (req: Request, res: Response) => {
  const { partyId } = req.params;
  const { userId, trackId, vote, context } = req.body;

  if (!userId || !trackId || !vote || !context) {
    return res.status(400).json(createError('INVALID_REQUEST', 'userId, trackId, vote, and context are required'));
  }

  if (!['UP', 'DOWN', 'NONE'].includes(vote)) {
    return res.status(400).json(createError('INVALID_VOTE', 'vote must be UP, DOWN, or NONE'));
  }

  if (!['QUEUE', 'TESTING'].includes(context)) {
    return res.status(400).json(createError('INVALID_REQUEST', 'context must be QUEUE or TESTING'));
  }

  const party = store.getParty(partyId);
  if (!party) {
    return res.status(404).json(createError('PARTY_NOT_FOUND', 'Party not found'));
  }

  if (party.status !== 'LIVE') {
    return res.status(400).json(createError('PARTY_NOT_LIVE', 'Party must be live to vote'));
  }

  // Update member activity
  store.updateMemberActivity(partyId, userId);

  // Set the vote
  store.setVote(partyId, userId, trackId, vote as VoteType, context as VoteContext);

  // Update song vote counts
  store.updateSongVotes(partyId, trackId);

  // Get updated counts
  const counts = store.getVoteCounts(partyId, trackId);
  const activeMembersCount = store.getActiveMembersCount(partyId);

  // Check thresholds
  let status: string = context === 'QUEUE' ? 'QUEUED' : 'TESTING';
  let shouldRemove = false;
  let shouldPromote = false;

  // Removal threshold (40% downvotes)
  if (counts.downvotes >= CONFIG.REMOVE_THRESHOLD * activeMembersCount) {
    status = 'REMOVED';
    shouldRemove = true;
  }

  // Promotion threshold (40% upvotes) - only for suggestions
  if (context === 'TESTING' && counts.upvotes >= CONFIG.PROMOTE_THRESHOLD * activeMembersCount) {
    status = 'PROMOTED';
    shouldPromote = true;
  }

  // Update status
  if (shouldRemove || shouldPromote) {
    store.updateSongStatus(partyId, trackId, status as any);
  }

  // Handle removal from queue
  if (shouldRemove && context === 'QUEUE') {
    store.removeFromQueue(partyId, trackId);

    // Broadcast song removed
    if (io) {
      io.to(`party:${partyId}`).emit('party:songRemoved', {
        trackId,
        reason: 'DOWNVOTE_THRESHOLD',
      });

      // Broadcast queue updated
      const state = store.getState(partyId);
      if (state) {
        io.to(`party:${partyId}`).emit('party:queueUpdated', {
          queue: state.queue.map((s) => ({
            trackId: s.trackId,
            source: s.source,
            status: s.status,
          })),
        });
      }
    }
  }

  // Handle suggestion promotion
  if (shouldPromote && context === 'TESTING') {
    const suggestion = store.getSuggestion(partyId, trackId);
    if (suggestion) {
      // Add to queue
      suggestion.song.status = 'PROMOTED';
      store.addToQueue(partyId, suggestion.song);

      // Broadcast promotion
      if (io) {
        io.to(`party:${partyId}`).emit('party:suggestionPromoted', {
          trackId,
          status: 'PROMOTED',
        });

        // Broadcast queue updated
        const state = store.getState(partyId);
        if (state) {
          io.to(`party:${partyId}`).emit('party:queueUpdated', {
            queue: state.queue.map((s) => ({
              trackId: s.trackId,
              source: s.source,
              status: s.status,
            })),
          });
        }
      }
    }
  }

  // Always broadcast vote update
  if (io) {
    io.to(`party:${partyId}`).emit('party:voteUpdate', {
      trackId,
      upvotes: counts.upvotes,
      downvotes: counts.downvotes,
      status,
      context,
    });
  }

  res.json({
    trackId,
    upvotes: counts.upvotes,
    downvotes: counts.downvotes,
    status,
    context,
  });
});

export default router;
