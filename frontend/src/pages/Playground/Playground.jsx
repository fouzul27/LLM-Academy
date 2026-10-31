import { useState } from 'react';
import './Playground.css';

const codeExamples = [
  {
    id: 'basics',
    title: 'Python Basics',
    icon: '🐍',
    color: 'mint',
    category: 'Fundamentals',
    code: `# Python Basics for AI
# Variables and data types

# Numbers
learning_rate = 0.001
epochs = 10
batch_size = 32

# Strings
model_name = "qwen2.5:1.5b"

# Lists (used for storing data)
scores = [0.85, 0.90, 0.92, 0.95]

# Dictionary (used for configurations)
config = {
    "model": model_name,
    "learning_rate": learning_rate,
    "epochs": epochs,
    "batch_size": batch_size
}

# Loop through scores
for i, score in enumerate(scores):
    print(f"Epoch {i+1}: Accuracy = {score:.2%}")

# List comprehension
high_scores = [s for s in scores if s > 0.90]
print(f"\\nHigh scores: {high_scores}")
print(f"Average: {sum(scores)/len(scores):.2%}")`,
    explanation: 'This example covers fundamental Python data types and operations used in AI development. Variables store your model configuration, lists hold training metrics, and dictionaries organize hyperparameters.',
  },
  {
    id: 'tokenization',
    title: 'Simple Tokenizer',
    icon: '🔤',
    color: 'lavender',
    category: 'NLP',
    code: `# Simple Word Tokenizer
# Understanding how text is broken into tokens

def simple_tokenize(text):
    """Split text into tokens (words and punctuation)."""
    # Convert to lowercase
    text = text.lower()
    
    # Simple word splitting
    tokens = text.split()
    
    # Remove punctuation from tokens
    clean_tokens = []
    for token in tokens:
        # Strip punctuation
        cleaned = token.strip('.,!?;:()[]{}"\\'')
        if cleaned:
            clean_tokens.append(cleaned)
    
    return clean_tokens

# Example usage
text = "What is a Large Language Model? LLMs are AI systems trained on text."
tokens = simple_tokenize(text)

print(f"Original text: {text}")
print(f"\\nTokens: {tokens}")
print(f"Number of tokens: {len(tokens)}")

# Build a simple vocabulary
vocab = sorted(set(tokens))
word_to_id = {word: idx for idx, word in enumerate(vocab)}

print(f"\\nVocabulary size: {len(vocab)}")
print(f"\\nWord to ID mapping:")
for word, idx in word_to_id.items():
    print(f"  '{word}' -> {idx}")`,
    explanation: 'Tokenization is the first step in NLP — converting text into discrete units (tokens). Real LLMs use subword tokenizers like BPE (Byte-Pair Encoding), but this shows the basic concept.',
  },
  {
    id: 'embeddings',
    title: 'Word Embeddings',
    icon: '📊',
    color: 'blue',
    category: 'NLP',
    code: `# Understanding Word Embeddings
# Words represented as numerical vectors

import numpy as np

# Simulated word embeddings (in reality, these are learned)
# Each word is represented as a vector of numbers
embeddings = {
    "king":    np.array([0.8, 0.2, 0.9, 0.1, 0.7]),
    "queen":   np.array([0.7, 0.8, 0.9, 0.1, 0.6]),
    "man":     np.array([0.9, 0.1, 0.5, 0.2, 0.8]),
    "woman":   np.array([0.8, 0.9, 0.5, 0.2, 0.7]),
    "prince":  np.array([0.85, 0.15, 0.85, 0.3, 0.75]),
}

def cosine_similarity(a, b):
    """Measure how similar two vectors are."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Compare word similarities
print("Word Similarity Scores:")
print(f"  king ~ queen:  {cosine_similarity(embeddings['king'], embeddings['queen']):.4f}")
print(f"  king ~ man:    {cosine_similarity(embeddings['king'], embeddings['man']):.4f}")
print(f"  man ~ woman:   {cosine_similarity(embeddings['man'], embeddings['woman']):.4f}")

# Famous analogy: king - man + woman ≈ queen
result = embeddings["king"] - embeddings["man"] + embeddings["woman"]
print(f"\\nking - man + woman =")

# Find closest word
best_word = ""
best_sim = -1
for word, vec in embeddings.items():
    sim = cosine_similarity(result, vec)
    print(f"  Similarity to '{word}': {sim:.4f}")
    if sim > best_sim:
        best_sim = sim
        best_word = word

print(f"\\nClosest word: '{best_word}' ✓")`,
    explanation: 'Word embeddings convert words to dense numerical vectors where similar words are close together. This enables mathematical operations on language — the foundation of how neural networks process text.',
  },
  {
    id: 'attention',
    title: 'Self-Attention',
    icon: '⚡',
    color: 'peach',
    category: 'Transformers',
    code: `# Simplified Self-Attention Mechanism
# The core innovation behind Transformers

import numpy as np

def softmax(x):
    """Convert scores to probabilities."""
    exp_x = np.exp(x - np.max(x))
    return exp_x / exp_x.sum()

def self_attention(query, key, value):
    """
    Simplified self-attention.
    
    In a real Transformer:
    - Q, K, V are learned linear projections
    - There are multiple attention heads
    - Scaling factor sqrt(d_k) is applied
    """
    # Step 1: Calculate attention scores (Q @ K^T)
    d_k = query.shape[-1]
    scores = np.dot(query, key.T) / np.sqrt(d_k)
    
    # Step 2: Apply softmax to get attention weights
    weights = softmax(scores)
    
    # Step 3: Multiply weights by values
    output = np.dot(weights, value)
    
    return output, weights

# Example: 3 tokens, embedding dimension = 4
# Tokens: ["The", "cat", "sat"]
np.random.seed(42)
sequence_length = 3
d_model = 4

# Simulated embeddings for each token
embeddings = np.random.randn(sequence_length, d_model)

print("Token Embeddings:")
tokens = ["The", "cat", "sat"]
for i, token in enumerate(tokens):
    print(f"  {token}: {embeddings[i].round(3)}")

# In practice, Q, K, V come from linear layers
# Here we use the embeddings directly
Q = K = V = embeddings

output, attention_weights = self_attention(Q, K, V)

print(f"\\nAttention Weights (who attends to whom):")
for i, token in enumerate(tokens):
    weights_str = ", ".join([f"{tokens[j]}:{w:.3f}" for j, w in enumerate(attention_weights[i])])
    print(f"  {token} -> [{weights_str}]")

print(f"\\nOutput (context-aware representations):")
for i, token in enumerate(tokens):
    print(f"  {token}: {output[i].round(3)}")`,
    explanation: 'Self-attention lets each token "look at" every other token to build contextual understanding. This is why Transformers understand that "bank" means different things in "river bank" vs "bank account".',
  },
  {
    id: 'huggingface',
    title: 'Hugging Face Basics',
    icon: '🤗',
    color: 'pink',
    category: 'LLM',
    code: `# Using Hugging Face Transformers
# Load and use pre-trained models

# NOTE: This code requires the 'transformers' library
# pip install transformers torch

from transformers import pipeline, AutoTokenizer

# --- Text Generation ---
# generator = pipeline("text-generation", model="gpt2")
# result = generator("AI is transforming", max_length=50)
# print(result[0]["generated_text"])

# --- Tokenizer Example ---
# See how models break text into tokens

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

text = "Understanding Large Language Models"
tokens = tokenizer.tokenize(text)
token_ids = tokenizer.encode(text)

print(f"Text: {text}")
print(f"Tokens: {tokens}")
print(f"Token IDs: {token_ids}")
print(f"Number of tokens: {len(tokens)}")

# Decode back
decoded = tokenizer.decode(token_ids)
print(f"Decoded: {decoded}")

# --- Sentiment Analysis ---
# classifier = pipeline("sentiment-analysis")
# result = classifier("I love learning about AI!")
# print(f"Sentiment: {result[0]['label']}")
# print(f"Confidence: {result[0]['score']:.4f}")

# --- Available Pipeline Tasks ---
tasks = [
    "text-generation",
    "text-classification",
    "question-answering",
    "summarization",
    "translation",
    "fill-mask",
    "token-classification",
    "zero-shot-classification",
]
print("\\nAvailable Hugging Face Pipeline Tasks:")
for task in tasks:
    print(f"  • {task}")`,
    explanation: 'Hugging Face provides the most popular library for working with pre-trained models. The pipeline API makes it easy to use models for various NLP tasks with just a few lines of code.',
  },
  {
    id: 'finetuning',
    title: 'LoRA Fine-Tuning',
    icon: '🔧',
    color: 'lavender',
    category: 'Fine-Tuning',
    code: `# LoRA Fine-Tuning Conceptual Example
# Low-Rank Adaptation of Large Language Models

# NOTE: This requires transformers, peft, torch
# pip install transformers peft torch datasets

# --- Understanding LoRA ---
# Instead of updating ALL model parameters (billions),
# LoRA adds small trainable matrices (thousands)

# Original weight matrix W (frozen): [d x k]
# LoRA adds: W + BA where
#   B: [d x r]  (small rank)
#   A: [r x k]  (small rank)
#   r << min(d, k), typically r = 8, 16, or 32

# Example: A 7B parameter model
total_params = 7_000_000_000
lora_rank = 16
# Rough estimate of LoRA parameters
# For each attention layer (Q, K, V, O projections)
d_model = 4096
num_layers = 32
lora_params = num_layers * 4 * (d_model * lora_rank + lora_rank * d_model) * 2

print("=== LoRA Efficiency ===")
print(f"Total model parameters: {total_params:,}")
print(f"LoRA parameters (r={lora_rank}): {lora_params:,}")
print(f"Trainable: {lora_params/total_params:.4%}")
print(f"Memory savings: ~{100 - lora_params/total_params*100:.1f}%")

# --- Conceptual Training Setup ---
config_example = """
# LoRA Configuration
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,                    # Rank
    lora_alpha=32,           # Scaling factor
    target_modules=[         # Which layers to adapt
        "q_proj", "k_proj",
        "v_proj", "o_proj"
    ],
    lora_dropout=0.05,       # Dropout for regularization
    bias="none",             # Don't train biases
    task_type="CAUSAL_LM"    # Language modeling
)

# Apply LoRA to model
model = get_peft_model(base_model, lora_config)
model.print_trainable_parameters()
# Output: trainable params: 4,194,304 || all: 7B || trainable%: 0.06%
"""
print(config_example)`,
    explanation: 'LoRA (Low-Rank Adaptation) makes fine-tuning large models practical by only training tiny adapter matrices instead of the full model. This reduces memory by ~99% while maintaining quality.',
  },
];

export default function Playground() {
  const [selectedExample, setSelectedExample] = useState(codeExamples[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedExample.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setSelectedExample({ ...selectedExample });
  };

  const categories = [...new Set(codeExamples.map(e => e.category))];

  return (
    <div className="playground-page fade-in">
      <div className="pg-header">
        <div>
          <h1>Code Playground</h1>
          <p className="pg-subtitle">Explore Python examples for AI and LLM development. Study, modify, and learn.</p>
        </div>
        <div className="pg-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Learning environment — run these examples in your local Python setup or Jupyter notebook</span>
        </div>
      </div>

      <div className="pg-layout">
        {/* Sidebar - example list */}
        <div className="pg-sidebar card">
          <h3 className="pg-sidebar-title">Examples</h3>
          {categories.map(cat => (
            <div key={cat} className="pg-category">
              <span className="pg-cat-label">{cat}</span>
              {codeExamples.filter(e => e.category === cat).map(example => (
                <button
                  key={example.id}
                  className={`pg-example-btn ${selectedExample.id === example.id ? 'active' : ''}`}
                  onClick={() => setSelectedExample(example)}
                >
                  <span className="pg-example-icon">{example.icon}</span>
                  <span>{example.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div className="pg-main">
          {/* Code editor */}
          <div className="pg-editor card">
            <div className="pg-editor-header">
              <div className="pg-editor-title">
                <span className={`pg-dot bg-${selectedExample.color}`}></span>
                <h3>{selectedExample.title}</h3>
                <span className="badge badge-beginner">{selectedExample.category}</span>
              </div>
              <div className="pg-editor-actions">
                <button className="btn btn-outline btn-sm" onClick={handleCopy}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={handleReset}>
                  🔄 Reset
                </button>
              </div>
            </div>
            <div className="pg-code-area">
              <pre className="code-block pg-code">{selectedExample.code}</pre>
            </div>
          </div>

          {/* Explanation */}
          <div className="pg-explanation card">
            <h4>💡 Explanation</h4>
            <p>{selectedExample.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

