import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EnhancedLoginScreen } from './components/Auth/EnhancedLoginScreen';
import { AuthCallback } from './components/Auth/AuthCallback';
import { EnhancedDashboard } from './components/Dashboard/EnhancedDashboard';
import { WishlistDetailScreen } from './components/WishList/WishlistDetailScreen';
import { ProfileScreen } from './components/Profile/ProfileScreen';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('🎯 App: Current state', { hasUser: !!user, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
          <p className="text-xs text-gray-400 mt-2">
            Проверьте консоль разработчика для подробной информации
          </p>
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
        path="/wishlist/:id" 
        element={user ? <WishlistDetailScreen /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/profile" 
        element={user ? <ProfileScreen /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to={user ? "/" : "/auth"} replace />} 
      />
    </Routes>
  );
};

function App() {
  console.log('🚀 App: Starting application...');
  
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;