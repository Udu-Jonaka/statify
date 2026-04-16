// lib/spotify.js
// ─────────────────────────────────────────────────────────────
// Thin wrapper around the Spotify Web API.
// All functions accept an access token (retrieved from the session)
// and return parsed JSON.
// ─────────────────────────────────────────────────────────────

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

/**
 * Generic authenticated fetch helper.
 * @param {string} endpoint  - Path after the base URL (e.g. "/me/top/tracks")
 * @param {string} token     - Spotify access token
 * @param {Object} params    - Optional URL search params
 */
async function spotifyFetch(endpoint, token, params = {}) {
  const url = new URL(`${SPOTIFY_API_BASE}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // Revalidate every 5 minutes for Next.js fetch cache
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `Spotify API error ${res.status}: ${error?.error?.message ?? res.statusText}`,
    );
  }

  return res.json();
}

// ── Public helpers ─────────────────────────────────────────────

/**
 * Fetch the authenticated user's top tracks.
 * @param {string} token
 * @param {'short_term'|'medium_term'|'long_term'} timeRange
 * @param {number} limit  - 1–50
 * @param {number} offset - Pagination offset
 */
export async function getTopTracks(
  token,
  timeRange = "short_term",
  limit = 10,
  offset = 0,
) {
  return spotifyFetch("/me/top/tracks", token, {
    time_range: timeRange,
    limit,
    offset,
  });
}

/**
 * Fetch the top 100 tracks by making two 50-item requests and merging.
 * Spotify's max limit per request is 50, so we need two pages.
 * @param {string} token
 * @param {'short_term'|'medium_term'|'long_term'} timeRange
 */
export async function getTop100Tracks(token, timeRange = "medium_term") {
  const [page1, page2] = await Promise.all([
    spotifyFetch("/me/top/tracks", token, {
      time_range: timeRange,
      limit: 50,
      offset: 0,
    }),
    spotifyFetch("/me/top/tracks", token, {
      time_range: timeRange,
      limit: 50,
      offset: 50,
    }),
  ]);

  return {
    items: [...page1.items, ...page2.items],
    total: page1.total,
  };
}

/**
 * Fetch the authenticated user's top artists.
 * @param {string} token
 * @param {'short_term'|'medium_term'|'long_term'} timeRange
 * @param {number} limit
 */
export async function getTopArtists(
  token,
  timeRange = "short_term",
  limit = 10,
) {
  return spotifyFetch("/me/top/artists", token, {
    time_range: timeRange,
    limit,
  });
}

/**
 * Fetch the current user's Spotify profile.
 * @param {string} token
 */
export async function getSpotifyProfile(token) {
  return spotifyFetch("/me", token);
}
