import { useFideHistory, useLichessHistory } from '../datafetching';

interface RatingHistoryChartProps {
  fideId?: string;
  lichessId?: string;
}


const RatingHistoryChart = ({
  fideId,
  lichessId
}: RatingHistoryChartProps) => {
  // const labels = Utils.months({ count: 7 });
  const lichessData = lichessId && useLichessHistory(lichessId);
  const fideData = fideId && useFideHistory(fideId);
  console.log(lichessData)

  // const data = {
  //   labels: labels,
  //   datasets: [
  //     {
  //       label: 'My First Dataset',
  //       data: [65, 59, 80, 81, 56, 55, 40],
  //       fill: false,
  //       borderColor: 'rgb(75, 192, 192)',
  //       tension: 0.1,
  //     },
  //   ],
  // };

  // return <Line data={data} />;
  return <></>
};

export default RatingHistoryChart;