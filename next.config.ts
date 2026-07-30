import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true
  },
  images: {
    disableStaticImages: true
  },
  output: 'standalone'
};

export default nextConfig;
