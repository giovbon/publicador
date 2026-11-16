import sharp from "sharp";
import site from "../src/_data/site.js";

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0f0f10"/>
  <rect x="80" y="78" width="14" height="14" fill="#e07a5f"/>
  <text x="110" y="92" font-family="DejaVu Sans Mono" font-size="18" letter-spacing="5" fill="#a49d90">CADERNO</text>

  <text x="78" y="300" font-family="DejaVu Serif" font-size="104" fill="#f7f2e8">${xmlEscape(site.author)}</text>

  <line x1="80" y1="366" x2="1120" y2="366" stroke="#2a292c" stroke-width="1"/>

  <text x="80" y="430" font-family="DejaVu Sans" font-size="30" fill="#a49d90">${xmlEscape(site.description)}</text>

  <text x="80" y="552" font-family="DejaVu Sans Mono" font-size="20" fill="#6f6a61">${xmlEscape(site.url.replace(/^https?:\/\//, ""))}</text>
</svg>
`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(new URL("../public/og.png", import.meta.url).pathname);

console.log("public/og.png gerado");
