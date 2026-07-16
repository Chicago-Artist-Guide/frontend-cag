import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true
  },
  images: {
    disableStaticImages: true
  },
  output: 'standalone',
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(gif|jpe?g|png|svg)$/i,
      type: 'asset/resource'
    });

    return config;
  }
};

export default nextConfig;
