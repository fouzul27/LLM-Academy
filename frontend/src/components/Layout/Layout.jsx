import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '../../contexts/AppContext';
import './Layout.css';

export default function Layout() {
  const { state, dispatch } = useApp();

  return (
    <div className={`app-layout ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile overlay */}
      {state.mobileSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => dispatch({ type: 'CLOSE_MOBILE_SIDEBAR' })}
        />
      )}
      
      <Sidebar />
      
      <div className="main-area">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
