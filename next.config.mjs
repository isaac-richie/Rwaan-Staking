/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
  },
  webpack: (config, { isServer }) => {
    // Optional deps from MetaMask SDK (React Native only) and WalletConnect (pino-pretty).
    // Stub them so build warnings go away; app runs fine without them.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
