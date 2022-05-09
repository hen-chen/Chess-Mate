import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as CONSTANTS from '../constants';
import SearchBar from '../components/SearchBar';

const HomePage = () => {
  // likes states
  const [logUser, setLogUser] = useState<string | null>('');
  const [likes, setLikes] = useState<string[]>([]);

  const nav = useNavigate();

  useEffect(() => {
    // get the logged user
    let loggedUser: string | null = null;
    if (window.localStorage.getItem('username') !== undefined) {
      loggedUser = window.localStorage.getItem('username');
      setLogUser(loggedUser);
    }

    // find the liked users of the logged user
    const likesUrl = `${CONSTANTS.HOST}/users/liked/${loggedUser}`;
    async function search() {
      // check if user likes the player
      await axios.get(likesUrl).then((res: { data: { result: string[] } }) => {
        if (!res || !res.data || !res.data || !res.data.result) {
          setLikes([]);
        } else {
          setLikes(res.data.result);
        }
      });
    }
    if (loggedUser) {
      search();
    }
  }, []);

  return (
    <div className="container-sm p-4 d-flex flex-column align-items-start">
      {/* the search bar for players */}
      <SearchBar />

      {/* display liked usernamees */}
      {logUser && (
        <>
          <h3> Your Liked Users </h3>
          {likes.map((user, i) => {
            return <h4 key={i}> {user} </h4>;
          })}
        </>
      )}
    </div>
  );
};

export default HomePage;
