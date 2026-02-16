"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const QUESTIONS = [
  {
    id: 1,
    question: "What does Artificial Intelligence primarily aim to simulate?",
    options: [
      "Human emotions",
      "Human intelligence",
      "Human appearance",
      "Human language only"
    ],
    correctIndex: 1,
    explanation: "AI focuses on simulating human intelligence such as learning, reasoning, and decision-making."
  },
  {
    id: 2,
    question: "Which of the following is an example of Narrow AI?",
    options: [
      "Self-aware robot",
      "Google Search",
      "Human brain",
      "General problem-solving AI"
    ],
    correctIndex: 1,
    explanation: "Google Search performs a specific task and is a classic example of Narrow AI."
  },
  {
    id: 3,
    question: "What is Machine Learning?",
    options: [
      "Programming machines manually",
      "Machines learning from data",
      "Machines replacing humans",
      "Machines using hardware acceleration"
    ],
    correctIndex: 1,
    explanation: "Machine Learning allows systems to learn patterns from data without being explicitly programmed."
  },
  {
    id: 4,
    question: "Which algorithm type learns using labeled data?",
    options: [
      "Unsupervised learning",
      "Reinforcement learning",
      "Supervised learning",
      "Clustering"
    ],
    correctIndex: 2,
    explanation: "Supervised learning uses labeled datasets to train models."
  },
  {
    id: 5,
    question: "What is Deep Learning based on?",
    options: [
      "Decision trees",
      "Rule engines",
      "Neural networks",
      "Databases"
    ],
    correctIndex: 2,
    explanation: "Deep Learning uses multi-layered neural networks inspired by the human brain."
  },
  {
    id: 6,
    question: "Which component allows a neural network to learn?",
    options: [
      "Activation function",
      "Loss function",
      "Weights update",
      "All of the above"
    ],
    correctIndex: 3,
    explanation: "Learning occurs through loss calculation, activation functions, and weight updates."
  },
  {
    id: 7,
    question: "What is Natural Language Processing (NLP) used for?",
    options: [
      "Image recognition",
      "Speech generation",
      "Understanding human language",
      "Robotics control"
    ],
    correctIndex: 2,
    explanation: "NLP helps machines understand, interpret, and generate human language."
  },
  {
    id: 8,
    question: "Which is a common NLP application?",
    options: [
      "Spam detection",
      "Face recognition",
      "Autonomous driving",
      "Game physics"
    ],
    correctIndex: 0,
    explanation: "Spam detection uses NLP to analyze email text."
  },
  {
    id: 9,
    question: "What does a recommendation system primarily use?",
    options: [
      "User preferences",
      "Random selection",
      "Hardware speed",
      "Manual tagging only"
    ],
    correctIndex: 0,
    explanation: "Recommendation systems analyze user behavior and preferences."
  },
  {
    id: 10,
    question: "What is Reinforcement Learning based on?",
    options: [
      "Labeled datasets",
      "Punishment and reward",
      "Static rules",
      "Human supervision"
    ],
    correctIndex: 1,
    explanation: "Reinforcement learning trains agents using rewards and penalties."
  },
  {
    id: 11,
    question: "Which AI model is commonly used for image recognition?",
    options: [
      "CNN",
      "RNN",
      "Linear Regression",
      "Naive Bayes"
    ],
    correctIndex: 0,
    explanation: "Convolutional Neural Networks (CNNs) are designed for image processing."
  },
  {
    id: 12,
    question: "What does overfitting mean?",
    options: [
      "Model performs well on new data",
      "Model memorizes training data",
      "Model has too little data",
      "Model runs slowly"
    ],
    correctIndex: 1,
    explanation: "Overfitting happens when a model memorizes training data and fails to generalize."
  },
  {
    id: 13,
    question: "What helps prevent overfitting?",
    options: [
      "More parameters",
      "Regularization",
      "Less data",
      "Removing validation"
    ],
    correctIndex: 1,
    explanation: "Regularization techniques reduce overfitting by constraining model complexity."
  },
  {
    id: 14,
    question: "Which metric measures classification accuracy?",
    options: [
      "MSE",
      "Precision",
      "Loss",
      "Gradient"
    ],
    correctIndex: 1,
    explanation: "Precision measures how many predicted positives are actually correct."
  },
  {
    id: 15,
    question: "What is a chatbot an example of?",
    options: [
      "Computer Vision",
      "NLP application",
      "Robotics",
      "Hardware automation"
    ],
    correctIndex: 1,
    explanation: "Chatbots use NLP to communicate with users."
  },
  {
    id: 16,
    question: "Which company popularized Transformers?",
    options: [
      "Meta",
      "Google",
      "Amazon",
      "Netflix"
    ],
    correctIndex: 1,
    explanation: "Google introduced Transformers in the paper 'Attention Is All You Need'."
  },
  {
    id: 17,
    question: "What is fine-tuning?",
    options: [
      "Training from scratch",
      "Adjusting a pretrained model",
      "Removing layers",
      "Changing hardware"
    ],
    correctIndex: 1,
    explanation: "Fine-tuning adapts a pretrained model to a specific task."
  },
  {
    id: 18,
    question: "What does RAG stand for?",
    options: [
      "Random AI Generator",
      "Retrieval Augmented Generation",
      "Recursive AI Graph",
      "Real-time AI Generator"
    ],
    correctIndex: 1,
    explanation: "RAG combines retrieval with generation for better responses."
  },
  {
    id: 19,
    question: "Which is an ethical concern in AI?",
    options: [
      "Bias",
      "Speed",
      "Scalability",
      "Caching"
    ],
    correctIndex: 0,
    explanation: "Bias can lead to unfair or harmful AI outcomes."
  },
  {
    id: 20,
    question: "What is the main goal of Explainable AI (XAI)?",
    options: [
      "Make AI faster",
      "Reduce cost",
      "Make AI decisions understandable",
      "Automate training"
    ],
    correctIndex: 2,
    explanation: "XAI focuses on transparency and interpretability of AI decisions."
  }
];

export default function QuizPage() {
  const router = useRouter();

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const q = QUESTIONS[current];

  function selectOption(i: number) {
    if (showAnswer) return;

    setSelected(i);
    setShowAnswer(true);
    if (i === q.correctIndex) setScore((s) => s + 1);
  }

  function nextQuestion() {
    setSelected(null);
    setShowAnswer(false);

    if (current + 1 < QUESTIONS.length) {
      setCurrent((c) => c + 1);
    } else {
      setCompleted(true);
    }
  }

  return (
    <main style={page}>
      <div style={container}>
        <p style={eyebrow}>QUIZ MODE</p>
        <h1 style={headline}>AI Quiz</h1>

        {!completed ? (
          <section style={card}>
            <p style={counter}>
              Question {current + 1} of {QUESTIONS.length}
            </p>

            <h3 style={question}>{q.question}</h3>

            {q.options.map((opt, i) => {
  let bg: string = optionBg;

  if (showAnswer) {
    if (i === q.correctIndex) bg = correctBg;
    else if (i === selected) bg = wrongBg;
  }

  return (
    <button
      key={i}
      onClick={() => selectOption(i)}
      style={{
        ...option,
        background: bg,
        cursor: showAnswer ? "default" : "pointer",
      }}
    >
      {opt}
    </button>
  );
})}


            {showAnswer && (
              <div style={explanation}>
                <strong>Explanation</strong>
                <p>{q.explanation}</p>
              </div>
            )}

            {showAnswer && (
              <button style={nextBtn} onClick={nextQuestion}>
                {current + 1 === QUESTIONS.length
                  ? "Finish Quiz"
                  : "Next →"}
              </button>
            )}
          </section>
        ) : (
          <section style={card}>
            <h2 style={{ marginBottom: 12 }}>Quiz Completed 🎉</h2>
            <p style={{ opacity: 0.8 }}>
              You scored <strong>{score}</strong> out of{" "}
              {QUESTIONS.length}
            </p>

            <button
              style={primaryBtn}
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

/* ---------------- Styles ---------------- */

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(1200px 600px at 30% -10%, rgba(56,189,248,0.18), transparent 40%), #020617",
  padding: "80px 24px",
  color: "#e5e7eb",
};

const container = {
  maxWidth: 720,
  margin: "0 auto",
};

const eyebrow = {
  fontSize: 12,
  letterSpacing: "0.14em",
  color: "#67e8f9",
  marginBottom: 8,
};

const headline = {
  fontSize: 36,
  fontWeight: 800,
  marginBottom: 28,
};

const card = {
  padding: 28,
  borderRadius: 20,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
};

const counter = {
  fontSize: 14,
  opacity: 0.6,
};

const question = {
  fontSize: 20,
  fontWeight: 600,
  margin: "12px 0 18px",
};

const option = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e5e7eb",
  marginBottom: 12,
  textAlign: "left" as const,
  transition: "all 0.25s ease",
};

const optionBg = "rgba(255,255,255,0.06)";
const correctBg = "linear-gradient(90deg, #14532d, #166534)";
const wrongBg = "linear-gradient(90deg, #7f1d1d, #991b1b)";

const explanation = {
  marginTop: 16,
  padding: 14,
  background: "rgba(255,255,255,0.06)",
  borderRadius: 12,
  fontSize: 14,
  lineHeight: 1.6,
};

const nextBtn = {
  marginTop: 20,
  padding: "10px 18px",
  borderRadius: 999,
  background: "#2563eb",
  border: "none",
  color: "#fff",
  cursor: "pointer",
};

const primaryBtn = {
  marginTop: 20,
  padding: "12px 22px",
  borderRadius: 999,
  background: "#22c55e",
  border: "none",
  color: "#022c22",
  fontWeight: 600,
  cursor: "pointer",
};
