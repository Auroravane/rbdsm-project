import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AmbientStarfield from "./components/AmbientStarfield";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MyGames from "./pages/MyGames";
import GameBoard from "./pages/GameBoard";
import GamePlanner from "./pages/GamePlanner";
import Borrowed from "./pages/Borrowed";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AmbientStarfield />
        <div className="app-route-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/games" element={<MyGames />} />
            <Route path="/games/:gameId/board" element={<GameBoard />} />
            <Route path="/planner" element={<GamePlanner />} />
            <Route path="/borrowed" element={<Borrowed />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;