/**
 * Party routes
 */

import { Router, Request, Response } from 'express';
import { store } from '../store.js';
import { generateId, generateJoinCode, createError } from '../utils.js';
import type { Party, PartyMember } from '../types.js';

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

export default router;
