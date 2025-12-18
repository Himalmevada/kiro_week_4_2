// Simple sound generator using Web Audio API
export class SoundGenerator {
  private audioContext: AudioContext;
  private backgroundMusicGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  playShootSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  playExplosionSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  playHitSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  playEnemyShootSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
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
