export type MonthYear = {
  year: number;
  month: number;
};

export type RatingHistoryPoint = {
  year: number;
  month: number;
  rating: number;
};

export type RatingHistory = {
  [key: string]: RatingHistoryPoint[];
};

export type ColorMap = {
  [key: string]: string;
};

export type SimilarHistResult = {
  id: string;
  score: number;
  variance: number;
  numPoints: number;
  rating: number;
};

export interface SimilarFideHistResult extends SimilarHistResult {
  firstName: string;
  lastName: string;
}
