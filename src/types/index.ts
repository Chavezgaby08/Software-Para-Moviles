export interface Mission {
  id: number;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  unlocked: boolean;
}

export interface UserProgress {
  points: number;
  missions: { id: number; completed: boolean }[];
}

export interface UserProfile {
  uid: string;
  email: string;
  points: number;
  displayName?: string;
}