import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phase S: the old /login/individual accepted any password. Send everyone to
  // the real participant sign-in, which verifies credentials against the API.
  async redirects() {
    return [
      { source: "/login/individual", destination: "/app/login", permanent: false },
    ];
  },
};

export default nextConfig;
