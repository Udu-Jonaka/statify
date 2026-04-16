// app/(marketing)/page.js
// Landing page — marketing home with Spotify login CTA.
// Server Component: no "use client" needed.

import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LoginButton from "@/components/LoginButton";
import styles from "@/styles/landing.module.css";

export const metadata = {
  title: "Spotify Stats — Know Your Sound",
  description:
    "Discover your top songs, artists, and musical history. Powered by your Spotify listening data.",
};

export default async function LandingPage() {
  // If already logged in, skip the landing page
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className={styles.landing}>
      {/* Noise texture overlay */}
      <div className={styles.noise} aria-hidden="true" />

      {/* Ambient glow blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <nav className={styles.nav}>
        <span className={styles.logo}>
          <span className={styles.logoMark}>●</span> STATIFY
        </span>
        <Link href="/faq" className={styles.navLink}>
          FAQ
        </Link>
      </nav>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Your Spotify. Decoded.</p>

        <h1 className={styles.headline}>
          Know your <span className={styles.accentGold}>sound</span>
          <br />
          own your <span className={styles.accentGreen}>stats</span>
        </h1>

        <p className={styles.subheadline}>
          Dive deep into your top tracks, artists, and a growing personal
          history of your listening habits — month by month.
        </p>

        <LoginButton />

        <p className={styles.disclaimer}>
          We only read your listening data. We never post or modify anything.
        </p>
      </section>

      <section className={styles.features}>
        {[
          {
            icon: "◈",
            title: "Top Songs",
            desc: "See exactly what you've been listening to this week and month.",
          },
          {
            icon: "◉",
            title: "Top Artists",
            desc: "Discover which artists have dominated your ears lately.",
          },
          {
            icon: "◎",
            title: "Time Capsule",
            desc: "We snapshot your top tracks every month so you can look back.",
          },
        ].map(function renderFeature(f) {
          return (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          );
        })}
      </section>
    </main>
  );
}
