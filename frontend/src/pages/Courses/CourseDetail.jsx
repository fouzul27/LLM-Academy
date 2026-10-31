import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import './CourseDetail.css';

const courseData = {
  1: {
    title: 'Introduction to Artificial Intelligence',
    icon: '🤖',
    color: 'mint',
    difficulty: 'Beginner',
    duration: '4 hours',
    description: 'Learn the fundamentals of AI, its history, types, and how intelligent systems work.',
    chapters: [
      {
        title: 'Getting Started with AI',
        lessons: [
          {
            id: 'c1-l1',
            title: 'What is Artificial Intelligence?',
            duration: '20 min',
            content: `# What is Artificial Intelligence?\n\nArtificial Intelligence (AI) is the science of creating computer systems that can perform tasks typically requiring human intelligence.\n\n## Key Concepts\n\n**AI** refers to machines that can:\n- **Learn** from experience and data\n- **Reason** about problems and solutions\n- **Understand** natural language\n- **Perceive** images, sounds, and patterns\n- **Make decisions** based on available information\n\n## Types of AI\n\n### Narrow AI (Weak AI)\nDesigned for a specific task. Examples:\n- Voice assistants (Siri, Alexa)\n- Recommendation systems (Netflix, YouTube)\n- Image recognition (face detection)\n\n### General AI (Strong AI)\nHypothetical AI with human-level understanding across all domains. This does not exist yet.\n\n### Superintelligent AI\nTheoretical AI that surpasses human intelligence. This is a concept discussed in research and philosophy.\n\n## Why AI Matters\n\nAI is transforming every industry:\n- **Healthcare**: Disease diagnosis, drug discovery\n- **Finance**: Fraud detection, algorithmic trading\n- **Education**: Personalized learning (like this platform!)\n- **Transportation**: Self-driving vehicles\n\n## Quick Check\nCan you think of three AI applications you use daily? Most people interact with AI more than they realize — from search engines to social media feeds.`,
          },
          {
            id: 'c1-l2',
            title: 'History of AI',
            duration: '15 min',
            content: `# History of AI\n\n## The Beginning (1950s)\n\nAlan Turing proposed the famous **Turing Test** in 1950: "Can machines think?"\n\nThe term "Artificial Intelligence" was coined at the **Dartmouth Conference** in 1956 by John McCarthy.\n\n## AI Winters and Revivals\n\n### First AI Winter (1974-1980)\nEarly AI systems couldn't handle real-world complexity. Funding decreased.\n\n### Expert Systems Era (1980s)\nRule-based systems showed commercial value. Companies invested heavily.\n\n### Second AI Winter (1987-1993)\nExpert systems proved too rigid and expensive to maintain.\n\n### Machine Learning Rise (2000s)\nThe internet provided massive datasets. Computing power grew exponentially.\n\n### Deep Learning Revolution (2012+)\nAlexNet won ImageNet in 2012. Neural networks proved they could outperform traditional methods.\n\n### The LLM Era (2020+)\nGPT-3 (2020), ChatGPT (2022), GPT-4 (2023), and open models like Llama and Qwen have democratized AI.\n\n## Key Takeaway\nAI has gone through cycles of hype and disappointment, but each cycle brought real progress. We are now in the most productive era of AI development.`,
          },
          {
            id: 'c1-l3',
            title: 'AI vs ML vs Deep Learning',
            duration: '20 min',
            content: `# AI vs Machine Learning vs Deep Learning\n\nThese terms are often confused. Let's clarify.\n\n## The Hierarchy\n\n**AI** is the broadest concept — any technique that enables machines to mimic human intelligence.\n\n**Machine Learning** is a subset of AI — algorithms that learn from data without being explicitly programmed.\n\n**Deep Learning** is a subset of ML — neural networks with many layers that learn complex patterns.\n\nThink of it like nested circles:\n- Largest circle: **AI**\n  - Inside: **Machine Learning**\n    - Inside: **Deep Learning**\n      - Inside: **Large Language Models**\n\n## Machine Learning Approaches\n\n### Supervised Learning\nLearn from labeled examples.\n- Input: Photos labeled "cat" or "dog"\n- Output: Model that classifies new photos\n\n### Unsupervised Learning\nFind patterns in unlabeled data.\n- Input: Customer purchase history\n- Output: Customer segments/groups\n\n### Reinforcement Learning\nLearn by trial and error with rewards.\n- Agent takes actions in an environment\n- Receives rewards or penalties\n- Learns optimal strategy\n\n## Where Do LLMs Fit?\nLarge Language Models are deep learning models trained on massive text datasets using self-supervised learning (predicting the next word). They sit at the very center of our nested circles.`,
          },
        ],
      },
      {
        title: 'Core AI Concepts',
        lessons: [
          {
            id: 'c1-l4',
            title: 'How Machines Learn',
            duration: '25 min',
            content: `# How Machines Learn\n\nAt its core, machine learning is about finding patterns in data.\n\n## The Learning Process\n\n1. **Collect data** — Gather relevant examples\n2. **Prepare data** — Clean, format, and split into training/test sets\n3. **Choose a model** — Select an appropriate algorithm\n4. **Train the model** — Feed training data and adjust parameters\n5. **Evaluate** — Test performance on unseen data\n6. **Deploy** — Use the model in production\n\n## A Simple Example\n\nImagine teaching a computer to predict house prices:\n\n\`\`\`python\n# Simple linear relationship\n# price = weight * size + bias\n\nsize = [1000, 1500, 2000, 2500]  # square feet\nprice = [200000, 300000, 400000, 500000]  # dollars\n\n# The model learns:\n# weight ≈ 200 (price per sq ft)\n# bias ≈ 0\n\n# Now it can predict:\n# predict(1800) → 360000\n\`\`\`\n\n## Key Terminology\n\n- **Features**: Input variables (house size, bedrooms)\n- **Labels**: Output we want to predict (price)\n- **Parameters**: Values the model learns (weights, biases)\n- **Hyperparameters**: Settings we choose (learning rate, epochs)\n- **Loss function**: Measures how wrong the model is\n- **Optimization**: Process of minimizing the loss\n\n## Practice Question\nIf a model has never seen data about 5-bedroom houses, what challenges might it face when predicting their prices?`,
          },
          {
            id: 'c1-l5',
            title: 'Data: The Fuel of AI',
            duration: '20 min',
            content: `# Data: The Fuel of AI\n\nWithout data, AI is just math. Data is what makes AI systems useful.\n\n## Types of Data\n\n### Structured Data\nOrganized in tables with rows and columns.\n- Spreadsheets, databases, CSV files\n- Example: Customer records, sales data\n\n### Unstructured Data\nNo predefined format.\n- Text, images, audio, video\n- Example: Emails, social media posts, photos\n\n### Semi-Structured Data\nHas some organization but is flexible.\n- JSON, XML, HTML\n- Example: API responses, web pages\n\n## Data Quality Matters\n\n"Garbage in, garbage out" — bad data leads to bad AI.\n\n### Common Data Issues\n- **Missing values**: Empty fields in datasets\n- **Noise**: Random errors or irrelevant information\n- **Bias**: Data that doesn't represent the real world fairly\n- **Imbalance**: Unequal representation of categories\n\n## For LLMs\n\nLarge Language Models are trained on:\n- **Books and articles**: High-quality written text\n- **Websites**: Filtered web crawl data\n- **Code**: Open-source repositories\n- **Conversations**: Dialogue datasets\n\nGPT-3 was trained on ~570 GB of text. Modern models use trillions of tokens.\n\n## Key Takeaway\nThe quality and quantity of data directly determine how good an AI model will be.`,
          },
        ],
      },
    ],
  },
};

// Generate placeholder data for other courses
for (let i = 2; i <= 12; i++) {
  if (!courseData[i]) {
    courseData[i] = null; // Will show "coming soon"
  }
}

export default function CourseDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [activeLesson, setActiveLesson] = useState(null);
  
  const course = courseData[Number(id)];
  const isEnrolled = state.progress.enrolledCourses.includes(Number(id));

  if (!course) {
    return (
      <div className="course-detail fade-in">
        <div className="course-coming-soon card">
          <span className="coming-icon">🚧</span>
          <h2>Course Coming Soon</h2>
          <p>This course content is being developed. Check back soon or explore other available courses.</p>
          <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
        </div>
      </div>
    );
  }

  const allLessons = course.chapters.flatMap(ch => ch.lessons);
  const currentLesson = activeLesson ? allLessons.find(l => l.id === activeLesson) : null;
  const currentIndex = currentLesson ? allLessons.indexOf(currentLesson) : -1;
  const isLessonCompleted = (lessonId) => state.progress.completedLessons.includes(lessonId);

  const handleCompleteLesson = (lessonId) => {
    dispatch({ type: 'COMPLETE_LESSON', payload: lessonId });
  };

  if (currentLesson) {
    return (
      <div className="lesson-view fade-in">
        <div className="lesson-nav-bar">
          <button className="btn btn-outline btn-sm" onClick={() => setActiveLesson(null)}>
            ← Back to Course
          </button>
          <span className="lesson-counter">{currentIndex + 1} / {allLessons.length}</span>
          <div className="lesson-nav-btns">
            {currentIndex > 0 && (
              <button className="btn btn-outline btn-sm" onClick={() => setActiveLesson(allLessons[currentIndex - 1].id)}>
                ← Previous
              </button>
            )}
            {currentIndex < allLessons.length - 1 && (
              <button className="btn btn-primary btn-sm" onClick={() => setActiveLesson(allLessons[currentIndex + 1].id)}>
                Next →
              </button>
            )}
          </div>
        </div>

        <div className="lesson-content card">
          <div className="lesson-body" dangerouslySetInnerHTML={{ __html: '' }}>
          </div>
          <div className="lesson-body">
            {currentLesson.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
              if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
              if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
              if (line.startsWith('- **')) {
                const parts = line.slice(2).split('**');
                return <li key={i} className="lesson-list-item"><strong>{parts[1]}</strong>{parts[2]}</li>;
              }
              if (line.startsWith('- ')) return <li key={i} className="lesson-list-item">{line.slice(2)}</li>;
              if (line.startsWith('```')) return null;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i}>{line}</p>;
            })}
          </div>

          <div className="lesson-footer">
            {!isLessonCompleted(currentLesson.id) ? (
              <button className="btn btn-primary" onClick={() => handleCompleteLesson(currentLesson.id)}>
                ✓ Mark as Completed
              </button>
            ) : (
              <span className="lesson-completed-badge">✅ Lesson Completed</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail fade-in">
      {/* Course header */}
      <div className={`cd-header bg-${course.color}`}>
        <Link to="/courses" className="cd-back">← Back to Courses</Link>
        <div className="cd-header-content">
          <span className="cd-icon">{course.icon}</span>
          <div>
            <h1>{course.title}</h1>
            <p className="cd-desc">{course.description}</p>
            <div className="cd-meta">
              <span className={`badge badge-${course.difficulty.toLowerCase()}`}>{course.difficulty}</span>
              <span>📖 {course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)} lessons</span>
              <span>⏱️ {course.duration}</span>
            </div>
            {!isEnrolled && (
              <button className="btn btn-primary cd-enroll" onClick={() => dispatch({ type: 'ENROLL_COURSE', payload: Number(id) })}>
                Enroll in Course
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="cd-chapters">
        {course.chapters.map((chapter, ci) => (
          <div key={ci} className="chapter-card card">
            <h3 className="chapter-title">Chapter {ci + 1}: {chapter.title}</h3>
            <div className="chapter-lessons">
              {chapter.lessons.map((lesson, li) => (
                <button
                  key={lesson.id}
                  className={`chapter-lesson ${isLessonCompleted(lesson.id) ? 'completed' : ''}`}
                  onClick={() => setActiveLesson(lesson.id)}
                >
                  <span className="cl-num">{isLessonCompleted(lesson.id) ? '✅' : `${ci + 1}.${li + 1}`}</span>
                  <span className="cl-lesson-title">{lesson.title}</span>
                  <span className="cl-duration">{lesson.duration}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
