// app/(dashboard)/dashboard/page.js
// Main dashboard page — shows the dynamic "Number Ones" grid
// and triggers the monthly Time Capsule snapshot.

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTopTracks, getTopArtists } from "@/lib/spotify";
import { connectDB } from "@/lib/mongodb";
import Snapshot from "@/models/Snapshot";
import User from "@/models/User";
import Greeting from "@/components/Greeting";
import GridCard from "@/components/GridCard";
import styles from "@/styles/dashboard-grid.module.css";

export const metadata = { title: "Dashboard — Statify" };

// ── Time Capsule: Monthly Snapshot Logic ───────────────────────
// Run server-side on every dashboard load. Checks if we've already
// snapped this month; if not, saves a new snapshot.
async function maybeCreateSnapshot(userId, accessToken) {
  await connectDB();

  // Normalize to midnight on the 1st of the current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Check if a snapshot already exists for this user this month
  const existing = await Snapshot.findOne({ userId, month: monthStart });
  if (existing) return; // Already snapped — nothing to do

  try {
    // Fetch up to 50 short_term tracks for the snapshot
    const data = await getTopTracks(accessToken, "short_term", 50, 0);

    const tracks = data.items.map(function mapTrack(track, idx) {
      return {
        spotifyId: track.id,
        name: track.name,
        artists: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
        albumImageUrl: track.album.images[1]?.url ?? track.album.images[0]?.url,
        durationMs: track.duration_ms,
        spotifyUrl: track.external_urls.spotify,
        rank: idx,
      };
    });

    const label = monthStart.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    await Snapshot.create({
      userId,
      month: monthStart,
      label,
      tracks,
      timeRange: "short_term",
    });

    // Update the user's lastSnapshotDate
    await User.findByIdAndUpdate(userId, { lastSnapshotDate: now });

    console.log(`[Snapshot] Created ${label} snapshot for user ${userId}`);
  } catch (err) {
    // Non-fatal: log but don't crash the page load
    console.error("[Snapshot] Failed to create snapshot:", err.message);
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const { accessToken, user } = session;

  // Fetch top #1 items for the grid cards (in parallel)
  const [topTracksData, topArtistsData] = await Promise.all([
    getTopTracks(accessToken, "short_term", 1, 0),
    getTopArtists(accessToken, "short_term", 1),
  ]);

  const numberOneTrack = topTracksData.items[0] ?? null;
  const numberOneArtist = topArtistsData.items[0] ?? null;

  // Trigger snapshot asynchronously (don't await it to keep page fast)
  // We pass user.id which comes from the JWT userId claim
  maybeCreateSnapshot(user.id, accessToken);

  // Build grid card data
  const gridCards = [
    {
      id: "top-songs",
      title: "Top Songs",
      subtitle: "This month's #1",
      href: "/top-songs",
      imageUrl: numberOneTrack?.album?.images[0]?.url,
      numberOne: numberOneTrack?.name,
    },
    {
      id: "top-artists",
      title: "Top Artists",
      subtitle: "Your #1 artist",
      href: "/top-artists",
      imageUrl: numberOneArtist?.images[0]?.url,
      numberOne: numberOneArtist?.name,
    },
    {
      id: "top-100",
      title: "Top 100",
      subtitle: "4-month deep dive",
      href: "/top-100",
      imageUrl: numberOneTrack?.album?.images[0]?.url,
      numberOne: "Your extended chart",
    },
    {
      id: "history",
      title: "Time Capsule",
      subtitle: "Monthly snapshots",
      href: "/history",
      imageUrl: null,
      numberOne: "Your listening history",
    },
  ];

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.pageHeader}>
        <Greeting name={user.name?.split(" ")[0] ?? "Listener"} />
        <p className={styles.headerSub}>
          Here&apos;s a snapshot of your sound right now.
        </p>
      </header>

      <section className={styles.gridSection} aria-label="Your Stats">
        <div className={styles.grid}>
          {gridCards.map(function renderCard(card) {
            return <GridCard key={card.id} {...card} />;
          })}
        </div>
      </section>
    </div>
  );
}
