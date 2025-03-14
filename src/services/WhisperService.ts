import { TranscriptionService } from '../types';

interface WhisperResult {
  text: string;
}

export class WhisperService implements TranscriptionService {
  private abortController: AbortController | null = null;
  private model: any = null;
  private modelLoaded = false;
  
  public isSupported(): boolean {
    return window.isSecureContext && window.AudioContext !== undefined;
  }
  
  public getMethod(): 'webSpeech' | 'whisper' | 'simulation' {
    return 'whisper';
  }
  
  private async loadModel(): Promise<void> {
    if (this.modelLoaded) return;
    
    try {
      // Use CDN script load instead of dynamic import to avoid CORS issues
      if (!window.transformers) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0";
        script.async = true;
        
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Transformers.js library'));
          document.head.appendChild(script);
        });
      }
      
      // Use tiny model for better performance
      const { pipeline } = window.transformers!;
      this.model = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
      this.modelLoaded = true;
    } catch (error) {
      throw new Error(`Failed to load Whisper model: ${(error as Error).message}`);
    }
  }
  
  public async transcribe(file: File, language: string): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Whisper is not supported in this environment');
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
      
      // Process with Whisper
      const result = await this.model(arrayBuffer, {
        language: language.split('-')[0], // Extract base language code
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5
      }) as WhisperResult;
      
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
