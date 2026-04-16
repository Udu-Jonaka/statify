"use client";

import { signIn } from "next-auth/react";
import { FaSpotify } from "react-icons/fa";
import styles from "@/styles/landing.module.css";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
      className={styles.ctaButton}
    >
      <FaSpotify className={styles.spotifyIcon} />
      Login with Spotify
    </button>
  );
}
