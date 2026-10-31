import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import './Roadmap.css';

const stages = [
  {
    id: 1,
    title: 'AI & Python Fundamentals',
    icon: '🌱',
    color: 'mint',
    description: 'Build a strong foundation in AI concepts and Python programming.',
    topics: [
      { name: 'Introduction to Artificial Intelligence', desc: 'What AI is, its history, types, and real-world applications.' },
      { name: 'Introduction to Machine Learning', desc: 'Supervised, unsupervised, and reinforcement learning basics.' },
      { name: 'Introduction to Deep Learning', desc: 'Neural networks, perceptrons, and why deep learning matters.' },
      { name: 'Python Fundamentals', desc: 'Variables, data types, loops, functions, and OOP basics.' },
      { name: 'NumPy for AI', desc: 'Arrays, matrix operations, and numerical computing.' },
      { name: 'Pandas for Data', desc: 'DataFrames, data cleaning, and manipulation.' },
      { name: 'Mathematics for AI', desc: 'Linear algebra, calculus, probability, and statistics basics.' },
    ],
    objectives: [
      'Understand what AI, ML, and DL are',
      'Write Python programs confidently',
      'Use NumPy and Pandas for data processing',
      'Understand basic math behind AI',
    ],
  },
  {
    id: 2,
    title: 'Machine Learning & Deep Learning',
    icon: '🌿',
    color: 'blue',
    description: 'Master the core algorithms and neural network architectures.',
    topics: [
      { name: 'Supervised Learning', desc: 'Linear regression, logistic regression, decision trees, SVMs.' },
      { name: 'Unsupervised Learning', desc: 'Clustering, dimensionality reduction, K-means, PCA.' },
      { name: 'Neural Networks', desc: 'Architecture, layers, neurons, and forward propagation.' },
      { name: 'Activation Functions', desc: 'ReLU, sigmoid, tanh, softmax and when to use each.' },
      { name: 'Backpropagation', desc: 'How neural networks learn through gradient computation.' },
      { name: 'Gradient Descent', desc: 'SGD, Adam, learning rates, and optimization strategies.' },
      { name: 'Training & Validation', desc: 'Overfitting, regularization, cross-validation, and evaluation metrics.' },
    ],
    objectives: [
      'Implement ML algorithms from scratch',
      'Build and train neural networks',
      'Understand backpropagation deeply',
      'Apply proper training methodology',
    ],
  },
  {
    id: 3,
    title: 'NLP & Transformer Architecture',
    icon: '⚡',
    color: 'lavender',
    description: 'Understand how language is processed and the revolutionary Transformer model.',
    topics: [
      { name: 'Natural Language Processing', desc: 'Text processing, sentiment analysis, and language understanding.' },
      { name: 'Text Preprocessing', desc: 'Cleaning, normalization, stemming, and lemmatization.' },
      { name: 'Tokenization', desc: 'BPE, WordPiece, SentencePiece, and tokenizer training.' },
      { name: 'Word Embeddings', desc: 'Word2Vec, GloVe, and contextual embeddings.' },
      { name: 'Attention Mechanism', desc: 'The breakthrough idea that transformed NLP forever.' },
      { name: 'Self-Attention', desc: 'Queries, keys, values, and multi-head attention.' },
      { name: 'Positional Encoding', desc: 'How Transformers understand word order without recurrence.' },
      { name: 'Transformer Architecture', desc: 'The complete architecture from "Attention Is All You Need".' },
      { name: 'Encoder & Decoder', desc: 'BERT-style vs GPT-style vs T5-style architectures.' },
    ],
    objectives: [
      'Process and analyze text data',
      'Understand tokenization deeply',
      'Explain the Transformer architecture',
      'Differentiate encoder vs decoder models',
    ],
  },
  {
    id: 4,
    title: 'LLM Development & Fine-Tuning',
    icon: '🔧',
    color: 'peach',
    description: 'Build, customize, and fine-tune Large Language Models.',
    topics: [
      { name: 'Large Language Models', desc: 'What makes an LLM, scaling laws, and emergent abilities.' },
      { name: 'Pretraining', desc: 'How LLMs are trained on massive text corpora.' },
      { name: 'Next-Token Prediction', desc: 'The core objective behind GPT-style models.' },
      { name: 'Model Parameters', desc: 'Weights, biases, and what "7B parameters" means.' },
      { name: 'Context Windows', desc: 'Token limits, KV-cache, and handling long sequences.' },
      { name: 'Hugging Face Transformers', desc: 'Using the Transformers library for inference and training.' },
      { name: 'Open-Source LLMs', desc: 'Llama, Mistral, Qwen, Phi — choosing the right model.' },
      { name: 'Fine-Tuning', desc: 'Full fine-tuning vs parameter-efficient methods.' },
      { name: 'LoRA & QLoRA', desc: 'Low-rank adaptation for efficient fine-tuning.' },
      { name: 'Dataset Preparation', desc: 'Creating, cleaning, and formatting training datasets.' },
      { name: 'Model Evaluation', desc: 'Perplexity, BLEU, ROUGE, and human evaluation.' },
    ],
    objectives: [
      'Understand LLM architecture and training',
      'Use Hugging Face for model inference',
      'Fine-tune models with LoRA/QLoRA',
      'Prepare datasets for training',
    ],
  },
  {
    id: 5,
    title: 'RAG, Deployment & Advanced Projects',
    icon: '🚀',
    color: 'pink',
    description: 'Build production-ready AI applications and deploy them.',
    topics: [
      { name: 'Retrieval-Augmented Generation', desc: 'Combining search with generation for factual AI.' },
      { name: 'Vector Databases', desc: 'Storing and searching embeddings efficiently.' },
      { name: 'ChromaDB', desc: 'Building a local vector store for RAG applications.' },
      { name: 'LangChain', desc: 'Building LLM applications with chains and agents.' },
      { name: 'Prompt Engineering', desc: 'Crafting effective prompts for better AI outputs.' },
      { name: 'AI Agents', desc: 'Building autonomous AI systems with tool use.' },
      { name: 'Model Quantization', desc: 'GPTQ, GGUF, AWQ — making models run efficiently.' },
      { name: 'Model Deployment', desc: 'Serving models with APIs, Ollama, and cloud services.' },
      { name: 'Production AI Apps', desc: 'Building full-stack AI applications for real users.' },
    ],
    objectives: [
      'Build a RAG system from scratch',
      'Deploy models for production use',
      'Create AI agents with tools',
      'Build complete AI applications',
    ],
  },
];

export default function Roadmap() {
  const { state } = useApp();
  const [expandedStage, setExpandedStage] = useState(state.progress.currentStage);

  return (
    <div className="roadmap-page fade-in">
      <div className="roadmap-intro">
        <h1>Your Learning Roadmap</h1>
        <p>A structured journey from AI beginner to LLM developer. Follow each stage to build your skills step by step.</p>
      </div>

      {/* Progress overview */}
      <div className="roadmap-progress card">
        <div className="rp-info">
          <span className="rp-label">Overall Progress</span>
          <span className="rp-value">Stage {state.progress.currentStage} of 5</span>
        </div>
        <div className="progress-bar rp-bar">
          <div className="progress-bar-fill" style={{ width: `${(state.progress.currentStage / 5) * 100}%` }}></div>
        </div>
      </div>

      {/* Stages */}
      <div className="roadmap-stages">
        {stages.map((stage, index) => {
          const isExpanded = expandedStage === stage.id;
          const isCompleted = state.progress.currentStage > stage.id;
          const isCurrent = state.progress.currentStage === stage.id;
          
          return (
            <div key={stage.id} className={`stage-card card stage-${stage.color} ${isExpanded ? 'expanded' : ''} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              {/* Connector line */}
              {index < stages.length - 1 && <div className="stage-connector" />}
              
              {/* Stage header */}
              <button className="stage-header" onClick={() => setExpandedStage(isExpanded ? null : stage.id)}>
                <div className={`stage-number bg-${stage.color}`}>
                  {isCompleted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <span>{stage.id}</span>
                  )}
                </div>
                <div className="stage-title-area">
                  <h3 className="stage-title">
                    <span className="stage-icon">{stage.icon}</span>
                    {stage.title}
                  </h3>
                  <p className="stage-desc">{stage.description}</p>
                </div>
                <div className={`stage-status ${isCurrent ? 'badge-intermediate' : isCompleted ? 'badge-beginner' : ''}`}>
                  {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : 'Upcoming'}
                </div>
                <svg className={`stage-chevron ${isExpanded ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="stage-content">
                  {/* Learning objectives */}
                  <div className="stage-objectives">
                    <h4>🎯 Learning Objectives</h4>
                    <ul>
                      {stage.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Topics */}
                  <div className="stage-topics">
                    <h4>📖 Topics</h4>
                    <div className="topics-list">
                      {stage.topics.map((topic, i) => (
                        <div key={i} className="topic-item">
                          <div className={`topic-dot bg-${stage.color}`}></div>
                          <div className="topic-info">
                            <span className="topic-name">{topic.name}</span>
                            <span className="topic-desc">{topic.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="stage-actions">
                    <Link to="/courses" className="btn btn-primary">
                      {isCurrent ? 'Continue Learning' : isCompleted ? 'Review' : 'Start Stage'}
                    </Link>
                    <Link to="/quizzes" className="btn btn-outline">Take Quiz</Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
