// app/api/auth/[...nextauth]/route.js
// ─────────────────────────────────────────────────────────────
// NextAuth.js (Auth.js v4) configuration.
//
// Key responsibilities:
//  1. Spotify OAuth Provider with the scopes we need
//  2. MongoDB Adapter for persistent sessions/accounts
//  3. Token Rotation – Spotify access tokens expire after 1 hour.
//     We store the refresh token in the JWT and silently swap it
//     out before it expires. This keeps the user logged in without
//     forcing a re-authentication.
// ─────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodbClient"; // see note below

// ── Spotify Scopes ─────────────────────────────────────────────
// We only request what we actually use. Add more scopes here if
// you later need playlist access, playback control, etc.
const SPOTIFY_SCOPES = [
  "user-read-email", // For the user's profile email
  "user-read-private", // For country, subscription tier
  "user-top-read", // ← THE MAIN ONE: top artists & tracks
].join(" ");

// ── Token Refresh Helper ───────────────────────────────────────
// Called inside the `jwt` callback whenever the access token has expired.
//
// HOW SPOTIFY TOKEN ROTATION WORKS:
// ┌─────────────┐    expires_in: 3600s (1 hour)    ┌────────────────┐
// │ Access Token│ ──────────────────────────────── │  Spotify API   │
// └─────────────┘                                   └────────────────┘
//       ↓ expires
// ┌──────────────────────────────────────────────────────────────┐
// │  POST https://accounts.spotify.com/api/token                 │
// │  grant_type=refresh_token                                    │
// │  refresh_token=<stored refresh token>                        │
// │  Authorization: Basic base64(clientId:clientSecret)          │
// └──────────────────────────────────────────────────────────────┘
//       ↓
// New access token (+ occasionally a new refresh token)
//
// We store { accessToken, refreshToken, accessTokenExpires } in the
// encrypted JWT cookie. Each page request, the `jwt` callback checks
// if the token has expired and calls this function if needed.
async function refreshAccessToken(token) {
  try {
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) {
      throw refreshed; // will be caught below
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      // Spotify sometimes issues a new refresh token; fall back to the old one
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      // New expiry: current time + expires_in seconds, minus 60s safety buffer
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000 - 60_000,
      error: undefined, // clear any previous error
    };
  } catch (error) {
    console.error("SpotifyTokenRefreshError", error);

    // Return the token with an error flag. The client can read
    // session.error === "RefreshAccessTokenError" and force a sign-in.
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// ── NextAuth Options ───────────────────────────────────────────
export const authOptions = {
  // The MongoDBAdapter requires a raw MongoClient promise (not Mongoose).
  // See src/lib/mongodbClient.js for the adapter-compatible client.
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: {
          scope: SPOTIFY_SCOPES,
        },
      },
    }),
  ],

  // Use JWT strategy. Even with a DB adapter, JWTs are still used
  // to carry the access token to the client efficiently.
  session: {
    strategy: "jwt",
  },

  callbacks: {
    // ── JWT Callback ─────────────────────────────────────────────
    // Runs on every JWT creation, update, and read.
    // This is where we embed the Spotify tokens into the encrypted JWT.
    async jwt({ token, account, user }) {
      // INITIAL SIGN-IN: `account` and `user` are only available on first sign-in.
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          // Store expiry as a timestamp (ms) for easy comparison later
          accessTokenExpires: account.expires_at * 1000,
          userId: user.id,
          spotifyId: account.providerAccountId,
        };
      }

      // SUBSEQUENT REQUESTS: Check if the access token is still valid.
      // If it hasn't expired, just return the existing token as-is.
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // TOKEN EXPIRED: Silently refresh it using the stored refresh token.
      // The user won't notice — this happens server-side on the next request.
      console.log("Spotify access token expired, refreshing…");
      return refreshAccessToken(token);
    },

    // ── Session Callback ─────────────────────────────────────────
    // Runs whenever a session is read (e.g. `getServerSession` in a
    // Server Component). We expose only what the client needs.
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.spotifyId = token.spotifyId;
      session.accessToken = token.accessToken;

      // Propagate any refresh error so the client can react
      // (e.g. show a "Please sign in again" banner)
      if (token.error) {
        session.error = token.error;
      }

      return session;
    },
  },

  // Custom pages (optional – remove to use NextAuth's built-in UI)
  pages: {
    signIn: "/", // Redirect unauthenticated users to the landing page
    error: "/", // Auth errors also go back to landing
  },

  // Recommended: explicitly set the secret (it's already in NEXTAUTH_SECRET
  // but being explicit avoids confusion)
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// App Router requires named exports for each HTTP method
export { handler as GET, handler as POST };
