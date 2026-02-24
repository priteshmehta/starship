/**
 * Star Ship - Audio Manager
 * Handles background music and sound effects
 */

// ============================================
// AUDIO MANAGER CLASS
// ============================================
export class AudioManager {
    constructor() {
        // Audio context for Web Audio API (for generated sounds)
        this.audioContext = null;

        // Sound storage
        this.sounds = {};
        this.music = null;

        // State
        this.isMuted = false;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;

        // Procedural music
        this.proceduralMusic = null;

        // Initialize
        this.init();
    }

    /**
     * Initialize the audio system
     */
    init() {
        // Create audio context (needs user interaction to start)
        this.initAudioContext();

        // Define sound configurations
        this.soundConfigs = {
            coin: {
                file: 'assets/sounds/coin-collect.mp3',
                volume: 0.6,
                generated: true // Use generated sound as fallback
            },
            collision: {
                file: 'assets/sounds/collision.mp3',
                volume: 0.7,
                generated: true
            },
            gameOver: {
                file: 'assets/sounds/game-over.mp3',
                volume: 0.8,
                generated: true
            },
            levelUp: {
                file: 'assets/sounds/level-up.mp3',
                volume: 0.6,
                generated: true
            }
        };

        // Try to load audio files
        this.loadSounds();
        this.loadMusic('assets/sounds/background-music.mp3');

        console.log('🔊 Audio Manager initialized');
    }

    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    /**
     * Resume audio context (required after user interaction)
     */
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Load all sound effects
     */
    loadSounds() {
        for (const [name, config] of Object.entries(this.soundConfigs)) {
            this.loadSound(name, config);
        }
    }

    /**
     * Load a single sound effect
     */
    loadSound(name, config) {
        const audio = new Audio();
        audio.volume = config.volume * this.sfxVolume;

        audio.addEventListener('canplaythrough', () => {
            this.sounds[name] = {
                audio: audio,
                config: config,
                loaded: true
            };
            console.log(`🔊 Sound loaded: ${name}`);
        });

        audio.addEventListener('error', () => {
            // File not found - will use generated sound
            this.sounds[name] = {
                audio: null,
                config: config,
                loaded: false
            };
            if (config.generated) {
                console.log(`🔊 Using generated sound for: ${name}`);
            }
        });

        audio.src = config.file;
    }

    /**
     * Load background music
     */
    loadMusic(src) {
        this.music = new Audio();
        this.music.loop = true;
        this.music.volume = this.musicVolume;

        this.music.addEventListener('canplaythrough', () => {
            console.log('🎵 Background music loaded');
        });

        this.music.addEventListener('error', () => {
            console.log('🎵 No background music file found - using procedural music');
            this.music = null;
        });

        this.music.src = src;
    }

    /**
     * Play a sound effect
     */
    play(name) {
        if (this.isMuted) return;

        // Resume context if needed
        this.resumeContext();

        const sound = this.sounds[name];

        if (sound && sound.loaded && sound.audio) {
            // Clone and play the audio element for overlapping sounds
            const clone = sound.audio.cloneNode();
            clone.volume = sound.config.volume * this.sfxVolume;
            clone.play().catch(() => {});
        } else if (sound && sound.config.generated) {
            // Use generated sound
            this.playGeneratedSound(name);
        }
    }

    /**
     * Play a generated sound using Web Audio API
     */
    playGeneratedSound(name) {
        if (!this.audioContext || this.isMuted) return;

        this.resumeContext();

        switch (name) {
            case 'coin':
                this.playCoinSound();
                break;
            case 'collision':
                this.playCollisionSound();
                break;
            case 'gameOver':
                this.playGameOverSound();
                break;
            case 'levelUp':
                this.playLevelUpSound();
                break;
        }
    }

    /**
     * Generate coin collect sound (pleasant chime)
     */
    playCoinSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create oscillator for the main tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.setValueAtTime(1320, now + 0.1); // E6

        gain1.gain.setValueAtTime(0.3 * this.sfxVolume, now);
        gain1.gain.exponentialDecayTo = 0.01;
        gain1.gain.setValueAtTime(0.3 * this.sfxVolume, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.3);

        // Second tone for sparkle
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1760, now + 0.05); // A6

        gain2.gain.setValueAtTime(0.2 * this.sfxVolume, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start(now + 0.05);
        osc2.stop(now + 0.25);
    }

    /**
     * Generate collision sound (impact noise)
     */
    playCollisionSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // White noise burst
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Low-pass filter for thump
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.2);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);

        // Add a low tone for impact
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

        oscGain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * Generate game over sound (descending tones)
     */
    playGameOverSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const frequencies = [440, 392, 349, 330, 294, 262]; // A4 down to C4
        const duration = 0.15;

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + i * duration);

            gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + i * duration);
            gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * duration);
            osc.stop(now + (i + 1) * duration + 0.1);
        });
    }

    /**
     * Generate level up sound (ascending tones)
     */
    playLevelUpSound() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
        const duration = 0.1;

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * duration);

            gain.gain.setValueAtTime(0.25 * this.sfxVolume, now + i * duration);
            gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 0.8) * duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * duration);
            osc.stop(now + (i + 1) * duration + 0.2);
        });

        // Final sparkle
        setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(2093, ctx.currentTime); // C7

            gain.gain.setValueAtTime(0.15 * this.sfxVolume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }, frequencies.length * duration * 1000);
    }

    /**
     * Start background music
     */
    startMusic() {
        if (this.music && !this.isMuted) {
            this.music.currentTime = 0;
            this.music.play().catch(() => {
                console.log('🎵 Music autoplay blocked - will start on user interaction');
            });
        } else if (!this.music) {
            // Use procedural music if no file loaded
            this.startProceduralMusic();
        }
    }

    /**
     * Start procedural background music (space ambient)
     */
    startProceduralMusic() {
        if (!this.audioContext || this.isMuted) return;

        // Stop any existing procedural music
        this.stopProceduralMusic();

        console.log('🎵 Starting procedural space music');

        // Create the ambient space music
        this.proceduralMusic = {
            nodes: [],
            isPlaying: true
        };

        // Bass drone
        this.createBassDrone();

        // Atmospheric pad
        this.createAtmosphericPad();

        // Sparkly arpeggios
        this.createSparkleArpeggio();
    }

    /**
     * Create bass drone layer
     */
    createBassDrone() {
        if (!this.audioContext || !this.proceduralMusic) return;

        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // A1

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, ctx.currentTime);

        gain.gain.setValueAtTime(0.1 * this.musicVolume, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        this.proceduralMusic.nodes.push({ osc, gain, filter });

        // Add subtle frequency modulation
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
        lfoGain.gain.setValueAtTime(2, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        lfo.start();
        this.proceduralMusic.nodes.push({ osc: lfo, gain: lfoGain });
    }

    /**
     * Create atmospheric pad layer
     */
    createAtmosphericPad() {
        if (!this.audioContext || !this.proceduralMusic) return;

        const ctx = this.audioContext;
        const frequencies = [220, 277, 330, 440]; // Am chord

        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                if (!this.proceduralMusic?.isPlaying) return;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);

                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.08 * this.musicVolume, ctx.currentTime + 2);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                this.proceduralMusic.nodes.push({ osc, gain, filter });

                // Add tremolo
                const tremolo = ctx.createOscillator();
                const tremoloGain = ctx.createGain();

                tremolo.frequency.setValueAtTime(0.2 + Math.random() * 0.3, ctx.currentTime);
                tremoloGain.gain.setValueAtTime(0.02, ctx.currentTime);

                tremolo.connect(tremoloGain);
                tremoloGain.connect(gain.gain);

                tremolo.start();
                this.proceduralMusic.nodes.push({ osc: tremolo, gain: tremoloGain });

            }, i * 500);
        });
    }

    /**
     * Create sparkle arpeggio layer
     */
    createSparkleArpeggio() {
        if (!this.audioContext || !this.proceduralMusic) return;

        const playArpeggio = () => {
            if (!this.proceduralMusic?.isPlaying) return;

            const ctx = this.audioContext;
            const scale = [440, 523, 659, 784, 880]; // A major pentatonic
            const note = scale[Math.floor(Math.random() * scale.length)];

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(note * 2, ctx.currentTime); // Higher octave

            gain.gain.setValueAtTime(0.05 * this.musicVolume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.8);

            // Schedule next note
            setTimeout(playArpeggio, 1000 + Math.random() * 2000);
        };

        // Start after a delay
        setTimeout(playArpeggio, 3000);
    }

    /**
     * Stop procedural music
     */
    stopProceduralMusic() {
        if (this.proceduralMusic) {
            this.proceduralMusic.isPlaying = false;
            this.proceduralMusic.nodes.forEach(nodeInfo => {
                try {
                    if (nodeInfo.osc) {
                        nodeInfo.osc.stop();
                    }
                } catch (e) {
                    // Oscillator may already be stopped
                }
            });
            this.proceduralMusic = null;
        }
    }

    /**
     * Stop background music
     */
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
        this.stopProceduralMusic();
    }

    /**
     * Pause background music
     */
    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
        // Note: Procedural music can't be paused, only stopped/restarted
        this.stopProceduralMusic();
    }

    /**
     * Resume background music
     */
    resumeMusic() {
        if (this.music && !this.isMuted) {
            this.music.play().catch(() => {});
        } else if (!this.music && !this.isMuted) {
            this.startProceduralMusic();
        }
    }

    /**
     * Toggle mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            this.pauseMusic();
            this.stopProceduralMusic();
        } else {
            this.resumeMusic();
        }

        return this.isMuted;
    }

    /**
     * Set mute state
     */
    setMuted(muted) {
        this.isMuted = muted;

        if (this.isMuted) {
            this.pauseMusic();
            this.stopProceduralMusic();
        } else {
            this.resumeMusic();
        }
    }

    /**
     * Set music volume (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
    }

    /**
     * Set SFX volume (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
}
