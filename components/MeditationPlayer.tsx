
import React, { useState, useEffect, useRef } from 'react';
import { MeditationSession } from '../types';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { PlayIcon, PauseIcon, StopIcon } from './icons/MediaIcons';

interface MeditationPlayerProps {
  session: MeditationSession;
  onEndSession: () => void;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ session, onEndSession }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    let isActive = true;
    
    const setupAudio = async () => {
      try {
        if (!session.audioData) return;
        
        // Ensure AudioContext is only created once
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const audioBytes = decode(session.audioData);
        const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
        
        if (isActive) {
          audioBufferRef.current = buffer;
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to decode audio:", error);
      }
    };

    setupAudio();

    return () => {
      isActive = false;
      // Cleanup audio resources on component unmount or session change
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      // Don't close the context here to allow re-playing
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.audioData]);
  
  const playAudio = () => {
    if (!audioContextRef.current || !audioBufferRef.current || !isReady) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if(sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
    }

    const newSource = audioContextRef.current.createBufferSource();
    newSource.buffer = audioBufferRef.current;
    newSource.connect(audioContextRef.current.destination);
    newSource.start();

    newSource.onended = () => {
      setIsPlaying(false);
      sourceNodeRef.current = null;
    };

    sourceNodeRef.current = newSource;
    setIsPlaying(true);
  };
  
  const pauseAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
        <div className="absolute inset-0 w-full h-full z-0">
            <img src={session.imageUrl} alt="Serene background" className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-3xl p-6 md:p-8 bg-slate-900 bg-opacity-70 backdrop-blur-md rounded-lg shadow-2xl text-center flex flex-col items-center">
            <div className="w-full max-h-64 overflow-y-auto mb-6 pr-2">
                <p className="text-slate-200 text-lg leading-relaxed text-left">{session.script}</p>
            </div>
            
            <div className="flex items-center space-x-6">
                <button
                    onClick={handleTogglePlay}
                    disabled={!isReady}
                    className="p-4 bg-violet-600 rounded-full text-white disabled:bg-slate-600 transition-all transform hover:scale-110 disabled:scale-100"
                >
                    {isReady ? (isPlaying ? <PauseIcon /> : <PlayIcon />) : <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> }
                </button>

                <button
                    onClick={onEndSession}
                    className="flex items-center gap-2 py-2 px-4 bg-slate-700 text-slate-200 rounded-full hover:bg-slate-600 transition-colors"
                >
                    <StopIcon />
                    End Session
                </button>
            </div>
        </div>
    </div>
  );
};

export default MeditationPlayer;
