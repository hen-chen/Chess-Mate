export interface Player {
  username: string;
  bio: string | null;
  country: string | null;
  location: string | null;
  firstName: string | null;
  lastName: string | null;
  fideRating: number | null;
  uscfRating: number | null;
  ecfRating: number | null;
  createdAt: number | null;
  title: string | null;
  bulletRating: number | null;
  bulletNumGames: number | null;
  bulletIsProvisional: boolean;
  blitzRating: number | null;
  blitzNumGames: number | null;
  blitzIsProvisional: boolean;
  rapidRating: number | null;
  rapidNumGames: number | null;
  rapidIsProvisional: boolean;
  classicalRating: number | null;
  classicalNumGames: number | null;
  classicalIsProvisional: boolean;
  totalPlayTime: number | null;
  isVerified: boolean;
}
