import { useSearchParams } from 'react-router-dom';
import RatingHistoryChart from '../components/RatingHistoryChart';

const RatingHistory = () => {
  const [searchQuery] = useSearchParams();
  const fideId = searchQuery.get('fideId');
  const lichessId = searchQuery.get('lichessId');

  return (
    <div style={{ margin: 20, maxHeight: 600 }}>
      <RatingHistoryChart lichessId={lichessId} fideId={fideId} />
    </div>
  );
};

export default RatingHistory;
