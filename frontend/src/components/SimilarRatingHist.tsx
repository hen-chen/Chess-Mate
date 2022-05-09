import { Table } from 'react-bootstrap';
import { useSimilarHistToFide, useSimilarHistToLichess } from '../datafetching';
import { SimilarFideHistResult, SimilarHistResult } from '../types';

interface SimilarRatingHistProps {
  id: string;
  // playerType: 'lichess' | 'fide';
}

const SimilarRatingHist = ({ id }: SimilarRatingHistProps) => {
  const data = useSimilarHistToLichess(id, 'blitz', 'classical');

  if (!data) return <>Finding players with similar rating histories...</>;

  const { results } = data;

  if (results && !Array.isArray(results)) {
    console.error(results);
    return <>Error</>;
  }

  const tableRows = results.map(
    ({
      id: fideId,
      score,
      variance,
      numPoints,
      firstName,
      lastName,
      rating,
    }: SimilarFideHistResult) => {
      return (
        <tr key={fideId}>
          <td>
            <a href={`/history?lichessId=${id}&fideId=${fideId}`}>{fideId}</a>
          </td>
          <td>{`${firstName} ${lastName}`}</td>
          <td>{rating}</td>
          <td>{score}</td>
          <td>{numPoints}</td>
          <td>{variance}</td>
        </tr>
      );
    },
  );

  return (
    <>
      <h3>Similar FIDE Players</h3>
      <Table>
        <thead>
          <tr>
            <th>Fide ID</th>
            <th>Name</th>
            <th>Rating</th>
            <th>Difference Score</th>
            <th># of Points</th>
            <th>Variance</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </Table>
    </>
  );
};

export default SimilarRatingHist;
