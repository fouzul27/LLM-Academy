import { useApp } from '../../contexts/AppContext';
import './Progress.css';

export default function Progress() {
  const { state } = useApp();
  const { progress } = state;

  const lessonContribution = Math.min(40, (progress.lessonsCompleted / 10) * 40);
  const courseContribution = Math.min(30, (progress.completedCourses.length / 5) * 30);
  const quizContribution = Math.min(30, (progress.quizzesTaken / 5) * 30);
  const overallProgress = Math.round(lessonContribution + courseContribution + quizContribution);

  const stageNames = [
    { title: 'AI & Python Fundamentals', desc: 'Syntax, NumPy, Math foundations' },
    { title: 'ML & Deep Learning', desc: 'Loss functions, backprop, neural nets' },
    { title: 'NLP & Transformers', desc: 'Attention, embeddings, encoders/decoders' },
    { title: 'LLM Fine-Tuning', desc: 'LoRA, QLoRA, parameter scaling' },
    { title: 'RAG & Production', desc: 'Vector search, deployment, Ollama, APIs' },
  ];

  const achievements = [
    {
      name: 'First Steps',
      desc: 'Complete your first lesson',
      unlocked: progress.lessonsCompleted >= 1,
      icon: '🎯'
    },
    {
      name: 'Knowledge Seeker',
      desc: 'Complete 3 lessons',
      unlocked: progress.lessonsCompleted >= 3,
      icon: '💡'
    },
    {
      name: 'Quiz Explorer',
      desc: 'Complete your first assessment',
      unlocked: progress.quizzesTaken >= 1,
      icon: '📝'
    },
    {
      name: 'Consistent Learner',
      desc: 'Maintain a learning streak',
      unlocked: progress.currentStreak >= 1,
      icon: '🔥'
    },
    {
      name: 'Course Pioneer',
      desc: 'Enroll in 2 or more courses',
      unlocked: progress.coursesEnrolled >= 2,
      icon: '📚'
    },
    {
      name: 'Transformer Apprentice',
      desc: 'Advance to Stage 3 on the roadmap',
      unlocked: progress.currentStage >= 3,
      icon: '⚡'
    },
    {
      name: 'Quiz Master',
      desc: 'Score 100% on any quiz',
      unlocked: Object.values(progress.quizScores).some((s) => s === 100),
      icon: '🏆'
    },
    {
      name: 'LLM Architect',
      desc: 'Reach Stage 5 on the roadmap',
      unlocked: progress.currentStage >= 5,
      icon: '🚀'
    }
  ];

  return (
    <div className="progress-page fade-in">
      <div className="progress-header">
        <h1>My Learning Progress</h1>
        <p className="progress-subtitle">
          Real-time analytics on your journey from foundations to building LLMs.
        </p>
      </div>

      {/* Progress Overview Section */}
      <div className="progress-overview">
        <div className="po-circle-card card">
          <div className="po-circle">
            <svg viewBox="0 0 120 120" className="po-ring">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--lavender-light)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--lavender)"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallProgress / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span className="po-pct">{overallProgress}%</span>
          </div>
          <h3>Overall Completion</h3>
          <p>Calculated across lessons, quizzes, and stage milestones.</p>
        </div>

        <div className="po-stats-grid">
          <div className="po-stat card bg-lavender">
            <span className="po-stat-icon">📖</span>
            <span className="po-stat-value">{progress.lessonsCompleted}</span>
            <span className="po-stat-label">Lessons Completed</span>
          </div>
          <div className="po-stat card bg-mint">
            <span className="po-stat-icon">🎓</span>
            <span className="po-stat-value">{progress.completedCourses.length}</span>
            <span className="po-stat-label">Courses Completed</span>
          </div>
          <div className="po-stat card bg-blue">
            <span className="po-stat-icon">📝</span>
            <span className="po-stat-value">{progress.quizzesTaken}</span>
            <span className="po-stat-label">Quizzes Evaluated</span>
          </div>
          <div className="po-stat card bg-peach">
            <span className="po-stat-icon">🔥</span>
            <span className="po-stat-value">{progress.currentStreak} d</span>
            <span className="po-stat-label">Active Streak</span>
          </div>
          <div className="po-stat card bg-pink">
            <span className="po-stat-icon">⏱️</span>
            <span className="po-stat-value">{progress.learningHours} hrs</span>
            <span className="po-stat-label">Study Time</span>
          </div>
          <div className="po-stat card bg-cream">
            <span className="po-stat-icon">📚</span>
            <span className="po-stat-value">{progress.coursesEnrolled}</span>
            <span className="po-stat-label">Enrolled Courses</span>
          </div>
        </div>
      </div>

      {/* 5-Stage Journey Roadmap Track */}
      <div className="progress-stage card">
        <div className="stage-card-header">
          <h3>Curriculum Stage Progress</h3>
          <span className="badge badge-intermediate">Stage {progress.currentStage} of 5</span>
        </div>
        <div className="stage-progress-track">
          {stageNames.map((stage, i) => {
            const isCompleted = i + 1 < progress.currentStage;
            const isCurrent = i + 1 === progress.currentStage;
            return (
              <div
                key={i}
                className={`spt-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <div className="spt-dot">
                  {isCompleted ? '✓' : i + 1}
                </div>
                <div className="spt-info">
                  <span className="spt-name">{stage.title}</span>
                  <span className="spt-desc">{stage.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz Scores breakdown */}
      {Object.keys(progress.quizScores).length > 0 && (
        <div className="progress-quizzes card">
          <h3>Assessment Performance</h3>
          <div className="pq-list">
            {Object.entries(progress.quizScores).map(([quizId, score]) => (
              <div key={quizId} className="pq-item">
                <span className="pq-name">
                  {quizId
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </span>
                <div className="pq-bar">
                  <div
                    className="pq-bar-fill"
                    style={{
                      width: `${score}%`,
                      background:
                        score >= 80 ? 'var(--mint-dark)' : score >= 60 ? 'var(--lavender)' : 'var(--pink-dark)',
                    }}
                  ></div>
                </div>
                <span className="pq-score">{score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Showcase */}
      <div className="progress-achievements">
        <h3>Unlocked Achievements</h3>
        <div className="achievements-grid">
          {achievements.map((a, i) => (
            <div
              key={i}
              className={`achievement-card card ${a.unlocked ? 'unlocked' : 'locked'}`}
            >
              <span className="achievement-icon">{a.icon}</span>
              <h4>{a.name}</h4>
              <p>{a.desc}</p>
              <span className={`achievement-tag ${a.unlocked ? 'status-unlocked' : 'status-locked'}`}>
                {a.unlocked ? '✓ Unlocked' : '🔒 Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

