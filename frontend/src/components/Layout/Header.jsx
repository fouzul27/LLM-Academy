import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Search, Bell, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import './Header.css';

const pageTitles = {
  '/': 'Dashboard',
  '/workspace': 'AI Build Workspace',
  '/tutor': 'AI Tutor',
  '/roadmap': 'Learning Roadmap',
  '/courses': 'Courses',
  '/playground': 'Code Playground',
  '/model-lab': 'Model Lab',
  '/quizzes': 'Quizzes',
  '/progress': 'My Progress',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch, logoutUser } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  let title = pageTitles[location.pathname] || 'LLM Academy';
  if (location.pathname.startsWith('/courses/')) title = 'Course Details';
  if (location.pathname.startsWith('/quizzes/')) title = 'Quiz Assessment';

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logoutUser();
    navigate('/login', { replace: true });
  };

  const userInitial = (state.user.name || 'U').charAt(0).toUpperCase();

  return (
    <header className="app-header">
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => dispatch({ type: 'TOGGLE_MOBILE_SIDEBAR' })}
        aria-label="Toggle menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="header-search">
          <Search size={16} />
          <input type="text" placeholder="Search concepts, lessons..." className="search-input" />
        </div>

        {/* Notifications */}
        <button className="header-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        {/* Level badge */}
        <div className={`header-level level-${state.user.level || 'beginner'}`}>
          <span className="level-dot"></span>
          <span className="level-text">
            {(state.user.level || 'beginner').charAt(0).toUpperCase() + (state.user.level || 'beginner').slice(1)}
          </span>
        </div>

        {/* User profile dropdown */}
        <div className="user-profile-menu" ref={menuRef}>
          <button
            className="header-avatar-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="User account menu"
            aria-expanded={menuOpen}
          >
            <div className="header-avatar">
              <span>{userInitial}</span>
            </div>
            <span className="user-display-name">{state.user.name}</span>
            <ChevronDown size={14} className={`menu-chevron ${menuOpen ? 'rotated' : ''}`} />
          </button>

          {menuOpen && (
            <div className="profile-dropdown card fade-in">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">{userInitial}</div>
                <div className="dropdown-details">
                  <span className="dropdown-name">{state.user.name}</span>
                  <span className="dropdown-email">{state.user.email}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <div className="dropdown-meta">
                <div className="meta-row">
                  <span className="meta-label">Level:</span>
                  <span className="meta-val">{state.user.level || 'Beginner'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Goal:</span>
                  <span className="meta-val">{state.user.goal || 'Build my own LLM'}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <Link
                to="/settings"
                className="dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                <SettingsIcon size={16} />
                <span>Account & Preferences</span>
              </Link>

              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
