import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

export default function ProtectedRoute() {
  const { state } = useApp();
  const location = useLocation();

  if (state.auth.isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-main, #FFFDF8)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--lavender-light, #EAE2F8)',
            borderTopColor: 'var(--lavender, #A995D6)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: 'var(--text-secondary, #85818E)', fontSize: '0.875rem' }}>
          Loading your learning environment...
        </p>
      </div>
    );
  }

  if (!state.auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

