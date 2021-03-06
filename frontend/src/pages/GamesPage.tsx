import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as CONSTANTS from '../constants';

const GamesPage = () => {
  const { user } = useParams();
  const [gamePreviews, setGamePreviews] = useState([]);
  const [similar, setSimilar] = useState<any[] | null>([]);
  const [page, setPage] = useState<number>(0);
  const nav = useNavigate();

  const getSimilarOpenings = async () => {
    const {
      data: { results },
    } = await axios.get(`${CONSTANTS.HOST}/getSimilarPlayersOpenings/${user}`);
    console.log(results);
    setSimilar(results);
  };

  useEffect(() => {
    (async () => {
      const {
        data: { results },
      } = await axios.get(`${CONSTANTS.HOST}/getGames/${user}`);
      console.log(results);
      setGamePreviews(results);
    })();
  }, []);

  return (
    <div style={{ margin: 30, padding: 20 }}>
      <div className="row">
        <div className="col-3">
          <h3 style={{ marginBottom: 20 }}>
            Find Players with Similar Openings
          </h3>
          {similar === null || similar.length === 0 ? (
            <button
              className="btn btn-primary"
              disabled={similar === null}
              onClick={() => {
                setSimilar(null);
                getSimilarOpenings();
              }}
            >
              {similar === null ? <div className="spinner-border" /> : `Go!`}
            </button>
          ) : (
            <ul className="pagination">
              <li className="page-item">
                <button
                  className="page-link"
                  aria-label="Previous"
                  onClick={() => setPage(page - 1)}
                >
                  <span aria-hidden="true">&laquo;</span>
                </button>
              </li>
              <li className="page-item active">
                <a className="page-link">{`${page * 100 + 1}-${
                  (page + 1) * 100
                }`}</a>
              </li>
              <li className="page-item">
                <button
                  className="page-link"
                  aria-label="Next"
                  onClick={() => setPage(page + 1)}
                >
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </li>
            </ul>
          )}
          <ul style={{ overflowY: 'scroll', maxHeight: '45vh' }}>
            {similar
              ?.slice(page * 100, (page + 1) * 100)
              .map(({ username }) => (
                <li key={username}>
                  <a href={`/games/${username}`}>{username}</a>
                </li>
              ))}
          </ul>
        </div>
        <div className="col-9">
          <h3 style={{ marginBottom: 20 }}>{`Games of ${user}`}</h3>
          <div className="d-flex flex-column align-items-stretch">
            {gamePreviews.map(({ id, whiteId, blackId, timeControl, date }) => (
              <div key={id}>
                <li>
                  <a href={`/game/${id}`}>
                    {timeControl} vs. {whiteId === user ? blackId : whiteId} on{' '}
                    {date}
                  </a>
                </li>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
