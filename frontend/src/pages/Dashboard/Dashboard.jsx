import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import {
  Sparkles,
  Play,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  FileText,
  Terminal,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';
import './Dashboard.css';

const featuredCourses = [
  {
    id: 1,
    title: 'Introduction to Artificial Intelligence',
    description: 'Learn the fundamentals of AI, its history, and core concepts that power modern intelligent systems.',
    difficulty: 'Beginner',
    duration: '4 hours',
    lessons: 8,
    color: 'mint',
  },
  {
    id: 2,
    title: 'Python for AI Development',
    description: 'Master Python programming essentials needed for AI and machine learning development.',
    difficulty: 'Beginner',
    duration: '6 hours',
    lessons: 12,
    color: 'blue',
  },
  {
    id: 3,
    title: 'Understanding Transformers',
    description: 'Dive deep into the Transformer architecture — the foundation of modern LLMs like GPT and BERT.',
    difficulty: 'Intermediate',
    duration: '5 hours',
    lessons: 10,
    color: 'lavender',
  },
  {
    id: 4,
    title: 'Fine-Tuning LLMs',
    description: 'Learn to customize pre-trained language models for your specific tasks using modern techniques.',
    difficulty: 'Advanced',
    duration: '7 hours',
    lessons: 14,
    color: 'peach',
  },
];

export default function Dashboard() {
  const { state } = useApp();
  const { progress } = state;

  const stats = [
    { label: 'Courses Enrolled', value: progress.coursesEnrolled, icon: BookOpen, color: 'lavender' },
    { label: 'Lessons Completed', value: progress.lessonsCompleted, icon: CheckCircle2, color: 'mint' },
    { label: 'Learning Hours', value: progress.learningHours, icon: Clock, color: 'blue' },
    { label: 'Current Streak', value: `${progress.currentStreak} days`, icon: Flame, color: 'peach' },
    { label: 'Quizzes Taken', value: progress.quizzesTaken, icon: FileText, color: 'pink' },
  ];

  return (
    <div className="dashboard fade-in">
      {/* Main AI Engineering Hero Section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-text">
            <div className="welcome-eyebrow">
              <Sparkles size={16} />
              <span>AI-Guided Development Platform</span>
            </div>
            <h1>Build Your Own LLM</h1>
            <p className="welcome-subtitle">
              Your personal AI engineer will guide you from your first line of code to your own working language model.
            </p>
            <div className="welcome-actions">
              <Link to="/workspace" className="btn btn-primary">
                <Play size={16} />
                Start Building an LLM
              </Link>
              <Link to="/workspace" className="btn btn-secondary">
                <Terminal size={16} />
                Continue My Project
              </Link>
              <Link to="/tutor" className="btn btn-outline">
                <HelpCircle size={16} />
                Ask AI Mentor
              </Link>
            </div>
          </div>
          <div className="welcome-illustration">
            <div className="illustration-blob">
              <div className="hero-icon-center">
                <Cpu size={40} className="hero-cpu-icon" />
              </div>
              <div className="illustration-ring ring-1"></div>
              <div className="illustration-ring ring-2"></div>
              <div className="illustration-ring ring-3"></div>
            </div>
          </div>
        </div>
        <div className="welcome-stage">
          <span className="stage-label">Current Stage:</span>
          <span className="stage-value">Stage {progress.currentStage} of 10 (Development Environment)</span>
          <div className="stage-dots">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
              <span key={s} className={`stage-dot ${s <= progress.currentStage ? 'active' : ''}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="stats-grid">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <div key={i} className={`stat-card card bg-${stat.color}`}>
              <div className="stat-icon-wrapper">
                <IconComponent size={20} className="stat-icon-svg" />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Continue Building Card */}
      <section className="continue-section card">
        <div className="continue-header-row">
          <div>
            <h3>Active Project: TinyTransformer from Scratch</h3>
            <p>Stage 1 • Task: Set up Python virtual environment & install PyTorch</p>
          </div>
          <Link to="/workspace" className="btn btn-primary btn-sm">
            Resume Workspace <ArrowRight size={14} />
          </Link>
        </div>
        <div className="progress-bar" style={{ marginTop: '14px' }}>
          <div className="progress-bar-fill" style={{ width: '10%' }}></div>
        </div>
      </section>

      {/* Today's Learning Workflows */}
      <section className="today-section">
        <div className="section-header">
          <h2>AI Engineering Milestones</h2>
        </div>
        <div className="today-grid">
          <div className="today-card card bg-lavender-soft">
            <div className="today-icon-wrap">
              <Terminal size={20} />
            </div>
            <h4>1. Tokenizer Implementation</h4>
            <p>Build character and subword mapping dictionaries from raw text. Test encoding and decoding fidelity.</p>
            <Link to="/workspace" className="btn btn-outline btn-sm">
              Open in Workspace
            </Link>
          </div>
          <div className="today-card card bg-mint-soft">
            <div className="today-icon-wrap">
              <Layers size={20} />
            </div>
            <h4>2. Self-Attention Block</h4>
            <p>Implement Scaled Dot-Product Attention with causal masks in PyTorch. Tailored for your 8GB RAM computer.</p>
            <Link to="/playground" className="btn btn-outline btn-sm">
              Code Playground
            </Link>
          </div>
          <div className="today-card card bg-peach-soft">
            <div className="today-icon-wrap">
              <Cpu size={20} />
            </div>
            <h4>3. Hardware Safety Check</h4>
            <p>Verify batch sizes, context window length (64 tokens), and memory bounds before training.</p>
            <Link to="/model-lab" className="btn btn-outline btn-sm">
              Model Lab
            </Link>
          </div>
        </div>
      </section>

      {/* Supporting Courses */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Reference Courses & Foundations</h2>
          <Link to="/courses" className="view-all-link">
            View all courses →
          </Link>
        </div>
        <div className="courses-grid">
          {featuredCourses.map((course) => (
            <div key={course.id} className="course-card card">
              <div className={`course-icon-wrapper bg-${course.color}`}>
                <BookOpen size={24} className="course-icon-svg" />
              </div>
              <div className="course-card-content">
                <h4 className="course-card-title">{course.title}</h4>
                <p className="course-card-desc">{course.description}</p>
                <div className="course-card-meta">
                  <span className={`badge badge-${course.difficulty.toLowerCase()}`}>{course.difficulty}</span>
                  <span className="meta-item">{course.lessons} lessons</span>
                  <span className="meta-item">{course.duration}</span>
                </div>
                <Link to={`/courses/${course.id}`} className="btn btn-secondary btn-sm course-start-btn">
                  Read Module
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
