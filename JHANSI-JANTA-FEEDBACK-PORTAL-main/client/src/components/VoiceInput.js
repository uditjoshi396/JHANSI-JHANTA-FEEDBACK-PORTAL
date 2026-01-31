import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { motion } from 'framer-motion';
import { Mic, MicOff, Square, Volume2 } from 'lucide-react';

const VoiceInput = ({ onTranscript, placeholder = "Click mic to speak...", disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionTimeoutRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !listening) {
      handleTranscriptComplete(transcript);
    }
  }, [transcript, listening]);

  const handleTranscriptComplete = async (finalTranscript) => {
    if (finalTranscript.trim()) {
      setIsProcessing(true);
      try {
        // Optional: Send to AI for processing/cleanup
        onTranscript(finalTranscript.trim());
      } catch (error) {
        console.error('Voice processing error:', error);
        onTranscript(finalTranscript.trim());
      } finally {
        setIsProcessing(false);
      }
    }
    resetTranscript();
  };

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    resetTranscript();
    setIsListening(true);
    SpeechRecognition.startListening({
      continuous: false,
      language: 'en-US'
    });

    // Auto-stop after 30 seconds
    recognitionTimeoutRef.current = setTimeout(() => {
      stopListening();
    }, 30000);
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
    }
  };

  const handleMicClick = () => {
    if (disabled || isProcessing) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return null; // Don't show voice input if not supported
  }

  return (
    <div className="voice-input-container">
      <motion.button
        type="button"
        className={`voice-input-button ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
        onClick={handleMicClick}
        disabled={disabled || isProcessing}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isListening ? {
          scale: [1, 1.1, 1],
          transition: { duration: 1.5, repeat: Infinity }
        } : {}}
      >
        {isProcessing ? (
          <Volume2 size={20} className="processing-icon" />
        ) : isListening ? (
          <Square size={20} className="stop-icon" />
        ) : (
          <Mic size={20} />
        )}
      </motion.button>

      {/* Visual feedback for listening state */}
      {isListening && (
        <motion.div
          className="voice-waveform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
        </motion.div>
      )}

      {/* Status text */}
      <div className="voice-status">
        {isProcessing && <span className="status-text processing">Processing...</span>}
        {isListening && <span className="status-text listening">Listening...</span>}
        {!isListening && !isProcessing && (
          <span className="status-text ready">{placeholder}</span>
        )}
      </div>

      {/* Live transcript preview */}
      {isListening && transcript && (
        <motion.div
          className="live-transcript"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="transcript-text">{transcript}</span>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceInput;
