/**
 * In-memory store for parties
 */

import type { Party, PartyData, PartyMember, Song, PartyState } from './types.js';
import { CONFIG } from './config.js';

export class PartyStore {
  private parties = new Map<string, PartyData>();

  createParty(party: Party): void {
    const partyData: PartyData = {
      party,
      members: new Map(),
      queue: [],
      nowPlaying: null,
      votes: new Map(),
      suggestions: new Map(),
    };
    this.parties.set(party.partyId, partyData);
  }

  getParty(partyId: string): Party | null {
    return this.parties.get(partyId)?.party || null;
  }

  getPartyData(partyId: string): PartyData | null {
    return this.parties.get(partyId) || null;
  }

  updateParty(partyId: string, updates: Partial<Party>): boolean {
    const partyData = this.parties.get(partyId);
    if (!partyData) return false;

    partyData.party = { ...partyData.party, ...updates };
    return true;
  }

  addMember(partyId: string, member: PartyMember): boolean {
    const partyData = this.parties.get(partyId);
    if (!partyData) return false;

    partyData.members.set(member.userId, member);
    return true;
  }

  getMember(partyId: string, userId: string): PartyMember | null {
    const partyData = this.parties.get(partyId);
    if (!partyData) return null;
    return partyData.members.get(userId) || null;
  }

  updateMemberActivity(partyId: string, userId: string): boolean {
    const partyData = this.parties.get(partyId);
    if (!partyData) return false;

    const member = partyData.members.get(userId);
    if (!member) return false;

    member.lastActiveAt = Date.now();
    return true;
  }

  getActiveMembersCount(partyId: string): number {
    const partyData = this.parties.get(partyId);
    if (!partyData) return 0;

    const now = Date.now();
    const activeWindow = CONFIG.ACTIVE_WINDOW_MIN * 60 * 1000;

    let count = 0;
    for (const member of partyData.members.values()) {
      if (now - member.lastActiveAt <= activeWindow) {
        count++;
      }
    }
    return count;
  }

  getActiveMembers(partyId: string): PartyMember[] {
    const partyData = this.parties.get(partyId);
    if (!partyData) return [];

    const now = Date.now();
    const activeWindow = CONFIG.ACTIVE_WINDOW_MIN * 60 * 1000;

    return Array.from(partyData.members.values()).filter(
      (member) => now - member.lastActiveAt <= activeWindow
    );
  }

  getAllMembers(partyId: string): PartyMember[] {
    const partyData = this.parties.get(partyId);
    if (!partyData) return [];
    return Array.from(partyData.members.values());
  }

  getState(partyId: string): PartyState | null {
    const partyData = this.parties.get(partyId);
    if (!partyData) return null;

    const testingSuggestions = Array.from(partyData.suggestions.values())
      .map((s) => s.song)
      .filter((s) => s.status === 'TESTING');

    return {
      party: partyData.party,
      activeMembersCount: this.getActiveMembersCount(partyId),
      members: this.getAllMembers(partyId),
      nowPlaying: partyData.nowPlaying,
      queue: partyData.queue,
      testingSuggestions,
    };
  }

  addToQueue(partyId: string, song: Song): boolean {
    const partyData = this.parties.get(partyId);
    if (!partyData) return false;

    partyData.queue.push(song);
    return true;
  }

  removeFromQueue(partyId: string, trackId: string): boolean {
    const partyData = this.parties.get(partyId);
    if (!partyData) return false;

    const initialLength = partyData.queue.length;
    partyData.queue = partyData.queue.filter((song) => song.trackId !== trackId);
    return partyData.queue.length < initialLength;
  }

  getSongFromQueue(partyId: string, trackId: string): Song | null {
    const partyData = this.parties.get(partyId);
    if (!partyData) return null;
    return partyData.queue.find((song) => song.trackId === trackId) || null;
  }
}

export const store = new PartyStore();
