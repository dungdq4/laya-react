export type QuestionType = 'choice' | 'score' | 'noul';

export interface BaseQuestion {
  type: QuestionType;
  instructions: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice';
  criteria: Record<string, string | null> | string[];
}

export interface ScoreQuestion extends BaseQuestion {
  type: 'score';
  criteria: string[];
}

export interface NoulQuestion extends BaseQuestion {
  type: 'noul';
  criteria?: {
    true?: string;
    false?: string;
  };
}

export type Question = ChoiceQuestion | ScoreQuestion | NoulQuestion;
export type QuestionSet = Record<string, Question>;

export interface ChoiceAnswer {
  type: 'choice';
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
  rl_agent?: { act_probability: number };
}

export interface ScoreAnswer {
  type: 'score';
  score: number;
  legend?: Record<string, string>;
  probabilities: Record<string, number>;
  confidence: number;
  rl_agent?: { act_probability: number };
}

export interface NoulAnswer {
  type: 'noul';
  noul: number;
  confidence?: number;
  rl_agent?: { act_probability: number };
}

export type Answer = ChoiceAnswer | ScoreAnswer | NoulAnswer;

export interface SystemOneResponse {
  model: string;
  answers: Record<string, Answer>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  latency_ms: number;
}

export interface TableRow {
  question: string;
  answer: string;
  confidence: string;
  type: QuestionType;
  rawAnswer: Answer;
  riskScore: number;
}

export interface RagResultRow {
  index: number;
  passage: string;
  relevant: number;
  contradicts: number;
  injection: number;
  verdict: 'KEEP' | 'KEEP + flag contradiction' | 'DROP (injection)' | 'DROP (not relevant)';
}

