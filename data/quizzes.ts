export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
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
