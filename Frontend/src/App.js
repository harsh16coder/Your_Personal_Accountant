import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AssetView from './pages/AssetView';
import LiabilityView from './pages/LiabilityView';
import RecommendationView from './pages/RecommendationView';
import { isAuthenticated } from './utils/auth';
import './index.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/assets" element={
            <ProtectedRoute>
              <AssetView />
            </ProtectedRoute>
          } />
          <Route path="/liabilities" element={
            <ProtectedRoute>
              <LiabilityView />
            </ProtectedRoute>
          } />
          <Route path="/recommendations" element={
            <ProtectedRoute>
              <RecommendationView />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;