import { Line } from 'react-chartjs-2';
import {
  useFideHistory,
  useFideName,
  useLichessHistory,
} from '../datafetching';
import {
  RatingHistory,
  MonthYear,
  RatingHistoryPoint,
  ColorMap,
} from '../types';
import { Chart as ChartJS, ChartOptions, registerables } from 'chart.js';
import {
  BLUE_BRIGHT,
  BLUE_DARK,
  BLUE_LIGHT,
  BLUE_MED,
  ORANGE_DARK,
  ORANGE_LIGHT,
  ORANGE_MED,
} from '../style/colors';
ChartJS.register(...registerables);

interface RatingHistoryChartProps {
  fideId: string | null;
  lichessId: string | null;
}

const convert = (my: MonthYear): number => {
  return my.year * 12 + (my.month - 1); // months stored from 1 to 12 :")
};

const display = (date: number) => {
  const month = date % 12;
  const year = Math.floor(date / 12);
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
  return `${displayMonth[month]} ${year}`;
};

const fideColors: ColorMap = {
  blitz: ORANGE_LIGHT,
  rapid: ORANGE_MED,
  classical: ORANGE_DARK,
};

const lichessColors: ColorMap = {
  bullet: BLUE_BRIGHT,
  blitz: BLUE_LIGHT,
  rapid: BLUE_MED,
  classical: BLUE_DARK,
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
  // TODO: better error UI
  if (!lichessId && !fideId) {
    return <>No history to display</>;
  }

  const lichessHistory: RatingHistory = lichessId
    ? useLichessHistory(lichessId)
    : {};
  const fideHistory: RatingHistory = fideId ? useFideHistory(fideId) : {};
  // console.log('FIDE' + fideId);
  // console.log(fideData);

  const [start, end] = parseStartEnd([lichessHistory, fideHistory]);
  // console.log(start, end);
  const labels = getLabels(start, end);
  const datasets = [];

  const fideDisplay = fideId ? useFideName(fideId) || fideId : '';
  const lichessDisplay = lichessId || '';

  if (fideId) {
    for (const type in fideHistory) {
      const data = parseSeries(fideHistory[type], start, end);
      // console.log(data)
      datasets.push({
        label: `${fideDisplay} - ${type}`,
        data,
        spanGaps: true,
        borderColor: lichessColors[type],
      });
    }
  }

  for (const type in lichessHistory) {
    const data = parseSeries(lichessHistory[type], start, end);
    datasets.push({
      label: `${lichessId} - ${type}`,
      data,
      spanGaps: true,
      borderColor: fideColors[type],
    });
  }

  const data = {
    labels: labels,
    datasets,
  };

  const title = `Rating History of ${lichessDisplay}${
    lichessId && fideId ? ' and ' : ''
  }${fideDisplay}`;
  const options: ChartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        position: 'top',
        text: title,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default RatingHistoryChart;
