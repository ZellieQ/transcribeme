import { TranscriptionService } from '../types';
import { WebSpeechService } from './WebSpeechService';
import { WhisperService } from './WhisperService';
import { SimulationService } from './SimulationService';

export class SpeechService {
  private webSpeechService: WebSpeechService;
  private whisperService: WhisperService;
  private simulationService: SimulationService;
  private activeService: TranscriptionService | null = null;
  private finalTranscript: string = '';
  
  constructor() {
    this.webSpeechService = new WebSpeechService();
    this.whisperService = new WhisperService();
    this.simulationService = new SimulationService();
  }
  
  public async transcribe(
    file: File, 
    language: string
  ): Promise<{ text: string; method: 'webSpeech' | 'whisper' | 'simulation' }> {
    this.resetTranscript();
    
    console.log('Starting transcription with file:', file.name, 'language:', language);
    
    // For file transcription, prioritize Whisper as it's more reliable for audio files
    if (this.whisperService.isSupported()) {
      try {
        console.log('Attempting transcription with Whisper...');
        this.activeService = this.whisperService;
        const text = await this.whisperService.transcribe(file, language);
        this.finalTranscript = text;
        console.log('Whisper transcription successful');
        return { text, method: 'whisper' };
      } catch (error) {
        console.warn('Whisper failed:', error);
      }
    }
    
    // Try Web Speech API as fallback
    if (this.webSpeechService.isSupported()) {
      try {
        console.log('Attempting transcription with Web Speech API...');
        this.activeService = this.webSpeechService;
        const text = await this.webSpeechService.transcribe(file, language);
        this.finalTranscript = text;
        console.log('Web Speech API transcription successful');
        return { text, method: 'webSpeech' };
      } catch (error) {
        console.warn('Web Speech API failed:', error);
      }
    }
    
    // Finally, fall back to simulation
    this.activeService = this.simulationService;
    const text = await this.simulationService.transcribe(file, language);
    this.finalTranscript = text;
    return { text, method: 'simulation' };
  }
  
  public getFinalTranscript(): string {
    return this.finalTranscript;
  }
  
  public resetTranscript(): void {
    this.finalTranscript = '';
  }
  
  public cancel(): void {
    if (this.activeService) {
      this.activeService.cancel();
      this.activeService = null;
    }
  }
}
