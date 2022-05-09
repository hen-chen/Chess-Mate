import { BrowserRouter, Route, Routes } from 'react-router-dom';

import PlayersPage from './pages/PlayersPage';
import GamesPage from './pages/GamesPage';
import HomePage from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import TopGames from './pages/TopGames';
import PoorGames from './pages/PoorGames';

import './App.css';
import RatingHistory from './pages/RatingHistory';
import GamePage from './pages/GamePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="games/:user" element={<GamesPage />} />
        <Route path="game/:id" element={<GamePage />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="history" element={<RatingHistory />} />
        <Route path="topGames" element={<TopGames />} />
        <Route path="poorGames" element={<PoorGames />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
