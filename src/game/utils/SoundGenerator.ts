// Simple sound generator using Web Audio API
export class SoundGenerator {
  private audioContext: AudioContext;
  private backgroundMusicGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  playShootSound() {
    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(900, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);

    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  playExplosionSound() {
    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Create multiple layers for a richer explosion sound
    const now = this.audioContext.currentTime;

    // Layer 1: Deep boom
    const boom = this.audioContext.createOscillator();
    const boomGain = this.audioContext.createGain();
    boom.connect(boomGain);
    boomGain.connect(this.audioContext.destination);
    boom.type = 'sine';
    boom.frequency.setValueAtTime(120, now);
    boom.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    boomGain.gain.setValueAtTime(0.8, now);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    boom.start(now);
    boom.stop(now + 0.3);

    // Layer 2: Mid-range explosion body
    const explosion = this.audioContext.createOscillator();
    const explosionGain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    explosion.connect(filter);
    filter.connect(explosionGain);
    explosionGain.connect(this.audioContext.destination);
    explosion.type = 'sawtooth';
    explosion.frequency.setValueAtTime(250, now);
    explosion.frequency.exponentialRampToValueAtTime(60, now + 0.4);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.4);
    explosionGain.gain.setValueAtTime(0.6, now);
    explosionGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    explosion.start(now);
    explosion.stop(now + 0.4);

    // Layer 3: High-frequency crackle for impact
    const crackle = this.audioContext.createOscillator();
    const crackleGain = this.audioContext.createGain();
    crackle.connect(crackleGain);
    crackleGain.connect(this.audioContext.destination);
    crackle.type = 'square';
    crackle.frequency.setValueAtTime(800, now);
    crackle.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    crackleGain.gain.setValueAtTime(0.4, now);
    crackleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    crackle.start(now);
    crackle.stop(now + 0.15);
  }

  playHitSound() {
    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.25);

    gainNode.gain.setValueAtTime(0.7, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    oscillator.start(now);
    oscillator.stop(now + 0.25);
  }

  playEnemyShootSound() {
    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(350, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);

    gainNode.gain.setValueAtTime(0.35, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  startBackgroundMusic() {
    if (this.backgroundMusicGain) {
      return; // Music already playing
    }

    // Create master gain for background music
    this.backgroundMusicGain = this.audioContext.createGain();
    this.backgroundMusicGain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    this.backgroundMusicGain.connect(this.audioContext.destination);

    // Bass note (root)
    const bass = this.audioContext.createOscillator();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(55, this.audioContext.currentTime); // A1
    bass.connect(this.backgroundMusicGain);
    bass.start();
    this.musicOscillators.push(bass);

    // Ambient pad 1 (fifth)
    const pad1 = this.audioContext.createOscillator();
    pad1.type = 'triangle';
    pad1.frequency.setValueAtTime(82.5, this.audioContext.currentTime); // E2
    const pad1Gain = this.audioContext.createGain();
    pad1Gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    pad1.connect(pad1Gain);
    pad1Gain.connect(this.backgroundMusicGain);
    pad1.start();
    this.musicOscillators.push(pad1);

    // Ambient pad 2 (octave)
    const pad2 = this.audioContext.createOscillator();
    pad2.type = 'triangle';
    pad2.frequency.setValueAtTime(110, this.audioContext.currentTime); // A2
    const pad2Gain = this.audioContext.createGain();
    pad2Gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    pad2.connect(pad2Gain);
    pad2Gain.connect(this.backgroundMusicGain);
    pad2.start();
    this.musicOscillators.push(pad2);

    // High shimmer with slow LFO
    const shimmer = this.audioContext.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
    const shimmerGain = this.audioContext.createGain();
    shimmerGain.gain.setValueAtTime(0.05, this.audioContext.currentTime);

    // Create LFO for shimmer
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.5, this.audioContext.currentTime); // 0.5 Hz
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(0.03, this.audioContext.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(shimmerGain.gain);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.backgroundMusicGain);

    lfo.start();
    shimmer.start();
    this.musicOscillators.push(shimmer);
    this.musicOscillators.push(lfo);
  }

  stopBackgroundMusic() {
    if (this.backgroundMusicGain) {
      // Fade out
      this.backgroundMusicGain.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 1
      );

      // Stop all oscillators after fade
      setTimeout(() => {
        this.musicOscillators.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {
            // Oscillator might already be stopped
          }
        });
        this.musicOscillators = [];
        this.backgroundMusicGain = null;
      }, 1100);
    }
  }
}
