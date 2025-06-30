import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EnhancedLoginScreen } from './components/Auth/EnhancedLoginScreen';
import { AuthCallback } from './components/Auth/AuthCallback';
import { EnhancedDashboard } from './components/Dashboard/EnhancedDashboard';
import { WishlistDetailScreen } from './components/WishList/WishlistDetailScreen';
import { ProfileScreen } from './components/Profile/ProfileScreen';
import { FriendsManager } from './components/Friends/FriendsManager';
import { ProductRecommendations } from './components/Products/ProductRecommendations';
import { LoadingSpinner } from './components/Layout/LoadingSpinner';
import { ErrorHandler } from './lib/errorHandler';

const AuthRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Проверка авторизации..." />
      </div>
    );
  }

  // Если пользователь уже авторизован и не гость, или гость не хочет регистрироваться
  if (user && (!user.is_guest || mode !== 'register')) {
    return <Navigate to="/" replace />;
  }

  return <EnhancedLoginScreen />;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('🎯 App: Current state', { hasUser: !!user, loading });

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
      <Route 
        path="/auth" 
        element={<AuthRoute />} 
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
        path="/friends" 
        element={user ? <FriendsManager /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/recommendations" 
        element={user ? <ProductRecommendations /> : <Navigate to="/auth" replace />} 
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
  
  // Инициализируем обработчик ошибок
  React.useEffect(() => {
    console.log('🔧 App: Error handler initialized');
  }, []);
  
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;