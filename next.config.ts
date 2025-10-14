
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // This allows the Next.js dev server to accept requests from the
    // Firebase Studio environment, preventing cross-origin errors.
    allowedDevOrigins: [
        "6000-firebase-studio-1760189830759.cluster-ulqnojp5endvgve6krhe7klaws.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
