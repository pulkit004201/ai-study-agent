"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* ---------------- TYPES ---------------- */

type Concept = {
  title: string;
  explanation: string;
  analogy: string;
};

/* ---------------- DATA (50 CONCEPTS) ---------------- */

const ALL_CONCEPTS: Concept[] = [
  { title: "Artificial Intelligence (AI)", explanation: "AI enables machines to perform tasks that normally require human intelligence.", analogy: "A digital assistant that can think." },
  { title: "Machine Learning (ML)", explanation: "ML allows systems to learn from data without explicit programming.", analogy: "Learning to ride a bike by practice." },
  { title: "Deep Learning (DL)", explanation: "Uses neural networks with many layers for complex problems.", analogy: "A brain with multiple thinking layers." },
  { title: "Supervised Learning", explanation: "Learning using labeled data.", analogy: "Learning with a teacher." },
  { title: "Unsupervised Learning", explanation: "Finding patterns in unlabeled data.", analogy: "Finding groups in a crowd." },

  { title: "Reinforcement Learning", explanation: "Learning via rewards and penalties.", analogy: "Training a dog with treats." },
  { title: "Training vs Inference", explanation: "Training teaches models, inference predicts outcomes.", analogy: "Studying vs exam." },
  { title: "Feature Engineering", explanation: "Transforming raw data into useful inputs.", analogy: "Preparing ingredients before cooking." },
  { title: "Overfitting", explanation: "Model memorizes training data.", analogy: "Memorizing answers." },
  { title: "Underfitting", explanation: "Model is too simple to learn patterns.", analogy: "Not studying enough." },

  { title: "Datasets", explanation: "Collections of data for training.", analogy: "Study material." },
  { title: "Data Labeling", explanation: "Tagging data with correct outputs.", analogy: "Answer key." },
  { title: "Data Preprocessing", explanation: "Cleaning and preparing data.", analogy: "Washing vegetables." },
  { title: "Model Architecture", explanation: "Structure of the neural network.", analogy: "Building blueprint." },
  { title: "Loss Function", explanation: "Measures prediction error.", analogy: "Exam score." },

  { title: "Optimization", explanation: "Improving model performance.", analogy: "Course correction." },
  { title: "Hyperparameters", explanation: "Model configuration values.", analogy: "Difficulty settings." },
  { title: "Generalization", explanation: "Performance on unseen data.", analogy: "Applying knowledge in new exams." },
  { title: "Transfer Learning", explanation: "Using pre-trained models.", analogy: "Using past job experience." },
  { title: "Model Deployment", explanation: "Putting models into production.", analogy: "Launching a product." },

  { title: "NLP", explanation: "Understanding human language.", analogy: "Teaching computers to read." },
  { title: "Tokenization", explanation: "Breaking text into tokens.", analogy: "LEGO blocks." },
  { title: "Embeddings", explanation: "Numeric meaning representations.", analogy: "GPS for words." },
  { title: "Attention", explanation: "Focusing on important parts of text.", analogy: "Highlighting text." },
  { title: "Transformers", explanation: "Parallel architecture for language models.", analogy: "Reading a paragraph at once." },

  { title: "LLMs", explanation: "Large models trained on massive text.", analogy: "Advanced autocomplete." },
  { title: "Prompt Engineering", explanation: "Designing effective prompts.", analogy: "Asking the right question." },
  { title: "Fine-tuning", explanation: "Specializing models with domain data.", analogy: "Job training." },
  { title: "Hallucinations", explanation: "Model generating incorrect info.", analogy: "Confident wrong answers." },
  { title: "Context Window", explanation: "How much text a model remembers.", analogy: "Short-term memory." },

  { title: "Vector Databases", explanation: "Stores embeddings for search.", analogy: "Smart library." },
  { title: "Similarity Search", explanation: "Finding nearest matches.", analogy: "Finding similar songs." },
  { title: "RAG", explanation: "Retrieval + generation.", analogy: "Open-book exam." },
  { title: "AI Agents", explanation: "Autonomous decision-making systems.", analogy: "Digital employees." },
  { title: "Tool Calling", explanation: "AI using external tools.", analogy: "Using a calculator." },

  { title: "Evaluation Metrics", explanation: "Measuring model quality.", analogy: "Grades." },
  { title: "A/B Testing", explanation: "Comparing AI versions.", analogy: "Taste testing." },
  { title: "Explainable AI", explanation: "Understanding AI decisions.", analogy: "Showing your work." },
  { title: "AI Bias", explanation: "Unfair model behavior.", analogy: "Biased grading." },
  { title: "Responsible AI", explanation: "Ethical AI usage.", analogy: "Corporate governance." },
];

/* ---------------- PAGE ---------------- */

const CONCEPTS_PER_PAGE = 5;

export default function LearnPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) router.push("/");
  }, [router]);

  const totalPages = Math.ceil(ALL_CONCEPTS.length / CONCEPTS_PER_PAGE);

  const visibleConcepts = useMemo(() => {
    const start = page * CONCEPTS_PER_PAGE;
    return ALL_CONCEPTS.slice(start, start + CONCEPTS_PER_PAGE);
  }, [page]);

  return (
    <main style={{ padding: 40, maxWidth: 900 }}>
      <h1>Learn AI Concepts</h1>
      <p>
        Concepts {page * CONCEPTS_PER_PAGE + 1}–
        {Math.min((page + 1) * CONCEPTS_PER_PAGE, ALL_CONCEPTS.length)} of{" "}
        {ALL_CONCEPTS.length}
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
        {visibleConcepts.map((c) => (
          <div
            key={c.title}
            style={{
              padding: 20,
              background: "#111",
              borderRadius: 10,
              border: "1px solid #222",
            }}
          >
            <h3>{c.title}</h3>
            <p>
              <strong>Explanation:</strong> {c.explanation}
            </p>
            <p>
              <strong>Analogy:</strong> {c.analogy}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 30,
        }}
      >
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 0}
          style={buttonStyle(page === 0)}
        >
          Back
        </button>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page === totalPages - 1}
          style={buttonStyle(page === totalPages - 1)}
        >
          Next
        </button>
      </div>
    </main>
  );
}

/* ---------------- STYLES ---------------- */

const buttonStyle = (disabled: boolean) => ({
  padding: "10px 20px",
  fontSize: 16,
  borderRadius: 6,
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  backgroundColor: disabled ? "#333" : "#ffffff",
  color: disabled ? "#777" : "#000",
});
