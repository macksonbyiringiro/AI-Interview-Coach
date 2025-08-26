import { useState, useEffect, useRef } from 'react';

// FIX: Add type declarations for the Web Speech API which is not part of standard DOM typings.
// These interfaces define the shape of the SpeechRecognition constructor and its related event objects,
// allowing TypeScript to understand and type-check this browser feature.
interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
  length: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}


interface SpeechRecognitionOptions {
  lang: string;
}

interface SpeechRecognitionHook {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
}

const getSpeechRecognition = (): SpeechRecognitionStatic | undefined => {
  if (typeof window !== 'undefined') {
    // FIX: Correctly access vendor-prefixed properties on the window object.
    // Casting to `any` bypasses TypeScript's strict type checking for `window`,
    // and the return type provides type safety for the rest of the hook.
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  }
  return undefined;
}

export const useSpeechRecognition = ({ lang }: SpeechRecognitionOptions): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  // FIX: With the interfaces defined above, `SpeechRecognition` is now a known type.
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let currentInterimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          currentInterimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript);
      setInterimTranscript(currentInterimTranscript);
    };
    
    recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            setError("No speech was detected. Please try again.");
        } else if (event.error === 'audio-capture') {
            setError("Microphone not available. Please check your microphone settings.");
        } else if (event.error === 'not-allowed') {
            setError("Permission to use microphone was denied. Please enable it in your browser settings.");
        } else {
            setError(`An error occurred with speech recognition: ${event.error}`);
        }
        setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
  }, [lang]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setError("Could not start speech recognition.");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    transcript,
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport: !!getSpeechRecognition(),
    error,
  };
};
