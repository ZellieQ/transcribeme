# Speech Recognition Application

A React TypeScript application for speech recognition with multiple transcription methods. This application is built on top of the [Speechnotes](https://speechnotes.co) speech recognition engine with significant enhancements.

## Features

- **Multiple Transcription Methods**:
  - Web Speech API (Chrome, Edge)
  - Whisper.js (All modern browsers)
  - Simulation fallback (Guaranteed to work everywhere)

- **Silent Audio Processing**: No audio playback during transcription

- **File Upload**: Support for various audio formats (MP3, WAV, OGG, WebM, M4A)

- **Real-time Progress**: Visual feedback during transcription

- **Language Selection**: Support for multiple languages

- **Error Handling**: Comprehensive error handling with recovery options

- **Export Options**: Copy to clipboard, download as TXT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Production Build

```bash
# Create production build
npm run build

# Serve the production build
npx serve -s build
```

## Architecture

This application follows a service-based architecture with React components:

- **Services**: Separate services for each transcription method
- **Components**: React function components with hooks
- **Context API**: For state management
- **TypeScript**: Strict type checking throughout

## Browser Support

- **Full Support** (all features): Chrome, Edge
- **Partial Support** (Whisper.js and fallback): Firefox, Safari, Opera
- **Minimal Support** (fallback only): Older browsers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Transformers.js](https://huggingface.co/docs/transformers.js/index)
- [Speechnotes](https://speechnotes.co)
