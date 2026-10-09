import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phase S: the old /login/individual accepted any password. Send everyone to
  // the real participant sign-in, which verifies credentials against the API.
  async redirects() {
    return [
      { source: "/login/individual", destination: "/app/login", permanent: false },
      // Composer's readiness-assessment invites link to /assessment/begin,
      // which never existed (404). Send them to the readiness intake.
      { source: "/assessment", destination: "/intake", permanent: false },
      { source: "/assessment/begin", destination: "/intake", permanent: false },
    ];
  },
};

export default nextConfig;
