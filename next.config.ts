import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],
  outputFileTracingIncludes: {
    '/api/chat': [
      './node_modules/onnxruntime-node/bin/**/*',
    ],
  },
};

export default nextConfig;
