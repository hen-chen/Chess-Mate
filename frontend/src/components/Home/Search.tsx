import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const nav = useNavigate();

  return (
    <div className="container">
      <Form>
        <Form.Control
          type="text"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          onKeyPress={(e) => {
            if (e.code === 'Enter' && searchQuery.trim().length) {
              // TODO: given query, e.g. add backend that loads player page
              nav(`/searchPlayer?q=${searchQuery}`);
            }
          }}
        />
        <button
          disabled={!searchQuery.trim().length}
          className="btn btn-info btn-small"
          type="button"
          onClick={() => nav(`/searchPlayer?q=${searchQuery}`)}
        >
          Search
        </button>
      </Form>
    </div>
  );
};

export default Search;
