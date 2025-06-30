import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EnhancedAuthProvider, useAuth } from './components/Auth/EnhancedAuthProvider';
import { EnhancedLoginScreen } from './components/Auth/EnhancedLoginScreen';
import { AuthCallback } from './components/Auth/AuthCallback';
import { EnhancedDashboard } from './components/Dashboard/EnhancedDashboard';
import { WishlistDetailScreen } from './components/WishList/WishlistDetailScreen';
import { ProfileScreen } from './components/Profile/ProfileScreen';
import { FriendsManager } from './components/Friends/FriendsManager';
import { ProductRecommendations } from './components/Products/ProductRecommendations';
import { LoadingSpinner } from './components/Layout/LoadingSpinner';

const AuthRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Проверка авторизации..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <EnhancedLoginScreen />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загрузка..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Загрузка приложения..." />
          <div className="mt-4">
            <p className="text-xs text-gray-400 mt-2">
              Если загрузка затянулась, обновите страницу
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <EnhancedDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/wishlist/:id" 
        element={
          <ProtectedRoute>
            <WishlistDetailScreen />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/friends" 
        element={
          <ProtectedRoute>
            <FriendsManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/recommendations" 
        element={
          <ProtectedRoute>
            <ProductRecommendations />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  console.log('🚀 Запуск приложения WishFlick');
  
  return (
    <Router>
      <EnhancedAuthProvider>
        <AppContent />
      </EnhancedAuthProvider>
    </Router>
  );
}

export default App;