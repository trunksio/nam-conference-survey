import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseAudioSurveyReturn {
  // State
  isAudioEnabled: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isSupported: boolean;

  // Actions
  toggleAudioMode: () => void;
  speakText: (text: string) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;

  // Results
  transcript: string;
  resetTranscript: () => void;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
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

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new(): SpeechRecognition;
    };
  }
}

const AUDIO_ENABLED_KEY = 'survey-audio-enabled';

/**
 * Custom hook for managing audio features in the survey
 * Provides Text-to-Speech and Speech-to-Text capabilities
 */
export function useAudioSurvey(): UseAudioSurveyReturn {
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(AUDIO_ENABLED_KEY);
    return stored === 'true';
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceQueueRef = useRef<string[]>([]);
  const isProcessingQueueRef = useRef<boolean>(false);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = !!SpeechRecognitionAPI && !!window.speechSynthesis;
    setIsSupported(supported);

    // Initialize speech recognition if supported
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => {
            const newTranscript = prev ? `${prev} ${finalTranscript}` : finalTranscript;
            return newTranscript.trim();
          });
        }
      };

      recognition.onerror = (event: Event) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }

      // Cancel any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Toggle audio mode
  const toggleAudioMode = useCallback(() => {
    setIsAudioEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem(AUDIO_ENABLED_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // Process speech queue
  const processQueue = useCallback(() => {
    if (isProcessingQueueRef.current || utteranceQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    const text = utteranceQueueRef.current.shift();

    if (!text) {
      isProcessingQueueRef.current = false;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Select a voice (prefer en-US voices)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google'));
    const fallbackVoice = voices.find(voice => voice.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    } else if (fallbackVoice) {
      utterance.voice = fallbackVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isProcessingQueueRef.current = false;
      // Process next item in queue
      processQueue();
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      isProcessingQueueRef.current = false;
      // Process next item in queue even on error
      processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Speak text using TTS
  const speakText = useCallback(async (text: string): Promise<void> => {
    if (!text || !window.speechSynthesis) {
      return Promise.resolve();
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    utteranceQueueRef.current = [];

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Load voices if not loaded yet
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          voices = window.speechSynthesis.getVoices();
        });
      }

      // Select a voice (prefer en-US voices)
      const preferredVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google'));
      const fallbackVoice = voices.find(voice => voice.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else if (fallbackVoice) {
        utterance.voice = fallbackVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Start listening for voice input
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) {
      return;
    }

    try {
      // Stop any ongoing speech first
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);

      // Reset transcript
      setTranscript('');

      // Start recognition
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  }, [isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) {
      return;
    }

    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, [isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isAudioEnabled,
    isSpeaking,
    isListening,
    isSupported,
    toggleAudioMode,
    speakText,
    startListening,
    stopListening,
    transcript,
    resetTranscript,
  };
}
