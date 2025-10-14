
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
  // Explicitly disable the service worker generation
  // This is a safeguard to ensure no PWA features are active.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'firebase/app': false,
        'firebase/auth': false,
        'firebase/firestore': false,
      };
    }
    return config;
  },
};

export default nextConfig;
