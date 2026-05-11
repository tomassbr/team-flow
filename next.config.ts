import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  // Prevent the page from being rendered in an iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Content-Security-Policy:
  // - 'unsafe-inline' and 'unsafe-eval' are required by Next.js App Router (inline scripts, style tags).
  // - img-src allows https: for OAuth avatars (Google, GitHub).
  // - connect-src allows the app to call its own API.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  // Force HTTPS in production.
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // Turbopack (default in Next.js 16) needs its own alias config.
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
    },
  },
  /**
   * react-native-web: alias `react-native` → `react-native-web` so that
   * shared components in packages/ui (built with RN primitives) render
   * correctly in Next.js. View → <div>, Text → <span>, Image → <img>, etc.
   *
   * This is the standard approach for sharing UI components across
   * React Native and web in a monorepo (used by Expo, Meta, and others).
   */
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      "react-native$": "react-native-web",
    };
    return config;
  },
  images: {
    remotePatterns: [
      // Google OAuth avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
