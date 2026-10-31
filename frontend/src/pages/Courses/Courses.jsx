import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import './Courses.css';

const allCourses = [
  {
    id: 1,
    title: 'Introduction to Artificial Intelligence',
    description: 'Learn the fundamentals of AI, its history, types, and how it is transforming the world.',
    difficulty: 'Beginner',
    duration: '4 hours',
    lessons: 8,
    color: 'mint',
    icon: '🤖',
    stage: 1,
  },
  {
    id: 2,
    title: 'Python for AI Development',
    description: 'Master Python programming essentials needed for AI and machine learning development.',
    difficulty: 'Beginner',
    duration: '6 hours',
    lessons: 12,
    color: 'blue',
    icon: '🐍',
    stage: 1,
  },
  {
    id: 3,
    title: 'Machine Learning Fundamentals',
    description: 'Understand core ML algorithms: regression, classification, clustering, and evaluation.',
    difficulty: 'Beginner',
    duration: '5 hours',
    lessons: 10,
    color: 'peach',
    icon: '📊',
    stage: 2,
  },
  {
    id: 4,
    title: 'Deep Learning Fundamentals',
    description: 'Build neural networks from scratch and understand backpropagation and optimization.',
    difficulty: 'Intermediate',
    duration: '6 hours',
    lessons: 10,
    color: 'pink',
    icon: '🧠',
    stage: 2,
  },
  {
    id: 5,
    title: 'Natural Language Processing',
    description: 'Process and analyze text data using modern NLP techniques and tools.',
    difficulty: 'Intermediate',
    duration: '5 hours',
    lessons: 9,
    color: 'lavender',
    icon: '📝',
    stage: 3,
  },
  {
    id: 6,
    title: 'Understanding Transformers',
    description: 'Dive deep into the Transformer architecture — attention, encoders, decoders, and more.',
    difficulty: 'Intermediate',
    duration: '5 hours',
    lessons: 10,
    color: 'blue',
    icon: '⚡',
    stage: 3,
  },
  {
    id: 7,
    title: 'Building Large Language Models',
    description: 'Understand how LLMs are built, trained, and scaled from the ground up.',
    difficulty: 'Advanced',
    duration: '8 hours',
    lessons: 14,
    color: 'mint',
    icon: '🏗️',
    stage: 4,
  },
  {
    id: 8,
    title: 'Hugging Face for Beginners',
    description: 'Learn to use the Hugging Face ecosystem for model inference, datasets, and pipelines.',
    difficulty: 'Intermediate',
    duration: '4 hours',
    lessons: 8,
    color: 'peach',
    icon: '🤗',
    stage: 4,
  },
  {
    id: 9,
    title: 'Fine-Tuning LLMs',
    description: 'Customize pre-trained language models for your specific tasks and domains.',
    difficulty: 'Advanced',
    duration: '7 hours',
    lessons: 12,
    color: 'lavender',
    icon: '🔧',
    stage: 4,
  },
  {
    id: 10,
    title: 'LoRA and QLoRA',
    description: 'Master parameter-efficient fine-tuning techniques that work on consumer hardware.',
    difficulty: 'Advanced',
    duration: '5 hours',
    lessons: 8,
    color: 'pink',
    icon: '⚙️',
    stage: 4,
  },
  {
    id: 11,
    title: 'Retrieval-Augmented Generation',
    description: 'Build RAG systems that combine search with LLM generation for factual AI.',
    difficulty: 'Advanced',
    duration: '6 hours',
    lessons: 10,
    color: 'blue',
    icon: '📚',
    stage: 5,
  },
  {
    id: 12,
    title: 'Building AI Applications',
    description: 'Create full-stack AI applications — from chatbots to AI agents with tool use.',
    difficulty: 'Advanced',
    duration: '8 hours',
    lessons: 14,
    color: 'mint',
    icon: '🚀',
    stage: 5,
  },
];

export default function Courses() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = allCourses.filter(c => {
    const matchesFilter = filter === 'all' || c.difficulty.toLowerCase() === filter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const isEnrolled = (id) => state.progress.enrolledCourses.includes(id);

  return (
    <div className="courses-page fade-in">
      <div className="courses-header-area">
        <div>
          <h1>Course Library</h1>
          <p className="courses-subtitle">Explore {allCourses.length} courses from AI basics to advanced LLM development.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="courses-filters">
        <div className="filter-pills">
          {['all', 'beginner', 'intermediate', 'advanced'].map(f => (
            <button
              key={f}
              className={`filter-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Courses' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="courses-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Course grid */}
      <div className="courses-list-grid">
        {filtered.map(course => (
          <div key={course.id} className="course-list-card card">
            <div className={`cl-icon bg-${course.color}`}>
              <span>{course.icon}</span>
            </div>
            <div className="cl-body">
              <div className="cl-top">
                <h3 className="cl-title">{course.title}</h3>
                <span className={`badge badge-${course.difficulty.toLowerCase()}`}>
                  {course.difficulty}
                </span>
              </div>
              <p className="cl-desc">{course.description}</p>
              <div className="cl-meta">
                <span>📖 {course.lessons} lessons</span>
                <span>⏱️ {course.duration}</span>
                <span>📍 Stage {course.stage}</span>
              </div>
            </div>
            <div className="cl-actions">
              {isEnrolled(course.id) ? (
                <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">Continue</Link>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => dispatch({ type: 'ENROLL_COURSE', payload: course.id })}
                >
                  Enroll
                </button>
              )}
              <Link to={`/courses/${course.id}`} className="btn btn-outline btn-sm">View</Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="courses-empty">
          <span>🔍</span>
          <p>No courses found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
