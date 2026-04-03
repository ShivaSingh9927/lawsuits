import type { NextConfig } from "next";
import dns from "node:dns";

// Completely bypass intermittent IPv6 network hangs in Next.js Server Components
dns.setDefaultResultOrder("ipv4first");

const nextConfig: NextConfig = {
  serverExternalPackages: ["@supabase/ssr", "@supabase/supabase-js"],
  images: {
    unoptimized: true,
    qualities: [75, 80, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.hetzner.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
