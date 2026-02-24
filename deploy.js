#!/usr/bin/env node
/**
 * Star Ship - Deploy Script
 * Deploys to various hosting platforms
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Deploying Star Ship Game...\n');

// Check if dist directory exists
if (!fs.existsSync('./dist')) {
    console.error('❌ Dist directory not found. Run "npm run build" first.');
    process.exit(1);
}

/**
 * Deploy to GitHub Pages
 */
function deployToGitHubPages() {
    console.log('📡 Deploying to GitHub Pages...');

    try {
        // Check if we're in a git repository
        execSync('git status', { stdio: 'pipe' });

        // Check if gh-pages branch exists
        let branchExists = false;
        try {
            execSync('git show-ref --verify --quiet refs/heads/gh-pages', { stdio: 'pipe' });
            branchExists = true;
        } catch (e) {
            console.log('📝 Creating gh-pages branch...');
        }

        // Create or switch to gh-pages branch
        if (branchExists) {
            execSync('git checkout gh-pages', { stdio: 'inherit' });
            execSync('git pull origin gh-pages', { stdio: 'inherit' });
        } else {
            execSync('git checkout -b gh-pages', { stdio: 'inherit' });
        }

        // Copy dist files to root
        console.log('📂 Copying build files...');
        execSync('cp -r dist/* .', { stdio: 'inherit' });

        // Add and commit changes
        execSync('git add .', { stdio: 'inherit' });

        try {
            execSync(`git commit -m "Deploy build ${Date.now()}"`, { stdio: 'inherit' });
            console.log('✅ Changes committed');
        } catch (e) {
            console.log('ℹ️  No changes to commit');
        }

        // Push to GitHub
        execSync('git push origin gh-pages', { stdio: 'inherit' });

        console.log('✅ Deployed to GitHub Pages!');
        console.log('🌐 Your game will be available at:');
        console.log('   https://yourusername.github.io/starship');

        // Switch back to main branch
        execSync('git checkout main || git checkout master', { stdio: 'inherit' });

    } catch (error) {
        console.error('❌ GitHub Pages deployment failed:', error.message);
        console.log('\n📚 Manual deployment steps:');
        console.log('1. git checkout -b gh-pages');
        console.log('2. cp -r dist/* .');
        console.log('3. git add .');
        console.log('4. git commit -m "Deploy game"');
        console.log('5. git push origin gh-pages');
    }
}

/**
 * Generate deployment instructions
 */
function showDeploymentOptions() {
    console.log('🎯 Deployment Options:\n');

    console.log('1️⃣  GitHub Pages (Free):');
    console.log('   - Push your code to GitHub');
    console.log('   - Enable GitHub Pages in repository settings');
    console.log('   - Select "Deploy from branch" → "gh-pages"');
    console.log('   - URL: https://yourusername.github.io/repository-name\n');

    console.log('2️⃣  Netlify (Free):');
    console.log('   - Visit https://netlify.com');
    console.log('   - Drag and drop the "dist" folder');
    console.log('   - Get instant URL like https://amazing-name-123.netlify.app\n');

    console.log('3️⃣  Vercel (Free):');
    console.log('   - Visit https://vercel.com');
    console.log('   - Connect your GitHub repository');
    console.log('   - Auto-deploys on every push\n');

    console.log('4️⃣  Firebase Hosting (Free):');
    console.log('   - npm install -g firebase-tools');
    console.log('   - firebase login');
    console.log('   - firebase init hosting');
    console.log('   - firebase deploy\n');

    console.log('5️⃣  Surge.sh (Free):');
    console.log('   - npm install -g surge');
    console.log('   - cd dist');
    console.log('   - surge (follow prompts)\n');

    console.log('📱 Mobile App Stores:');
    console.log('   - Use Capacitor or Cordova to wrap as native app');
    console.log('   - Or submit PWA to Microsoft Store, Google Play (TWA)');
}

/**
 * Create deployment files
 */
function createDeploymentFiles() {
    console.log('📄 Creating deployment configuration files...\n');

    // Netlify config
    const netlifyConfig = `# Netlify configuration for Star Ship Game
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
`;

    fs.writeFileSync('./netlify.toml', netlifyConfig);
    console.log('✅ Created netlify.toml');

    // Vercel config
    const vercelConfig = {
        "name": "starship",
        "version": 2,
        "builds": [
            {
                "src": "package.json",
                "use": "@vercel/static-build"
            }
        ],
        "routes": [
            {
                "src": "/sw.js",
                "headers": {
                    "Cache-Control": "no-cache"
                }
            },
            {
                "src": "/assets/(.*)",
                "headers": {
                    "Cache-Control": "public, max-age=31536000"
                }
            }
        ]
    };

    fs.writeFileSync('./vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Created vercel.json');

    // Firebase config
    const firebaseConfig = {
        "hosting": {
            "public": "dist",
            "ignore": [
                "firebase.json",
                "**/.*",
                "**/node_modules/**"
            ],
            "rewrites": [
                {
                    "source": "**",
                    "destination": "/index.html"
                }
            ],
            "headers": [
                {
                    "source": "/sw.js",
                    "headers": [
                        {
                            "key": "Cache-Control",
                            "value": "no-cache"
                        }
                    ]
                },
                {
                    "source": "/assets/**",
                    "headers": [
                        {
                            "key": "Cache-Control",
                            "value": "public, max-age=31536000"
                        }
                    ]
                }
            ]
        }
    };

    fs.writeFileSync('./firebase.json', JSON.stringify(firebaseConfig, null, 2));
    console.log('✅ Created firebase.json');

    // GitHub Actions workflow
    const githubAction = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Build
      run: |
        npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
`;

    const workflowDir = './.github/workflows';
    if (!fs.existsSync(workflowDir)) {
        fs.mkdirSync(workflowDir, { recursive: true });
    }
    fs.writeFileSync(`${workflowDir}/deploy.yml`, githubAction);
    console.log('✅ Created .github/workflows/deploy.yml');

    console.log('\n🎯 Configuration files created!');
    console.log('Now you can deploy to any platform easily.\n');
}

// Main deployment logic
const args = process.argv.slice(2);

if (args.includes('--github') || args.includes('-g')) {
    deployToGitHubPages();
} else if (args.includes('--config') || args.includes('-c')) {
    createDeploymentFiles();
} else {
    showDeploymentOptions();
    createDeploymentFiles();
}

console.log('✨ Deployment setup complete!');