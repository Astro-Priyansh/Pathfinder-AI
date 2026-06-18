// Real-time Web Audio API synthesizer for the Solarpunk botanical eco-futurism experience.
// Programmatic generation of:
// 1. Rustling Leaves / Gentle Meadow Wind (pink noise, bandpass filtered with LFO wave modulation)
// 2. Solar Dew-Drop Chimes (high-Q glass bar resonators, shimmering bell frequencies)
// 3. Bioluminescent Evening Whispers (resonant sub-canopy ocean-like wind swells)
// 4. Glass-house Water Droplets (gentle organic trickle sound)

class SolarpunkAudioEngine {
  private ctx: AudioContext | null = null;
  private isAmbientRunning = false;
  private windOscillator: OscillatorNode | null = null;
  private windModulator: OscillatorNode | null = null;
  private windGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private timerToken: any = null;

  // Lazy initialize AudioContext on user interaction
  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Create customized pinkish/brownish organic noise buffer for wind/leaves
  private createLeafNoiseBuffer(duration: number): AudioBuffer {
    const context = this.getContext();
    const bufferSize = context.sampleRate * duration;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11; // scale back to comfortable volume
    }
    return buffer;
  }

  // Play a highly aesthetic solar crystal wind chime (a light, comforting high-resonance glass ding)
  public playSolarChime(volume = 0.35) {
    try {
      const context = this.getContext();
      const now = context.currentTime;

      // Wind chimes have multiple non-harmonic modes
      const frequencies = [880, 1200, 1430, 1650, 1980];
      const selectedFreq = frequencies[Math.floor(Math.random() * frequencies.length)];

      const osc = context.createOscillator();
      const subOsc = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(selectedFreq, now);
      
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(selectedFreq * 1.5, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(selectedFreq, now);
      filter.Q.setValueAtTime(30, now); // Sweet bell chime ring

      gain.gain.setValueAtTime(volume * 0.3, now);
      // Soft metallic sweep fade out
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      osc.start();
      subOsc.start();
      osc.stop(now + 2.0);
      subOsc.stop(now + 2.0);

    } catch (e) {
      console.warn('Dew chime audio not ready yet', e);
    }
  }

  // Play natural botanical raindrop/dewdrop trickle (water-bubble dynamic frequency decay)
  public playWaterDewdrop(volume = 0.4) {
    try {
      const context = this.getContext();
      const now = context.currentTime;

      const osc = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();

      osc.type = 'sine';
      // Low water pop frequency sweep
      const baseFreq = 300 + Math.random() * 200;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.8, now + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, now);

      gain.gain.setValueAtTime(volume * 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      osc.start();
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // Start or stop the calming botanical wind rustle ambient layer
  public toggleAmbientCanopy(): boolean {
    const context = this.getContext();

    if (this.isAmbientRunning) {
      this.stopAmbient();
      this.isAmbientRunning = false;
      return false;
    }

    try {
      const now = context.currentTime;

      // Comforting dynamic wind sound
      const windBuffer = this.createLeafNoiseBuffer(6.0);
      const windNode = context.createBufferSource();
      windNode.buffer = windBuffer;
      windNode.loop = true;

      this.filter = context.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(350, now);
      
      this.windGain = context.createGain();
      this.windGain.gain.setValueAtTime(0.08, now);

      // Create an LFO (Low Frequency Oscillator) to swing back-and-forth like wind pushing trees
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12, now); // Once every 8 seconds loop
      lfoGain.gain.setValueAtTime(150, now); // sweep range

      lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency); // modulating lowpass frequency cut
      lfo.start();

      windNode.connect(this.filter);
      this.filter.connect(this.windGain);
      this.windGain.connect(context.destination);

      windNode.start();
      
      // Keep track of resources to release later
      this.windOscillator = windNode as any;
      this.windModulator = lfo;

      // Boot up the intermittent melodic breeze chimes & droplets
      this.isAmbientRunning = true;
      this.runSoothingForestLoop();

      // play welcoming solar chime on start
      this.playSolarChime(0.5);
      return true;
    } catch (e) {
      console.error('Failed to boot solarpunk audio landscape', e);
      return false;
    }
  }

  private runSoothingForestLoop() {
    let tick = 0;
    const playForestPulsation = () => {
      if (!this.isAmbientRunning) return;
      
      try {
        const checkChime = Math.random() > 0.65;
        const checkDroplet = Math.random() > 0.45;

        if (checkChime) {
          this.playSolarChime(0.18);
        }
        if (checkDroplet) {
          // Play comforting gentle dynamic leaf droplets
          setTimeout(() => {
            this.playWaterDewdrop(0.15);
          }, Math.random() * 800);
        }
      } catch (e) {}

      tick++;
      // Warm organic random rhythms
      const randomInterval = 1500 + Math.random() * 2000;
      this.timerToken = setTimeout(playForestPulsation, randomInterval);
    };

    playForestPulsation();
  }

  public stopAmbient() {
    this.isAmbientRunning = false;
    if (this.timerToken) {
      clearTimeout(this.timerToken);
      this.timerToken = null;
    }
    try {
      if (this.windOscillator) {
        (this.windOscillator as any).stop();
        (this.windOscillator as any).disconnect();
        this.windOscillator = null;
      }
      if (this.windModulator) {
        this.windModulator.stop();
        this.windModulator.disconnect();
        this.windModulator = null;
      }
      if (this.windGain) {
        this.windGain.disconnect();
        this.windGain = null;
      }
    } catch (e) {}
  }

  public isRunning(): boolean {
    return this.isAmbientRunning;
  }
}

export const solarpunkAudio = new SolarpunkAudioEngine();
