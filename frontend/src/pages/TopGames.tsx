import axios from 'axios';
import React, { useState } from 'react';
import { Spinner, Card, Button } from 'react-bootstrap';

import * as CONSTANTS from '../constants';

const TopGames = () => {
  // top game query
  const [elo, setElo] = useState('');
  const [topGamesResults, setTopGamesResults] = useState<any>([]);
  const [topGamesLoading, setTopGamesLoading] = useState(false);

  // poor games query

  const topGames = async () => {
    console.log(elo);
    const url = `${CONSTANTS.HOST}/topGamesCountryPlayers/${elo}`;
    await axios.get(url).then((res: { data: { results: any[] } }) => {
      if (!res || !res.data || !res.data || !res.data.results) {
        setTopGamesResults([]);
      } else {
        setTopGamesResults(res.data.results);
      }
    });
    setTopGamesLoading(false);
  };

  return (
    <div className="container">
      <h3>
        Find all the countries that have top players. Get all the players that
        are in these countries. Specify the elo for the threshold of the elo.
      </h3>

      <br />

      {topGamesLoading ? (
        <div className="div-center">
          <Spinner animation="border" role="status" variant="danger">
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
            variant="info"
            disabled={parseInt(elo) <= 0}
            onClick={() => {
              setTopGamesLoading(true);
              topGames();
            }}
          >
            Submit Elo!
          </Button>
        </>
      )}

      {topGamesResults &&
        topGamesResults.map((user: { username: any; country: any; fideRating: any; }, i: number) => {
          const { username, country, fideRating } = user;
          return (
            <Card key={i} style={{ marginBottom: '1rem' }}>
              {username} - From {country} - FIDERating: {fideRating}
            </Card>
          );
        })}
    </div>
  );
};

export default TopGames;
