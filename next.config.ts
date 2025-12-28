import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile Stacks packages to ensure compatibility with newer bundlers
  transpilePackages: [
    '@stacks/connect',
    '@stacks/connect-react',
    '@stacks/auth',
    '@stacks/common',
    '@stacks/encryption',
    '@stacks/network',
    '@stacks/profile',
    '@stacks/storage',
    '@stacks/transactions',
  ],
  // Empty turbopack config to allow webpack fallbacks
  turbopack: {},
  // Webpack configuration to handle potential module issues
  webpack: (config, { isServer }) => {
    // Handle node: protocol imports that some Stacks packages use
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    return config;
  },
};

export default nextConfig;

