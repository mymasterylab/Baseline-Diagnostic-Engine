/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CurriculumType = 'US' | 'UK_EUROPE';

export interface StudentInfo {
  name: string;
  email: string;
  grade: Grade;
  curriculum: CurriculumType;
  assessmentId: string;
  date: string;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionType =
  | 'MCQ'
  | 'MULTIPLE_SELECT'
  | 'FILL_IN_BLANK'
  | 'TRUE_FALSE'
  | 'SHORT_NUMERICAL'
  | 'DRAG_DROP_ORDERING'
  | 'MATCHING'
  | 'HOTSPOT'
  | 'PATTERN_RECOGNITION'
  | 'FRACTION_MODEL'
  | 'CLOCK_TIME'
  | 'MONEY_COUNT';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface HotspotArea {
  id: string;
  label: string;
  x: number; // percentage from left
  y: number; // percentage from top
  width: number;
  height: number;
}

export interface Question {
  id: string;
  grade: Grade;
  curriculum: CurriculumType;
  category: string;
  subcategory: string;
  standardCode: string;
  difficulty: Difficulty;
  type: QuestionType;
  text: string;
  hint: string;
  explanation: string;
  estimatedTime: number; // in seconds
  bloomLevel: 'Remembering' | 'Understanding' | 'Applying' | 'Analyzing' | 'Evaluating' | 'Creating';
  tags: string[];
  skillId: string;
  conceptId: string;
  
  // Type-specific properties
  options?: string[]; // For MCQ, Multiple Select
  correctAnswer: string | string[] | Record<string, string> | number[]; // Can be single answer string, array for multiselect, matching map, or ordered indices
  
  // Interactive metadata
  visualData?: {
    fractionParts?: { shaded: number; total: number };
    clockTime?: { hour: number; minute: number };
    moneyCoins?: { type: 'quarter' | 'dime' | 'nickel' | 'penny' | 'one' | 'five' | 'ten'; count: number }[];
    matchingPairs?: MatchingPair[];
    hotspots?: HotspotArea[];
    imageUrl?: string;
    pattern?: string[];
  };
}

export interface StudentResponse {
  questionId: string;
  category: string;
  subcategory: string;
  difficulty: Difficulty;
  type: QuestionType;
  questionText: string;
  studentAnswer: any; // Saved response
  correctAnswer: any;
  isCorrect: boolean;
  timeTaken: number; // in seconds
  attempts: number;
  skipped: boolean;
  confidence?: 'Low' | 'Medium' | 'High';
}

export type MasteryLevel =
  | 'Mastered' // 95-100%
  | 'Proficient' // 85-94%
  | 'Developing' // 70-84%
  | 'Emerging' // 50-69%
  | 'Needs Immediate Intervention'; // <50%

export interface DiagnosticReport {
  overallPercentage: number;
  overallScore: string; // e.g. "42 / 50"
  categoryScores: Record<string, { correct: number; total: number; percentage: number; mastery: MasteryLevel }>;
  accuracy: number;
  averageTimePerQuestion: number;
  totalTime: number;
  fastestCategory: string;
  slowestCategory: string;
  difficultyAccuracy: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  skippedCount: number;
  guessProbability: number; // estimated probability of guessing
  masteryLevel: MasteryLevel;
  learningGaps: string[];
  strongestSkills: string[];
  weakestSkills: string[];
  recommendedStartingGrade: Grade | string;
  recommendedStartingUnit: string;
  recommendedLessons: string[];
  readinessScore: number; // 0-100 scale
  confidenceIndex: number; // 0-100 scale
  learningVelocity: 'Steady' | 'Accelerated' | 'Needs Support';
  
  // Curricular Skill Group Scores
  fluencyScore: number;
  reasoningScore: number;
  computationalScore: number;
  geometryScore: number;
  fractionsScore: number;
  numberSenseScore: number;
}
