import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: [
      "@duckdb/node-api",
      "@duckdb/node-bindings",
      "@duckdb/node-bindings-darwin-arm64",
    ],
};

export default nextConfig;
