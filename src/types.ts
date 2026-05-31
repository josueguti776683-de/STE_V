export interface Word {
  en: string;
  es: string;
  ctx: string;
  ctxEs: string;
}

export interface Group {
  id: number;
  title: string;
  desc: string;
  color: string;
  words: Word[];
}

export interface GameStats {
  correct: number;
  wrong: number;
  penalties: number;
  totalAttempts: number;
}

export interface PenaltyState {
  word: Word;
  count: number;
  target: number;
  isSentence: boolean;
  originalIndex: number;
}

export type GameMode = 'vocab1' | 'vocab2' | 'vocab3' | 'test' | 'test_escritura' | 'test_auditivo';
