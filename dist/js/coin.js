/**
 * Star Ship - Coin Class
 * Collectibles that give the player points
 */

// ============================================
// COIN CLASS
// ============================================
export class Coin {
    constructor(x, y, size, speed, points) {
        // Position
        this.x = x;
        this.y = y;

        // Size
        this.size = size;

        // Movement
        this.speed = speed;
        this.baseSpeed = speed;

        // Points value
        this.points = points;

        // Animation
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = 5; // Radians per second
        this.bobOffset = Math.random() * Math.PI * 2; // Random phase for bobbing
        this.bobAmount = 3; // Pixels to bob up/down
        this.baseY = y;

        // Sparkle effect
        this.sparkles = this.generateSparkles();
        this.sparkleTimer = 0;

        // State
        this.active = true;
        this.collected = false;
        this.collectAnimation = 0;

        // Sprite (will be loaded later)
        this.sprite = null;
        this.spriteLoaded = false;
    }

    /**
     * Generate sparkle positions around the coin
     */
    generateSparkles() {
        const sparkles = [];
        const numSparkles = 4;

        for (let i = 0; i < numSparkles; i++) {
            sparkles.push({
                angle: (i / numSparkles) * Math.PI * 2,
                distance: this.size * 0.8,
                size: 2 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2
            });
        }

        return sparkles;
    }

    /**
     * Update coin position and animation
     */
    update(deltaTime, speedMultiplier = 1) {
        if (this.collected) {
            // Collection animation
            this.collectAnimation += deltaTime * 5;
            if (this.collectAnimation >= 1) {
                this.active = false;
            }
            return;
        }

        // Move left
        this.x -= this.speed * speedMultiplier * deltaTime;

        // Rotate (spinning effect)
        this.rotation += this.rotationSpeed * deltaTime;

        // Bob up and down
        this.bobOffset += deltaTime * 3;
        this.y = this.baseY + Math.sin(this.bobOffset) * this.bobAmount;

        // Update sparkle timer
        this.sparkleTimer += deltaTime;

        // Mark as inactive if off-screen (left side)
        if (this.x < -this.size * 2) {
            this.active = false;
        }
    }

    /**
     * Draw the coin
     */
    draw(ctx) {
        if (!this.active) return;

        ctx.save();

        if (this.collected) {
            // Collection animation - scale up and fade out
            const scale = 1 + this.collectAnimation * 0.5;
            const alpha = 1 - this.collectAnimation;
            ctx.globalAlpha = alpha;
            ctx.translate(this.x, this.y);
            ctx.scale(scale, scale);
        } else {
            ctx.translate(this.x, this.y);
        }

        if (this.spriteLoaded && this.sprite) {
            // Draw sprite with rotation effect (squash for 3D spin)
            const scaleX = Math.cos(this.rotation);
            ctx.scale(Math.abs(scaleX) * 0.5 + 0.5, 1);
            ctx.drawImage(
                this.sprite,
                -this.size,
                -this.size,
                this.size * 2,
                this.size * 2
            );
        } else {
            // Draw procedural coin
            this.drawProcedural(ctx);
        }

        ctx.restore();

        // Draw sparkles (outside transform)
        if (!this.collected) {
            this.drawSparkles(ctx);
        }

        // Draw points popup during collection
        if (this.collected) {
            this.drawPointsPopup(ctx);
        }
    }

    /**
     * Draw procedurally generated coin
     */
    drawProcedural(ctx) {
        // Calculate 3D rotation effect (ellipse squash)
        const scaleX = Math.cos(this.rotation);
        const absScaleX = Math.abs(scaleX) * 0.4 + 0.6; // Min 0.6, max 1.0

        // Outer ring (gold)
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * absScaleX, this.size, 0, 0, Math.PI * 2);

        // Gold gradient
        const gradient = ctx.createRadialGradient(
            -this.size * 0.3 * absScaleX, -this.size * 0.3, 0,
            0, 0, this.size
        );
        gradient.addColorStop(0, '#ffec8b');  // Light gold
        gradient.addColorStop(0.5, '#ffd700'); // Gold
        gradient.addColorStop(1, '#daa520');   // Darker gold

        ctx.fillStyle = gradient;
        ctx.fill();

        // Coin border
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner circle detail
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.7 * absScaleX, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#daa520';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Star or dollar sign in center (only show when facing forward)
        if (absScaleX > 0.7) {
            ctx.fillStyle = '#b8860b';
            ctx.font = `bold ${this.size * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', 0, 0);
        }

        // Shine effect
        ctx.beginPath();
        ctx.ellipse(
            -this.size * 0.25 * absScaleX,
            -this.size * 0.25,
            this.size * 0.15 * absScaleX,
            this.size * 0.1,
            -Math.PI / 4,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }

    /**
     * Draw sparkle effects around the coin
     */
    drawSparkles(ctx) {
        this.sparkles.forEach((sparkle, index) => {
            // Animate sparkle position
            const animatedAngle = sparkle.angle + this.sparkleTimer * 2;
            const pulse = 0.5 + 0.5 * Math.sin(this.sparkleTimer * 5 + sparkle.phase);

            const sparkleX = this.x + Math.cos(animatedAngle) * sparkle.distance;
            const sparkleY = this.y + Math.sin(animatedAngle) * sparkle.distance;

            // Draw sparkle
            ctx.save();
            ctx.globalAlpha = pulse * 0.8;
            ctx.fillStyle = '#fff';

            // Four-pointed star shape
            ctx.translate(sparkleX, sparkleY);
            ctx.rotate(this.sparkleTimer * 3 + index);

            const s = sparkle.size * pulse;
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.3, -s * 0.3);
            ctx.lineTo(s, 0);
            ctx.lineTo(s * 0.3, s * 0.3);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.3, s * 0.3);
            ctx.lineTo(-s, 0);
            ctx.lineTo(-s * 0.3, -s * 0.3);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        });
    }

    /**
     * Draw points popup when collected
     */
    drawPointsPopup(ctx) {
        const popupY = this.y - 30 - this.collectAnimation * 30;
        const alpha = 1 - this.collectAnimation;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(`+${this.points}`, this.x, popupY);
        ctx.restore();
    }

    /**
     * Mark coin as collected
     */
    collect() {
        if (!this.collected && this.active) {
            this.collected = true;
            this.collectAnimation = 0;
            return this.points;
        }
        return 0;
    }

    /**
     * Get bounding box for collision detection
     */
    getBounds() {
        return {
            x: this.x - this.size,
            y: this.y - this.size,
            width: this.size * 2,
            height: this.size * 2
        };
    }

    /**
     * Get circular bounds for collision
     */
    getCircularBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.size
        };
    }
}

// ============================================
// COIN SPAWNER CLASS
// ============================================
export class CoinSpawner {
    constructor(config, canvasWidth, canvasHeight) {
        this.config = config;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Spawning
        this.spawnTimer = 0;
        this.spawnInterval = config.spawnInterval;

        // Sprite (shared across all coins)
        this.sprite = null;
        this.spriteLoaded = false;
    }

    /**
     * Load coin sprite image
     */
    loadSprite(imagePath) {
        this.sprite = new Image();
        this.sprite.onload = () => {
            this.spriteLoaded = true;
            console.log('🪙 Coin sprite loaded');
        };
        this.sprite.onerror = () => {
            console.warn('⚠️ Failed to load coin sprite, using fallback');
        };
        this.sprite.src = imagePath;
    }

    /**
     * Update spawner and check if new coin should spawn
     */
    update(deltaTime, level) {
        this.spawnTimer += deltaTime * 1000;

        // Slightly decrease spawn interval as level increases
        const levelMultiplier = 1 - (level - 1) * 0.03; // 3% faster per level
        const adjustedInterval = this.spawnInterval * Math.max(0.5, levelMultiplier);

        if (this.spawnTimer >= adjustedInterval) {
            this.spawnTimer = 0;
            return this.spawn(level);
        }

        return null;
    }

    /**
     * Spawn a new coin
     */
    spawn(level) {
        const size = this.config.size;

        // Spawn off-screen to the right
        const x = this.canvasWidth + size;

        // Random Y position with margin
        const margin = size + 50;
        const y = margin + Math.random() * (this.canvasHeight - margin * 2);

        // Speed increases with level
        const speed = this.config.baseSpeed + (level - 1) * this.config.speedIncreasePerLevel;

        const coin = new Coin(x, y, size, speed, this.config.points);

        // Apply shared sprite if loaded
        if (this.spriteLoaded && this.sprite) {
            coin.sprite = this.sprite;
            coin.spriteLoaded = true;
        }

        return coin;
    }

    /**
     * Update canvas dimensions (for window resize)
     */
    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
}
