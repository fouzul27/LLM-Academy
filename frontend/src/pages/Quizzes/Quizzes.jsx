import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import './Quizzes.css';

const quizData = [
  {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    icon: '🤖',
    color: 'mint',
    difficulty: 'Beginner',
    questions: [
      {
        q: 'What is Artificial Intelligence?',
        options: [
          'A type of computer hardware',
          'Systems that can perform tasks requiring human intelligence',
          'A programming language',
          'A database management system'
        ],
        correct: 1,
        explanation: 'AI refers to computer systems designed to perform tasks that typically require human intelligence, such as visual perception, speech recognition, decision-making, and language translation.'
      },
      {
        q: 'Which of these is a primary branch of Machine Learning?',
        options: [
          'Supervised learning',
          'Manual learning',
          'Static learning',
          'Hardware learning'
        ],
        correct: 0,
        explanation: 'Supervised learning is one of the three primary paradigms of ML (along with unsupervised and reinforcement learning), where models learn mappings from labeled inputs.'
      },
      {
        q: 'What is the relationship between AI, ML, and Deep Learning?',
        options: [
          'They are completely distinct and unrelated fields',
          'ML contains AI and Deep Learning',
          'AI encompasses ML, which encompasses Deep Learning',
          'Deep Learning contains ML, which contains AI'
        ],
        correct: 2,
        explanation: 'AI is the broad umbrella concept. Machine Learning is a subset of AI, and Deep Learning is a specialized subset of ML using deep multi-layered neural networks.'
      },
      {
        q: 'What year was the term "Artificial Intelligence" officially coined at Dartmouth?',
        options: ['1943', '1950', '1956', '1970'],
        correct: 2,
        explanation: 'The term was coined at the Dartmouth Summer Research Project on Artificial Intelligence organized in 1956 by John McCarthy, Marvin Minsky, and colleagues.'
      },
      {
        q: 'Which is an example of Narrow (Weak) AI?',
        options: [
          'Autonomous general reasoning across all human fields',
          'A chess engine or facial recognition model',
          'A self-aware conscious digital mind',
          'Time travel navigation'
        ],
        correct: 1,
        explanation: 'Narrow AI is built and optimized for specific tasks, such as playing chess, recognizing faces, or predicting tokens. Artificial General Intelligence (AGI) remains theoretical.'
      }
    ]
  },
  {
    id: 'python-basics',
    title: 'Python for AI Development',
    icon: '🐍',
    color: 'blue',
    difficulty: 'Beginner',
    questions: [
      {
        q: 'Which Python library is fundamental for tensor math and array calculations?',
        options: ['Django', 'Flask', 'NumPy', 'Requests'],
        correct: 2,
        explanation: 'NumPy provides high-performance multi-dimensional array objects and mathematical routines for AI computation.'
      },
      {
        q: 'What does `len([10, 20, 30, 40])` return in Python?',
        options: ['4', '3', '40', '10'],
        correct: 0,
        explanation: 'The len() function returns the number of elements in the list, which is 4.'
      },
      {
        q: 'What data structure is commonly used to store model hyperparameters as key-value pairs?',
        options: ['Tuple', 'Dictionary', 'Set', 'File pointer'],
        correct: 1,
        explanation: 'Dictionaries (`dict`) store key-value associations and are universally used for configs and model hyperparameter maps.'
      },
      {
        q: 'Which library is standard for tabular data manipulation (DataFrames)?',
        options: ['Pandas', 'Requests', 'Pygame', 'BeautifulSoup'],
        correct: 0,
        explanation: 'Pandas provides DataFrames and Series, allowing fast manipulation and preprocessing of structured datasets.'
      },
      {
        q: 'What is a list comprehension?',
        options: [
          'A method to read aloud lists',
          'A concise syntax for creating new lists by transforming an iterable',
          'A tool to encrypt data',
          'A database compression method'
        ],
        correct: 1,
        explanation: 'List comprehensions, e.g. `[x * 2 for x in data]`, offer an expressive, Pythonic way to construct transformed lists.'
      }
    ]
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks & Deep Learning',
    icon: '🧠',
    color: 'lavender',
    difficulty: 'Intermediate',
    questions: [
      {
        q: 'What does an artificial neuron compute before applying an activation function?',
        options: [
          'A weighted sum of inputs plus a bias: z = W·x + b',
          'A random hashing function',
          'A string concatenation',
          'A database SQL query'
        ],
        correct: 0,
        explanation: 'A linear combination of the inputs multiplied by learned weights plus an additive bias term forms the pre-activation input.'
      },
      {
        q: 'Why are non-linear activation functions necessary in neural networks?',
        options: [
          'To increase GPU power draw',
          'Without them, stacking multiple layers collapses mathematically to a single linear transformation',
          'To convert text to numbers',
          'To compress the model weights onto disk'
        ],
        correct: 1,
        explanation: 'Stacking purely linear layers results in another linear transformation. Non-linear activations (like ReLU, GELU, Swish) allow networks to approximate arbitrary complex functions.'
      },
      {
        q: 'What algorithm computes gradients of the loss function with respect to weights via the chain rule?',
        options: ['QuickSort', 'Backpropagation', 'Dijkstra', 'K-Means'],
        correct: 1,
        explanation: 'Backpropagation uses the calculus chain rule recursively from the loss backward through layers to compute partial derivatives.'
      },
      {
        q: 'What is the vanishing gradient problem often seen with Sigmoid activations?',
        options: [
          'Gradients become excessively large and overflow float32',
          'Gradients shrink toward zero during backprop, preventing early layers from learning',
          'The dataset disappears from RAM',
          'The learning rate automatically drops to zero'
        ],
        correct: 1,
        explanation: 'Sigmoid derivatives saturate at small values (< 0.25). Multiplying many such derivatives in deep networks causes gradients to decay exponentially toward zero.'
      },
      {
        q: 'What is overfitting in machine learning?',
        options: [
          'When the model architecture is too small',
          'When the model memorizes training noise and generalizes poorly to unseen data',
          'When inference runs too fast',
          'When the dataset contains too few features'
        ],
        correct: 1,
        explanation: 'Overfitting occurs when a model fits the training data too closely, capturing noise rather than underlying patterns, hurting test performance.'
      }
    ]
  },
  {
    id: 'transformers',
    title: 'Transformers & Self-Attention',
    icon: '⚡',
    color: 'peach',
    difficulty: 'Intermediate',
    questions: [
      {
        q: 'What seminal paper introduced the Transformer architecture in 2017?',
        options: [
          '"Deep Residual Learning for Image Recognition"',
          '"Attention Is All You Need"',
          '"Language Models are Few-Shot Learners"',
          '"Mastering the Game of Go"'
        ],
        correct: 1,
        explanation: 'Vaswani et al. published "Attention Is All You Need" in 2017, introducing the Transformer architecture and self-attention.'
      },
      {
        q: 'What is the formula for Scaled Dot-Product Attention?',
        options: [
          'Softmax(Q · K^T / √d_k) · V',
          'Sigmoid(Q + K) · V',
          'Relu(W · x + b)',
          'Norm(Q - K) / V'
        ],
        correct: 0,
        explanation: 'Scaled Dot-Product Attention multiplies Queries and Keys, divides by the square root of key dimension √d_k for stability, applies Softmax, and weights the Values.'
      },
      {
        q: 'Why do Transformers require Positional Encodings?',
        options: [
          'Because attention is permutation-invariant and lacks inherent recurrence or sequence order knowledge',
          'To encrypt private user tokens',
          'To reduce vocabulary size',
          'To prevent GPU memory leaks'
        ],
        correct: 0,
        explanation: 'Unlike RNNs that process tokens sequentially, self-attention processes all tokens in parallel. Positional encodings (or RoPE) provide crucial word order information.'
      },
      {
        q: 'What is the architectural difference between GPT and BERT?',
        options: [
          'GPT is an autoregressive decoder-only model; BERT is a bidirectional encoder-only model',
          'GPT is only for computer vision; BERT is only for audio',
          'BERT was released after GPT-4',
          'They share the exact same causal masking pattern'
        ],
        correct: 0,
        explanation: 'GPT utilizes masked causal self-attention (predicting next token from left-to-right), whereas BERT attends bidirectionally to learn contextual representations.'
      },
      {
        q: 'What is the KV-Cache used for during autoregressive generation?',
        options: [
          'Caching previous Key and Value matrices to avoid recomputing past tokens during token-by-token generation',
          'Clearing RAM after each word',
          'Compressing tokenizer vocabularies',
          'Encrypting API communications'
        ],
        correct: 0,
        explanation: 'The KV-cache stores the Key and Value tensor representations of previously generated tokens so generation of token N only requires computing the new token\'s projections.'
      }
    ]
  },
  {
    id: 'llm-development',
    title: 'LLM Fine-Tuning & Deployment',
    icon: '🔧',
    color: 'pink',
    difficulty: 'Advanced',
    questions: [
      {
        q: 'What does LoRA (Low-Rank Adaptation) do during model fine-tuning?',
        options: [
          'Freezes base weights and trains low-rank decomposition matrices (A and B) alongside them',
          'Deletes 90% of model layers to save disk space',
          'Trains all model weights from scratch with high learning rates',
          'Converts language models into image classifiers'
        ],
        correct: 0,
        explanation: 'LoRA decomposes weight updates ΔW into two low-rank matrices A and B (rank r ≪ d), keeping the original model frozen and reducing trainable parameters by ~99%.'
      },
      {
        q: 'What innovation does QLoRA introduce on top of LoRA?',
        options: [
          'Quantizing the frozen base model to 4-bit NormalFloat (NF4) with double quantization and paged optimizers',
          'Using quantum computers for gradient descent',
          'Eliminating all attention mechanisms',
          'Training only on cloud GPUs'
        ],
        correct: 0,
        explanation: 'QLoRA quantizes the base model to 4-bit NF4 while training 16-bit LoRA adapter weights, allowing fine-tuning of 7B-13B models on a single consumer GPU.'
      },
      {
        q: 'What is the primary function of Retrieval-Augmented Generation (RAG)?',
        options: [
          'Dynamically retrieving relevant domain chunks from a vector database and injecting them into the prompt context',
          'Retraining the model weights every hour',
          'Generating fake user reviews',
          'Converting Python code to C++'
        ],
        correct: 0,
        explanation: 'RAG retrieves contextually relevant knowledge from an external database using vector embeddings, grounding LLM outputs with factual data and minimizing hallucinations.'
      },
      {
        q: 'What is the GGUF model format primarily designed for?',
        options: [
          'High-performance quantized local inference via llama.cpp and Ollama',
          'Pretraining multi-trillion token models on supercomputers',
          'Storing raw audio files',
          'Exporting CSS styles'
        ],
        correct: 0,
        explanation: 'GGUF is a binary file format optimized for fast CPU/GPU loading and quantized inference of language models with llama.cpp and tools like Ollama.'
      },
      {
        q: 'What metric is standard for measuring language model uncertainty on a test corpus?',
        options: ['Perplexity (PPL)', 'Mean Squared Error (MSE)', 'IoU score', 'F-statistic'],
        correct: 0,
        explanation: 'Perplexity measures the exponential of the cross-entropy loss over a sequence. Lower perplexity means the model predicts the token distribution with higher certainty.'
      }
    ]
  }
];

export default function Quizzes() {
  const { state, dispatch } = useApp();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const quiz = activeQuiz ? quizData.find((q) => q.id === activeQuiz) : null;
  const question = quiz?.questions[currentQuestion];

  const handleAnswer = (index) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    const correct = index === question.correct;
    setIsCorrect(correct);
    if (correct) setScore((prev) => prev + 1);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setIsCorrect(false);
    } else {
      setShowResult(true);
      const finalScore = Math.round(((score + (isCorrect ? 0 : 0)) / quiz.questions.length) * 100);
      dispatch({
        type: 'RECORD_QUIZ_SCORE',
        payload: { quizId: activeQuiz, score: finalScore },
      });
    }
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);
    setIsCorrect(false);
  };

  const retryQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);
    setIsCorrect(false);
  };

  if (showResult && quiz) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="quizzes-page fade-in">
        <div className="quiz-result card">
          <span className="result-emoji">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}</span>
          <h2>Quiz Completed!</h2>
          <p className="result-quiz-name">{quiz.title}</p>
          <div className="result-score-circle">
            <span className="result-pct">{pct}%</span>
          </div>
          <p className="result-text">
            You scored <strong>{score}</strong> out of <strong>{quiz.questions.length}</strong> questions correctly.
          </p>
          <p className="result-msg">
            {pct >= 80
              ? 'Outstanding performance! You have a strong grasp of these concepts.'
              : pct >= 50
              ? 'Good work! Review the topics you missed to reinforce your knowledge.'
              : 'Keep studying! Read the course modules and try again.'}
          </p>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={retryQuiz}>
              🔄 Retry Quiz
            </button>
            <button className="btn btn-outline" onClick={resetQuiz}>
              ← Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quiz && question) {
    return (
      <div className="quizzes-page fade-in">
        <div className="quiz-active">
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="quiz-info-bar">
            <button className="btn btn-outline btn-sm" onClick={resetQuiz}>
              ← Exit Quiz
            </button>
            <span className="quiz-counter">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="quiz-score-live">Current Score: {score}</span>
          </div>

          <div className="quiz-question-card card">
            <h3 className="quiz-question">{question.q}</h3>
            <div className="quiz-options">
              {question.options.map((opt, i) => {
                let optClass = 'quiz-option';
                if (answered) {
                  if (i === question.correct) optClass += ' correct';
                  else if (i === selectedAnswer && !isCorrect) optClass += ' wrong';
                } else if (i === selectedAnswer) {
                  optClass += ' selected';
                }
                return (
                  <button
                    key={i}
                    className={optClass}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                  >
                    <span className="opt-letter">{['A', 'B', 'C', 'D'][i]}</span>
                    <span className="opt-text">{opt}</span>
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className={`quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
                <p className="feedback-status">{isCorrect ? '✅ Correct!' : '❌ Incorrect'}</p>
                <p className="feedback-explanation">{question.explanation}</p>
                <button className="btn btn-primary btn-sm" onClick={nextQuestion}>
                  {currentQuestion < quiz.questions.length - 1 ? 'Next Question →' : 'See Results'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quizzes-page fade-in">
      <div className="quizzes-header">
        <h1>Quizzes & Assessments</h1>
        <p className="quizzes-subtitle">
          Test and solidify your understanding across AI, Python, Neural Networks, Transformers, and LLM fine-tuning.
        </p>
      </div>

      <div className="quiz-grid">
        {quizData.map((q) => {
          const prevScore = state.progress.quizScores[q.id];
          return (
            <div key={q.id} className="quiz-card card">
              <div className={`quiz-card-icon bg-${q.color}`}>
                <span>{q.icon}</span>
              </div>
              <div className="quiz-card-body">
                <h3>{q.title}</h3>
                <div className="quiz-card-meta">
                  <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                    {q.difficulty}
                  </span>
                  <span>{q.questions.length} questions</span>
                  <span>Multiple Choice</span>
                </div>
                {prevScore !== undefined && (
                  <p className="quiz-prev-score">Best Score: {prevScore}%</p>
                )}
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveQuiz(q.id)}
              >
                {prevScore !== undefined ? 'Retake Quiz' : 'Start Quiz'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

