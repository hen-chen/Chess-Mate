import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';

import * as CONSTANTS from '../constants';
import PlayerResults from '../components/PlayerResults';

const PlayersPage = () => {
  const [searchQuery, setSearchQuery] = useSearchParams();
  const [result, setResult] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // get the query of the URL
  useEffect(() => {
    setSearchQuery(searchQuery); // to avoid lint error
    const query = searchQuery.get('q');
    const url = `${CONSTANTS.HOST}/players?p=${query}`; // TODO

    // calls the backend
    async function search() {
      await axios.get(url).then((res: { data: { results: any[] } }) => {
        // check if results are empty
        if (!res || !res.data || !res.data || !res.data.results) {
          setResult([]);
        } else {
          setResult(res.data.results[0]);
        }
      });
      setLoading(false);
    }
    search();
  }, []);

  return (
    <>
      {/* fetching results, so spinner */}
      {loading && (
        <>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h1> Loading... </h1>
        </>
      )}

      {!loading && (
        // query to get player has loaded
        <div className="container">
          <h1> Player Review </h1>
          <Link to="/">Back to Home!</Link>

          <br />
          <h2> Results: </h2>
          <hr />
          {result ? (
            <>
              {/* result={result} doesn't work for some reason */}
              <PlayerResults {...result} />
            </>
          ) : (
            <h2> No such username found! :( </h2>
          )}
        </div>
      )}
    </>
  );
};

export default PlayersPage;
