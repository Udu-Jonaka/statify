// app/(dashboard)/top-songs/page.js
// Shows the user's top 10 tracks for the current short-term period.

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTopTracks } from "@/lib/spotify";
import TrackListItem from "@/components/TrackListItem";
import styles from "@/styles/stat-page.module.css";

export const metadata = { title: "Top Songs — Statify" };

export default async function TopSongsPage() {
  const session = await getServerSession(authOptions);
  const data = await getTopTracks(session.accessToken, "short_term", 10, 0);

  return (
    <div className={styles.statPage}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>Short Term · Last 4 Weeks</span>
        <h1 className={styles.title}>Top Songs</h1>
        <p className={styles.desc}>
          The tracks you&apos;ve had on repeat most recently.
        </p>
      </header>

      <ol className={styles.list} aria-label="Top 10 songs">
        {data.items.map(function renderTrack(track, idx) {
          return (
            <TrackListItem
              key={track.id}
              rank={idx + 1}
              name={track.name}
              artists={track.artists.map((a) => a.name).join(", ")}
              album={track.album.name}
              imageUrl={track.album.images[1]?.url}
              durationMs={track.duration_ms}
              spotifyUrl={track.external_urls.spotify}
            />
          );
        })}
      </ol>
    </div>
  );
}
