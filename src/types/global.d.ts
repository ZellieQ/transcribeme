// This file provides stronger declarations for the Web Speech API and Transformers.js objects.
// Ensure your tsconfig includes this file under "include" or similar.

declare global {
  interface Window {
    // Declarations for the Web Speech API:
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };

    // Declarations for Transformers.js:
    transformers?: {
      pipeline: (task: string, model: string) => Promise<any>;
    };
  }

  // Web Speech API interfaces
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    onnomatch: () => void;
    onaudiostart: () => void;
    onaudioend: () => void;
    onsoundstart: () => void;
    onsoundend: () => void;
    onspeechstart: () => void;
    onspeechend: () => void;
    onstart: () => void;
  }

  interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent {
    error: string;
    message: string;
  }

  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }
}

export {};
