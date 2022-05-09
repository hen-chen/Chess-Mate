import useSWR from 'use-swr';
import { RatingHistory, MonthYear, RatingHistoryPoint } from './types';

const BACKEND_HOST = 'localhost:8000';

const convert = (my: MonthYear): number => {
  return my.year * 12 + my.month;
};

const unconvert = (date: number): MonthYear => {
  return {
    month: date % 12,
    year: date / 12,
  };
};

// Get start and end months to display line graphs
const parseStartEnd = (histories: RatingHistory[]) => {
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;

  for (const history of histories) {
    for (const type in history) {
      const series = history[type];
      if (series !== []) {
        const [firstPoint] = series;
        const lastPoint = series[series.length - 1];

        const seriesMin = convert(firstPoint);
        const seriesMax = convert(lastPoint);

        if (min > seriesMin) {
          min = seriesMin;
        }
        if (max < seriesMax) {
          max = seriesMax;
        }
      } else {
        console.error('Backend should not return empty string');
      }
    }
  }
  return [min, max];
};

const getSeries = (
  series: RatingHistoryPoint[],
  start: number,
  end: number,
) => {
  const newSeries = [];
  if (series === []) return series;

  for (let my = start; my <= end; my++) {
    const point = series.find((point) => convert(point) === my)
    if (point) {
      newSeries.push(point.rating);
    } else {
      newSeries.push(null)
    }
  }
};

// Backend returns sorted history
export const useLichessHistory = (lichessId: string) => {
  const { data, error } = useSWR(`${BACKEND_HOST}/history/lichess/${lichessId}`, fetch)
  if (!data) {
    console.error(error)
  }
  return data
};

export const useFideHistory = (fideId: string) => {
  const { data, error } = useSWR(`${BACKEND_HOST}/history/lichess/${fideId}`, fetch);
  if (!data) {
    console.error(error)
  }
  return data
}