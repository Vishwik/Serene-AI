
import React, { useState } from 'react';
import { generateMeditationSession } from '../services/geminiService';
import { MeditationSession } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface MeditationCreatorProps {
  onSessionCreated: (session: MeditationSession) => void;
}

const loadingMessages = [
  "Crafting your moment of calm...",
  "Generating serene visuals...",
  "Narrating your meditation...",
  "Harmonizing audio and visuals...",
  "Almost there, take a deep breath...",
];

const MeditationCreator: React.FC<MeditationCreatorProps> = ({ onSessionCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const messageInterval = setInterval(() => {
      setLoadingMessage(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2500);

    try {
      const session = await generateMeditationSession(prompt);
      onSessionCreated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      clearInterval(messageInterval);
    }
  };
  
  const placeholderSuggestions = [
    "reduce anxiety",
    "a 5-minute morning energy boost",
    "unwind after a long day",
    "improve focus for studying",
    "deep sleep and relaxation"
  ];

  return (
    <div className="w-full max-w-2xl text-center p-4">
      <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 mb-4">
        What is your intention?
      </h2>
      <p className="text-lg text-slate-400 mb-8">
        Describe the focus of your meditation, and we'll craft a unique guided session just for you.
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`For example: "${placeholderSuggestions[Math.floor(Math.random() * placeholderSuggestions.length)]}"`}
          className="w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 min-h-[120px] text-lg"
          rows={3}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="mt-6 w-full flex items-center justify-center gap-3 bg-violet-600 text-white font-bold py-4 px-6 rounded-lg text-xl hover:bg-violet-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
              <span>{loadingMessage}</span>
            </>
          ) : (
            <>
              <SparklesIcon />
              Generate Session
            </>
          )}
        </button>
      </form>
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
};

export default MeditationCreator;
