// app/(dashboard)/top-100/page.js
// Displays the user's top 100 tracks over medium_term (~4 months).
// Uses the two-request pagination strategy in lib/spotify.js.

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTop100Tracks } from "@/lib/spotify";
import TrackListItem from "@/components/TrackListItem";
import styles from "@/styles/stat-page.module.css";

export const metadata = { title: "Top 100 — Statify" };

export default async function Top100Page() {
  const session = await getServerSession(authOptions);
  const data = await getTop100Tracks(session.accessToken, "medium_term");

  return (
    <div className={styles.statPage}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>Medium Term · Last ~4 Months</span>
        <h1 className={styles.title}>
          Top{" "}
          <span style={{ color: "var(--color-gold)" }}>
            {data.items.length}
          </span>
        </h1>
        <p className={styles.desc}>
          Your extended personal chart. The full picture of what you&apos;ve
          loved over the last four months.
        </p>
      </header>

      <ol className={styles.list} aria-label={`Top ${data.items.length} songs`}>
        {data.items.map(function renderTrack(track, idx) {
          return (
            <TrackListItem
              key={`${track.id}-${idx}`}
              rank={idx + 1}
              name={track.name}
              artists={track.artists.map((a) => a.name).join(", ")}
              album={track.album.name}
              imageUrl={
                track.album.images[2]?.url ?? track.album.images[1]?.url
              }
              durationMs={track.duration_ms}
              spotifyUrl={track.external_urls.spotify}
            />
          );
        })}
      </ol>
    </div>
  );
}
