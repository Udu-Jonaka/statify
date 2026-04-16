// app/(dashboard)/history/page.js
// The Time Capsule: shows all monthly snapshots stored in MongoDB.

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Snapshot from "@/models/Snapshot";
import { FaHistory } from "react-icons/fa";
import styles from "@/styles/stat-page.module.css";
import historyStyles from "@/styles/history.module.css";
import TrackListItem from "@/components/TrackListItem";

export const metadata = { title: "Time Capsule — Statify" };

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  // Fetch all snapshots for this user, most recent first
  const snapshots = await Snapshot.find({ userId: session.user.id })
    .sort({ month: -1 })
    .lean();

  return (
    <div className={styles.statPage}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>Your Personal Archive</span>
        <h1 className={styles.title}>
          Time <span style={{ color: "var(--color-gold)" }}>Capsule</span>
        </h1>
        <p className={styles.desc}>
          A snapshot of your top tracks is saved on the 1st of every month you
          log in. Your history starts here — come back next month.
        </p>
      </header>

      {snapshots.length === 0 ? (
        <div className={historyStyles.empty}>
          <FaHistory className={historyStyles.emptyIcon} />
          <p className={historyStyles.emptyTitle}>No snapshots yet</p>
          <p className={historyStyles.emptyDesc}>
            Your first Time Capsule will be created automatically when you log
            in on the 1st of next month.
          </p>
        </div>
      ) : (
        <div className={historyStyles.snapshotList}>
          {snapshots.map(function renderSnapshot(snap) {
            return (
              <section
                key={snap._id.toString()}
                className={historyStyles.month}
              >
                <h2 className={historyStyles.monthLabel}>{snap.label}</h2>
                <ol
                  className={styles.list}
                  aria-label={`Top tracks for ${snap.label}`}
                >
                  {snap.tracks.map(function renderTrack(track) {
                    return (
                      <TrackListItem
                        key={`${snap._id}-${track.spotifyId}`}
                        rank={track.rank + 1}
                        name={track.name}
                        artists={track.artists}
                        album={track.album}
                        imageUrl={track.albumImageUrl}
                        durationMs={track.durationMs}
                        spotifyUrl={track.spotifyUrl}
                      />
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
