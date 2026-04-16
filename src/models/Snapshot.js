// models/Snapshot.js
// ─────────────────────────────────────────────────────────────
// Stores a monthly snapshot of a user's top tracks.
//
// Why do we need this?
// Spotify's API only returns *current* top tracks. It has no
// endpoint for "what were my top tracks in January 2024?"
// We solve this by recording a snapshot on the 1st of each month
// when the user logs in, building a personal history over time.
// ─────────────────────────────────────────────────────────────

import mongoose from "mongoose";

// ── Embedded sub-document: a single track in the snapshot ──────
const TrackSchema = new mongoose.Schema(
  {
    // Spotify track ID
    spotifyId: { type: String, required: true },

    // Track name (e.g. "Blinding Lights")
    name: { type: String, required: true },

    // Artist display name(s), joined: "The Weeknd, Metro Boomin"
    artists: { type: String, required: true },

    // Album name
    album: { type: String, required: true },

    // Album cover image URL (the 300x300 variant from Spotify)
    albumImageUrl: { type: String },

    // Duration in milliseconds
    durationMs: { type: Number },

    // Spotify external URL for linking out
    spotifyUrl: { type: String },

    // The track's 0-based rank position in the snapshot (0 = #1)
    rank: { type: Number, required: true },
  },
  { _id: false }, // no separate _id per track; the snapshot owns them
);

// ── Main Snapshot document ──────────────────────────────────────
const SnapshotSchema = new mongoose.Schema(
  {
    // Reference to the User document
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // The month this snapshot represents, normalized to midnight on
    // the 1st of that month (e.g. 2024-01-01T00:00:00.000Z).
    // This makes it easy to query "give me January 2024's snapshot".
    month: {
      type: Date,
      required: true,
    },

    // Human-readable label, e.g. "January 2024"
    label: {
      type: String,
      required: true,
    },

    // The top tracks at the time of the snapshot (up to 50)
    tracks: {
      type: [TrackSchema],
      default: [],
    },

    // Time range used when fetching (always 'short_term' for monthly capsule)
    timeRange: {
      type: String,
      enum: ["short_term", "medium_term", "long_term"],
      default: "short_term",
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index: one snapshot per user per month
SnapshotSchema.index({ userId: 1, month: 1 }, { unique: true });

export default mongoose.models.Snapshot ||
  mongoose.model("Snapshot", SnapshotSchema);
