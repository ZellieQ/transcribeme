import React from 'react';
import { AppProvider } from '../context/AppContext';
import ErrorBoundary from './ErrorBoundary';
import AudioUploader from './AudioUploader';
import TranscriptionDisplay from './TranscriptionDisplay';
import LanguageSelector from './LanguageSelector';
import ProgressBar from './ProgressBar';
import WaveformVisualizer from './WaveformVisualizer';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="app-container">
          <header>
            <h1>Speech-to-Text Transcription</h1>
            <p className="subtitle">Upload audio files for silent transcription</p>
          </header>
          
          <main>
            <div className="controls-panel">
              <LanguageSelector />
              <AudioUploader />
            </div>
            <ProgressBar />
            <div className="visualization-container">
              <WaveformVisualizer width={700} height={80} />
            </div>
            <TranscriptionDisplay />
          </main>
          
          <footer>
            <p>
              This app uses multiple transcription methods including Web Speech API 
              and Whisper, with graceful fallback for all browsers.
            </p>
            <p className="version">Version 1.1.0 - Enhanced with waveform visualization</p>
          </footer>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
