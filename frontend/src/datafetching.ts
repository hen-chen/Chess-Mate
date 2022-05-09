import useSWR from 'use-swr';

const BACKEND_HOST = 'http://localhost:8000';
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Backend returns sorted history
export const useLichessHistory = (lichessId: string) => {
  const { data, error, isValidating } = useSWR(
    `${BACKEND_HOST}/history/lichess/${lichessId}`,
    fetcher,
  );
  if (!data && !isValidating) {
    console.error(error);
  }
  return data;
};

export const useFideHistory = (fideId: string) => {
  const { data, error, isValidating } = useSWR(
    `${BACKEND_HOST}/history/fide/${fideId}`,
    fetcher,
  );
  if (!data && !isValidating) {
    console.error(error);
  }
  return data;
};

export const useFideName = (fideId: string) => {
  const { data, error, isValidating } = useSWR(
    `${BACKEND_HOST}/player/fide/${fideId}`,
    fetcher,
  );
  if (!data && !isValidating) {
    console.error(error);
  }
  if (data) {
    const { firstName, lastName } = data;
    return `${firstName} ${lastName}`;
  }
};
