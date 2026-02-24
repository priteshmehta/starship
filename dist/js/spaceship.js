/**
 * Star Ship - Spaceship Class
 * Player-controlled spaceship with smooth movement and invincibility
 */

// ============================================
// SPACESHIP CLASS
// ============================================
export class Spaceship {
    constructor(config, canvasWidth, canvasHeight) {
        // Position (fixed X, centered Y)
        this.x = config.startX;
        this.y = canvasHeight / 2;

        // Dimensions
        this.width = 70;
        this.height = 50;

        // Movement
        this.speed = config.speed;
        this.velocity = 0;
        this.acceleration = 2000;  // How fast to reach max speed
        this.deceleration = 1500;  // How fast to slow down
        this.maxSpeed = config.speed;

        // Controls state
        this.moveUp = false;
        this.moveDown = false;

        // Health
        this.lives = config.lives;
        this.maxLives = config.lives;

        // Invincibility
        this.isInvincible = false;
        this.invincibilityTime = config.invincibilityTime;
        this.invincibilityTimer = 0;

        // Visual effects
        this.thrustIntensity = 0;
        this.damageFlash = 0;

        // Canvas bounds
        this.canvasHeight = canvasHeight;

        // Sprite (will be loaded later)
        this.sprite = null;
        this.spriteLoaded = false;
    }

    /**
     * Load spaceship sprite image
     */
    loadSprite(imagePath) {
        this.sprite = new Image();
        this.sprite.onload = () => {
            this.spriteLoaded = true;
            console.log('🚀 Spaceship sprite loaded');
        };
        this.sprite.onerror = () => {
            console.warn('⚠️ Failed to load spaceship sprite, using fallback');
        };
        this.sprite.src = imagePath;
    }

    /**
     * Update spaceship state
     */
    update(deltaTime) {
        // Handle movement with smooth acceleration
        this.updateMovement(deltaTime);

        // Update invincibility timer
        this.updateInvincibility(deltaTime);

        // Update visual effects
        this.updateEffects(deltaTime);
    }

    /**
     * Update movement with smooth acceleration/deceleration
     */
    updateMovement(deltaTime) {
        // Calculate target velocity based on input
        let targetVelocity = 0;

        if (this.moveUp && !this.moveDown) {
            targetVelocity = -this.maxSpeed;
        } else if (this.moveDown && !this.moveUp) {
            targetVelocity = this.maxSpeed;
        }

        // Smoothly accelerate/decelerate towards target velocity
        if (targetVelocity !== 0) {
            // Accelerating
            const accelDirection = targetVelocity > 0 ? 1 : -1;
            this.velocity += accelDirection * this.acceleration * deltaTime;

            // Clamp to max speed
            if (Math.abs(this.velocity) > this.maxSpeed) {
                this.velocity = accelDirection * this.maxSpeed;
            }

            // Update thrust visual
            this.thrustIntensity = Math.min(1, this.thrustIntensity + deltaTime * 5);
        } else {
            // Decelerating
            if (this.velocity > 0) {
                this.velocity -= this.deceleration * deltaTime;
                if (this.velocity < 0) this.velocity = 0;
            } else if (this.velocity < 0) {
                this.velocity += this.deceleration * deltaTime;
                if (this.velocity > 0) this.velocity = 0;
            }

            // Reduce thrust visual
            this.thrustIntensity = Math.max(0.3, this.thrustIntensity - deltaTime * 3);
        }

        // Apply velocity to position
        this.y += this.velocity * deltaTime;

        // Enforce boundaries with bounce-back effect
        const margin = this.height / 2 + 10;
        if (this.y < margin) {
            this.y = margin;
            this.velocity = Math.abs(this.velocity) * 0.3; // Soft bounce
        } else if (this.y > this.canvasHeight - margin) {
            this.y = this.canvasHeight - margin;
            this.velocity = -Math.abs(this.velocity) * 0.3; // Soft bounce
        }
    }

    /**
     * Update invincibility state
     */
    updateInvincibility(deltaTime) {
        if (this.isInvincible) {
            this.invincibilityTimer -= deltaTime * 1000;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
                this.invincibilityTimer = 0;
            }
        }
    }

    /**
     * Update visual effects
     */
    updateEffects(deltaTime) {
        // Fade out damage flash
        if (this.damageFlash > 0) {
            this.damageFlash -= deltaTime * 3;
            if (this.damageFlash < 0) this.damageFlash = 0;
        }
    }

    /**
     * Draw the spaceship
     */
    draw(ctx) {
        // Skip drawing for flash effect when invincible
        if (this.isInvincible) {
            const flashRate = 8; // Flashes per second
            if (Math.sin(Date.now() * 0.001 * flashRate * Math.PI * 2) > 0) {
                this.drawShip(ctx, 0.4); // Draw semi-transparent
                return;
            }
        }

        this.drawShip(ctx, 1);
    }

    /**
     * Draw the ship graphics
     */
    drawShip(ctx, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;

        // Draw damage flash overlay
        if (this.damageFlash > 0) {
            ctx.globalAlpha = alpha * (0.5 + this.damageFlash * 0.5);
        }

        if (this.spriteLoaded && this.sprite) {
            // Draw engine thrust behind sprite
            this.drawThrust(ctx, this.x, this.y, this.width, this.height);

            // Draw sprite
            ctx.drawImage(
                this.sprite,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );

            // Draw damage tint overlay
            if (this.damageFlash > 0) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = `rgba(255, 0, 0, ${this.damageFlash * 0.5})`;
                ctx.fillRect(
                    this.x - this.width / 2,
                    this.y - this.height / 2,
                    this.width,
                    this.height
                );
            }
        } else {
            // Draw placeholder graphics
            this.drawPlaceholder(ctx);
        }

        ctx.restore();
    }

    /**
     * Draw placeholder spaceship graphics
     */
    drawPlaceholder(ctx) {
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;

        // Engine thrust flame
        this.drawThrust(ctx, x, y, w, h);

        // Main body
        ctx.fillStyle = this.damageFlash > 0 ? '#ff6666' : '#4488ff';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.4, y - h * 0.3);
        ctx.lineTo(x + w * 0.3, y - h * 0.2);
        ctx.lineTo(x + w * 0.5, y);
        ctx.lineTo(x + w * 0.3, y + h * 0.2);
        ctx.lineTo(x - w * 0.4, y + h * 0.3);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.1, y, w * 0.15, h * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing top
        ctx.fillStyle = this.damageFlash > 0 ? '#cc4444' : '#3366cc';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.2, y - h * 0.25);
        ctx.lineTo(x - w * 0.1, y - h * 0.5);
        ctx.lineTo(x + w * 0.1, y - h * 0.35);
        ctx.lineTo(x + w * 0.1, y - h * 0.2);
        ctx.closePath();
        ctx.fill();

        // Wing bottom
        ctx.beginPath();
        ctx.moveTo(x - w * 0.2, y + h * 0.25);
        ctx.lineTo(x - w * 0.1, y + h * 0.5);
        ctx.lineTo(x + w * 0.1, y + h * 0.35);
        ctx.lineTo(x + w * 0.1, y + h * 0.2);
        ctx.closePath();
        ctx.fill();

        // Engine glow
        ctx.fillStyle = 'rgba(100, 150, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(x - w * 0.35, y, w * 0.1, h * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw engine thrust effect
     */
    drawThrust(ctx, x, y, w, h) {
        const intensity = this.thrustIntensity;
        const flicker = 0.8 + Math.random() * 0.4;
        const thrustLength = (30 + Math.random() * 20) * intensity * flicker;

        // Outer flame (orange/red)
        const gradient1 = ctx.createLinearGradient(
            x - w * 0.4, y,
            x - w * 0.4 - thrustLength, y
        );
        gradient1.addColorStop(0, `rgba(255, 150, 50, ${0.9 * intensity})`);
        gradient1.addColorStop(0.5, `rgba(255, 100, 30, ${0.6 * intensity})`);
        gradient1.addColorStop(1, 'rgba(255, 50, 0, 0)');

        ctx.fillStyle = gradient1;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.4, y - h * 0.15);
        ctx.quadraticCurveTo(
            x - w * 0.4 - thrustLength * 0.5, y,
            x - w * 0.4 - thrustLength, y
        );
        ctx.quadraticCurveTo(
            x - w * 0.4 - thrustLength * 0.5, y,
            x - w * 0.4, y + h * 0.15
        );
        ctx.closePath();
        ctx.fill();

        // Inner flame (yellow/white core)
        const innerLength = thrustLength * 0.6;
        const gradient2 = ctx.createLinearGradient(
            x - w * 0.4, y,
            x - w * 0.4 - innerLength, y
        );
        gradient2.addColorStop(0, `rgba(255, 255, 200, ${0.9 * intensity})`);
        gradient2.addColorStop(0.5, `rgba(255, 200, 100, ${0.5 * intensity})`);
        gradient2.addColorStop(1, 'rgba(255, 150, 50, 0)');

        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.4, y - h * 0.08);
        ctx.quadraticCurveTo(
            x - w * 0.4 - innerLength * 0.5, y,
            x - w * 0.4 - innerLength, y
        );
        ctx.quadraticCurveTo(
            x - w * 0.4 - innerLength * 0.5, y,
            x - w * 0.4, y + h * 0.08
        );
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Handle collision with obstacle
     * Returns true if damage was taken
     */
    hit() {
        if (!this.isInvincible && this.lives > 0) {
            this.lives--;
            this.isInvincible = true;
            this.invincibilityTimer = this.invincibilityTime;
            this.damageFlash = 1;

            // Knockback effect
            this.velocity = -200;

            return true;
        }
        return false;
    }

    /**
     * Get bounding box for collision detection
     */
    getBounds() {
        // Slightly smaller hitbox for fair gameplay
        const hitboxScale = 0.7;
        const hitW = this.width * hitboxScale;
        const hitH = this.height * hitboxScale;

        return {
            x: this.x - hitW / 2,
            y: this.y - hitH / 2,
            width: hitW,
            height: hitH
        };
    }

    /**
     * Update canvas height (for window resize)
     */
    setCanvasHeight(height) {
        this.canvasHeight = height;
        this.constrainToCanvas();
    }

    /**
     * Ensure spaceship stays within canvas bounds
     */
    constrainToCanvas() {
        const margin = this.height / 2 + 10;
        if (this.y < margin) {
            this.y = margin;
        } else if (this.y > this.canvasHeight - margin) {
            this.y = this.canvasHeight - margin;
        }
    }

    /**
     * Reset spaceship to initial state
     */
    reset(canvasHeight) {
        this.y = canvasHeight / 2;
        this.velocity = 0;
        this.lives = this.maxLives;
        this.isInvincible = false;
        this.invincibilityTimer = 0;
        this.damageFlash = 0;
        this.moveUp = false;
        this.moveDown = false;
        this.canvasHeight = canvasHeight;
    }
}
