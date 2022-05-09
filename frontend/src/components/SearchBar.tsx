import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const nav = useNavigate();

  return (
    <form className="row g-3">
      <div className="col-auto">
        <input
          className="form-control "
          type="search"
          placeholder="Search Player (e.g. -tristan-)"
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.code === 'Enter' && searchQuery.trim().length) {
              nav(`/players?q=${searchQuery}`);
            }
          }}
        />
      </div>
      <div className="col-auto">
        <button
          disabled={!searchQuery.trim().length}
          className="btn btn-outline-success my-2 my-sm-0"
          type="submit"
          onClick={() => nav(`/players?q=${searchQuery}`)}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default Search;
