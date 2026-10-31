import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ModelLab.css';

const labSections = [
  {
    id: 'explore',
    title: 'Explore Open-Source Models',
    icon: '🔍',
    color: 'mint',
    description: 'Discover popular open-source LLMs and understand their strengths.',
    content: {
      intro: 'The open-source LLM ecosystem has exploded. Here are the most important model families:',
      models: [
        { name: 'Llama 3 (Meta)', params: '8B / 70B', license: 'Llama 3 Community', desc: 'One of the most capable open models. Great for general tasks and fine-tuning.' },
        { name: 'Qwen 2.5 (Alibaba)', params: '0.5B - 72B', license: 'Apache 2.0 / Qwen', desc: 'Excellent multilingual model. Powers this platform\'s AI Tutor.' },
        { name: 'Mistral / Mixtral', params: '7B / 8x7B', license: 'Apache 2.0', desc: 'Efficient architecture with mixture-of-experts. Great performance per parameter.' },
        { name: 'Phi-3 (Microsoft)', params: '3.8B / 14B', license: 'MIT', desc: 'Small but powerful. Trained on high-quality "textbook" data.' },
        { name: 'Gemma 2 (Google)', params: '2B / 9B / 27B', license: 'Gemma', desc: 'Lightweight and efficient. Good for on-device deployment.' },
      ],
    },
  },
  {
    id: 'architecture',
    title: 'Understanding Model Architecture',
    icon: '🏗️',
    color: 'lavender',
    description: 'Learn how LLMs are structured internally.',
    content: {
      intro: 'Modern LLMs follow a decoder-only Transformer architecture:',
      layers: [
        { name: 'Token Embedding Layer', desc: 'Converts input token IDs to dense vectors (e.g., 4096 dimensions).' },
        { name: 'Positional Encoding', desc: 'Adds position information. Modern models use RoPE (Rotary Position Embedding).' },
        { name: 'Transformer Blocks (N layers)', desc: 'Each block contains: Multi-Head Self-Attention → Layer Norm → Feed-Forward Network → Layer Norm.' },
        { name: 'Self-Attention', desc: 'Computes Q, K, V projections. Attention = softmax(QK^T / √d_k) × V' },
        { name: 'Feed-Forward Network', desc: 'Two linear layers with activation (SwiGLU in modern models). Expands then contracts dimensions.' },
        { name: 'Output Head', desc: 'Linear layer projecting to vocabulary size. Softmax gives next-token probabilities.' },
      ],
    },
  },
  {
    id: 'tokenizer',
    title: 'Tokenizer Explorer',
    icon: '🔤',
    color: 'blue',
    description: 'Understand how text becomes numbers for the model.',
    content: {
      intro: 'Tokenizers convert text to sequences of token IDs that models can process:',
      methods: [
        { name: 'Byte-Pair Encoding (BPE)', desc: 'Most popular method (used by GPT). Iteratively merges the most frequent character pairs.' },
        { name: 'WordPiece', desc: 'Used by BERT. Similar to BPE but uses likelihood-based merging.' },
        { name: 'SentencePiece', desc: 'Language-agnostic tokenizer. Used by Llama, T5. Treats text as raw bytes.' },
        { name: 'Tiktoken', desc: 'OpenAI\'s fast BPE tokenizer. Optimized for speed.' },
      ],
      example: '"Hello, world!" → ["Hello", ",", " world", "!"] → [15496, 11, 995, 0]',
    },
  },
  {
    id: 'parameters',
    title: 'Understanding Parameters',
    icon: '📐',
    color: 'peach',
    description: 'What does "7 billion parameters" actually mean?',
    content: {
      intro: 'Parameters are the learnable numbers (weights and biases) in a neural network:',
      breakdown: [
        { name: 'Embedding Matrix', formula: 'vocab_size × d_model', example: '32,000 × 4,096 = 131M params' },
        { name: 'Attention Weights (per layer)', formula: '4 × d_model²', example: '4 × 4,096² = 67M params' },
        { name: 'FFN Weights (per layer)', formula: '3 × d_model × d_ff', example: '3 × 4,096 × 11,008 = 135M params' },
        { name: 'Total for 32 layers', formula: '(67M + 135M) × 32', example: '≈ 6.5B params' },
        { name: 'Output Head', formula: 'd_model × vocab_size', example: '4,096 × 32,000 = 131M params' },
      ],
    },
  },
  {
    id: 'dataset',
    title: 'Dataset Preparation',
    icon: '📋',
    color: 'mint',
    description: 'Learn how to prepare data for fine-tuning.',
    content: {
      intro: 'Good datasets are crucial for effective fine-tuning:',
      formats: [
        { name: 'Instruction Format', example: '{"instruction": "Summarize this text", "input": "Long text...", "output": "Summary..."}' },
        { name: 'Chat Format', example: '{"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}' },
        { name: 'Completion Format', example: '{"prompt": "Question: ...", "completion": "Answer: ..."}' },
      ],
      tips: [
        'Start with at least 100-1000 high-quality examples',
        'Ensure diversity in your training data',
        'Clean data thoroughly — remove duplicates, errors, sensitive info',
        'Use consistent formatting across all examples',
        'Split into train (80%), validation (10%), test (10%)',
      ],
    },
  },
  {
    id: 'finetuning',
    title: 'Fine-Tuning Laboratory',
    icon: '🔬',
    color: 'lavender',
    description: 'Step-by-step guide to fine-tuning an LLM.',
    content: {
      intro: 'Fine-tuning adapts a pre-trained model to your specific task:',
      steps: [
        { step: 1, name: 'Select Base Model', desc: 'Choose a model matching your task needs and hardware. Start small (1-3B) for learning.' },
        { step: 2, name: 'Check License', desc: 'Verify the model license allows your use case (commercial, research, etc.).' },
        { step: 3, name: 'Prepare Dataset', desc: 'Create instruction/chat format data. Clean and validate thoroughly.' },
        { step: 4, name: 'Configure LoRA', desc: 'Set rank (r=16), alpha (32), target modules (attention layers), and dropout (0.05).' },
        { step: 5, name: 'Set Training Args', desc: 'Learning rate (2e-4), batch size (4), gradient accumulation (4), epochs (3).' },
        { step: 6, name: 'Train', desc: 'Run training with SFTTrainer from the trl library. Monitor loss curve.' },
        { step: 7, name: 'Evaluate', desc: 'Test on held-out data. Check perplexity, task-specific metrics, and sample outputs.' },
        { step: 8, name: 'Merge & Save', desc: 'Merge LoRA weights with base model. Convert to desired format (GGUF for Ollama).' },
      ],
    },
  },
  {
    id: 'lora',
    title: 'LoRA & QLoRA',
    icon: '⚡',
    color: 'pink',
    description: 'Parameter-efficient fine-tuning techniques.',
    content: {
      intro: 'LoRA and QLoRA make fine-tuning accessible on consumer hardware:',
      comparison: [
        { feature: 'Memory (7B model)', lora: '~16 GB VRAM', qlora: '~6 GB VRAM' },
        { feature: 'Quantization', lora: 'None (FP16)', qlora: '4-bit (NF4)' },
        { feature: 'Training speed', lora: 'Fast', qlora: 'Slightly slower' },
        { feature: 'Quality', lora: 'Excellent', qlora: 'Very good' },
        { feature: 'Hardware', lora: 'RTX 3090/4090', qlora: 'RTX 3060+' },
      ],
    },
  },
  {
    id: 'evaluation',
    title: 'Model Evaluation',
    icon: '📊',
    color: 'blue',
    description: 'How to measure model quality.',
    content: {
      intro: 'Evaluating LLMs requires multiple metrics and approaches:',
      metrics: [
        { name: 'Perplexity', desc: 'How surprised the model is by text. Lower = better. Typically 5-30 for good models.' },
        { name: 'BLEU Score', desc: 'Measures n-gram overlap with reference text. Used for translation quality.' },
        { name: 'ROUGE Score', desc: 'Measures recall of n-grams. Used for summarization quality.' },
        { name: 'Human Evaluation', desc: 'The gold standard. Rate outputs for helpfulness, correctness, and safety.' },
        { name: 'Benchmark Suites', desc: 'MMLU, HellaSwag, GSM8K — standardized tests for model capabilities.' },
      ],
    },
  },
  {
    id: 'quantization',
    title: 'Model Quantization',
    icon: '📦',
    color: 'peach',
    description: 'Make models smaller and faster.',
    content: {
      intro: 'Quantization reduces model precision to save memory and speed up inference:',
      levels: [
        { name: 'FP32 (Full Precision)', size: '4 bytes per param', total: '~28 GB for 7B', quality: 'Maximum' },
        { name: 'FP16 (Half Precision)', size: '2 bytes per param', total: '~14 GB for 7B', quality: 'Nearly identical' },
        { name: 'INT8 (8-bit)', size: '1 byte per param', total: '~7 GB for 7B', quality: 'Very good' },
        { name: 'INT4 (4-bit)', size: '0.5 bytes per param', total: '~3.5 GB for 7B', quality: 'Good' },
      ],
      formats: ['GPTQ — GPU-optimized quantization', 'GGUF — CPU-friendly, used by llama.cpp and Ollama', 'AWQ — Activation-aware quantization, fast inference'],
    },
  },
  {
    id: 'deployment',
    title: 'Model Deployment',
    icon: '🚀',
    color: 'mint',
    description: 'Serve your model to the world.',
    content: {
      intro: 'Deploy your fine-tuned model for real-world use:',
      options: [
        { name: 'Ollama', desc: 'Run models locally. Easy setup, GGUF format. Great for development.' },
        { name: 'vLLM', desc: 'High-throughput serving with PagedAttention. Production-grade.' },
        { name: 'Text Generation Inference (TGI)', desc: 'Hugging Face\'s serving solution. Docker-based, easy to deploy.' },
        { name: 'FastAPI + Transformers', desc: 'Build a custom API. Full control over preprocessing and postprocessing.' },
        { name: 'Hugging Face Spaces', desc: 'Free hosting for demos. Supports Gradio and Streamlit.' },
      ],
    },
  },
];

export default function ModelLab() {
  const [activeSection, setActiveSection] = useState(labSections[0].id);
  const section = labSections.find(s => s.id === activeSection);

  return (
    <div className="model-lab-page fade-in">
      <div className="ml-header">
        <h1>Model Lab</h1>
        <p className="ml-subtitle">Hands-on learning for practical LLM development.</p>
      </div>

      <div className="ml-layout">
        {/* Section navigation */}
        <div className="ml-nav card">
          <h3 className="ml-nav-title">Sections</h3>
          {labSections.map(s => (
            <button
              key={s.id}
              className={`ml-nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span className="ml-nav-icon">{s.icon}</span>
              <span className="ml-nav-label">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="ml-content">
          <div className={`ml-section-header bg-${section.color}`}>
            <span className="ml-section-icon">{section.icon}</span>
            <div>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>
          </div>

          <div className="ml-section-body card">
            <p className="ml-intro">{section.content.intro}</p>

            {/* Models list */}
            {section.content.models && (
              <div className="ml-models-grid">
                {section.content.models.map((m, i) => (
                  <div key={i} className="ml-model-card">
                    <div className="ml-model-header">
                      <h4>{m.name}</h4>
                      <span className="badge badge-intermediate">{m.params}</span>
                    </div>
                    <p>{m.desc}</p>
                    <span className="ml-license">License: {m.license}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Architecture layers */}
            {section.content.layers && (
              <div className="ml-layers">
                {section.content.layers.map((l, i) => (
                  <div key={i} className="ml-layer">
                    <div className="ml-layer-num">{i + 1}</div>
                    <div>
                      <h4>{l.name}</h4>
                      <p>{l.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tokenizer methods */}
            {section.content.methods && (
              <div className="ml-methods">
                {section.content.methods.map((m, i) => (
                  <div key={i} className="ml-method-card">
                    <h4>{m.name}</h4>
                    <p>{m.desc}</p>
                  </div>
                ))}
                {section.content.example && (
                  <div className="code-block ml-example">{section.content.example}</div>
                )}
              </div>
            )}

            {/* Parameter breakdown */}
            {section.content.breakdown && (
              <div className="ml-table-wrap">
                <table className="ml-table">
                  <thead>
                    <tr><th>Component</th><th>Formula</th><th>Example (Llama 7B)</th></tr>
                  </thead>
                  <tbody>
                    {section.content.breakdown.map((b, i) => (
                      <tr key={i}><td>{b.name}</td><td className="mono">{b.formula}</td><td>{b.example}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Dataset formats */}
            {section.content.formats && section.content.tips && (
              <div>
                <div className="ml-formats">
                  {section.content.formats.map((f, i) => (
                    <div key={i} className="ml-format-card">
                      <h4>{f.name}</h4>
                      <div className="code-block">{f.example}</div>
                    </div>
                  ))}
                </div>
                <div className="ml-tips">
                  <h4>💡 Tips</h4>
                  <ul>{section.content.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              </div>
            )}

            {/* Fine-tuning steps */}
            {section.content.steps && (
              <div className="ml-steps">
                {section.content.steps.map((s, i) => (
                  <div key={i} className="ml-step">
                    <div className="ml-step-num">{s.step}</div>
                    <div>
                      <h4>{s.name}</h4>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LoRA comparison */}
            {section.content.comparison && (
              <div className="ml-table-wrap">
                <table className="ml-table">
                  <thead><tr><th>Feature</th><th>LoRA</th><th>QLoRA</th></tr></thead>
                  <tbody>
                    {section.content.comparison.map((c, i) => (
                      <tr key={i}><td>{c.feature}</td><td>{c.lora}</td><td>{c.qlora}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Metrics */}
            {section.content.metrics && (
              <div className="ml-metrics">
                {section.content.metrics.map((m, i) => (
                  <div key={i} className="ml-metric-card">
                    <h4>{m.name}</h4>
                    <p>{m.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quantization levels */}
            {section.content.levels && (
              <div>
                <div className="ml-table-wrap">
                  <table className="ml-table">
                    <thead><tr><th>Format</th><th>Size</th><th>Total (7B)</th><th>Quality</th></tr></thead>
                    <tbody>
                      {section.content.levels.map((l, i) => (
                        <tr key={i}><td>{l.name}</td><td>{l.size}</td><td>{l.total}</td><td>{l.quality}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {section.content.formats && typeof section.content.formats[0] === 'string' && (
                  <div className="ml-format-list">
                    <h4>Popular Formats</h4>
                    <ul>{section.content.formats.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {/* Deployment options */}
            {section.content.options && (
              <div className="ml-options">
                {section.content.options.map((o, i) => (
                  <div key={i} className="ml-option-card">
                    <h4>{o.name}</h4>
                    <p>{o.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ml-cta">
            <Link to="/tutor" className="btn btn-primary">Ask AI Tutor for help →</Link>
            <Link to="/playground" className="btn btn-outline">Try Code Examples →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

