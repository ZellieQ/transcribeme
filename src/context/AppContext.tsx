import React, { createContext, useState, useContext, ReactNode } from 'react';
import { 
  AppContextType, 
  Language, 
  TranscriptionProgress, 
  TranscriptionResult, 
  TranscriptionError 
} from '../types';
import { SpeechService } from '../services/SpeechService';
import { AudioUploadService } from '../services/AudioUploadService';

const availableLanguages: Language[] = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
];

const defaultContext: AppContextType = {
  languages: availableLanguages,
  selectedLanguage: 'en-US',
  setSelectedLanguage: () => {},
  transcriptionResult: null,
  transcriptionProgress: { status: 'idle', progress: 0 },
  error: null,
  uploadFile: () => {},
  startTranscription: async () => {},
  cancelTranscription: () => {},
  clearTranscription: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultContext.selectedLanguage);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [transcriptionProgress, setTranscriptionProgress] = useState<TranscriptionProgress>({
    status: 'idle',
    progress: 0
  });
  const [error, setError] = useState<TranscriptionError | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const speechService = React.useMemo(() => new SpeechService(), []);
  const audioUploadService = React.useMemo(() => new AudioUploadService(), []);
  
  const uploadFile = (file: File) => {
    const validation = audioUploadService.validateFile(file);
    if (!validation.valid) {
      setError({
        code: 'FILE_VALIDATION_ERROR',
        message: validation.message || 'Invalid file',
        recoverable: true
      });
      return;
    }
    setSelectedFile(file);
    setError(null);
  };
  
  const startTranscription = async () => {
    if (!selectedFile) {
      setError({
        code: 'NO_FILE_SELECTED',
        message: 'No file selected for transcription',
        recoverable: true
      });
      return;
    }
    
    try {
      setTranscriptionProgress({ status: 'loading', progress: 0 });
      setError(null);
      
      audioUploadService.startProgressTracking(selectedFile, (progress) => {
        setTranscriptionProgress(progress);
      });
      
      const result = await speechService.transcribe(selectedFile, selectedLanguage);
      
      setTranscriptionResult(result);
      setTranscriptionProgress({ status: 'complete', progress: 100 });
      
    } catch (error) {
      setTranscriptionProgress({ status: 'error', progress: 0 });
      setError({
        code: 'TRANSCRIPTION_ERROR',
        message: (error as Error).message,
        recoverable: true,
        retry: startTranscription
      });
    } finally {
      audioUploadService.stopProgressTracking();
    }
  };
  
  const cancelTranscription = () => {
    speechService.cancel();
    audioUploadService.stopProgressTracking();
    setTranscriptionProgress({ status: 'idle', progress: 0 });
  };
  
  const clearTranscription = () => {
    setTranscriptionResult(null);
    setTranscriptionProgress({ status: 'idle', progress: 0 });
    setError(null);
  };
  
  const contextValue: AppContextType = {
    languages: availableLanguages,
    selectedLanguage,
    setSelectedLanguage,
    transcriptionResult,
    transcriptionProgress,
    error,
    uploadFile,
    startTranscription,
    cancelTranscription,
    clearTranscription,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
