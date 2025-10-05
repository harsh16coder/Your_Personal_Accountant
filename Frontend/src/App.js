import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import AssetView from './pages/AssetView';
import LiabilityView from './pages/LiabilityView';
import RecommendationView from './pages/RecommendationView';
import { DataRefreshProvider } from './contexts/DataRefreshContext';
import { isAuthenticated } from './utils/auth';
import './index.css';

// Protected Route component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Public Route component - redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <DataRefreshProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes - redirect to dashboard if authenticated */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            
            {/* Protected routes - redirect to login if not authenticated */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
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
            
            {/* Catch-all route - redirect based on authentication status */}
            <Route path="*" element={
              isAuthenticated() ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
            } />
          </Routes>
        </div>
      </Router>
    </DataRefreshProvider>
  );
}

export default App;