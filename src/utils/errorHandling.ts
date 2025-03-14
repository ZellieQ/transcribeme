import { TranscriptionError } from '../types';

export const createTranscriptionError = (
  code: string,
  message: string,
  recoverable: boolean,
  retry?: () => void
): TranscriptionError => {
  return {
    code,
    message,
    recoverable,
    retry
  };
};

export const handleServiceError = (error: Error): TranscriptionError => {
  const message = error.message;
  
  // Categorize errors for better user feedback
  if (message.includes('permission') || message.includes('denied')) {
    return createTranscriptionError(
      'PERMISSION_ERROR',
      'Microphone access was denied. Please grant permission to use transcription.',
      true
    );
  }
  
  if (message.includes('network') || message.includes('offline')) {
    return createTranscriptionError(
      'NETWORK_ERROR',
      'Network connection issue. Please check your internet connection.',
      true
    );
  }
  
  if (message.includes('cancelled') || message.includes('aborted')) {
    return createTranscriptionError(
      'CANCELLED',
      'Transcription was cancelled.',
      false
    );
  }
  
  if (message.includes('file') || message.includes('audio')) {
    return createTranscriptionError(
      'FILE_ERROR',
      'There was a problem with the audio file. Please try a different file.',
      true
    );
  }
  
  // Default error
  return createTranscriptionError(
    'TRANSCRIPTION_ERROR',
    `Transcription failed: ${message}`,
    true
  );
};
