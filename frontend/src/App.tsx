import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PlayersPage from './pages/PlayersPage'
import GamesPage from './pages/GamesPage'
import HomePage from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="games" element={<GamesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
