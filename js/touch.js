/**
 * Star Ship - Touch Controls
 * Mobile/tablet touch screen support
 */

// ============================================
// TOUCH CONTROLS CLASS
// ============================================
export class TouchControls {
    constructor(game) {
        this.game = game;
        this.isTouchDevice = this.detectTouchDevice();
        this.touchControls = null;
        this.upButton = null;
        this.downButton = null;
        this.isUpPressed = false;
        this.isDownPressed = false;

        if (this.isTouchDevice) {
            this.init();
        }
    }

    /**
     * Detect if this is a touch device
     */
    detectTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    /**
     * Initialize touch controls
     */
    init() {
        this.createTouchUI();
        this.setupTouchEvents();
        console.log('📱 Touch controls initialized');
    }

    /**
     * Create touch control UI elements
     */
    createTouchUI() {
        // Create container
        this.touchControls = document.createElement('div');
        this.touchControls.id = 'touch-controls';
        this.touchControls.className = 'touch-controls hidden';

        // Create UP button
        this.upButton = document.createElement('button');
        this.upButton.className = 'touch-btn up-btn';
        this.upButton.innerHTML = '⬆️';
        this.upButton.setAttribute('aria-label', 'Move Up');

        // Create DOWN button
        this.downButton = document.createElement('button');
        this.downButton.className = 'touch-btn down-btn';
        this.downButton.innerHTML = '⬇️';
        this.downButton.setAttribute('aria-label', 'Move Down');

        // Add buttons to container
        this.touchControls.appendChild(this.upButton);
        this.touchControls.appendChild(this.downButton);

        // Add to page
        document.body.appendChild(this.touchControls);

        // Add CSS
        this.addTouchCSS();
    }

    /**
     * Add CSS for touch controls
     */
    addTouchCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .touch-controls {
                position: fixed;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                flex-direction: column;
                gap: 20px;
                z-index: 1000;
                pointer-events: auto;
            }

            .touch-btn {
                width: 80px;
                height: 80px;
                border: none;
                border-radius: 50%;
                background: rgba(0, 100, 200, 0.8);
                color: white;
                font-size: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                user-select: none;
                -webkit-user-select: none;
                touch-action: manipulation;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.3);
                transition: all 0.1s ease;
            }

            .touch-btn:active {
                background: rgba(0, 150, 255, 0.9);
                transform: scale(0.95);
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            }

            .touch-btn.pressed {
                background: rgba(0, 150, 255, 0.9);
                transform: scale(0.95);
            }

            /* Hide on desktop */
            @media (hover: hover) and (pointer: fine) {
                .touch-controls {
                    display: none !important;
                }
            }

            /* Adjust for smaller screens */
            @media (max-width: 480px) {
                .touch-controls {
                    right: 15px;
                }

                .touch-btn {
                    width: 70px;
                    height: 70px;
                    font-size: 28px;
                }
            }

            /* Landscape orientation adjustments */
            @media (orientation: landscape) and (max-height: 500px) {
                .touch-controls {
                    right: 15px;
                    gap: 15px;
                }

                .touch-btn {
                    width: 60px;
                    height: 60px;
                    font-size: 24px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup touch event listeners
     */
    setupTouchEvents() {
        // UP button events
        this.upButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.pressUp();
        });

        this.upButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.releaseUp();
        });

        this.upButton.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.releaseUp();
        });

        // DOWN button events
        this.downButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.pressDown();
        });

        this.downButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.releaseDown();
        });

        this.downButton.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.releaseDown();
        });

        // Mouse events for testing on desktop
        this.upButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.pressUp();
        });

        this.upButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.releaseUp();
        });

        this.downButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.pressDown();
        });

        this.downButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.releaseDown();
        });

        // Prevent context menu
        this.upButton.addEventListener('contextmenu', (e) => e.preventDefault());
        this.downButton.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Press UP button
     */
    pressUp() {
        if (!this.isUpPressed) {
            this.isUpPressed = true;
            this.upButton.classList.add('pressed');

            if (this.game.spaceship) {
                this.game.spaceship.moveUp = true;
            }
        }
    }

    /**
     * Release UP button
     */
    releaseUp() {
        if (this.isUpPressed) {
            this.isUpPressed = false;
            this.upButton.classList.remove('pressed');

            if (this.game.spaceship) {
                this.game.spaceship.moveUp = false;
            }
        }
    }

    /**
     * Press DOWN button
     */
    pressDown() {
        if (!this.isDownPressed) {
            this.isDownPressed = true;
            this.downButton.classList.add('pressed');

            if (this.game.spaceship) {
                this.game.spaceship.moveDown = true;
            }
        }
    }

    /**
     * Release DOWN button
     */
    releaseDown() {
        if (this.isDownPressed) {
            this.isDownPressed = false;
            this.downButton.classList.remove('pressed');

            if (this.game.spaceship) {
                this.game.spaceship.moveDown = false;
            }
        }
    }

    /**
     * Show touch controls
     */
    show() {
        if (this.touchControls) {
            this.touchControls.classList.remove('hidden');
        }
    }

    /**
     * Hide touch controls
     */
    hide() {
        if (this.touchControls) {
            this.touchControls.classList.add('hidden');
        }
    }

    /**
     * Update touch controls based on game state
     */
    update(gameState) {
        if (!this.isTouchDevice) return;

        switch (gameState) {
            case 'playing':
                this.show();
                break;
            case 'start':
            case 'gameover':
            case 'paused':
                this.hide();
                break;
        }
    }
}