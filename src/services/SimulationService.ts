import { TranscriptionService } from '../types';

export class SimulationService implements TranscriptionService {
  private intervalId: number | null = null;
  private abortController: AbortController | null = null;
  
  // Sample transcriptions by language
  private transcriptions: Record<string, string> = {
    'en-US': "This is a simulated transcription as a fallback method. In a production environment, this would be replaced with the actual transcribed text from your audio file.",
    'es-ES': "Esta es una transcripción simulada como método de respaldo. En un entorno de producción, esto se reemplazaría con el texto transcrito real de su archivo de audio.",
    'fr-FR': "Ceci est une transcription simulée en tant que méthode de secours. Dans un environnement de production, cela serait remplacé par le texte transcrit réel de votre fichier audio.",
    'de-DE': "Dies ist eine simulierte Transkription als Fallback-Methode. In einer Produktionsumgebung würde dies durch den tatsächlich transkribierten Text aus Ihrer Audiodatei ersetzt werden.",
    'it-IT': "Questa è una trascrizione simulata come metodo di fallback. In un ambiente di produzione, questo sarebbe sostituito con il testo effettivamente trascritto dal tuo file audio."
  };
  
  public isSupported(): boolean {
    return true; // Always supported as fallback
  }
  
  public getMethod(): 'webSpeech' | 'whisper' | 'simulation' {
    return 'simulation';
  }
  
  public async transcribe(file: File, language: string): Promise<string> {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    
    return new Promise<string>((resolve, reject) => {
      try {
        // Get audio duration or estimate it
        this.getAudioDuration(file).then(duration => {
          if (signal.aborted) {
            reject(new Error('Transcription cancelled'));
            return;
          }
          
          // Get transcription for selected language or fallback to English
          const text = this.transcriptions[language] || this.transcriptions['en-US'];
          
          // For very short files, return immediately
          if (duration < 3) {
            resolve(text);
            return;
          }
          
          // Simulate gradual transcription
          let elapsedTime = 0;
          const interval = 500; // Update every 500ms
          const simulationDuration = Math.min(10000, duration * 1000); // Max 10s
          const steps = simulationDuration / interval;
          
          this.intervalId = window.setInterval(() => {
            if (signal.aborted) {
              if (this.intervalId !== null) {
                clearInterval(this.intervalId);
              }
              reject(new Error('Transcription cancelled'));
              return;
            }
            
            elapsedTime += interval;
            
            if (elapsedTime >= simulationDuration) {
              if (this.intervalId !== null) {
                clearInterval(this.intervalId);
              }
              resolve(text);
            }
          }, interval);
        }).catch(error => {
          reject(new Error(`Simulation failed: ${error.message}`));
        });
      } catch (error) {
        reject(new Error(`Simulation failed: ${(error as Error).message}`));
      }
    });
  }
  
  private async getAudioDuration(file: File): Promise<number> {
    return new Promise<number>((resolve) => {
      const audio = new Audio();
      audio.muted = true;
      
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        URL.revokeObjectURL(audio.src);
        resolve(duration || (file.size / 16000)); // Fallback estimate
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        resolve(file.size / 16000); // Very rough fallback
      };
      
      audio.src = URL.createObjectURL(file);
    });
  }
  
  public cancel(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
