import React, { useRef, ChangeEvent } from 'react';
import { useAppContext } from '../context/AppContext';

const AudioUploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    uploadFile, 
    startTranscription, 
    cancelTranscription, 
    transcriptionProgress,
    error
  } = useAppContext();
  
  const isProcessing = transcriptionProgress.status === 'processing' || 
                      transcriptionProgress.status === 'loading';
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="audio-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,video/*"
        className="file-input"
        style={{ display: 'none' }}
      />
      
      <div className="upload-controls">
        <button
          className="upload-btn"
          onClick={handleButtonClick}
          disabled={isProcessing}
        >
          Select Audio File
        </button>
        
        <button
          className="start-btn"
          onClick={startTranscription}
          disabled={isProcessing}
        >
          Start Transcription
        </button>
        
        <button
          className="cancel-btn"
          onClick={cancelTranscription}
          disabled={!isProcessing}
        >
          Cancel
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error.message}</p>
          {error.recoverable && error.retry && (
            <button onClick={error.retry} className="retry-btn">
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
