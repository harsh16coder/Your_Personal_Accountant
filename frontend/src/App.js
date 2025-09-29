import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AssetView from './pages/AssetView';
import LiabilityView from './pages/LiabilityView';
import RecommendationView from './pages/RecommendationView';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets" element={<AssetView />} />
          <Route path="/liabilities" element={<LiabilityView />} />
          <Route path="/recommendations" element={<RecommendationView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;