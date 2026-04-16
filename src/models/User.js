// models/User.js
// ─────────────────────────────────────────────────────────────
// The NextAuth MongoDB Adapter manages most of the user/account
// documents. We extend with a minimal custom model only to store
// the fields WE need (e.g. spotifyId for quick lookups).
//
// The Adapter will create its own "users", "accounts", "sessions",
// and "verificationTokens" collections automatically. This model
// is for any custom user data you want beyond what the Adapter stores.
// ─────────────────────────────────────────────────────────────

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // The Spotify user ID (e.g. "31xyz…")
    spotifyId: {
      type: String,
      unique: true,
      sparse: true, // allows null for non-Spotify users if you ever add more providers
    },

    // Display name from Spotify
    displayName: {
      type: String,
    },

    // Email from Spotify (may be empty if user hasn't set one)
    email: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Avatar URL from Spotify
    image: {
      type: String,
    },

    // Tracks the last time a snapshot was taken so we can enforce
    // the "once per month on the 1st" rule in the Time Capsule feature.
    lastSnapshotDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  },
);

// Prevent model re-compilation on hot-reload (Next.js dev mode)
export default mongoose.models.User || mongoose.model("User", UserSchema);
