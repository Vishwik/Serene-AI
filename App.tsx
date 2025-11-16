
import React, { useState } from 'react';
import { MeditationSession } from './types';
import MeditationCreator from './components/MeditationCreator';
import MeditationPlayer from './components/MeditationPlayer';
import Chatbot from './components/Chatbot';
import { ChatIcon } from './components/icons/ChatIcon';

const App: React.FC = () => {
  const [session, setSession] = useState<MeditationSession | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSessionCreated = (newSession: MeditationSession) => {
    setSession(newSession);
  };

  const handleEndSession = () => {
    setSession(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 relative overflow-hidden flex flex-col items-center justify-center">
      <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
        <h1 className="text-2xl font-bold text-violet-300">Serene AI</h1>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow flex items-center justify-center transition-opacity duration-700">
        {!session ? (
          <MeditationCreator onSessionCreated={handleSessionCreated} />
        ) : (
          <MeditationPlayer session={session} onEndSession={handleEndSession} />
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-opacity-75"
          aria-label="Toggle Chat"
        >
          <ChatIcon />
        </button>
      </div>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default App;
