// app/(marketing)/faq/page.js

import Link from "next/link";
import { FaArrowLeft, FaCircle } from "react-icons/fa";
import styles from "@/styles/faq.module.css";

export const metadata = {
  title: "FAQ — Statify",
};

const FAQ_ITEMS = [
  {
    q: "What data does Statify access?",
    a: "We only request 'user-top-read' from Spotify, which gives us read access to your top artists and tracks. We never access your playlists, playback control, or post anything on your behalf.",
  },
  {
    q: "What is the Time Capsule?",
    a: "Spotify doesn't provide a history of your past top tracks. Statify solves this by taking a snapshot of your top tracks on the 1st of every month you log in. Over time, this builds a personal archive of your listening history.",
  },
  {
    q: "How often does my data update?",
    a: "Your top songs and artists are fetched live from Spotify's API each time you visit the relevant page. The 'short_term' data reflects approximately the last 4 weeks of listening.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. You can revoke Statify's access at any time from your Spotify account's 'Apps' settings page. This will invalidate our tokens, and we will no longer be able to fetch your data.",
  },
  {
    q: "Why does my Top 100 sometimes have fewer than 100 songs?",
    a: "Spotify's algorithm requires enough listening history to generate 100 distinct tracks. If your account is newer or you've listened to a limited catalog, the list may be shorter.",
  },
];

export default function FAQPage() {
  return (
    <main className={styles.faqPage}>
      <div className={styles.faqNoise} aria-hidden="true" />

      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>
          <FaArrowLeft /> Back
        </Link>
        <span className={styles.logo}>
          <FaCircle className={styles.logoMark} /> STATIFY
        </span>
      </nav>

      <section className={styles.content}>
        <h1 className={styles.title}>
          Frequently Asked
          <br />
          <span className={styles.accentGold}>Questions</span>
        </h1>

        <div className={styles.list}>
          {FAQ_ITEMS.map(function renderItem(item, i) {
            return (
              <div key={i} className={styles.item}>
                <h2 className={styles.question}>
                  <span className={styles.questionNum}>0{i + 1}</span>
                  {item.q}
                </h2>
                <p className={styles.answer}>{item.a}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
