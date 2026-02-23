/**
 * Star Ship - Asteroid Class
 * Obstacles that the player must dodge
 */

// ============================================
// ASTEROID CLASS
// ============================================
export class Asteroid {
    constructor(x, y, size, speed) {
        // Position
        this.x = x;
        this.y = y;

        // Size (radius)
        this.size = size;

        // Movement
        this.speed = speed;
        this.baseSpeed = speed;

        // Rotation
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 3; // Random rotation direction and speed

        // Visual variation
        this.variant = Math.floor(Math.random() * 3); // 0, 1, or 2 for different shapes
        this.vertices = this.generateVertices();
        this.color = this.generateColor();

        // State
        this.active = true;

        // Sprite (will be loaded later)
        this.sprite = null;
        this.spriteLoaded = false;
    }

    /**
     * Generate irregular asteroid vertices for unique shapes
     */
    generateVertices() {
        const vertices = [];
        const numVertices = 8 + Math.floor(Math.random() * 5); // 8-12 vertices

        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            // Random radius variation for irregular shape
            const radiusVariation = 0.7 + Math.random() * 0.5;
            vertices.push({
                angle: angle,
                radius: this.size * radiusVariation
            });
        }

        return vertices;
    }

    /**
     * Generate a brownish/grayish color for the asteroid
     */
    generateColor() {
        const baseColors = [
            { r: 139, g: 119, b: 101 }, // Brown
            { r: 128, g: 128, b: 128 }, // Gray
            { r: 105, g: 105, b: 105 }, // Dim gray
            { r: 160, g: 140, b: 120 }, // Tan
            { r: 120, g: 100, b: 90 },  // Dark brown
        ];

        const base = baseColors[Math.floor(Math.random() * baseColors.length)];
        const variation = 20;

        return {
            r: base.r + Math.floor(Math.random() * variation - variation / 2),
            g: base.g + Math.floor(Math.random() * variation - variation / 2),
            b: base.b + Math.floor(Math.random() * variation - variation / 2)
        };
    }

    /**
     * Update asteroid position and rotation
     */
    update(deltaTime, speedMultiplier = 1) {
        // Move left
        this.x -= this.speed * speedMultiplier * deltaTime;

        // Rotate
        this.rotation += this.rotationSpeed * deltaTime;

        // Mark as inactive if off-screen (left side)
        if (this.x < -this.size * 2) {
            this.active = false;
        }
    }

    /**
     * Draw the asteroid
     */
    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.spriteLoaded && this.sprite) {
            // Draw sprite
            ctx.drawImage(
                this.sprite,
                -this.size,
                -this.size,
                this.size * 2,
                this.size * 2
            );
        } else {
            // Draw procedural asteroid
            this.drawProcedural(ctx);
        }

        ctx.restore();
    }

    /**
     * Draw procedurally generated asteroid
     */
    drawProcedural(ctx) {
        // Main body
        ctx.beginPath();
        this.vertices.forEach((vertex, index) => {
            const x = Math.cos(vertex.angle) * vertex.radius;
            const y = Math.sin(vertex.angle) * vertex.radius;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();

        // Fill with gradient for 3D effect
        const gradient = ctx.createRadialGradient(
            -this.size * 0.3, -this.size * 0.3, 0,
            0, 0, this.size
        );
        gradient.addColorStop(0, `rgb(${this.color.r + 40}, ${this.color.g + 40}, ${this.color.b + 40})`);
        gradient.addColorStop(0.5, `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`);
        gradient.addColorStop(1, `rgb(${this.color.r - 30}, ${this.color.g - 30}, ${this.color.b - 30})`);

        ctx.fillStyle = gradient;
        ctx.fill();

        // Outline
        ctx.strokeStyle = `rgb(${this.color.r - 40}, ${this.color.g - 40}, ${this.color.b - 40})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add crater details
        this.drawCraters(ctx);
    }

    /**
     * Draw crater details on the asteroid
     */
    drawCraters(ctx) {
        const numCraters = 2 + this.variant;

        for (let i = 0; i < numCraters; i++) {
            // Use deterministic positions based on variant
            const angle = (i / numCraters) * Math.PI * 2 + this.variant;
            const distance = this.size * (0.3 + (i % 3) * 0.15);
            const craterSize = this.size * (0.1 + (i % 2) * 0.08);

            const craterX = Math.cos(angle) * distance;
            const craterY = Math.sin(angle) * distance;

            // Crater shadow
            ctx.beginPath();
            ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
            ctx.fill();

            // Crater highlight
            ctx.beginPath();
            ctx.arc(craterX - craterSize * 0.3, craterY - craterSize * 0.3, craterSize * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
            ctx.fill();
        }
    }

    /**
     * Get bounding box for collision detection
     */
    getBounds() {
        // Use slightly smaller hitbox for fair gameplay
        const hitboxScale = 0.75;
        const hitSize = this.size * hitboxScale;

        return {
            x: this.x - hitSize,
            y: this.y - hitSize,
            width: hitSize * 2,
            height: hitSize * 2
        };
    }

    /**
     * Get circular bounds for more accurate collision
     */
    getCircularBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.size * 0.75 // Slightly smaller for fairness
        };
    }
}

// ============================================
// ASTEROID SPAWNER CLASS
// ============================================
export class AsteroidSpawner {
    constructor(config, canvasWidth, canvasHeight) {
        this.config = config;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Spawning
        this.spawnTimer = 0;
        this.spawnInterval = config.spawnInterval;

        // Sprite (shared across all asteroids)
        this.sprite = null;
        this.spriteLoaded = false;
    }

    /**
     * Load asteroid sprite image
     */
    loadSprite(imagePath) {
        this.sprite = new Image();
        this.sprite.onload = () => {
            this.spriteLoaded = true;
            console.log('☄️ Asteroid sprite loaded');
        };
        this.sprite.onerror = () => {
            console.warn('⚠️ Failed to load asteroid sprite, using fallback');
        };
        this.sprite.src = imagePath;
    }

    /**
     * Update spawner and check if new asteroid should spawn
     */
    update(deltaTime, level) {
        this.spawnTimer += deltaTime * 1000;

        // Decrease spawn interval as level increases (more asteroids)
        const levelMultiplier = 1 - (level - 1) * 0.05; // 5% faster per level
        const adjustedInterval = this.spawnInterval * Math.max(0.4, levelMultiplier);

        if (this.spawnTimer >= adjustedInterval) {
            this.spawnTimer = 0;
            return this.spawn(level);
        }

        return null;
    }

    /**
     * Spawn a new asteroid
     */
    spawn(level) {
        // Random size within configured range
        const size = this.config.minSize + Math.random() * (this.config.maxSize - this.config.minSize);

        // Spawn off-screen to the right
        const x = this.canvasWidth + size;

        // Random Y position with margin
        const margin = size + 20;
        const y = margin + Math.random() * (this.canvasHeight - margin * 2);

        // Speed increases with level
        const speed = this.config.baseSpeed + (level - 1) * this.config.speedIncreasePerLevel;

        const asteroid = new Asteroid(x, y, size, speed);

        // Apply shared sprite if loaded
        if (this.spriteLoaded && this.sprite) {
            asteroid.sprite = this.sprite;
            asteroid.spriteLoaded = true;
        }

        return asteroid;
    }

    /**
     * Update canvas dimensions (for window resize)
     */
    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
}
