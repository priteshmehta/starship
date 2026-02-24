#!/usr/bin/env node
/**
 * Star Ship - Build Script
 * Creates optimized production build
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Building Star Ship Game...\n');

// Create dist directory
const distDir = './dist';
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Files to copy directly
const copyFiles = [
    'index.html',
    'manifest.json',
    'sw.js'
];

// Directories to copy
const copyDirs = [
    'css',
    'js',
    'assets'
];

/**
 * Copy a file
 */
function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`📄 Copied: ${src} → ${dest}`);
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.statSync(srcPath).isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });

    console.log(`📁 Copied directory: ${src} → ${dest}`);
}

/**
 * Minify CSS (basic minification)
 */
function minifyCSS(content) {
    return content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
        .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
        .replace(/;\s*/g, ';') // Remove spaces after semicolons
        .trim();
}

/**
 * Process HTML file
 */
function processHTML(content) {
    // Add cache busting
    const timestamp = Date.now();
    return content
        .replace(/href="css\//g, `href="css/`)
        .replace(/src="js\//g, `src="js/`)
        .replace(/<!-- PWA Service Worker Registration -->/g,
            `<!-- Build: ${new Date().toISOString()} -->\n    <!-- PWA Service Worker Registration -->`);
}

// Copy and process files
console.log('📦 Copying files...');

// Copy individual files
copyFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    if (file === 'index.html') {
        content = processHTML(content);
    }

    fs.writeFileSync(path.join(distDir, file), content);
    console.log(`📄 Processed: ${file}`);
});

// Copy directories
copyDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        copyDirectory(dir, path.join(distDir, dir));
    }
});

// Minify CSS
const cssDir = path.join(distDir, 'css');
if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
    cssFiles.forEach(file => {
        const cssPath = path.join(cssDir, file);
        const content = fs.readFileSync(cssPath, 'utf8');
        const minified = minifyCSS(content);
        fs.writeFileSync(cssPath, minified);
        console.log(`🎨 Minified CSS: ${file}`);
    });
}

// Create icons if they don't exist
const iconsDir = path.join(distDir, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('📁 Created icons directory');
    console.log('⚠️  Note: Add icon files to assets/icons/ directory');
    console.log('   Required sizes: 16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512');
}

// Create screenshots directory
const screenshotsDir = path.join(distDir, 'assets', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log('📁 Created screenshots directory');
    console.log('⚠️  Note: Add screenshot files to assets/screenshots/ directory');
    console.log('   Recommended: gameplay.png (1280x720), mobile.png (390x844)');
}

// Generate build info
const buildInfo = {
    version: "1.0.0",
    buildTime: new Date().toISOString(),
    buildNumber: Math.floor(Date.now() / 1000),
    files: {
        html: copyFiles.length,
        directories: copyDirs.length
    }
};

fs.writeFileSync(path.join(distDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2));

console.log('\n✅ Build complete!');
console.log(`📦 Output directory: ${distDir}`);
console.log(`🕐 Build time: ${buildInfo.buildTime}`);
console.log(`📊 Build number: ${buildInfo.buildNumber}`);
console.log('\n🚀 To test the build:');
console.log('   npm run preview');
console.log('\n📱 To deploy:');
console.log('   npm run deploy');