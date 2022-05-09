import axios from 'axios';
import React, { useState } from 'react';
import { Spinner, Card, Button } from 'react-bootstrap';

import * as CONSTANTS from '../constants';

const PoorGames = () => {
  const [elo, setElo] = useState('');
  const [poorGamesResults, setPoorGamesResults] = useState<any>([]);
  const [poorGamesLoading, setPoorGamesLoading] = useState(false);

  const poorGames = async () => {
    const url = `${CONSTANTS.HOST}/poorPlayers/${elo}`;
    await axios.get(url).then((res: { data: { results: any[] } }) => {
      if (!res || !res.data || !res.data || !res.data.results) {
        setPoorGamesResults([]);
      } else {
        setPoorGamesResults(res.data.results);
      }
    });
    setPoorGamesLoading(false);
  };

  return (
    <div className="container">
      <h3>
        Find some poor level games (sum of elo is less than 2400), and determine
        the playtime of all the players playtime.
      </h3>

      <br />

      {poorGamesLoading ? (
        <div className="div-center">
          <Spinner animation="border" role="status" variant="info">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h1> Loading results...</h1>
        </div>
      ) : (
        <>
          <input
            onChange={(e) => setElo(e.target.value)}
            placeholder="enter a positive elo"
          />

          <Button
            variant="danger"
            disabled={parseInt(elo) <= 0}
            onClick={() => {
              setPoorGamesLoading(true);
              poorGames();
            }}
          >
            Submit Elo!
          </Button>
        </>
      )}

      {poorGamesResults &&
        poorGamesResults.map(
          (
            user: { username: any; totalPlayTime: number; fideRating: any },
            i: number,
          ) => {
            const { username, totalPlayTime, fideRating } = user;
            return (
              <Card key={i} style={{ marginBottom: '1rem' }}>
                {username} - Hours Played: {Math.ceil(totalPlayTime / 3600)} -
                FIDERating: {fideRating}
              </Card>
            );
          },
        )}
    </div>
  );
};

export default PoorGames;
