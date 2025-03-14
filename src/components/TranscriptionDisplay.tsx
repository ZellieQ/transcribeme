import React from 'react';
import { useAppContext } from '../context/AppContext';

const TranscriptionDisplay: React.FC = () => {
  const { transcriptionResult, transcriptionProgress, clearTranscription } = useAppContext();
  
  const handleCopyToClipboard = () => {
    if (transcriptionResult?.text) {
      navigator.clipboard.writeText(transcriptionResult.text)
        .then(() => {
          alert('Transcript copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };
  
  const handleDownloadTxt = () => {
    if (transcriptionResult?.text) {
      const element = document.createElement('a');
      const file = new Blob([transcriptionResult.text], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = 'transcript.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  
  return (
    <div className="transcription-display">
      <div className="header">
        <h2>Transcription Result</h2>
        {transcriptionResult && (
          <div className="method-badge">
            Method: {transcriptionResult.method === 'webSpeech' ? 'Web Speech API' :
                     transcriptionResult.method === 'whisper' ? 'Whisper.js' :
                     'Simulation'}
          </div>
        )}
      </div>
      
      <div className="content">
        {transcriptionProgress.status === 'idle' && !transcriptionResult && (
          <div className="placeholder">
            Select an audio file and start transcription
          </div>
        )}
        
        {transcriptionProgress.status === 'loading' && (
          <div className="loading">
            Loading transcription service...
          </div>
        )}
        
        {transcriptionProgress.status === 'processing' && (
          <div className="processing">
            {transcriptionResult?.text || 'Processing your audio...'}
          </div>
        )}
        
        {transcriptionProgress.status === 'complete' && transcriptionResult && (
          <div className="result">
            {transcriptionResult.text}
          </div>
        )}
        
        {transcriptionProgress.status === 'error' && (
          <div className="error">
            Failed to transcribe audio
          </div>
        )}
      </div>
      
      {transcriptionProgress.status === 'complete' && transcriptionResult && (
        <div className="transcription-actions">
          <button onClick={handleCopyToClipboard} className="action-btn">
            Copy to Clipboard
          </button>
          <button onClick={handleDownloadTxt} className="action-btn">
            Download as TXT
          </button>
          <button onClick={clearTranscription} className="action-btn clear-btn">
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default TranscriptionDisplay;
