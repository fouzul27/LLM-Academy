import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import * as api from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Circle,
  Terminal,
  Code2,
  ChevronRight,
  ChevronLeft,
  Cpu,
  Layers,
  FileCode,
  Send,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import './AIWorkspace.css';

const DEFAULT_APPROACHES = [
  {
    id: 'scratch_transformer',
    title: 'TinyTransformer from Scratch',
    desc: 'Build an educational decoder-only model in PyTorch (~1.2M parameters). Optimized for 8GB RAM & CPU.',
    recommended: true,
  },
  {
    id: 'gpt_decoder',
    title: 'GPT-Style Decoder Architecture',
    desc: 'Implement causal multi-head self-attention, residual streams, and autoregressive generation.',
    recommended: false,
  },
  {
    id: 'domain_finetune',
    title: 'Domain Fine-Tuning with LoRA',
    desc: 'Adapt an existing open-source small model for your specific custom task or dataset.',
    recommended: false,
  },
  {
    id: 'rag_pipeline',
    title: 'Local RAG & Inference System',
    desc: 'Connect a quantized model with local vector storage for document question-answering.',
    recommended: false,
  },
];

export default function AIWorkspace() {
  const { state, logoutUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupError, setSetupError] = useState(null);

  // Setup Wizard State
  const [setupStep, setSetupStep] = useState(1);
  const [setupData, setSetupData] = useState({
    project_name: 'My TinyLLM',
    model_building_approach: 'scratch_transformer',
    experience_level: state.user.level || 'beginner',
    hardware_profile: '8GB RAM, CPU (Windows 11)',
    project_goal: state.user.goal || 'Build an educational LLM from scratch',
  });

  // Workspace UI State
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeStage, setActiveStage] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);

  // Chat & Verification State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const chatBottomRef = useRef(null);

  // Load user projects on mount
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getProjects();
      if (res.projects && res.projects.length > 0) {
        // Load details for first project
        const fullProj = await api.getProject(res.projects[0].id);
        setActiveProject(fullProj.project);
        setActiveStage(fullProj.project.current_stage || 1);
      } else {
        setShowSetupModal(true);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      if (err.status === 401) {
        // If session expired or unauthorized, redirect cleanly
        logoutUser();
        navigate('/login', { state: { from: location } });
        return;
      }
      setShowSetupModal(true);
    } finally {
      setLoading(false);
    }
  }, [logoutUser, navigate, location]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Update selected task when project changes
  useEffect(() => {
    if (activeProject && activeProject.tasks) {
      const pendingTask = activeProject.tasks.find((t) => t.status !== 'completed');
      setSelectedTask(pendingTask || activeProject.tasks[0]);

      // Seed initial welcome message from AI Mentor
      setMessages([
        {
          role: 'assistant',
          content: `Welcome back to **${activeProject.project_name}**! I'm your AI Lead Engineer.

We are currently working on **Stage ${activeProject.current_stage}: ${activeProject.current_task}**.

Your machine is configured with **${activeProject.hardware_profile}**. We will keep our model lightweight (~1.5M parameters) so training and token generation run smoothly on your local machine.

Would you like me to explain the current step, or should I generate the code for this task?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [activeProject]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Handle Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSetupError(null);
    try {
      setLoading(true);
      const res = await api.createProject(setupData);
      setActiveProject(res.project);
      setShowSetupModal(false);
      setSetupStep(1);
    } catch (err) {
      console.error('Create project error:', err);
      if (err.status === 401) {
        setSetupError('Authentication required or session expired. Please sign in again.');
      } else {
        setSetupError(err.message || 'Failed to initialize project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Send message to AI Mentor
  const handleSendMessage = async (customPrompt) => {
    const text = customPrompt || inputMessage.trim();
    if (!text || !activeProject || chatLoading) return;

    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const res = await api.sendProjectChat(activeProject.id, text);
      const assistantMsg = {
        role: 'assistant',
        content: res.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error contacting AI Mentor: ${err.message}. Please ensure the local FastAPI backend is active.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Run Code Verification
  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || !activeProject) return;
    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await api.verifyProjectCode(activeProject.id, verificationCode);
      setVerificationResult(res);

      if (res.success && selectedTask) {
        // Automatically mark task verified
        const updated = await api.updateProjectTask(activeProject.id, selectedTask.id, {
          status: 'completed',
          verification_status: 'verified',
          verification_output: res.stdout,
        });
        setActiveProject(updated.project);
      }
    } catch (err) {
      setVerificationResult({
        success: false,
        stderr: err.message,
        stdout: '',
        duration_seconds: 0,
      });
    } finally {
      setVerifying(false);
    }
  };

  // Toggle Task Completion Manually
  const handleToggleTask = async (task) => {
    if (!activeProject) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const newVerif = task.status === 'completed' ? 'unverified' : 'verified';

    try {
      const updated = await api.updateProjectTask(activeProject.id, task.id, {
        status: newStatus,
        verification_status: newVerif,
      });
      setActiveProject(updated.project);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  if (loading && !activeProject && !showSetupModal) {
    return (
      <div className="workspace-loading">
        <div className="auth-spinner" style={{ width: '36px', height: '36px', borderColor: 'var(--lavender)' }}></div>
        <p>Loading your AI Build Workspace...</p>
      </div>
    );
  }

  return (
    <div className="workspace-container fade-in">
      {/* Setup Modal */}
      {showSetupModal && (
        <div className="modal-overlay">
          <div className="setup-modal card fade-in">
            <div className="modal-header">
              <div className="modal-badge">
                <Sparkles size={20} className="modal-badge-icon" />
              </div>
              <h2>Build Your Own Large Language Model</h2>
              <p>Your personal AI engineer will guide you step by step.</p>
            </div>

            {setupError && (
              <div
                style={{
                  background: 'var(--rose-light, #F9E3E8)',
                  color: 'var(--rose-dark, #A85A6E)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span>{setupError}</span>
                {setupError.toLowerCase().includes('sign in') && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    onClick={() => {
                      logoutUser();
                      navigate('/login', { state: { from: location } });
                    }}
                  >
                    Go to Sign In
                  </button>
                )}
              </div>
            )}

            <div className="modal-steps-indicator">
              <span className={`step-dot ${setupStep >= 1 ? 'active' : ''}`}>1. Approach</span>
              <span className="step-line"></span>
              <span className={`step-dot ${setupStep >= 2 ? 'active' : ''}`}>2. Experience</span>
              <span className="step-line"></span>
              <span className={`step-dot ${setupStep >= 3 ? 'active' : ''}`}>3. Hardware</span>
            </div>

            {setupStep === 1 && (
              <div className="setup-step-body">
                <h3>What would you like to build?</h3>
                <div className="approach-grid">
                  {DEFAULT_APPROACHES.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      className={`approach-card ${setupData.model_building_approach === app.id ? 'selected' : ''}`}
                      onClick={() =>
                        setSetupData({
                          ...setupData,
                          model_building_approach: app.id,
                          project_name: app.title,
                        })
                      }
                    >
                      <div className="approach-header">
                        <strong>{app.title}</strong>
                        {app.recommended && <span className="recommended-tag">Recommended</span>}
                      </div>
                      <p>{app.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={() => setSetupStep(2)}>
                    Next Step <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {setupStep === 2 && (
              <div className="setup-step-body">
                <h3>What is your current experience?</h3>
                <div className="choice-list">
                  {[
                    { id: 'beginner', title: 'Complete Beginner', desc: 'New to Python & AI. Wants step-by-step guidance.' },
                    { id: 'basic_python', title: 'Basic Python Knowledge', desc: 'Knows variables, loops, and basic functions.' },
                    { id: 'intermediate', title: 'Intermediate Developer', desc: 'Familiar with OOP, NumPy, and basic PyTorch.' },
                    { id: 'advanced', title: 'Experienced Engineer', desc: 'Ready for full architecture implementation and training.' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      className={`choice-card ${setupData.experience_level === lvl.id ? 'selected' : ''}`}
                      onClick={() => setSetupData({ ...setupData, experience_level: lvl.id })}
                    >
                      <strong>{lvl.title}</strong>
                      <p>{lvl.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setSetupStep(1)}>
                    Back
                  </button>
                  <button className="btn btn-primary" onClick={() => setSetupStep(3)}>
                    Next Step <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {setupStep === 3 && (
              <form onSubmit={handleCreateProject} className="setup-step-body">
                <h3>Hardware Profile & Project Name</h3>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={setupData.project_name}
                    onChange={(e) => setSetupData({ ...setupData, project_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Hardware</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={setupData.hardware_profile}
                    onChange={(e) => setSetupData({ ...setupData, hardware_profile: e.target.value })}
                  />
                  <small style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    We automatically tune hyperparameters (batch size, layers, embedding size) to ensure your model trains reliably.
                  </small>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setSetupStep(2)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Launch AI Workspace <Play size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Workspace Main View */}
      <div className="workspace-layout">
        {/* LEFT PANEL — Roadmap & Tasks */}
        <aside className={`workspace-sidebar card ${leftPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="ws-sidebar-header">
            <div className="ws-project-title-area">
              <span className="ws-badge">Stage {activeProject?.current_stage || 1} of 10</span>
              <h2 className="ws-project-name">{activeProject?.project_name || 'My LLM'}</h2>
            </div>
            <button
              className="panel-toggle-btn"
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              aria-label="Toggle roadmap panel"
            >
              {leftPanelCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {!leftPanelCollapsed && (
            <div className="ws-sidebar-content">
              {/* Stages List */}
              <div className="roadmap-stages-scroller">
                <div className="stages-nav-header">
                  <span>Development Stages</span>
                  <button className="new-proj-btn" onClick={() => setShowSetupModal(true)} title="New Project">
                    <PlusCircle size={15} />
                  </button>
                </div>
                <div className="stages-pill-list">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stageNum) => (
                    <button
                      key={stageNum}
                      className={`stage-pill ${activeStage === stageNum ? 'active' : ''} ${
                        stageNum < (activeProject?.current_stage || 1) ? 'done' : ''
                      }`}
                      onClick={() => setActiveStage(stageNum)}
                    >
                      Stage {stageNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks for Active Stage */}
              <div className="stage-tasks-section">
                <h4>Stage {activeStage} Tasks</h4>
                <div className="tasks-list">
                  {activeProject?.tasks
                    ?.filter((t) => t.stage === activeStage)
                    ?.map((task) => {
                      const isCompleted = task.status === 'completed';
                      const isSelected = selectedTask?.id === task.id;
                      return (
                        <div
                          key={task.id}
                          className={`task-row ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <button
                            className="task-check-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTask(task);
                            }}
                            title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={18} className="icon-completed" />
                            ) : (
                              <Circle size={18} className="icon-pending" />
                            )}
                          </button>
                          <div className="task-info">
                            <span className={`task-name ${isCompleted ? 'completed' : ''}`}>{task.task_name}</span>
                            <span className="task-desc">{task.task_description}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Project Files */}
              <div className="project-files-section">
                <h4>Verified Files</h4>
                <div className="files-list">
                  <div className="file-item">
                    <FileCode size={14} className="file-icon" />
                    <span>tokenizer.py</span>
                  </div>
                  <div className="file-item">
                    <FileCode size={14} className="file-icon" />
                    <span>model.py</span>
                  </div>
                  <div className="file-item">
                    <FileCode size={14} className="file-icon" />
                    <span>train.py</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* CENTER PANEL — AI Mentor Pair Programming */}
        <main className="workspace-main card">
          {/* Active Task Banner */}
          <div className="active-task-banner">
            <div className="at-left">
              <div className="task-tag">Active Task</div>
              <h3>{selectedTask?.task_name || 'Set up Python Environment'}</h3>
            </div>
            <div className="at-actions">
              <button
                className="btn btn-outline btn-sm"
                onClick={() =>
                  handleSendMessage(
                    `Please explain step-by-step how to accomplish task: "${selectedTask?.task_name}". Provide runnable code for my 8GB RAM machine.`
                  )
                }
              >
                <HelpCircle size={14} /> Explain Step
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  handleSendMessage(
                    `Generate the complete Python implementation code for task: "${selectedTask?.task_name}". Include file name and instructions.`
                  )
                }
              >
                <Code2 size={14} /> Generate Code
              </button>
            </div>
          </div>

          {/* AI Mentor Chat Stream */}
          <div className="mentor-chat-stream">
            {messages.map((msg, i) => (
              <div key={i} className={`mentor-msg ${msg.role}`}>
                <div className="msg-header">
                  <div className="msg-avatar">
                    {msg.role === 'assistant' ? <Sparkles size={16} /> : <span>{state.user.name.charAt(0)}</span>}
                  </div>
                  <span className="msg-author">{msg.role === 'assistant' ? 'AI Mentor (Qwen 2.5)' : state.user.name}</span>
                </div>
                <div className="msg-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="mentor-msg assistant loading">
                <div className="msg-header">
                  <div className="msg-avatar">
                    <Sparkles size={16} />
                  </div>
                  <span className="msg-author">AI Mentor thinking...</span>
                </div>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Verification & Code Sandbox Drawer */}
          <div className="verification-drawer">
            <div className="vd-header">
              <div className="vd-title">
                <Terminal size={16} />
                <span>Local Code Verification Sandbox</span>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleVerifyCode}
                disabled={verifying || !verificationCode.trim()}
              >
                {verifying ? 'Running...' : 'Run & Verify Code'}
                <Play size={14} />
              </button>
            </div>
            <textarea
              className="code-sandbox-input"
              rows={4}
              placeholder="Paste your task Python code here to safely execute and verify..."
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            {verificationResult && (
              <div className={`verification-output ${verificationResult.success ? 'success' : 'error'}`}>
                <div className="vo-header">
                  <span>{verificationResult.success ? 'Execution Passed (0 Errors)' : 'Execution Error'}</span>
                  <span>{verificationResult.duration_seconds}s</span>
                </div>
                <pre>{verificationResult.stdout || verificationResult.stderr}</pre>
              </div>
            )}
          </div>

          {/* Prompt Composer & Quick Chips */}
          <div className="mentor-composer-area">
            <div className="quick-chips">
              <button
                className="chip"
                onClick={() => handleSendMessage('Can you generate the Python code for this step?')}
              >
                Generate Code
              </button>
              <button
                className="chip"
                onClick={() => handleSendMessage('How do I run and test this code in my terminal?')}
              >
                Run Command
              </button>
              <button
                className="chip"
                onClick={() => handleSendMessage('I encountered an error. Can you help me debug?')}
              >
                Help Debug Error
              </button>
              <button
                className="chip"
                onClick={() =>
                  handleSendMessage('Is this model size safe for my 8GB RAM computer without crashing?')
                }
              >
                Hardware Safety Check
              </button>
            </div>

            <div className="composer-bar">
              <input
                type="text"
                className="composer-input"
                placeholder="Ask your AI Mentor anything about your LLM project..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={chatLoading}
              />
              <button
                className="send-btn"
                onClick={() => handleSendMessage()}
                disabled={chatLoading || !inputMessage.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL — Hardware & Model Inspector */}
        {rightPanelOpen && (
          <aside className="workspace-inspector card">
            <div className="wi-header">
              <h3>Project Inspector</h3>
              <button
                className="panel-toggle-btn"
                onClick={() => setRightPanelOpen(false)}
                aria-label="Close inspector"
              >
                ✕
              </button>
            </div>

            <div className="inspector-content">
              {/* Hardware Profile */}
              <div className="inspector-box">
                <div className="ib-title">
                  <Cpu size={15} />
                  <span>Hardware Constraints</span>
                </div>
                <p className="ib-val">{activeProject?.hardware_profile || '8GB RAM • CPU'}</p>
                <span className="ib-status safe">Optimized for lightweight execution</span>
              </div>

              {/* Model Specification */}
              <div className="inspector-box">
                <div className="ib-title">
                  <Layers size={15} />
                  <span>Model Architecture Specs</span>
                </div>
                <div className="spec-table">
                  <div className="spec-row">
                    <span>Architecture:</span>
                    <strong>Decoder-only Transformer</strong>
                  </div>
                  <div className="spec-row">
                    <span>Target Parameters:</span>
                    <strong>~1.4 Million</strong>
                  </div>
                  <div className="spec-row">
                    <span>Embedding Dim:</span>
                    <strong>128</strong>
                  </div>
                  <div className="spec-row">
                    <span>Attention Heads:</span>
                    <strong>4 heads</strong>
                  </div>
                  <div className="spec-row">
                    <span>Layers:</span>
                    <strong>4 blocks</strong>
                  </div>
                  <div className="spec-row">
                    <span>Context Window:</span>
                    <strong>64 tokens</strong>
                  </div>
                </div>
              </div>

              {/* Development Checkpoints */}
              <div className="inspector-box">
                <div className="ib-title">
                  <CheckCircle2 size={15} />
                  <span>Recent Memory Checkpoints</span>
                </div>
                <div className="checkpoint-log">
                  {activeProject?.memory?.slice(0, 4).map((m, idx) => (
                    <div key={idx} className="cp-item">
                      <span className="cp-type">{m.memory_type}</span>
                      <p className="cp-text">{m.memory_content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
