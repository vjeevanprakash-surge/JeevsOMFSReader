// Brand images from public/favicon.svg: iPhone/iPad launch screens (public/splash/, linked from
// index.html between the splash-links markers) and the link-preview card (public/og-image.png).
// Usage: node scripts/make-brand-images.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const NAVY = '#0f3b5f';
const TEAL = '#1c6e8c';
const MINT = '#6ee7b7';
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const logo = `data:image/svg+xml;base64,${readFileSync('public/favicon.svg').toString('base64')}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const background = (w, h) => `
  <defs>
    <radialGradient id="bg" cx="50%" cy="0%" r="120%" fx="50%" fy="0%">
      <stop offset="0" stop-color="${TEAL}"/><stop offset="0.55" stop-color="${NAVY}"/><stop offset="1" stop-color="#08131d"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>`;

// The same layout as the in-page splash in index.html.
function splashSvg(w, h) {
  const u = Math.min(w, h) / 375; // one CSS pixel on a 375-wide phone
  const size = 104 * u;
  const top = h / 2 - 90 * u;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${background(w, h)}
    <image href="${logo}" x="${(w - size) / 2}" y="${top}" width="${size}" height="${size}"/>
    <text x="${w / 2}" y="${top + size + 46 * u}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="${26 * u}" fill="#fff"><tspan fill="${MINT}">Jeevs</tspan> OMFS Reader</text>
    <text x="${w / 2}" y="${top + size + 74 * u}" text-anchor="middle" font-family="${FONT}" font-size="${15 * u}" fill="#fff" fill-opacity="0.8">${esc('Rekindling the reading habit, one paper at a time.')}</text>
  </svg>`;
}

function ogSvg() {
  const [w, h] = [1200, 630];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${background(w, h)}
    <image href="${logo}" x="90" y="165" width="300" height="300"/>
    <text x="450" y="268" font-family="${FONT}" font-weight="800" font-size="76" fill="#fff"><tspan fill="${MINT}">Jeevs</tspan> OMFS Reader</text>
    <text x="452" y="330" font-family="${FONT}" font-size="31" fill="#fff" fill-opacity="0.85">${esc('Rekindling the reading habit, one paper at a time.')}</text>
    <text x="452" y="410" font-family="${FONT}" font-weight="600" font-size="28" fill="${MINT}">${esc('109 journals · OMFS, head & neck, facial plastics')}</text>
    <text x="452" y="452" font-family="${FONT}" font-size="28" fill="#fff" fill-opacity="0.75">${esc('Free papers first · new evidence as Shorts')}</text>
  </svg>`;
}

// Portrait launch screens: [device width, device height, pixel ratio] in CSS pixels.
const DEVICES = [
  [440, 956, 3], [402, 874, 3], [430, 932, 3], [393, 852, 3], [428, 926, 3], [390, 844, 3],
  [375, 812, 3], [414, 896, 3], [414, 896, 2], [414, 736, 3], [375, 667, 2], [320, 568, 2],
  [1024, 1366, 2], [834, 1194, 2], [820, 1180, 2], [810, 1080, 2], [768, 1024, 2], [744, 1133, 2],
];

mkdirSync('public/splash', { recursive: true });
const links = [];
for (const [dw, dh, r] of DEVICES) {
  const [w, h] = [dw * r, dh * r];
  const file = `splash/apple-splash-${w}-${h}.png`;
  await sharp(Buffer.from(splashSvg(w, h))).png({ compressionLevel: 9, palette: true, dither: 1 }).toFile(`public/${file}`);
  links.push(
    `<link rel="apple-touch-startup-image" href="./${file}" media="(device-width: ${dw}px) and (device-height: ${dh}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)" />`,
  );
}
await sharp(Buffer.from(ogSvg())).png({ compressionLevel: 9 }).toFile('public/og-image.png');

const html = readFileSync('index.html', 'utf8');
const block = `<!--splash-links-->\n    ${links.join('\n    ')}\n    <!--/splash-links-->`;
writeFileSync('index.html', html.replace(/<!--splash-links-->(?:[\s\S]*?<!--\/splash-links-->)?/, block));
console.log(`${links.length} launch screens and og-image.png written`);
