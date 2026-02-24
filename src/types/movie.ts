export interface Movie {
  id: string;
  coverUrl: string;
  code: string;
  date: string;
  actors: string;
  genre: string;
  description: string;
}

export type MovieInput = Omit<Movie, 'id'> & { id?: string };
