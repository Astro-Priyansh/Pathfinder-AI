// Real-time Web Audio API synthesizer for the Steampunk immersive experience.
// Programmatic generation of:
// 1. Steam hiss (white noise, filtered, dynamic amplitude envelope)
// 2. Clockwork cog ticks (high pass filter, narrow pulse clicks)
// 3. Comforting machinery hum (sine wave, sub-bass boiler resonance, notch sweep)
// 4. Steam pressure release (pressure valve sound)

class SteampunkAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioWorkletNode | ScriptProcessorNode | null = null;
  private isAmbientRunning = false;
  private boilerOscillator1: OscillatorNode | null = null;
  private boilerOscillator2: OscillatorNode | null = null;
  private boilerGain: GainNode | null = null;
  private humGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;

  // Lazy initialize AudioContext on user interaction to comply with browser autocomplete/autoplay blocks
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

  // Create white noise buffer
  private createNoiseBuffer(duration: number): AudioBuffer {
    const context = this.getContext();
    const bufferSize = context.sampleRate * duration;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Play a beautiful metallic clockwork click
  public playTick(volume = 0.4) {
    try {
      const context = this.getContext();
      
      const osc = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();

      // Clock tick sound: sudden spike with rapid bandpass decay
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2000, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, context.currentTime + 0.08);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, context.currentTime);
      filter.Q.setValueAtTime(15, context.currentTime);

      gain.gain.setValueAtTime(volume * 0.8, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      osc.start();
      osc.stop(context.currentTime + 0.15);

      // Add a tiny secondary snap for high-pitch metal feedback
      const snapBuf = this.createNoiseBuffer(0.05);
      const snapNode = context.createBufferSource();
      const snapFilter = context.createBiquadFilter();
      const snapGain = context.createGain();

      snapNode.buffer = snapBuf;
      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(4000, context.currentTime);

      snapGain.gain.setValueAtTime(volume * 0.35, context.currentTime);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.04);

      snapNode.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(context.destination);

      snapNode.start();
      snapNode.stop(context.currentTime + 0.05);

    } catch (e) {
      console.warn('Audio ticks not ready yet', e);
    }
  }

  // Play a valve huff / steam venting sound
  public playSteamHiss(intensity = 0.5) {
    try {
      const context = this.getContext();
      const time = context.currentTime;

      // Noise source
      const noise = context.createBufferSource();
      noise.buffer = this.createNoiseBuffer(1.5);

      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, time);
      filter.frequency.exponentialRampToValueAtTime(800, time + 1.2);
      filter.Q.setValueAtTime(2.5, time);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.001, time);
      // Sudden burst, then trailing release
      gain.gain.linearRampToValueAtTime(intensity * 0.7, time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.1, time + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      noise.start();
      noise.stop(time + 1.5);
    } catch (e) {
      console.warn('Steam vent audio not ready yet', e);
    }
  }

  // Start or stop the comforting ambient boiler machine hum and rhythmic furnace loop
  public toggleAmbientSteamEngine(): boolean {
    const context = this.getContext();

    if (this.isAmbientRunning) {
      this.stopAmbient();
      this.isAmbientRunning = false;
      return false;
    }

    try {
      const now = context.currentTime;

      // Primary furnace fire roar & mechanical hum
      this.boilerOscillator1 = context.createOscillator();
      this.boilerOscillator2 = context.createOscillator();
      this.boilerGain = context.createGain();
      this.humGain = context.createGain();
      this.filter = context.createBiquadFilter();

      // Deep comfortable boiler drone (72Hz + 110Hz harmonics)
      this.boilerOscillator1.type = 'sine';
      this.boilerOscillator1.frequency.setValueAtTime(72, now);
      
      this.boilerOscillator2.type = 'triangle';
      this.boilerOscillator2.frequency.setValueAtTime(110, now);

      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(150, now);
      this.filter.Q.setValueAtTime(2, now);

      this.boilerOscillator1.connect(this.filter);
      this.boilerOscillator2.connect(this.filter);
      
      // Soothing, rich sub-vibe
      this.boilerGain.gain.setValueAtTime(0.12, now);
      this.filter.connect(this.boilerGain);
      this.boilerGain.connect(context.destination);

      // Start oscillators
      this.boilerOscillator1.start();
      this.boilerOscillator2.start();

      // Setup a rhythmic steam engine loop (Chugga-chugga-chugga)
      // We will simulate this using a custom interval timer running in Web Audio space or standard interval
      this.runRhythmicSteamLoop();

      this.playSteamHiss(0.6); // Greet connection with steam burst
      this.isAmbientRunning = true;
      return true;
    } catch (e) {
      console.error('Failed to boot ambient engine', e);
      return false;
    }
  }

  private timerToken: any = null;

  private runRhythmicSteamLoop() {
    let tickCount = 0;
    const playNextLoopPart = () => {
      if (!this.isAmbientRunning) return;
      
      try {
        const isTick = tickCount % 4 === 0;
        const isSteam = tickCount % 4 === 2;

        if (isTick) {
          // Play a rhythmic metallic clockwork alignment chunk
          this.playTick(0.15);
        } else if (isSteam) {
          // Play a comforting low steam exhale ("chug")
          const context = this.getContext();
          const t = context.currentTime;
          const n = context.createBufferSource();
          n.buffer = this.createNoiseBuffer(0.3);
          const f = context.createBiquadFilter();
          const g = context.createGain();

          f.type = 'bandpass';
          f.frequency.setValueAtTime(450, t);
          f.Q.setValueAtTime(1.2, t);

          g.gain.setValueAtTime(0.06, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

          n.connect(f);
          f.connect(g);
          g.connect(context.destination);
          n.start();
          n.stop(t + 0.3);
        }
      } catch (e) {}

      tickCount++;
      // Mechanical standard speed (800ms between cycles, comfortably resting trains)
      this.timerToken = setTimeout(playNextLoopPart, 500);
    };

    playNextLoopPart();
  }

  public stopAmbient() {
    this.isAmbientRunning = false;
    if (this.timerToken) {
      clearTimeout(this.timerToken);
      this.timerToken = null;
    }
    try {
      if (this.boilerOscillator1) {
        this.boilerOscillator1.stop();
        this.boilerOscillator1.disconnect();
        this.boilerOscillator1 = null;
      }
      if (this.boilerOscillator2) {
        this.boilerOscillator2.stop();
        this.boilerOscillator2.disconnect();
        this.boilerOscillator2 = null;
      }
      if (this.boilerGain) {
        this.boilerGain.disconnect();
        this.boilerGain = null;
      }
      // Releasing steam on shutdown
      this.playSteamHiss(0.35);
    } catch (e) {}
  }

  public isRunning(): boolean {
    return this.isAmbientRunning;
  }
}

export const steampunkAudio = new SteampunkAudioEngine();
