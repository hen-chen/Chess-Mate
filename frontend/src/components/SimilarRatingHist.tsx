import { Table } from 'react-bootstrap';
import { useSimilarHistToFide } from '../datafetching';
import { SimilarHistResult } from '../types';

interface SimilarRatingHistProps {
  id: string;
  // playerType: 'lichess' | 'fide';
}

const SimilarRatingHist = ({ id }: SimilarRatingHistProps) => {
  const { results } = useSimilarHistToFide(id, 'classical', 'blitz');

  if (!results) return <>Finding players with similar rating histories...</>;

  if (results && !Array.isArray(results)) {
    console.error(results);
  }

  const tableRows = results.map(
    ({ lichessId, score, variance, numPoints }: SimilarHistResult) => {
      return (
        <tr key={lichessId}>
          <td>
            <a href={`/history?lichessId=${lichessId}&fideId=${id}`}>
              {lichessId}
            </a>
          </td>
          <td>{score}</td>
          <td>{variance}</td>
          <td>{numPoints}</td>
        </tr>
      );
    },
  );

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Score</th>
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
