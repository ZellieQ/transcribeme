export type Language = {
  code: string;
  name: string;
};

export type TranscriptionProgress = {
  status: 'idle' | 'loading' | 'processing' | 'complete' | 'error';
  progress: number;
  currentTime?: number;
  duration?: number;
  message?: string;
};

export type TranscriptionResult = {
  text: string;
  method: 'webSpeech' | 'whisper' | 'simulation';
};

export interface TranscriptionService {
  transcribe(file: File, language: string): Promise<string>;
  cancel(): void;
  isSupported(): boolean;
  getMethod(): 'webSpeech' | 'whisper' | 'simulation';
}

export type TranscriptionError = {
  code: string;
  message: string;
  recoverable: boolean;
  retry?: () => void;
};

export type AppContextType = {
  languages: Language[];
  selectedLanguage: string;
  setSelectedLanguage: (code: string) => void;
  transcriptionResult: TranscriptionResult | null;
  transcriptionProgress: TranscriptionProgress;
  error: TranscriptionError | null;
  uploadFile: (file: File) => void;
  startTranscription: () => Promise<void>;
  cancelTranscription: () => void;
  clearTranscription: () => void;
};
