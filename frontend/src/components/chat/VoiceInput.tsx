import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface Props {
  onTranscript: (text: string) => void;
  lang?: string;
}

export default function VoiceInput({ onTranscript, lang = "en-US" }: Props) {
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setListening(false);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const toggleListen = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = lang;
        recognitionRef.current.start();
        setListening(true);
      } else {
        alert("Microphone API not supported by this browser.");
      }
    }
  };

  return (
    <button
      onClick={toggleListen}
      type="button"
      className={`p-2 rounded-xl transition-all shadow-sm ${
        listening 
         ? 'bg-red-500 text-white animate-pulse shadow-red-500/30' 
         : 'bg-navy text-cream hover:bg-gold/20 hover:text-saffron'
      }`}
      title={listening ? "Listening... Click to stop" : "Use microphone"}
    >
      {listening ? <Square className="w-5 h-5 fill-white" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}
