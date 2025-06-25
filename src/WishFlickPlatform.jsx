import React, { useState } from 'react';
import { useStoredState } from './useStoredState';

// Add custom styles
const customStyles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .gradient-border {
    background: linear-gradient(white, white) padding-box,
                linear-gradient(45deg, #667eea, #764ba2) border-box;
    border: 2px solid transparent;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .card-hover:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  .pulse-glow { animation: pulse-glow 2s ease-in-out infinite alternate; }
  @keyframes pulse-glow {
    from { box-shadow: 0 0 10px rgba(102, 126, 234, 0.3); }
    to { box-shadow: 0 0 20px rgba(102, 126, 234, 0.6), 0 0 30px rgba(102, 126, 234, 0.4); }
  }
  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('wishflick-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  styleSheet.id = 'wishflick-styles';
  document.head.appendChild(styleSheet);
}

const defaultWishlists = [
  {
    id: 1,
    title: 'Мечты о путешествиях',
    items: [
      { id: 1, name: 'Камера Canon EOS R5', price: 350000, collected: 125000, image: '📷' },
      { id: 2, name: 'Чемодан Samsonite', price: 25000, collected: 15000, image: '🧳' }
    ],
    privacy: 'public',
    author: 'Анна Петрова'
  },
  {
    id: 2,
    title: 'Домашний офис мечты',
    items: [
      { id: 3, name: 'MacBook Pro M3', price: 280000, collected: 95000, image: '💻' },
      { id: 4, name: 'Эргономичное кресло', price: 45000, collected: 45000, image: '🪑' }
    ],
    privacy: 'public',
    author: 'Иван Сидоров'
  }
];

export default function WishFlickPlatform() {
  const [currentUser, setCurrentUser] = useStoredState('wishflick_user', null);
  const [currentPage, setCurrentPage] = useStoredState('wishflick_page', 'login');
  const [wishlists, setWishlists] = useStoredState('wishflick_wishlists', defaultWishlists);
  const [posts, setPosts] = useStoredState('wishflick_posts', []);
  const [notifications, setNotifications] = useStoredState('wishflick_notifications', []);
  const [transactions, setTransactions] = useStoredState('wishflick_transactions', []);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Пример простой навигации и отображения wishlists
  if (!currentUser) {
    return (
      <div className="glass-effect" style={{ padding: 40, maxWidth: 400, margin: '60px auto', borderRadius: 20, textAlign: 'center' }}>
        <h2>Вход в WishFlick</h2>
        <button className="gradient-border card-hover" style={{ padding: '10px 30px', borderRadius: 10, fontSize: 18 }}
          onClick={() => setCurrentUser({ name: 'Гость' })}>
          Войти как гость
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)', paddingBottom: 80 }}>
      <header style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontWeight: 800, fontSize: 32 }}>WishFlick</h1>
        <div>
          <span style={{ marginRight: 20 }}>Привет, {currentUser.name}</span>
          <button onClick={() => { setCurrentUser(null); setCurrentPage('login'); }}>Выйти</button>
        </div>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        <h2>Списки желаний</h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {wishlists.map(wl => (
            <div key={wl.id} className="glass-effect gradient-border card-hover animate-float" style={{ borderRadius: 18, minWidth: 260, padding: 24, margin: '12px 0', flex: '1 1 300px' }}>
              <h3 style={{ fontWeight: 700 }}>{wl.title}</h3>
              <div style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>Автор: {wl.author}</div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {wl.items.map(item => (
                  <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 24, marginRight: 10 }}>{item.image}</span>
                    <span style={{ flex: 1 }}>{item.name}</span>
                    <span style={{ marginLeft: 10, fontWeight: 600 }}>{item.collected} / {item.price} ₽</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 10, fontSize: 13, color: '#888' }}>
                Приватность: {wl.privacy === 'public' ? 'Публичный' : 'Приватный'}
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer style={{ textAlign: 'center', padding: 32, color: '#888', fontSize: 15 }}>
        WishFlick © 2025
      </footer>
    </div>
  );
}
