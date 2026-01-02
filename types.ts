
export enum EngineerLevel {
  ASSISTANT = '助理工程师',
  JUNIOR = '初级工程师',
  INTERMEDIATE = '中级工程师',
  SENIOR = '高级工程师'
}

export interface ClassroomReward {
  correctExp: number;
  streakN: number;
  streakBonusPoints: number;
}

export interface Classroom {
  code: string;
  className: string;
  expireAt: number;
  createdAt: number;
  initialPoints: number;
  unlockMode: "SEQUENTIAL";
  reward: ClassroomReward;
}

export interface StudentResult {
  nickname: string;
  points: number;
  exp: number;
  level: number;
  stage: number;
  finishedAt: number | null;
  yieldRate: number;
  accuracy: number;
  lastSubmitAt: number;
}

export interface Inventory {
  rawMaterial: number;
  crudeSilicon: number;
  siliconIngot: number;
  memoryWafer: number;
  powerWafer: number;
  memoryChip: number;
  powerChip: number;
}

export interface GameSession {
  stage: number;
  levelIndex: number; // 0-3 based on EngineerLevel
  points: number;
  exp: number;
  purity: number;
  streak: number;
  inventory: Inventory;
  correctCount: number;
  totalAnswered: number;
  manufactureSuccess: number;
  manufactureTotal: number;
  startTime: number;
  isFinished: boolean;
}

export interface Question {
  id: number;
  stage: number;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
}
