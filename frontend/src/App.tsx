import { BrowserRouter, Route, Routes } from 'react-router-dom';

import PlayersPage from './pages/PlayersPage';
import GamesPage from './pages/GamesPage';
import HomePage from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import TopGames from './pages/TopGames';

import './App.css';
import RatingHistory from './pages/RatingHistory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="games" element={<GamesPage />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="history" element={<RatingHistory />} />
        <Route path="topGamesPlayers" element={<TopGames />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
