import { useSearchParams } from 'react-router-dom';
import RatingHistoryChart from '../components/RatingHistoryChart';

const RatingHistory = () => {
  const [searchQuery, ] = useSearchParams();
  const fideId = searchQuery.get("fideId")
  const lichessId = searchQuery.get("lichessId")

  return <RatingHistoryChart lichessId={lichessId} fideId={fideId}/>;
};

export default RatingHistory;
