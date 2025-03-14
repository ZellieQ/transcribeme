import { TranscriptionProgress } from '../types';

export class AudioUploadService {
  private audioElement: HTMLAudioElement | null = null;
  private progressInterval: number | null = null;
  
  public validateFile(file: File): { valid: boolean; message?: string } {
    // Check if file is provided
    if (!file) {
      return { valid: false, message: 'No file selected' };
    }
    
    // Check file type
    const validTypes = [
      'audio/mp3', 'audio/wav', 'audio/mpeg', 
      'audio/ogg', 'audio/webm', 'video/mp4', 'audio/m4a'
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|webm|m4a|mp4)$/i)) {
      return { 
        valid: false, 
        message: 'Invalid file type. Please upload an audio file (MP3, WAV, OGG, WebM, M4A)'
      };
    }
    
    // Check file size (100MB limit)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      return { 
        valid: false, 
        message: 'File size exceeds 100MB limit. Please upload a smaller file.'
      };
    }
    
    return { valid: true };
  }
  
  public async getAudioDuration(file: File): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      try {
        this.audioElement = new Audio();
        this.audioElement.preload = 'metadata';
        this.audioElement.muted = true;
        
        const objectUrl = URL.createObjectURL(file);
        
        this.audioElement.onloadedmetadata = () => {
          if (!this.audioElement) {
            reject(new Error('Audio element was closed'));
            return;
          }
          const duration = this.audioElement.duration;
          URL.revokeObjectURL(objectUrl);
          resolve(isNaN(duration) ? (file.size / 16000) : duration);
        };
        
        this.audioElement.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          // Fallback: Estimate based on file size
          resolve(file.size / 16000);
        };
        
        this.audioElement.src = objectUrl;
      } catch (error) {
        reject(error);
      }
    });
  }
  
  public startProgressTracking(
    file: File, 
    onProgress: (progress: TranscriptionProgress) => void
  ): void {
    this.stopProgressTracking();
    
    this.getAudioDuration(file).then(duration => {
      if (!this.audioElement) return;
      
      let startTime = Date.now();
      const updateInterval = 100; // ms
      
      // Reset and play silently for progress tracking
      this.audioElement.currentTime = 0;
      this.audioElement.volume = 0;
      this.audioElement.muted = true;
      
      this.progressInterval = window.setInterval(() => {
        if (!this.audioElement) {
          this.stopProgressTracking();
          return;
        }
        
        const currentTime = this.audioElement.currentTime;
        const progress = Math.min(99, (currentTime / duration) * 100);
        
        onProgress({
          status: 'processing',
          progress,
          currentTime,
          duration
        });
        
        // Detect if playback is stuck
        const elapsedTime = (Date.now() - startTime) / 1000;
        if (elapsedTime > 3 && currentTime < 0.1) {
          this.stopProgressTracking();
          this.simulateProgress(duration, onProgress);
        }
      }, updateInterval);
      
      // Start playback silently
      this.audioElement.play().catch(error => {
        console.warn('Silent playback failed, simulating progress instead:', error);
        this.stopProgressTracking();
        this.simulateProgress(duration, onProgress);
      });
      
      // When audio ends, pegged at 99% until transcription is truly done
      this.audioElement.onended = () => {
        onProgress({
          status: 'processing',
          progress: 99,
          currentTime: duration,
          duration
        });
      };
    });
  }
  
  private simulateProgress(
    duration: number, 
    onProgress: (progress: TranscriptionProgress) => void
  ): void {
    let simulatedTime = 0;
    const updateInterval = 300; // ms
    const simulationStep = duration / (duration * (1000 / updateInterval) * 0.1);
    
    this.progressInterval = window.setInterval(() => {
      simulatedTime += simulationStep;
      if (simulatedTime > duration) simulatedTime = duration;
      
      const progress = (simulatedTime / duration) * 100;
      
      onProgress({
        status: 'processing',
        progress: Math.min(99, progress),
        currentTime: simulatedTime,
        duration
      });
      
      if (simulatedTime >= duration) {
        this.stopProgressTracking();
      }
    }, updateInterval);
  }
  
  public stopProgressTracking(): void {
    if (this.progressInterval !== null) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    
    if (this.audioElement) {
      this.audioElement.pause();
      if (this.audioElement.src) {
        URL.revokeObjectURL(this.audioElement.src);
      }
      this.audioElement = null;
    }
  }
}
