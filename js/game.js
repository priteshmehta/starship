/**
 * Star Ship - Main Game Controller
 * A space dodge game where you collect coins and avoid asteroids
 */

import { Background } from './background.js';
import { Spaceship } from './spaceship.js';
import { AsteroidSpawner } from './asteroid.js';
import { CoinSpawner } from './coin.js';
import { checkSpaceshipAsteroidCollision, checkSpaceshipCoinCollision } from './collision.js';
import { AudioManager } from './audio.js';
import { TouchControls } from './touch.js';

// ============================================
// GAME CONFIGURATION
// ============================================
const CONFIG = {
    // Spaceship settings
    spaceship: {
        startX: 100,           // Fixed X position (left side)
        speed: 400,            // Pixels per second
        lives: 3,
        invincibilityTime: 2000 // Milliseconds of invincibility after hit
    },

    // Asteroid settings
    asteroid: {
        baseSpeed: 200,        // Base speed in pixels per second
        speedIncreasePerLevel: 50,
        spawnInterval: 1500,   // Milliseconds between spawns
        minSize: 30,
        maxSize: 60
    },

    // Coin settings
    coin: {
        baseSpeed: 150,
        speedIncreasePerLevel: 30,
        spawnInterval: 2000,
        size: 30,
        points: 1
    },

    // Level settings
    level: {
        duration: 60000        // 60 seconds = 1 minute per level
    },

    // Background settings
    background: {
        baseSpeed: 50,
        speedIncreasePerLevel: 10
    }
};

// ============================================
// GAME STATE
// ============================================
const GameState = {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover'
};

// ============================================
// MAIN GAME CLASS
// ============================================
class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.state = GameState.START;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.level = 1;
        this.levelTime = 0;

        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;

        // Game objects (will be initialized later)
        this.spaceship = null;
        this.asteroids = [];
        this.coins = [];
        this.background = null;

        // Spawners
        this.asteroidSpawner = null;
        this.coinSpawner = null;

        // Audio
        this.audioManager = null;
        this.isMuted = false;

        // Touch controls
        this.touchControls = null;

        // Sprites
        this.sprites = {
            spaceship: null,
            asteroid: null,
            coin: null
        };

        // Initialize
        this.init();
    }

    /**
     * Initialize the game
     */
    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.updateUI();

        // Initialize background
        this.background = new Background(this.width, this.height);

        // Initialize spawners
        this.asteroidSpawner = new AsteroidSpawner(CONFIG.asteroid, this.width, this.height);
        this.coinSpawner = new CoinSpawner(CONFIG.coin, this.width, this.height);

        // Initialize audio
        this.audioManager = new AudioManager();

        // Initialize touch controls
        this.touchControls = new TouchControls(this);

        // Load sprites
        this.loadSprites();

        // Start the game loop
        requestAnimationFrame((time) => this.gameLoop(time));

        console.log('🚀 Star Ship initialized!');
        console.log(`Canvas size: ${this.canvas.width}x${this.canvas.height}`);
    }

    /**
     * Load all sprite images
     */
    loadSprites() {
        // Spaceship sprite
        this.sprites.spaceship = new Image();
        this.sprites.spaceship.onload = () => {
            console.log('🚀 Spaceship sprite loaded');
            // Update existing spaceship if game is running
            if (this.spaceship) {
                this.spaceship.sprite = this.sprites.spaceship;
                this.spaceship.spriteLoaded = true;
            }
        };
        this.sprites.spaceship.onerror = () => {
            console.log('🚀 Spaceship sprite not found, using procedural graphics');
            this.sprites.spaceship = null;
        };
        this.sprites.spaceship.src = 'assets/images/spaceship.svg';

        // Asteroid sprite
        this.sprites.asteroid = new Image();
        this.sprites.asteroid.onload = () => {
            console.log('☄️ Asteroid sprite loaded');
            // Update spawner to use sprite
            if (this.asteroidSpawner) {
                this.asteroidSpawner.sprite = this.sprites.asteroid;
                this.asteroidSpawner.spriteLoaded = true;
            }
        };
        this.sprites.asteroid.onerror = () => {
            console.log('☄️ Asteroid sprite not found, using procedural graphics');
            this.sprites.asteroid = null;
        };
        this.sprites.asteroid.src = 'assets/images/asteroid.svg';

        // Coin sprite
        this.sprites.coin = new Image();
        this.sprites.coin.onload = () => {
            console.log('🪙 Coin sprite loaded');
            // Update spawner to use sprite
            if (this.coinSpawner) {
                this.coinSpawner.sprite = this.sprites.coin;
                this.coinSpawner.spriteLoaded = true;
            }
        };
        this.sprites.coin.onerror = () => {
            console.log('🪙 Coin sprite not found, using procedural graphics');
            this.sprites.coin = null;
        };
        this.sprites.coin.src = 'assets/images/coin.svg';
    }

    /**
     * Resize canvas to fill the screen while maintaining pixel density
     */
    resizeCanvas() {
        // Get the display size
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;

        // Set the canvas size to match display size
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;

        // Store dimensions for game logic
        this.width = displayWidth;
        this.height = displayHeight;

        // Resize background if it exists
        if (this.background) {
            this.background.resize(displayWidth, displayHeight);
        }

        // Resize spawners
        if (this.asteroidSpawner) {
            this.asteroidSpawner.resize(displayWidth, displayHeight);
        }
        if (this.coinSpawner) {
            this.coinSpawner.resize(displayWidth, displayHeight);
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            // Update spaceship canvas bounds
            if (this.spaceship) {
                this.spaceship.setCanvasHeight(this.height);
            }
        });

        // Keyboard controls
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // UI Buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('mute-btn').addEventListener('click', () => this.toggleMute());

        // Prevent arrow key scrolling
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    /**
     * Handle key down events
     */
    handleKeyDown(e) {
        // Start game with Enter key
        if (e.key === 'Enter' && this.state === GameState.START) {
            this.startGame();
            return;
        }

        // Spaceship controls during gameplay
        if (this.state === GameState.PLAYING && this.spaceship) {
            if (e.key === 'ArrowUp') {
                this.spaceship.moveUp = true;
            }
            if (e.key === 'ArrowDown') {
                this.spaceship.moveDown = true;
            }
        }

        // Pause with Escape (optional feature)
        if (e.key === 'Escape' && this.state === GameState.PLAYING) {
            this.pauseGame();
        } else if (e.key === 'Escape' && this.state === GameState.PAUSED) {
            this.resumeGame();
        }
    }

    /**
     * Handle key up events
     */
    handleKeyUp(e) {
        if (this.spaceship) {
            if (e.key === 'ArrowUp') {
                this.spaceship.moveUp = false;
            }
            if (e.key === 'ArrowDown') {
                this.spaceship.moveDown = false;
            }
        }
    }

    /**
     * Start or restart the game
     */
    startGame() {
        // Reset game state
        this.state = GameState.PLAYING;
        this.score = 0;
        this.level = 1;
        this.levelTime = 0;

        // Clear game objects
        this.asteroids = [];
        this.coins = [];

        // Reset spawner timers
        if (this.asteroidSpawner) {
            this.asteroidSpawner.spawnTimer = 0;
        }
        if (this.coinSpawner) {
            this.coinSpawner.spawnTimer = 0;
        }

        // Create spaceship
        this.spaceship = new Spaceship(CONFIG.spaceship, this.width, this.height);

        // Apply sprite to spaceship if loaded
        if (this.sprites.spaceship) {
            this.spaceship.sprite = this.sprites.spaceship;
            this.spaceship.spriteLoaded = true;
        }

        // Start audio (needs user interaction to work)
        if (this.audioManager) {
            this.audioManager.resumeContext();
            this.audioManager.startMusic();
        }

        // Update UI
        this.hideScreen('start-screen');
        this.hideScreen('gameover-screen');
        this.showElement('hud');
        this.updateUI();

        // Update touch controls
        if (this.touchControls) {
            this.touchControls.update('playing');
        }

        console.log('🎮 Game started!');
    }

    /**
     * Pause the game
     */
    pauseGame() {
        this.state = GameState.PAUSED;

        // Pause music
        if (this.audioManager) {
            this.audioManager.pauseMusic();
        }

        // Update touch controls
        if (this.touchControls) {
            this.touchControls.update('paused');
        }

        console.log('⏸️ Game paused');
    }

    /**
     * Resume the game
     */
    resumeGame() {
        this.state = GameState.PLAYING;
        this.lastTime = performance.now(); // Reset timing to avoid jump

        // Resume music
        if (this.audioManager) {
            this.audioManager.resumeMusic();
        }

        // Update touch controls
        if (this.touchControls) {
            this.touchControls.update('playing');
        }

        console.log('▶️ Game resumed');
    }

    /**
     * End the game
     */
    gameOver() {
        this.state = GameState.GAMEOVER;

        // Stop music and play game over sound
        if (this.audioManager) {
            this.audioManager.stopMusic();
            this.audioManager.play('gameOver');
        }

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        // Update game over screen
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-highscore').textContent = this.highScore;
        document.getElementById('final-level').textContent = this.level;

        // Show game over screen
        this.hideElement('hud');
        this.showScreen('gameover-screen');

        // Update touch controls
        if (this.touchControls) {
            this.touchControls.update('gameover');
        }

        console.log('💥 Game Over! Final score:', this.score);
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        // Calculate delta time in seconds
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent huge jumps
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }

        // Update and render based on game state
        switch (this.state) {
            case GameState.START:
                this.renderStartScreen();
                break;

            case GameState.PLAYING:
                this.update();
                this.render();
                break;

            case GameState.PAUSED:
                // Draw frozen background and game objects
                if (this.background) {
                    this.background.draw(this.ctx);
                }
                this.coins.forEach(coin => coin.draw(this.ctx));
                this.asteroids.forEach(asteroid => asteroid.draw(this.ctx));
                if (this.spaceship) {
                    this.spaceship.draw(this.ctx);
                }
                this.renderPauseOverlay();
                break;

            case GameState.GAMEOVER:
                // Keep background animating on game over screen
                if (this.background) {
                    this.background.update(this.deltaTime, this.level);
                    this.background.draw(this.ctx);
                }
                break;
        }

        // Continue the loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Update game state
     */
    update() {
        // Update level timer
        this.levelTime += this.deltaTime * 1000;
        if (this.levelTime >= CONFIG.level.duration) {
            this.levelTime = 0;
            this.level++;
            this.updateUI();

            // Play level up sound
            if (this.audioManager) {
                this.audioManager.play('levelUp');
            }

            console.log(`📈 Level up! Now level ${this.level}`);
        }

        // Update spaceship
        if (this.spaceship) {
            this.spaceship.update(this.deltaTime);
        }

        // Update background
        if (this.background) {
            this.background.update(this.deltaTime, this.level);
        }

        // Update asteroids
        this.updateAsteroids();

        // Update coins
        this.updateCoins();

        // Check collisions
        this.checkCollisions();

        // Check game over
        if (this.spaceship && this.spaceship.lives <= 0) {
            this.gameOver();
        }
    }

    /**
     * Render the game
     */
    render() {
        // Draw scrolling background (handles its own clearing)
        if (this.background) {
            this.background.draw(this.ctx);
        }

        // Draw coins
        this.coins.forEach(coin => coin.draw(this.ctx));

        // Draw asteroids
        this.asteroids.forEach(asteroid => asteroid.draw(this.ctx));

        // Draw spaceship
        if (this.spaceship) {
            this.spaceship.draw(this.ctx);
        }
    }

    /**
     * Render start screen background
     */
    renderStartScreen() {
        // Update background even on start screen for animation
        if (this.background) {
            this.background.update(this.deltaTime, 1);
            this.background.draw(this.ctx);
        }

        // Update touch controls for start screen
        if (this.touchControls) {
            this.touchControls.update('start');
        }
    }

    /**
     * Update all asteroids
     */
    updateAsteroids() {
        // Spawn new asteroids
        if (this.asteroidSpawner) {
            const newAsteroid = this.asteroidSpawner.update(this.deltaTime, this.level);
            if (newAsteroid) {
                this.asteroids.push(newAsteroid);
            }
        }

        // Update existing asteroids
        const speedMultiplier = 1 + (this.level - 1) * 0.1; // 10% faster per level
        this.asteroids.forEach(asteroid => {
            asteroid.update(this.deltaTime, speedMultiplier);
        });

        // Remove inactive asteroids (off-screen)
        this.asteroids = this.asteroids.filter(asteroid => asteroid.active);
    }

    /**
     * Update all coins
     */
    updateCoins() {
        // Spawn new coins
        if (this.coinSpawner) {
            const newCoin = this.coinSpawner.update(this.deltaTime, this.level);
            if (newCoin) {
                this.coins.push(newCoin);
            }
        }

        // Update existing coins
        const speedMultiplier = 1 + (this.level - 1) * 0.1; // 10% faster per level
        this.coins.forEach(coin => {
            coin.update(this.deltaTime, speedMultiplier);
        });

        // Remove inactive coins (off-screen or collected)
        this.coins = this.coins.filter(coin => coin.active);
    }

    /**
     * Check all collisions
     */
    checkCollisions() {
        if (!this.spaceship) return;

        // Check spaceship vs asteroids
        this.checkAsteroidCollisions();

        // Check spaceship vs coins
        this.checkCoinCollisions();
    }

    /**
     * Check spaceship collision with asteroids
     */
    checkAsteroidCollisions() {
        for (const asteroid of this.asteroids) {
            if (!asteroid.active) continue;

            if (checkSpaceshipAsteroidCollision(this.spaceship, asteroid)) {
                // Try to damage the spaceship
                const wasHit = this.spaceship.hit();

                if (wasHit) {
                    // Update UI to show lost life
                    this.updateUI();

                    // Play collision sound
                    if (this.audioManager) {
                        this.audioManager.play('collision');
                    }

                    console.log(`💥 Hit! Lives remaining: ${this.spaceship.lives}`);

                    // Only process one asteroid hit per frame
                    break;
                }
            }
        }
    }

    /**
     * Check spaceship collision with coins
     */
    checkCoinCollisions() {
        for (const coin of this.coins) {
            if (!coin.active || coin.collected) continue;

            if (checkSpaceshipCoinCollision(this.spaceship, coin)) {
                // Collect the coin
                const points = coin.collect();

                if (points > 0) {
                    // Add to score
                    this.score += points;
                    this.updateUI();

                    // Play coin sound
                    if (this.audioManager) {
                        this.audioManager.play('coin');
                    }

                    console.log(`🪙 Coin collected! Score: ${this.score}`);
                }
            }
        }
    }

    /**
     * Render pause overlay
     */
    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press ESC to resume', this.width / 2, this.height / 2 + 40);
    }

    /**
     * Update UI elements
     */
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highscore').textContent = this.highScore;
        document.getElementById('level').textContent = this.level;

        // Update lives display
        const livesIcons = document.getElementById('lives-icons');
        if (this.spaceship) {
            livesIcons.textContent = '❤️'.repeat(this.spaceship.lives) + '🖤'.repeat(this.spaceship.maxLives - this.spaceship.lives);
        } else {
            livesIcons.textContent = '❤️'.repeat(CONFIG.spaceship.lives);
        }
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        if (this.audioManager) {
            this.isMuted = this.audioManager.toggleMute();
        } else {
            this.isMuted = !this.isMuted;
        }
        document.getElementById('mute-btn').textContent = this.isMuted ? '🔇' : '🔊';
        console.log(`🔊 Sound ${this.isMuted ? 'muted' : 'unmuted'}`);
    }

    /**
     * Load high score from session storage
     */
    loadHighScore() {
        const saved = sessionStorage.getItem('starship_highscore');
        return saved ? parseInt(saved, 10) : 0;
    }

    /**
     * Save high score to session storage
     */
    saveHighScore() {
        sessionStorage.setItem('starship_highscore', this.highScore.toString());
    }

    // UI Helper Methods
    showScreen(id) {
        document.getElementById(id).classList.remove('hidden');
    }

    hideScreen(id) {
        document.getElementById(id).classList.add('hidden');
    }

    showElement(id) {
        document.getElementById(id).classList.remove('hidden');
    }

    hideElement(id) {
        document.getElementById(id).classList.add('hidden');
    }
}

// ============================================
// INITIALIZE GAME ON PAGE LOAD
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
