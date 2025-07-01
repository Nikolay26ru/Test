import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './contexts/QueryContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthScreen } from './components/auth/AuthScreen';
import { AuthCallback } from './components/auth/AuthCallback';
import { Dashboard } from './components/dashboard/Dashboard';
import { WishlistDetail } from './components/wishlists/WishlistDetail';

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route 
                  path="/auth" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <AuthScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wishlist/:id" 
                  element={
                    <ProtectedRoute>
                      <WishlistDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<div>404 - Страница не найдена</div>} />
              </Routes>
              
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;