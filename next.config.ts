import { spawnSync } from "node:child_process"
import crypto from "node:crypto"

import withSerwistInit from "@serwist/next"
import type { NextConfig } from "next"

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID()

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})

const nextConfig: NextConfig = {
  // Serwist injects a webpack config; acknowledge Turbopack for dev (Serwist is disabled there).
  turbopack: {},
}

export default withSerwist(nextConfig)
