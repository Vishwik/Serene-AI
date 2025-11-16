
export interface MeditationSession {
  script: string;
  imageUrl: string;
  audioData: string; // base64 encoded raw PCM audio
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
