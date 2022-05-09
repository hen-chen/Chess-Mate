import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Spinner, Button } from 'react-bootstrap';
import axios from 'axios';

import * as CONSTANTS from '../constants';
import PlayerResults from '../components/PlayerResults';

const PlayersPage = () => {
  const [searchQuery, setSearchQuery] = useSearchParams();
  const [result, setResult] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // likes
  const [logUser, setLogUser] = useState<string | null>('');
  const [likes, setLikes] = useState<string[]>([]);

  // get the query of the URL
  useEffect(() => {
    setSearchQuery(searchQuery); // to avoid lint error
    const query = searchQuery.get('q');
    const url = `${CONSTANTS.HOST}/players?p=${query}`;

    // note the logged user
    let loggedUser: string | null = null;
    if (window.localStorage.getItem('username') !== undefined) {
      loggedUser = window.localStorage.getItem('username');
      setLogUser(loggedUser);
    }

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

      // check if user likes the player
      if (loggedUser) {
        const likesUrl = `${CONSTANTS.HOST}/users/liked/${loggedUser}`;
        await axios
          .get(likesUrl)
          .then((res: { data: { result: string[] } }) => {
            if (!res || !res.data || !res.data || !res.data.result) {
              setLikes([]);
            } else {
              setLikes(res.data.result);
            }
          });
      }
      setLoading(false);
    }
    search();
  }, []);

  const checkIfLiked = (username: string) => likes.includes(username);

  // put in database the newly liked/deleted player
  const unlikeOrLike = async (username: string) => {
    const url = `${CONSTANTS.HOST}/users/liked/${logUser}/${username}`;
    if (!checkIfLiked(username)) {
      await axios.put(url).then(() => setLikes([...likes, username]));
    } else {
      await axios
        .delete(url)
        .then(() => setLikes(likes.filter((u) => u !== username)));
    }
  };

  return (
    <>
      {/* fetching results, so spinner */}
      {loading && (
        <div className="div-center">
          <Spinner animation="border" role="status" variant="warning">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h1> Loading... </h1>
        </div>
      )}

      {!loading && (
        // query to get player has loaded
        <div className="container">
          <h1> Player Review </h1>
          <Link to="/">Back to Home!</Link>
          <br />
          <Link to={`/games/${searchQuery.get('q')}`}>View Games</Link>
          <br />
          {result ? (
            <>
              <h2> Results for {result.username} </h2>
              <hr />

              {/* display favorite button */}
              {logUser && (
                <Button
                  variant={
                    checkIfLiked(result.username)
                      ? 'warning'
                      : 'outline-warning'
                  }
                  size="sm"
                  onClick={() => {
                    unlikeOrLike(result.username);
                  }}
                >
                  Favorite ⭑
                </Button>
              )}

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
