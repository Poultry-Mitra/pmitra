
import type {NextConfig} from 'next';

console.log(">>> POULTRYMITRA APP RESTARTING WITH NEW CONFIGURATION...");

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // This is required to allow requests from the Firebase Studio preview environment.
    allowedDevOrigins: ["https://*.cluster-ulqnojp5endvgve6krhe7klaws.cloudworkstations.dev"],
  },
};

export default nextConfig;
