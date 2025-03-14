import React from 'react';
import { useAppContext } from '../context/AppContext';

const ProgressBar: React.FC = () => {
  const { transcriptionProgress } = useAppContext();
  
  // Format time as MM:SS
  const formatTime = (seconds?: number): string => {
    if (seconds === undefined) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Only show progress bar when loading or processing
  if (transcriptionProgress.status !== 'processing' && 
      transcriptionProgress.status !== 'loading') {
    return null;
  }
  
  const progressPercent = transcriptionProgress.progress || 0;
  
  return (
    <div className="progress-container">
      <div className="progress-status">
        {transcriptionProgress.status === 'loading' 
          ? 'Preparing transcription service...' 
          : 'Transcribing audio...'}
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="progress-details">
        <span className="time">
          {formatTime(transcriptionProgress.currentTime)} / 
          {formatTime(transcriptionProgress.duration)}
        </span>
        <span className="percentage">
          {Math.round(progressPercent)}%
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
