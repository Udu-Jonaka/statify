// app/(dashboard)/top-artists/page.js

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTopArtists } from "@/lib/spotify";
import styles from "@/styles/stat-page.module.css";
import artistStyles from "@/styles/artists.module.css";
import Image from "next/image";

export const metadata = { title: "Top Artists — Statify" };

export default async function TopArtistsPage() {
  const session = await getServerSession(authOptions);
  const data = await getTopArtists(session.accessToken, "short_term", 10);

  return (
    <div className={styles.statPage}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>Short Term · Last 4 Weeks</span>
        <h1 className={styles.title}>Top Artists</h1>
        <p className={styles.desc}>
          The artists who&apos;ve been living rent-free in your ears.
        </p>
      </header>

      <ol className={artistStyles.artistGrid} aria-label="Top 10 artists">
        {data.items.map(function renderArtist(artist, idx) {
          const imageUrl = artist.images[0]?.url;
          const topGenre = artist.genres?.[0] ?? "—";

          return (
            <li key={artist.id} className={artistStyles.artistCard}>
              <a
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className={artistStyles.artistLink}
              >
                <div className={artistStyles.imageWrap}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={artist.name}
                      width={200}
                      height={200}
                      className={artistStyles.artistImage}
                    />
                  ) : (
                    <div className={artistStyles.imagePlaceholder}>
                      {artist.name[0]}
                    </div>
                  )}
                  <span className={artistStyles.rank}>#{idx + 1}</span>
                </div>
                <div className={artistStyles.artistInfo}>
                  <span className={artistStyles.artistName}>{artist.name}</span>
                  <span className={artistStyles.artistGenre}>{topGenre}</span>
                </div>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
