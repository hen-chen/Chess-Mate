import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { useFideHistory, useLichessHistory } from '../datafetching';
import { RatingHistory, MonthYear, RatingHistoryPoint } from '../types';

interface RatingHistoryChartProps {
  fideId: string | null;
  lichessId: string | null;
}

const convert = (my: MonthYear): number => {
  return my.year * 12 + my.month;
};

const display = (date: number) => {
  const month = date % 12;
  const year = date / 12;
  const displayMonth = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${displayMonth[month - 1]} ${year}`;
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

const parseSeries = (
  series: RatingHistoryPoint[],
  start: number,
  end: number,
) => {
  const newSeries = [];
  if (series === []) return series;

  for (let my = start; my <= end; my++) {
    const point = series.find((point) => convert(point) === my);
    if (point) {
      newSeries.push(point.rating);
    } else {
      newSeries.push(null);
    }
  }
  return newSeries;
};

const getLabels = (start: number, end: number) => {
  const labels = [];
  for (let date = start; date <= end; date++) {
    labels.push(display(date));
  }
  return labels;
};

const RatingHistoryChart = ({ fideId, lichessId }: RatingHistoryChartProps) => {
  const lichessHistory: RatingHistory = lichessId
    ? useLichessHistory(lichessId)
    : {};
  const fideHistory: RatingHistory = fideId ? useFideHistory(fideId) : {};
  // console.log('FIDE' + fideId);
  // console.log(fideData);

  const [start, end] = parseStartEnd([lichessHistory, fideHistory]);
  console.log(start, end);
  const labels = getLabels(start, end);
  const datasets = [];

  for (const type in fideHistory) {
    const data = parseSeries(fideHistory[type], start, end);
    // console.log(data)
    datasets.push({
      label: `Type: ${type}`,
      data,
    });
  }

  const data = {
    labels: labels,
    datasets,
  };

  return <Line data={data} />;
};

export default RatingHistoryChart;
