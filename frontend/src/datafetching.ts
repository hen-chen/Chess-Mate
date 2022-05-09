import useSWR from 'use-swr';

const BACKEND_HOST = 'http://localhost:8000';
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Backend returns sorted history
export const useLichessHistory = (lichessId: string) => {
  const { data, error } = useSWR(
    `${BACKEND_HOST}/history/lichess/${lichessId}`,
    fetcher,
  );
  if (!data) {
    console.error(error);
  }
  return data;
};

export const useFideHistory = (fideId: string) => {
  const { data, error } = useSWR(
    `${BACKEND_HOST}/history/fide/${fideId}`,
    fetcher,
  );
  if (!data) {
    console.error(error);
  }
  return data;
};
