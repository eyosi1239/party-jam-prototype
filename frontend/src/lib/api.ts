/**
 * API client for Party Jam backend
 */

import type {
  CreatePartyRequest,
  CreatePartyResponse,
  JoinPartyRequest,
  JoinPartyResponse,
  PartyState,
  VoteRequest,
  VoteResponse,
  SuggestRequest,
  SuggestResponse,
  HeartbeatRequest,
  HeartbeatResponse,
  UpdateMoodRequest,
  UpdateKidFriendlyRequest,
  UpdateAllowSuggestionsRequest,
  UpdateNowPlayingRequest,
  ApiError,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error((data as ApiError).error?.message || 'API request failed');
      }

      return data as T;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Health check
  async health(): Promise<{ ok: boolean }> {
    return this.request('/health');
  }

  // Party lifecycle
  async createParty(data: CreatePartyRequest): Promise<CreatePartyResponse> {
    return this.request('/party', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resolveJoinCode(joinCode: string): Promise<{ partyId: string }> {
    return this.request(`/party/resolve?joinCode=${encodeURIComponent(joinCode)}`);
  }

  async joinParty(partyId: string, data: JoinPartyRequest): Promise<JoinPartyResponse> {
    return this.request(`/party/${partyId}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async startParty(partyId: string, hostId: string): Promise<{ status: string }> {
    return this.request(`/party/${partyId}/start`, {
      method: 'POST',
      body: JSON.stringify({ hostId }),
    });
  }

  async endParty(partyId: string, hostId: string): Promise<{ status: string }> {
    return this.request(`/party/${partyId}/end`, {
      method: 'POST',
      body: JSON.stringify({ hostId }),
    });
  }

  async getPartyState(partyId: string, userId?: string): Promise<PartyState> {
    const query = userId ? `?userId=${userId}` : '';
    return this.request(`/party/${partyId}/state${query}`);
  }

  // Heartbeat
  async heartbeat(partyId: string, data: HeartbeatRequest): Promise<HeartbeatResponse> {
    return this.request(`/party/${partyId}/heartbeat`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Voting
  async vote(partyId: string, data: VoteRequest): Promise<VoteResponse> {
    return this.request(`/party/${partyId}/vote`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Suggestions
  async suggestSong(partyId: string, data: SuggestRequest): Promise<SuggestResponse> {
    return this.request(`/party/${partyId}/suggest`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settings
  async updateMood(partyId: string, data: UpdateMoodRequest): Promise<{ mood: string }> {
    return this.request(`/party/${partyId}/settings/mood`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKidFriendly(
    partyId: string,
    data: UpdateKidFriendlyRequest
  ): Promise<{ kidFriendly: boolean }> {
    return this.request(`/party/${partyId}/settings/kidFriendly`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAllowSuggestions(
    partyId: string,
    data: UpdateAllowSuggestionsRequest
  ): Promise<{ allowSuggestions: boolean }> {
    return this.request(`/party/${partyId}/settings/allowSuggestions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Now Playing
  async updateNowPlaying(
    partyId: string,
    data: UpdateNowPlayingRequest
  ): Promise<{ ok: boolean }> {
    return this.request(`/party/${partyId}/nowPlaying`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Host remove song from queue
  async removeFromQueue(partyId: string, hostId: string, trackId: string): Promise<{ ok: boolean }> {
    return this.request(`/party/${partyId}/queue/${trackId}`, {
      method: 'DELETE',
      body: JSON.stringify({ hostId }),
    });
  }

  // Queue seeding
  async seedQueue(
    partyId: string,
    hostId: string,
    tracks: any[]
  ): Promise<{ ok: boolean; addedCount: number; queue: any[] }> {
    return this.request(`/party/${partyId}/seed`, {
      method: 'POST',
      body: JSON.stringify({ hostId, tracks }),
    });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
