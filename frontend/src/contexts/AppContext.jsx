import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const AppContext = createContext(null);

const defaultState = {
  auth: {
    isAuthenticated: false,
    isLoading: true,
    user: null,
  },
  user: {
    id: null,
    name: 'Learner',
    email: '',
    level: 'beginner', // beginner, intermediate, advanced
    goal: 'Build my own LLM',
    avatar: null,
    joinedDate: new Date().toISOString(),
  },
  progress: {
    coursesEnrolled: 0,
    lessonsCompleted: 0,
    learningHours: 0,
    currentStreak: 0,
    quizzesTaken: 0,
    quizAvgScore: 0,
    currentStage: 1,
    completedLessons: [],
    completedCourses: [],
    quizScores: {},
    enrolledCourses: [],
  },
  settings: {
    learningLevel: 'beginner',
    language: 'english',
    learningGoal: 'Build my own LLM',
    tutorPersonality: 'patient',
  },
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        auth: { ...state.auth, isLoading: true },
      };

    case 'AUTH_SUCCESS': {
      const u = action.payload;
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          isLoading: false,
          user: u,
        },
        user: {
          ...state.user,
          id: u.id,
          name: u.full_name || 'Learner',
          email: u.email || '',
          level: u.learning_level || 'beginner',
          goal: u.learning_goal || 'Build my own LLM',
        },
        settings: {
          ...state.settings,
          learningLevel: u.learning_level || 'beginner',
          learningGoal: u.learning_goal || 'Build my own LLM',
          language: u.preferred_language || 'english',
          tutorPersonality: u.tutor_preferences || 'patient',
        },
      };
    }

    case 'AUTH_FAILURE':
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          isLoading: false,
          user: null,
        },
      };

    case 'AUTH_LOGOUT':
      return {
        ...defaultState,
        auth: {
          isAuthenticated: false,
          isLoading: false,
          user: null,
        },
      };

    case 'SET_USER_LEVEL':
      return {
        ...state,
        user: { ...state.user, level: action.payload },
        settings: { ...state.settings, learningLevel: action.payload },
      };

    case 'COMPLETE_LESSON': {
      const lessonId = action.payload;
      if (state.progress.completedLessons.includes(lessonId)) return state;
      return {
        ...state,
        progress: {
          ...state.progress,
          lessonsCompleted: state.progress.lessonsCompleted + 1,
          completedLessons: [...state.progress.completedLessons, lessonId],
        },
      };
    }

    case 'ENROLL_COURSE': {
      const courseId = action.payload;
      if (state.progress.enrolledCourses.includes(courseId)) return state;
      return {
        ...state,
        progress: {
          ...state.progress,
          coursesEnrolled: state.progress.coursesEnrolled + 1,
          enrolledCourses: [...state.progress.enrolledCourses, courseId],
        },
      };
    }

    case 'COMPLETE_COURSE': {
      const courseId = action.payload;
      if (state.progress.completedCourses.includes(courseId)) return state;
      return {
        ...state,
        progress: {
          ...state.progress,
          completedCourses: [...state.progress.completedCourses, courseId],
        },
      };
    }

    case 'RECORD_QUIZ_SCORE':
      return {
        ...state,
        progress: {
          ...state.progress,
          quizzesTaken: state.progress.quizzesTaken + 1,
          quizScores: {
            ...state.progress.quizScores,
            [action.payload.quizId]: action.payload.score,
          },
        },
      };

    case 'UPDATE_LEARNING_HOURS':
      return {
        ...state,
        progress: {
          ...state.progress,
          learningHours: state.progress.learningHours + action.payload,
        },
      };

    case 'UPDATE_STREAK':
      return {
        ...state,
        progress: {
          ...state.progress,
          currentStreak: action.payload,
        },
      };

    case 'SET_CURRENT_STAGE':
      return {
        ...state,
        progress: {
          ...state.progress,
          currentStage: action.payload,
        },
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case 'TOGGLE_MOBILE_SIDEBAR':
      return { ...state, mobileSidebarOpen: !state.mobileSidebarOpen };

    case 'CLOSE_MOBILE_SIDEBAR':
      return { ...state, mobileSidebarOpen: false };

    case 'RESET_PROGRESS':
      return { ...state, progress: defaultState.progress };

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, defaultState, (initial) => {
    try {
      const saved = localStorage.getItem('llm-academy-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initial,
          ...parsed,
          auth: { isAuthenticated: false, isLoading: true, user: null },
          mobileSidebarOpen: false,
        };
      }
    } catch (e) {
      console.warn('Failed to load saved state:', e);
    }
    return initial;
  });

  // Verify session with backend on application boot
  useEffect(() => {
    let isMounted = true;
    async function checkAuthSession() {
      try {
        const res = await api.getCurrentUser();
        if (isMounted) {
          if (res && res.user) {
            dispatch({ type: 'AUTH_SUCCESS', payload: res.user });
          } else {
            dispatch({ type: 'AUTH_FAILURE' });
          }
        }
      } catch (_err) {
        if (isMounted) {
          dispatch({ type: 'AUTH_FAILURE' });
        }
      }
    }

    checkAuthSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist user-specific progress to localStorage
  useEffect(() => {
    const { auth: _authUnused, mobileSidebarOpen: _unused, ...toSave } = state;
    if (state.auth.isAuthenticated && state.user.id) {
      localStorage.setItem(`llm-academy-state-u${state.user.id}`, JSON.stringify(toSave));
    }
  }, [state]);

  const loginUser = useCallback(async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    const res = await api.login(credentials);
    dispatch({ type: 'AUTH_SUCCESS', payload: res.user });
    return res.user;
  }, []);

  const signupUser = useCallback(async (data) => {
    dispatch({ type: 'AUTH_START' });
    const res = await api.signup(data);
    dispatch({ type: 'AUTH_SUCCESS', payload: res.user });
    return res.user;
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        loginUser,
        signupUser,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
