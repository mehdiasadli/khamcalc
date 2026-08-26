import { mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.join(__dirname, "../public/icons")
const publicDir = path.join(__dirname, "../public")

const BRAND = {
  background: "#9AE635",
  foreground: "#365314",
  accent: "#4D7C0F",
}

function createIconSvg(size, maskable = false) {
  const radius = maskable ? 0 : Math.round(size * 0.22)
  const scoreSize = maskable ? size * 0.34 : size * 0.35
  const labelSize = maskable ? size * 0.09 : size * 0.094
  const scoreY = maskable ? size * 0.56 : size * 0.55
  const labelY = maskable ? size * 0.74 : size * 0.74

  const label = maskable
    ? ""
    : `<text x="50%" y="${labelY}" font-family="system-ui, -apple-system, sans-serif" font-size="${labelSize}" font-weight="600" fill="${BRAND.accent}" text-anchor="middle" opacity="0.9">KhamCalc</text>`

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${BRAND.background}"/>
  <text x="50%" y="${scoreY}" font-family="system-ui, -apple-system, sans-serif" font-size="${scoreSize}" font-weight="700" fill="${BRAND.foreground}" text-anchor="middle">100</text>
  ${label}
</svg>`)
}

async function writePng(filename, size, options = {}) {
  const svg = createIconSvg(size, options.maskable)
  const output = path.join(iconsDir, filename)

  await sharp(svg).resize(size, size).png().toFile(output)

  console.log(`Wrote ${output}`)
}

async function writeFavicon() {
  const svg = createIconSvg(32)

  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile(path.join(iconsDir, "favicon-32.png"))

  await sharp(svg).resize(32, 32).toFile(path.join(publicDir, "favicon.ico"))

  console.log(`Wrote ${path.join(publicDir, "favicon.ico")}`)
}

await mkdir(iconsDir, { recursive: true })

await Promise.all([
  writePng("icon-192.png", 192),
  writePng("icon-512.png", 512),
  writePng("icon-512-maskable.png", 512, { maskable: true }),
  writePng("apple-touch-icon.png", 180),
  writeFavicon(),
])

console.log("PWA icons generated.")
