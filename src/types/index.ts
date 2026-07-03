export interface LeaderboardEntry {
  value: string; // username
  score: number;
}

export type Rank =
  | "COPPER"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND"
  | "EMERALD"
  | "KOBOLT";

export interface ApiError {
  error: string;
  details?: { message: string }[];
}
