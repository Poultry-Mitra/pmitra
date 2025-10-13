
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Correctly place allowedDevOrigins at the top level
  allowedDevOrigins: [
    '*.cluster-ulqnojp5endvgve6krhe7klaws.cloudworkstations.dev',
  ],
};

export default nextConfig;
