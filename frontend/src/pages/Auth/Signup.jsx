import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, BookOpen, Target } from 'lucide-react';
import './Auth.css';

export default function Signup() {
  const { signupUser } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [learningLevel, setLearningLevel] = useState('beginner');
  const [learningGoal, setLearningGoal] = useState('Build my own LLM');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await signupUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        learning_level: learningLevel,
        learning_goal: learningGoal,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-container card signup-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles className="auth-logo-icon" size={24} />
          </div>
          <h1 className="auth-title">Join LLM Academy</h1>
          <p className="auth-subtitle">
            Create your account to begin your personal AI-powered education.
          </p>
        </div>

        {error && (
          <div className="auth-alert error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input
                id="fullName"
                type="text"
                required
                className="form-input"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                required
                className="form-input"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="learningLevel">
                <BookOpen size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Skill Level
              </label>
              <select
                id="learningLevel"
                className="form-select"
                value={learningLevel}
                onChange={(e) => setLearningLevel(e.target.value)}
                disabled={loading}
              >
                <option value="beginner">Beginner (New to AI)</option>
                <option value="intermediate">Intermediate (Knows Python/ML)</option>
                <option value="advanced">Advanced (Deep Learning/NLP)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="learningGoal">
                <Target size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Primary Goal
              </label>
              <select
                id="learningGoal"
                className="form-select"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                disabled={loading}
              >
                <option value="Build my own LLM">Build my own LLM</option>
                <option value="Fine-tune with LoRA & QLoRA">Fine-tune with LoRA & QLoRA</option>
                <option value="Build practical RAG applications">Build practical RAG applications</option>
                <option value="Understand Transformer mathematics">Understand Transformer math</option>
                <option value="Career in AI Engineering">Career in AI Engineering</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? (
              <span className="auth-spinner"></span>
            ) : (
              <>
                Create Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

