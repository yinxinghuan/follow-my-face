export type Direction = 'left' | 'right';
export type Phase = 'cover' | 'playing' | 'feedback' | 'result';
export type Feedback = 'correct' | 'wrong' | 'timeout' | null;

export type Identity = {
  name: string;
  avatarUrl: string;
  status: 'loading' | 'ready' | 'error';
};

export type Cue = {
  face: Direction;
  sign: Direction;
  startedAt: number;
  deadlineMs: number;
  index: number;
};

export type RunStats = {
  score: number;
  correct: number;
  mistakes: number;
  fooled: number;
  streak: number;
  bestMs: number | null;
};
