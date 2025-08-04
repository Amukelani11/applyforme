/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['pdfjs-dist', '@react-pdf-viewer/core', '@react-pdf-viewer/default-layout'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY,
    GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION
  },
  // Updated configuration for Next.js 15
  serverExternalPackages: ['canvas'],
  webpack: (config, { isServer }) => {
    // Handle PDF.js and canvas for both server and client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
        util: false
      };
    }
    
    // Handle pdfjs-dist worker files
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.min.js',
    };
    
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        canvas: 'canvas',
        'pdfjs-dist': 'pdfjs-dist'
      });
    }

    return config;
  }
}

export default nextConfig
