import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

const Navbar = () => {
  const [logUser, setLogUser] = useState<string | null>('');
  const nav = useNavigate();

  useEffect(() => {
    // get the logged user
    let loggedUser: string | null = null;
    if (window.localStorage.getItem('username') !== undefined) {
      loggedUser = window.localStorage.getItem('username');
      setLogUser(loggedUser);
    }
  }, []);

  return (
    <nav className="d-flex navbar-light bg-light justify-content-between align-items-center">
      <div className="navbar-brand p-1">
        <h1>ChessMate</h1>
      </div>
      {/* <SearchBar /> */}
      <div className="nav-item p-2">
        {logUser ? (
          <button
            type="button"
            className="btn mx-1 btn-danger"
            onClick={() => {
              window.localStorage.removeItem('username');
              nav('/login');
              window.alert('Logout successful!');
            }}
          >
            Logout
          </button>
        ) : (
          <button
            type="button"
            className="btn mx-1 btn-primary"
            onClick={() => nav('/login')}
          >
            Login to like users!
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
