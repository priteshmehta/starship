/**
 * Star Ship - Scrolling Space Background
 * Creates an infinite parallax starfield effect
 */

// ============================================
// STAR CLASS
// ============================================
class Star {
    constructor(x, y, size, speed, brightness) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.baseSpeed = speed;
        this.speed = speed;
        this.brightness = brightness;
        this.twinkleOffset = Math.random() * Math.PI * 2; // Random phase for twinkling
    }

    update(deltaTime, canvasWidth) {
        // Move star to the left
        this.x -= this.speed * deltaTime;

        // Reset position when off-screen
        if (this.x < -this.size) {
            this.x = canvasWidth + this.size;
            this.y = Math.random() * canvasWidth; // Randomize Y on reset
        }
    }

    draw(ctx, time) {
        // Calculate twinkle effect
        const twinkle = 0.7 + 0.3 * Math.sin(time * 0.003 + this.twinkleOffset);
        const alpha = this.brightness * twinkle;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
    }
}

// ============================================
// STAR LAYER CLASS (for parallax effect)
// ============================================
class StarLayer {
    constructor(config) {
        this.stars = [];
        this.baseSpeed = config.speed;
        this.starCount = config.count;
        this.minSize = config.minSize;
        this.maxSize = config.maxSize;
        this.minBrightness = config.minBrightness;
        this.maxBrightness = config.maxBrightness;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
    }

    /**
     * Initialize stars for this layer
     */
    init(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.stars = [];

        for (let i = 0; i < this.starCount; i++) {
            const x = Math.random() * canvasWidth;
            const y = Math.random() * canvasHeight;
            const size = this.minSize + Math.random() * (this.maxSize - this.minSize);
            const brightness = this.minBrightness + Math.random() * (this.maxBrightness - this.minBrightness);

            this.stars.push(new Star(x, y, size, this.baseSpeed, brightness));
        }
    }

    /**
     * Update all stars in this layer
     */
    update(deltaTime, speedMultiplier) {
        this.stars.forEach(star => {
            star.speed = star.baseSpeed * speedMultiplier;
            star.update(deltaTime, this.canvasWidth);
        });
    }

    /**
     * Draw all stars in this layer
     */
    draw(ctx, time) {
        this.stars.forEach(star => star.draw(ctx, time));
    }

    /**
     * Handle canvas resize
     */
    resize(canvasWidth, canvasHeight) {
        const widthRatio = canvasWidth / this.canvasWidth;
        const heightRatio = canvasHeight / this.canvasHeight;

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Reposition stars proportionally
        this.stars.forEach(star => {
            star.x *= widthRatio;
            star.y *= heightRatio;

            // Ensure stars are within bounds
            if (star.y > canvasHeight) star.y = Math.random() * canvasHeight;
            if (star.x > canvasWidth) star.x = Math.random() * canvasWidth;
        });
    }
}

// ============================================
// NEBULA CLASS (background color clouds)
// ============================================
class Nebula {
    constructor(canvasWidth, canvasHeight) {
        this.x = canvasWidth + Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.radius = 100 + Math.random() * 200;
        this.baseSpeed = 20 + Math.random() * 30;
        this.speed = this.baseSpeed;
        this.hue = Math.random() * 60 + 200; // Blue to purple range
        this.alpha = 0.03 + Math.random() * 0.05;
    }

    update(deltaTime, canvasWidth, speedMultiplier) {
        this.speed = this.baseSpeed * speedMultiplier;
        this.x -= this.speed * deltaTime;

        if (this.x < -this.radius * 2) {
            this.x = canvasWidth + this.radius + Math.random() * 200;
            this.y = Math.random() * canvasWidth;
            this.hue = Math.random() * 60 + 200;
        }
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 50%, ${this.alpha})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }
}

// ============================================
// MAIN BACKGROUND CLASS
// ============================================
class Background {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.speedMultiplier = 1;
        this.time = 0;

        // Define parallax layers (back to front)
        this.layers = [
            // Far background - small, dim, slow stars
            new StarLayer({
                count: 80,
                speed: 30,
                minSize: 0.5,
                maxSize: 1,
                minBrightness: 0.2,
                maxBrightness: 0.4
            }),
            // Mid background - medium stars
            new StarLayer({
                count: 50,
                speed: 60,
                minSize: 1,
                maxSize: 2,
                minBrightness: 0.4,
                maxBrightness: 0.7
            }),
            // Near background - larger, brighter, faster stars
            new StarLayer({
                count: 30,
                speed: 100,
                minSize: 2,
                maxSize: 3,
                minBrightness: 0.7,
                maxBrightness: 1.0
            })
        ];

        // Nebula clouds for atmosphere
        this.nebulae = [];
        for (let i = 0; i < 3; i++) {
            this.nebulae.push(new Nebula(canvasWidth, canvasHeight));
        }

        // Initialize all layers
        this.init();
    }

    /**
     * Initialize all background elements
     */
    init() {
        this.layers.forEach(layer => layer.init(this.canvasWidth, this.canvasHeight));
    }

    /**
     * Update background based on current level
     */
    update(deltaTime, level) {
        this.time += deltaTime * 1000;

        // Increase speed with level (10% increase per level)
        this.speedMultiplier = 1 + (level - 1) * 0.1;

        // Update star layers
        this.layers.forEach(layer => layer.update(deltaTime, this.speedMultiplier));

        // Update nebulae
        this.nebulae.forEach(nebula => nebula.update(deltaTime, this.canvasWidth, this.speedMultiplier));
    }

    /**
     * Draw the complete background
     */
    draw(ctx) {
        // Draw deep space gradient
        this.drawSpaceGradient(ctx);

        // Draw nebulae (atmospheric clouds)
        this.nebulae.forEach(nebula => nebula.draw(ctx));

        // Draw star layers (back to front for proper depth)
        this.layers.forEach(layer => layer.draw(ctx, this.time));
    }

    /**
     * Draw the base space gradient
     */
    drawSpaceGradient(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#0d0d25');
        gradient.addColorStop(1, '#0a0a1a');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    /**
     * Handle canvas resize
     */
    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.layers.forEach(layer => layer.resize(canvasWidth, canvasHeight));

        // Reposition nebulae
        this.nebulae.forEach(nebula => {
            if (nebula.y > canvasHeight) nebula.y = Math.random() * canvasHeight;
        });
    }
}

// Export for use in game.js
export { Background };
