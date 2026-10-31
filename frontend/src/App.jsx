import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import AIWorkspace from './pages/Workspace/AIWorkspace';
import Dashboard from './pages/Dashboard/Dashboard';
import AITutor from './pages/AITutor/AITutor';
import Roadmap from './pages/Roadmap/Roadmap';
import Courses from './pages/Courses/Courses';
import CourseDetail from './pages/Courses/CourseDetail';
import Playground from './pages/Playground/Playground';
import ModelLab from './pages/ModelLab/ModelLab';
import Quizzes from './pages/Quizzes/Quizzes';
import Progress from './pages/Progress/Progress';
import Settings from './pages/Settings/Settings';

function PublicAuthRoute({ children }) {
  const { state } = useApp();
  if (!state.auth.isLoading && state.auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <Login />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicAuthRoute>
            <Signup />
          </PublicAuthRoute>
        }
      />

      {/* Protected Learning Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workspace" element={<AIWorkspace />} />
          <Route path="tutor" element={<AITutor />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="playground" element={<Playground />} />
          <Route path="model-lab" element={<ModelLab />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="progress" element={<Progress />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
