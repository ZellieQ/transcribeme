import { TranscriptionService } from '../types';

interface WhisperResult {
  text: string;
}

export class WhisperService implements TranscriptionService {
  private abortController: AbortController | null = null;
  private model: any = null;
  private modelLoaded = false;
  
  public isSupported(): boolean {
    // Always return true and handle errors in transcribe method
    // This ensures we at least try to use Whisper before falling back to simulation
    return true;
  }
  
  public getMethod(): 'webSpeech' | 'whisper' | 'simulation' {
    return 'whisper';
  }
  
  private async loadModel(): Promise<void> {
    if (this.modelLoaded) return;
    
    try {
      // Use CDN script load instead of dynamic import to avoid CORS issues
      if (typeof window.transformers === 'undefined') {
        console.log('Loading Transformers.js library...');
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0";
        script.async = true;
        
        await new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log('Transformers.js library loaded successfully');
            resolve();
          };
          script.onerror = (e) => {
            console.error('Failed to load Transformers.js library:', e);
            reject(new Error('Failed to load Transformers.js library'));
          };
          document.head.appendChild(script);
        });
      }
      
      // Wait a moment to ensure the library is fully initialized
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (typeof window.transformers === 'undefined') {
        throw new Error('Transformers.js library failed to initialize properly');
      }
      
      console.log('Loading Whisper model...');
      // Use tiny model for better performance
      const { pipeline } = window.transformers;
      this.model = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
      console.log('Whisper model loaded successfully');
      this.modelLoaded = true;
    } catch (error) {
      throw new Error(`Failed to load Whisper model: ${(error as Error).message}`);
    }
  }
  
  public async transcribe(file: File, language: string): Promise<string> {
    if (!window.isSecureContext || typeof window.AudioContext === 'undefined') {
      console.warn('Environment may not fully support Whisper, but attempting anyway');
    }
    
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    
    try {
      await this.loadModel();
      
      if (signal.aborted) {
        throw new Error('Transcription cancelled');
      }
      
      // Read file as ArrayBuffer
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      
      if (signal.aborted) {
        throw new Error('Transcription cancelled');
      }
      
      console.log('Processing audio with Whisper model...');
      // Process with Whisper
      const result = await this.model(arrayBuffer, {
        language: language.split('-')[0], // Extract base language code
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true // Get timestamps for better transcription
      }) as WhisperResult;
      
      console.log('Whisper transcription completed successfully');
      
      return result.text;
    } catch (error) {
      if ((error as Error).message === 'Transcription cancelled') {
        throw error;
      }
      throw new Error(`Whisper transcription failed: ${(error as Error).message}`);
    }
  }
  
  private async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }
  
  public cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
