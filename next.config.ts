
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
};

export default nextConfig;
