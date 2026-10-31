import { useApp } from '../../contexts/AppContext';
import './Settings.css';

export default function Settings() {
  const { state, dispatch } = useApp();

  const handleLevelChange = (level) => {
    dispatch({ type: 'SET_USER_LEVEL', payload: level });
  };

  const handleNameChange = (e) => {
    dispatch({ type: 'UPDATE_USER', payload: { name: e.target.value } });
  };

  const handleSettingChange = (key, value) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset your local progress, lessons, and quiz history? This cannot be undone.'
      )
    ) {
      dispatch({ type: 'RESET_PROGRESS' });
    }
  };

  return (
    <div className="settings-page fade-in">
      <div className="settings-header">
        <h1>Preferences & Settings</h1>
        <p className="settings-subtitle">
          Customize your profile, personalized AI teacher behavior, and learning objectives.
        </p>
      </div>

      {/* Profile Section */}
      <section className="settings-section card">
        <h3>👤 Profile</h3>
        <div className="setting-row">
          <div>
            <label className="setting-label">Display Name</label>
            <p className="setting-subtext">How the AI Tutor and dashboard address you</p>
          </div>
          <input
            type="text"
            className="setting-input"
            value={state.user.name}
            onChange={handleNameChange}
            placeholder="Your name"
          />
        </div>
      </section>

      {/* Learning Level Section */}
      <section className="settings-section card">
        <h3>📚 Current Learning Level</h3>
        <p className="setting-desc">
          Sets default explanation depth for the AI Tutor and highlights matching courses.
        </p>
        <div className="level-options">
          {[
            {
              id: 'beginner',
              emoji: '🌱',
              label: 'Beginner',
              desc: 'New to Python & AI. Prefers simple analogies, step-by-step guidance.',
            },
            {
              id: 'intermediate',
              emoji: '🌿',
              label: 'Intermediate',
              desc: 'Comfortable with Python & ML fundamentals. Eager for architecture deep dives.',
            },
            {
              id: 'advanced',
              emoji: '🌳',
              label: 'Advanced',
              desc: 'Familiar with Deep Learning. Focused on LoRA, quantization, and deployment.',
            },
          ].map((level) => (
            <button
              key={level.id}
              className={`level-option ${state.user.level === level.id ? 'active' : ''}`}
              onClick={() => handleLevelChange(level.id)}
            >
              <span className="lo-emoji">{level.emoji}</span>
              <span className="lo-label">{level.label}</span>
              <span className="lo-desc">{level.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* AI Teacher Preferences */}
      <section className="settings-section card">
        <h3>🤖 AI Tutor Persona & Goals</h3>
        <div className="setting-row">
          <div>
            <label className="setting-label">Primary Learning Goal</label>
            <p className="setting-subtext">Focus area for suggested topics</p>
          </div>
          <select
            className="setting-select"
            value={state.settings.learningGoal}
            onChange={(e) => handleSettingChange('learningGoal', e.target.value)}
          >
            <option>Build my own LLM from scratch</option>
            <option>Fine-tune models with LoRA & QLoRA</option>
            <option>Build practical RAG applications</option>
            <option>Understand Transformer mathematics</option>
            <option>General AI engineering mastery</option>
          </select>
        </div>

        <div className="setting-row">
          <div>
            <label className="setting-label">AI Tutor Personality</label>
            <p className="setting-subtext">Teaching tone and explanation style</p>
          </div>
          <select
            className="setting-select"
            value={state.settings.tutorPersonality}
            onChange={(e) => handleSettingChange('tutorPersonality', e.target.value)}
          >
            <option value="patient">Patient, encouraging & pedagogical</option>
            <option value="concise">Concise, code-first & direct</option>
            <option value="socratic">Socratic (guides with questions)</option>
          </select>
        </div>
      </section>

      {/* Design System & Aesthetic */}
      <section className="settings-section card">
        <h3>🎨 Design Theme</h3>
        <div className="theme-info-box">
          <div className="theme-swatches">
            <span className="swatch" style={{ background: '#FFFDF8' }} title="Background" />
            <span className="swatch" style={{ background: '#A995D6' }} title="Lavender Primary" />
            <span className="swatch" style={{ background: '#DDF1E6' }} title="Mint" />
            <span className="swatch" style={{ background: '#DCEBFA' }} title="Powder Blue" />
            <span className="swatch" style={{ background: '#F9E3E8' }} title="Blush Pink" />
            <span className="swatch" style={{ background: '#FCE8D8' }} title="Peach" />
          </div>
          <div className="theme-details">
            <strong>Peaceful Pastel Aesthetic</strong>
            <p>
              Specially engineered for long, comfortable digital learning sessions with warm cream
              and soft lavender accents.
            </p>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="settings-section card settings-danger">
        <h3>⚠️ Learning Data & Storage</h3>
        <p className="setting-desc">
          Your progress is stored locally in your browser storage. Resetting will clear all finished
          lessons, scores, and streak data.
        </p>
        <button className="btn btn-danger" onClick={handleReset}>
          Reset Local Progress
        </button>
      </section>
    </div>
  );
}

