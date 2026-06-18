'use client';
import { useState, useEffect, useRef } from 'react';

interface UseVoiceAssistantProps {
    onTranscript: (text: string) => void;
    onListeningChange?: (isListening: boolean) => void;
}

export function useVoiceAssistant({ onTranscript, onListeningChange }: UseVoiceAssistantProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        // Initialize speech recognition
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    onTranscript(transcript);
                    stopListening();
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    setError(event.error);
                    stopListening();
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                    if (onListeningChange) onListeningChange(false);
                };
            } else {
                setError('Speech recognition not supported in this browser');
            }

            // Initialize speech synthesis
            synthRef.current = window.speechSynthesis;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const startListening = () => {
        if (!recognitionRef.current) {
            setError('Speech recognition not supported');
            return;
        }
        setError(null);
        setIsListening(true);
        if (onListeningChange) onListeningChange(true);
        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        if (onListeningChange) onListeningChange(false);
    };

    const speak = (text: string) => {
        if (!synthRef.current) {
            console.error('Speech synthesis not supported');
            return;
        }
        
        // Cancel any ongoing speech
        synthRef.current.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        synthRef.current.speak(utterance);
    };

    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    return {
        isListening,
        isSpeaking,
        error,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        isSupported: !!recognitionRef.current
    };
}