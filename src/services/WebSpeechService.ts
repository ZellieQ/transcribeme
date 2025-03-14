import { TranscriptionService } from '../types';

export class WebSpeechService implements TranscriptionService {
  private recognition: SpeechRecognition | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private abortController: AbortController | null = null;
  
  public isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
  
  public getMethod(): 'webSpeech' | 'whisper' | 'simulation' {
    return 'webSpeech';
  }
  
  public async transcribe(file: File, language: string): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Web Speech API is not supported in this browser');
    }
    
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    
    return new Promise<string>((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error('Transcription cancelled'));
        return;
      }
      
      try {
        // Create audio element for silent playback
        const fileUrl = URL.createObjectURL(file);
        this.audioElement = new Audio();
        this.audioElement.src = fileUrl;
        this.audioElement.volume = 0; // silent
        
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error('Speech Recognition not available');
        }
        
        this.recognition = new SpeechRecognition();
        
        this.recognition.lang = language;
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        
        let finalTranscript = '';
        
        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (signal.aborted) return;
          
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
        };
        
        this.recognition.onerror = (event) => {
          // Don't reject for non-critical errors
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }
          
          this.cancel();
          reject(new Error(`Speech recognition error: ${event.error}`));
        };
        
        this.recognition.onend = () => {
          if (signal.aborted) {
            reject(new Error('Transcription cancelled'));
            return;
          }
          
          this.cancel();
          resolve(finalTranscript.trim());
        };
        
        // Start recognition and play audio silently
        this.recognition.start();
        this.audioElement.play().catch(error => {
          this.cancel();
          reject(new Error(`Failed to play audio: ${error.message}`));
        });
        
        // Handle audio end
        this.audioElement.onended = () => {
          setTimeout(() => {
            if (this.recognition) {
              this.recognition.stop();
            }
          }, 1000); // Give recognition time to process final bit
        };
        
      } catch (error) {
        this.cancel();
        reject(error);
      }
    });
  }
  
  public cancel(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
      this.recognition = null;
    }
    
    if (this.audioElement) {
      this.audioElement.pause();
      if (this.audioElement.src) {
        URL.revokeObjectURL(this.audioElement.src);
      }
      this.audioElement = null;
    }
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
