// app/layout.js
// Root layout — applies global CSS variables and font.

import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Spotify Stats",
  description: "Your personalized Spotify statistics dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
