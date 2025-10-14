
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Keep other experimental features here if any
  },
  allowedDevOrigins: [
      "6000-firebase-studio-1760189830759.cluster-ulqnojp5endvgve6krhe7klaws.cloudworkstations.dev",
      "9000-firebase-studio-1760189830759.cluster-ulqnojp5endvgve6krhe7klaws.cloudworkstations.dev"
  ],
};

module.exports = nextConfig;
