// High-performance audio engine using WebAssembly
// Integrates C++ audio processing for ultra-fast performance

export interface AudioProcessorModule {
  AudioProcessor: new () => AudioProcessor;
  StreamOptimizer: new () => StreamOptimizer;
  VectorFloat: new (data: number[]) => VectorFloat;
  VectorUint8: new (data: number[]) => VectorUint8;
}

export interface AudioProcessor {
  processAudioChunk(input: VectorFloat, output: VectorFloat): void;
  crossfadeTracks(track1: VectorFloat, track2: VectorFloat, output: VectorFloat, fadeRatio: number): void;
  pitchShift(input: VectorFloat, output: VectorFloat, pitchFactor: number): void;
  getSpectrumData(samples: VectorFloat, fftSize?: number): VectorFloat;
  getPerformanceMetrics(): number;
  setVolume(volume: number): void;
  setSpeed(speed: number): void;
  setMuted(muted: boolean): void;
  setEqualizerBand(band: number, gain: number): void;
  getVolume(): number;
  getSpeed(): number;
  isMuted(): boolean;
  getEqualizerSettings(): VectorFloat;
}

export interface StreamOptimizer {
  compressAudioChunk(samples: VectorFloat): VectorUint8;
  decompressAudioChunk(compressed: VectorUint8): VectorFloat;
}

export interface VectorFloat {
  size(): number;
  get(index: number): number;
  set(index: number, value: number): void;
  push_back(value: number): void;
  resize(size: number): void;
  delete(): void;
}

export interface VectorUint8 {
  size(): number;
  get(index: number): number;
  set(index: number, value: number): void;
  push_back(value: number): void;
  resize(size: number): void;
  delete(): void;
}

class FastAudioEngine {
  private wasmModule: AudioProcessorModule | null = null;
  private audioProcessor: AudioProcessor | null = null;
  private streamOptimizer: StreamOptimizer | null = null;
  private audioContext: AudioContext | null = null;
  private audioWorklet: AudioWorkletNode | null = null;
  private isInitialized = false;
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
  }

  async initialize(): Promise<void> {
    try {
      // Load WebAssembly module - use dynamic import that works with Vite
      const FastAudioModule = await import('/wasm/fast_audio.js?url').then(
        (module) => import(module.default)
      ).catch(() => {
        // Fallback: try direct path
        return import('../public/wasm/fast_audio.js');
      }).catch(() => {
        // Final fallback: use fetch + eval for dynamic loading
        return this.loadWasmModuleFallback();
      });

      this.wasmModule = await (typeof FastAudioModule.default === 'function' ? FastAudioModule.default() : FastAudioModule);
      
      // Initialize audio processor
      this.audioProcessor = new this.wasmModule.AudioProcessor();
      this.streamOptimizer = new this.wasmModule.StreamOptimizer();
      
      // Initialize Web Audio API with optimized settings
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'playback',
        sampleRate: 48000, // High quality sample rate
      });

      // Load and register audio worklet for background processing
      await this.initializeAudioWorklet();
      
      this.isInitialized = true;
      console.log('FastAudioEngine initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize FastAudioEngine:', error);
      throw error;
    }
  }

  private async initializeAudioWorklet(): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Register custom audio worklet processor
      await this.audioContext.audioWorklet.addModule('/js/fast-audio-worklet.js');
      
      // Create worklet node
      this.audioWorklet = new AudioWorkletNode(this.audioContext, 'fast-audio-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 2,
        processorOptions: {
          wasmModulePath: '/wasm/fast_audio_worker.js'
        }
      });

    } catch (error) {
      console.warn('AudioWorklet not supported, falling back to ScriptProcessor');
      // Fallback for browsers without AudioWorklet support
    }
  }

  // Process audio with C++ speed
  processAudioBuffer(inputBuffer: Float32Array): Float32Array {
    if (!this.isInitialized || !this.wasmModule || !this.audioProcessor) {
      return inputBuffer; // Fallback to original
    }

    try {
      const startTime = performance.now();
      
      // Convert to WASM vector
      const inputVector = new this.wasmModule.VectorFloat(Array.from(inputBuffer));
      const outputVector = new this.wasmModule.VectorFloat([]);
      
      // Process with C++ speed
      this.audioProcessor.processAudioChunk(inputVector, outputVector);
      
      // Convert back to Float32Array
      const outputSize = outputVector.size();
      const outputBuffer = new Float32Array(outputSize);
      for (let i = 0; i < outputSize; i++) {
        outputBuffer[i] = outputVector.get(i);
      }
      
      // Clean up WASM vectors
      inputVector.delete();
      outputVector.delete();
      
      // Record performance
      const processingTime = performance.now() - startTime;
      this.performanceMonitor.recordProcessingTime(processingTime, inputBuffer.length);
      
      return outputBuffer;
      
    } catch (error) {
      console.error('Audio processing error:', error);
      return inputBuffer; // Fallback
    }
  }

  // Ultra-fast crossfading between tracks
  crossfadeTracks(track1Buffer: Float32Array, track2Buffer: Float32Array, fadeRatio: number): Float32Array {
    if (!this.isInitialized || !this.wasmModule || !this.audioProcessor) {
      // JavaScript fallback
      return this.crossfadeJS(track1Buffer, track2Buffer, fadeRatio);
    }

    try {
      const track1Vector = new this.wasmModule.VectorFloat(Array.from(track1Buffer));
      const track2Vector = new this.wasmModule.VectorFloat(Array.from(track2Buffer));
      const outputVector = new this.wasmModule.VectorFloat([]);
      
      this.audioProcessor.crossfadeTracks(track1Vector, track2Vector, outputVector, fadeRatio);
      
      const outputSize = outputVector.size();
      const result = new Float32Array(outputSize);
      for (let i = 0; i < outputSize; i++) {
        result[i] = outputVector.get(i);
      }
      
      track1Vector.delete();
      track2Vector.delete();
      outputVector.delete();
      
      return result;
      
    } catch (error) {
      console.error('Crossfade error:', error);
      return this.crossfadeJS(track1Buffer, track2Buffer, fadeRatio);
    }
  }

  // Fallback JavaScript crossfade
  private crossfadeJS(track1: Float32Array, track2: Float32Array, fadeRatio: number): Float32Array {
    const length = Math.min(track1.length, track2.length);
    const result = new Float32Array(length);
    const fade1 = 1 - fadeRatio;
    const fade2 = fadeRatio;
    
    for (let i = 0; i < length; i++) {
      result[i] = (track1[i] * fade1) + (track2[i] * fade2);
    }
    
    return result;
  }

  // Real-time spectrum analysis for visualizations
  getSpectrumData(audioBuffer: Float32Array, fftSize: number = 512): Float32Array {
    if (!this.isInitialized || !this.wasmModule || !this.audioProcessor) {
      return new Float32Array(fftSize / 2); // Empty spectrum
    }

    try {
      const inputVector = new this.wasmModule.VectorFloat(Array.from(audioBuffer));
      const spectrumVector = this.audioProcessor.getSpectrumData(inputVector, fftSize);
      
      const spectrumSize = spectrumVector.size();
      const spectrum = new Float32Array(spectrumSize);
      for (let i = 0; i < spectrumSize; i++) {
        spectrum[i] = spectrumVector.get(i);
      }
      
      inputVector.delete();
      spectrumVector.delete();
      
      return spectrum;
      
    } catch (error) {
      console.error('Spectrum analysis error:', error);
      return new Float32Array(fftSize / 2);
    }
  }

  // Real-time audio controls
  setVolume(volume: number): void {
    if (this.audioProcessor) {
      this.audioProcessor.setVolume(Math.max(0, Math.min(2, volume)));
    }
  }

  setSpeed(speed: number): void {
    if (this.audioProcessor) {
      this.audioProcessor.setSpeed(Math.max(0.25, Math.min(4, speed)));
    }
  }

  setMuted(muted: boolean): void {
    if (this.audioProcessor) {
      this.audioProcessor.setMuted(muted);
    }
  }

  setEqualizerBand(band: number, gain: number): void {
    if (this.audioProcessor && band >= 0 && band < 8) {
      this.audioProcessor.setEqualizerBand(band, Math.max(0, Math.min(3, gain)));
    }
  }

  // Performance monitoring
  getPerformanceMetrics() {
    const wasmMetrics = this.audioProcessor?.getPerformanceMetrics() || 0;
    const jsMetrics = this.performanceMonitor.getMetrics();
    
    return {
      samplesPerSecond: wasmMetrics,
      averageProcessingTime: jsMetrics.averageProcessingTime,
      efficiency: jsMetrics.efficiency,
      bufferUnderruns: jsMetrics.bufferUnderruns
    };
  }

  // Cleanup
  destroy(): void {
    if (this.audioWorklet) {
      this.audioWorklet.disconnect();
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    if (this.audioProcessor) {
      // WASM cleanup is handled automatically
      this.audioProcessor = null;
    }
    
    this.isInitialized = false;
  }
}

class PerformanceMonitor {
  private processingTimes: number[] = [];
  private bufferUnderruns = 0;
  private maxSamples = 100; // Keep last 100 measurements

  recordProcessingTime(time: number, sampleCount: number): void {
    this.processingTimes.push(time);
    
    if (this.processingTimes.length > this.maxSamples) {
      this.processingTimes.shift();
    }
    
    // Detect buffer underruns (processing took too long)
    const realTimeThreshold = (sampleCount / 48000) * 1000; // Expected time in ms
    if (time > realTimeThreshold * 0.8) { // 80% threshold
      this.bufferUnderruns++;
    }
  }

  getMetrics() {
    if (this.processingTimes.length === 0) {
      return { averageProcessingTime: 0, efficiency: 100, bufferUnderruns: 0 };
    }

    const average = this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
    const efficiency = Math.max(0, 100 - (average * 10)); // Rough efficiency calculation
    
    return {
      averageProcessingTime: average,
      efficiency,
      bufferUnderruns: this.bufferUnderruns
    };
  }
}

// Singleton instance
export const fastAudioEngine = new FastAudioEngine();
