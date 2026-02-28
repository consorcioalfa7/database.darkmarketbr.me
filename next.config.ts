import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    'preview-chat-a2c531ca-5e06-430f-98a4-d8569adba4bb.space.z.ai',
  ],
};

export default nextConfig;
