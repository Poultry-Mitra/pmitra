import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
},
  devIndicators: {
    allowedDevOrigins: [
      '*.cluster-ulqnojp5endvgve6krhe7klaws.cloudworkstations.dev',
    ],
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
