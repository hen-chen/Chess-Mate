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
