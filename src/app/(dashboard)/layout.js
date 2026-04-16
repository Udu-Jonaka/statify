// app/(dashboard)/layout.js
// Persistent dashboard shell: fixed sidebar + scrollable content.
// Guards against unauthenticated access server-side.

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import styles from "@/styles/dashboard-layout.module.css";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  // If no session, redirect to the landing page for login
  if (!session) redirect("/");

  // If the token refresh failed, force a fresh sign-in
  if (session.error === "RefreshAccessTokenError") redirect("/api/auth/signin");

  return (
    <div className={styles.shell}>
      <Sidebar user={session.user} />
      <main className={styles.main}>
        <div className={styles.mainInner}>{children}</div>
        <Footer />
      </main>
    </div>
  );
}
