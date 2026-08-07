export interface UserDocument {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: string;
  lastLogin: string;
  streakCount: number;
  lastActiveDate: string;
}

export interface TopicItem {
  id: string;
  topicText: string;
  genre: string;
  difficulty: "Easy" | "Medium" | "Hard";
  createdAt: string;
}

export interface HistoryItem {
  id?: string;
  topicId: string;
  topicText: string;
  genre: string;
  attemptedAt: string;
  score: number;
  clarity: number;
  confidence: number;
  grammar: number;
  depth: number;
  structure: number;
  wordsPerMinute: number;
  transcript: string;
  feedback: string;
  reattemptCount: number;
}
