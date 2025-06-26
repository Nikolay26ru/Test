import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EnhancedLoginScreen } from './components/Auth/EnhancedLoginScreen';
import { AuthCallback } from './components/Auth/AuthCallback';
import { EnhancedDashboard } from './components/Dashboard/EnhancedDashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/" replace /> : <EnhancedLoginScreen />} 
      />
      <Route 
        path="/auth/callback" 
        element={<AuthCallback />} 
      />
      <Route 
        path="/" 
        element={user ? <EnhancedDashboard /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to={user ? "/" : "/auth"} replace />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;