#!/usr/bin/env node
/**
 * Star Ship - Icon Generator
 * Creates PWA icons from spaceship SVG
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Generating PWA icons...\n');

// Icon sizes needed for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// Create icons directory
const iconsDir = './assets/icons';
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

/**
 * Create a simple spaceship icon SVG
 */
function createSpaceshipIcon(size) {
    const padding = size * 0.1; // 10% padding
    const shipSize = size - (padding * 2);
    const centerX = size / 2;
    const centerY = size / 2;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#2a5298"/>
      <stop offset="100%" style="stop-color:#1e3c72"/>
    </radialGradient>
    <linearGradient id="ship" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4488ff"/>
      <stop offset="50%" style="stop-color:#6ab7ff"/>
      <stop offset="100%" style="stop-color:#88ccff"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0"/>
    </radialGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="${centerX}" cy="${centerY}" r="${size/2}" fill="url(#bg)"/>

  <!-- Stars -->
  <circle cx="${size * 0.2}" cy="${size * 0.3}" r="${size * 0.02}" fill="white" opacity="0.8"/>
  <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.015}" fill="white" opacity="0.6"/>
  <circle cx="${size * 0.85}" cy="${size * 0.7}" r="${size * 0.01}" fill="white" opacity="0.7"/>
  <circle cx="${size * 0.15}" cy="${size * 0.8}" r="${size * 0.01}" fill="white" opacity="0.5"/>

  <!-- Spaceship -->
  <g transform="translate(${centerX - shipSize/2}, ${centerY - shipSize/4})">
    <!-- Engine flame -->
    <ellipse cx="${shipSize * 0.1}" cy="${shipSize * 0.25}" rx="${shipSize * 0.08}" ry="${shipSize * 0.12}" fill="#ff6600" opacity="0.8"/>

    <!-- Main body -->
    <path d="M${shipSize * 0.2},${shipSize * 0.15} L${shipSize * 0.7},${shipSize * 0.12} L${shipSize * 0.85},${shipSize * 0.25} L${shipSize * 0.7},${shipSize * 0.38} L${shipSize * 0.2},${shipSize * 0.35} Z" fill="url(#ship)"/>

    <!-- Wing top -->
    <path d="M${shipSize * 0.3},${shipSize * 0.18} L${shipSize * 0.4},${shipSize * 0.05} L${shipSize * 0.6},${shipSize * 0.1} L${shipSize * 0.5},${shipSize * 0.2} Z" fill="#3366cc"/>

    <!-- Wing bottom -->
    <path d="M${shipSize * 0.3},${shipSize * 0.32} L${shipSize * 0.4},${shipSize * 0.45} L${shipSize * 0.6},${shipSize * 0.4} L${shipSize * 0.5},${shipSize * 0.3} Z" fill="#3366cc"/>

    <!-- Cockpit -->
    <ellipse cx="${shipSize * 0.62}" cy="${shipSize * 0.25}" rx="${shipSize * 0.08}" ry="${shipSize * 0.06}" fill="#00ffff"/>

    <!-- Highlight -->
    <ellipse cx="${shipSize * 0.58}" cy="${shipSize * 0.22}" rx="${shipSize * 0.04}" ry="${shipSize * 0.03}" fill="white" opacity="0.6"/>
  </g>

  <!-- Glow overlay -->
  <circle cx="${centerX}" cy="${centerY}" r="${size/3}" fill="url(#glow)" opacity="0.3"/>
</svg>`;
}

/**
 * Generate all icon sizes
 */
function generateIcons() {
    let iconsGenerated = 0;

    iconSizes.forEach(size => {
        const iconSVG = createSpaceshipIcon(size);
        const filename = `icon-${size}.svg`;
        const filepath = path.join(iconsDir, filename);

        fs.writeFileSync(filepath, iconSVG);
        console.log(`✅ Generated: ${filename} (${size}x${size})`);
        iconsGenerated++;
    });

    // Create favicon.ico equivalent (16x16 PNG would be generated from SVG by browsers)
    const faviconSVG = createSpaceshipIcon(32);
    fs.writeFileSync('./favicon.svg', faviconSVG);
    console.log(`✅ Generated: favicon.svg`);

    return iconsGenerated;
}

/**
 * Create a simple screenshot placeholder
 */
function createScreenshotPlaceholder() {
    const screenshotsDir = './assets/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Wide screenshot (1280x720)
    const wideScreenshot = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" style="background: linear-gradient(135deg, #0a0a20 0%, #1a1a40 100%);">
  <defs>
    <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0"/>
    </radialGradient>
  </defs>

  <!-- Stars -->
  ${Array.from({length: 100}, (_, i) => {
    const x = Math.random() * 1280;
    const y = Math.random() * 720;
    const size = Math.random() * 3 + 1;
    return `<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${Math.random() * 0.8 + 0.2}"/>`;
  }).join('\n  ')}

  <!-- Game title -->
  <text x="640" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#00aaff">STAR SHIP</text>
  <text x="640" y="260" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="#ffffff">Space Adventure Game</text>

  <!-- Spaceship -->
  <g transform="translate(300, 400) scale(3)">
    <path d="M0,0 L40,5 L60,15 L40,25 L0,30 Z" fill="#4488ff"/>
    <ellipse cx="45" cy="15" rx="8" ry="5" fill="#00ffff"/>
  </g>

  <!-- Coins -->
  <g transform="translate(800, 300)">
    ${Array.from({length: 5}, (_, i) => `<circle cx="${i * 60}" cy="${Math.sin(i) * 20}" r="15" fill="#ffd700"/>`).join('\n    ')}
  </g>

  <!-- Asteroids -->
  <g transform="translate(900, 500)">
    ${Array.from({length: 3}, (_, i) => `<circle cx="${i * 80}" cy="${Math.sin(i * 2) * 30}" r="${20 + i * 5}" fill="#666666"/>`).join('\n    ')}
  </g>

  <!-- UI mockup -->
  <text x="50" y="60" font-family="Arial, sans-serif" font-size="24" fill="#ffffff">Score: 12,340</text>
  <text x="50" y="90" font-family="Arial, sans-serif" font-size="18" fill="#ffd700">High Score: 25,680</text>
  <text x="1230" y="60" text-anchor="end" font-family="Arial, sans-serif" font-size="24" fill="#00ffff">Level: 8</text>
  <text x="1230" y="90" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="#ff4444">❤️❤️🖤</text>
</svg>`;

    fs.writeFileSync(path.join(screenshotsDir, 'gameplay.svg'), wideScreenshot);
    console.log(`✅ Generated: gameplay screenshot placeholder`);

    // Mobile screenshot (390x844)
    const mobileScreenshot = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" style="background: linear-gradient(135deg, #0a0a20 0%, #1a1a40 100%);">
  <!-- Stars -->
  ${Array.from({length: 50}, (_, i) => {
    const x = Math.random() * 390;
    const y = Math.random() * 844;
    const size = Math.random() * 2 + 0.5;
    return `<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${Math.random() * 0.8 + 0.2}"/>`;
  }).join('\n  ')}

  <!-- Game title -->
  <text x="195" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#00aaff">STAR SHIP</text>

  <!-- Spaceship -->
  <g transform="translate(50, 400) scale(2)">
    <path d="M0,0 L30,3 L45,10 L30,17 L0,20 Z" fill="#4488ff"/>
    <ellipse cx="35" cy="10" rx="6" ry="3" fill="#00ffff"/>
  </g>

  <!-- Touch controls -->
  <circle cx="320" cy="600" r="35" fill="rgba(68,136,255,0.3)" stroke="#4488ff" stroke-width="2"/>
  <text x="320" y="607" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#ffffff">⬆️</text>

  <circle cx="320" cy="700" r="35" fill="rgba(68,136,255,0.3)" stroke="#4488ff" stroke-width="2"/>
  <text x="320" y="707" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#ffffff">⬇️</text>

  <!-- UI -->
  <text x="20" y="40" font-family="Arial, sans-serif" font-size="18" fill="#ffffff">Score: 8,520</text>
  <text x="370" y="40" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="#00ffff">Level: 5</text>
</svg>`;

    fs.writeFileSync(path.join(screenshotsDir, 'mobile.svg'), mobileScreenshot);
    console.log(`✅ Generated: mobile screenshot placeholder`);
}

// Generate everything
const iconsGenerated = generateIcons();
createScreenshotPlaceholder();

console.log(`\n🎉 Generated ${iconsGenerated} icons + favicon + screenshots`);
console.log('\n📝 Next steps:');
console.log('1. Convert SVG icons to PNG if needed (browsers support SVG icons)');
console.log('2. Replace screenshot placeholders with actual game screenshots');
console.log('3. Test PWA installation on mobile devices');
console.log('4. Run "npm run build" to include icons in build');

console.log('\n💡 Tips:');
console.log('• SVG icons scale perfectly on all devices');
console.log('• Take actual screenshots while playing for better marketing');
console.log('• Test installation on iOS Safari and Android Chrome');