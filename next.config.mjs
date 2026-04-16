/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Spotify CDN for album art and artist images
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/image/**",
      },
      {
        // Spotify mosaic images
        protocol: "https",
        hostname: "mosaic.scdn.co",
        pathname: "/**",
      },
      {
        // Wrapped / other Spotify image hosts
        protocol: "https",
        hostname: "*.spotifycdn.com",
        pathname: "/**",
      },
    ],
  },

  allowedDevOrigins: ["127.0.0.1"],

  // Needed if you deploy on Vercel or any serverless host:
  // ensures long-running token-refresh logic isn't cut off.
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
