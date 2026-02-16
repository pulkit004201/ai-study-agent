export const CONCEPTS = [
  {
    title: "Artificial Intelligence (AI)",
    explanation:
      "AI refers to machines that can simulate human intelligence such as learning, reasoning, and decision-making.",
    analogy:
      "Like a human brain that can think and learn from experience.",
    example:
      "Google Search predicting what you want to type next.",
    usage:
      "Used in chatbots, recommendations, fraud detection, and automation.",
  },
  {
    title: "Machine Learning (ML)",
    explanation:
      "ML is a subset of AI where systems learn patterns from data instead of being explicitly programmed.",
    analogy:
      "Like learning to ride a bicycle by practicing, not reading instructions.",
    example:
      "Netflix recommending shows based on viewing history.",
    usage:
      "Used in personalization, forecasting, and classification tasks.",
  },
  {
    title: "Deep Learning",
    explanation:
      "Deep Learning uses neural networks with many layers to model complex patterns.",
    analogy:
      "Like multiple filters refining an image step by step.",
    example:
      "Face recognition in smartphones.",
    usage:
      "Used in image recognition, speech, and autonomous vehicles.",
  },
  {
    title: "Large Language Models (LLMs)",
    explanation:
      "LLMs are AI models trained on massive text data to understand and generate language.",
    analogy:
      "Like a person who has read millions of books.",
    example:
      "ChatGPT generating answers.",
    usage:
      "Used in chatbots, coding assistants, and summarization.",
  },
  {
    title: "Prompt Engineering",
    explanation:
      "Designing effective prompts to get better outputs from AI models.",
    analogy:
      "Asking the right question to get the best answer.",
    example:
      "Specifying tone, format, and role in ChatGPT.",
    usage:
      "Used heavily in AI tools and copilots.",
  },
  {
    title: "Embeddings",
    explanation:
      "Embeddings convert text or data into numerical vectors representing meaning.",
    analogy:
      "Placing similar books close together on a shelf.",
    example:
      "Semantic search systems.",
    usage:
      "Used in recommendation, search, and clustering.",
  },
  {
    title: "Vector Databases",
    explanation:
      "Databases optimized to store and search vector embeddings efficiently.",
    analogy:
      "A GPS system for finding nearby places.",
    example:
      "Pinecone, Weaviate.",
    usage:
      "Used in AI search and retrieval systems.",
  },
  {
    title: "Retrieval Augmented Generation (RAG)",
    explanation:
      "Combines document retrieval with text generation for accurate answers.",
    analogy:
      "Open-book exam instead of memorization.",
    example:
      "Chatbot answering using company documents.",
    usage:
      "Used in enterprise chatbots and knowledge systems.",
  },
  {
    title: "Fine-Tuning",
    explanation:
      "Training a model further on specific data to specialize it.",
    analogy:
      "Special coaching after general education.",
    example:
      "Custom chatbot trained on medical data.",
    usage:
      "Used when domain-specific accuracy is needed.",
  },
  {
    title: "Inference",
    explanation:
      "The process of generating output from a trained model.",
    analogy:
      "Applying learned knowledge in real life.",
    example:
      "ChatGPT responding to a prompt.",
    usage:
      "Used whenever AI produces results.",
  },


  /* ---------------- 11–20 ---------------- */

  {
    title: "Supervised Learning",
    explanation:
      "A learning approach where models are trained on labeled data with known outcomes.",
    analogy:
      "Like learning with a teacher who corrects your answers.",
    example:
      "Email spam classification using labeled emails.",
    usage:
      "Fraud detection, image classification, medical diagnosis.",
  },
  {
    title: "Unsupervised Learning",
    explanation:
      "A method where models find patterns in unlabeled data.",
    analogy:
      "Sorting photos without knowing who is in them.",
    example:
      "Customer segmentation using clustering.",
    usage:
      "Market segmentation, anomaly detection.",
  },
  {
    title: "Reinforcement Learning",
    explanation:
      "An agent learns by interacting with an environment using rewards and penalties.",
    analogy:
      "Training a dog using treats for good behavior.",
    example:
      "Game-playing AI like AlphaGo.",
    usage:
      "Robotics, recommendation systems, dynamic pricing.",
  },
  {
    title: "Neural Networks",
    explanation:
      "Models inspired by the human brain that process data through interconnected layers.",
    analogy:
      "A network of neurons passing signals.",
    example:
      "Handwritten digit recognition.",
    usage:
      "Vision, speech recognition, forecasting.",
  },
  {
    title: "Convolutional Neural Networks (CNNs)",
    explanation:
      "Neural networks specialized for image and spatial data.",
    analogy:
      "Scanning an image piece by piece.",
    example:
      "Face detection systems.",
    usage:
      "Medical imaging, autonomous vehicles.",
  },
  {
    title: "Recurrent Neural Networks (RNNs)",
    explanation:
      "Neural networks designed to handle sequential data.",
    analogy:
      "Remembering previous words while reading a sentence.",
    example:
      "Language translation.",
    usage:
      "Speech recognition, time-series forecasting.",
  },
  {
    title: "Transformers",
    explanation:
      "A model architecture that processes data using attention mechanisms.",
    analogy:
      "Paying attention only to important words in a sentence.",
    example:
      "GPT and BERT models.",
    usage:
      "Chatbots, document summarization.",
  },
  {
    title: "Attention Mechanism",
    explanation:
      "Allows models to focus on relevant parts of input data.",
    analogy:
      "Highlighting important text while reading.",
    example:
      "Machine translation.",
    usage:
      "LLMs, recommendation engines.",
  },
  {
    title: "Fine-Tuning",
    explanation:
      "Adapting a pre-trained model for a specific task.",
    analogy:
      "Specializing after general education.",
    example:
      "Custom chatbots trained on company data.",
    usage:
      "Customer support, legal AI.",
  },
  {
    title: "Transfer Learning",
    explanation:
      "Reusing knowledge from one task to solve another.",
    analogy:
      "Using cycling skills to learn motorbiking.",
    example:
      "Using ImageNet-trained models for medical images.",
    usage:
      "Low-data AI applications.",
  },

  /* ---------------- 21–30 ---------------- */

  {
    title: "Overfitting",
    explanation:
      "When a model memorizes training data and fails to generalize.",
    analogy:
      "Memorizing answers without understanding concepts.",
    example:
      "High training accuracy but poor test accuracy.",
    usage:
      "Model evaluation & improvement.",
  },
  {
    title: "Underfitting",
    explanation:
      "When a model is too simple to capture data patterns.",
    analogy:
      "Studying too little for an exam.",
    example:
      "Linear model for complex data.",
    usage:
      "Model tuning decisions.",
  },
  {
    title: "Bias-Variance Tradeoff",
    explanation:
      "Balancing simplicity and complexity in models.",
    analogy:
      "Balancing speed and accuracy.",
    example:
      "Choosing model depth.",
    usage:
      "ML model optimization.",
  },
  {
    title: "Loss Function",
    explanation:
      "Measures how far predictions are from actual outcomes.",
    analogy:
      "Scorecard for mistakes.",
    example:
      "Cross-entropy loss.",
    usage:
      "Training ML models.",
  },
  {
    title: "Gradient Descent",
    explanation:
      "Optimization technique to minimize loss.",
    analogy:
      "Walking downhill to reach the lowest point.",
    example:
      "Training neural networks.",
    usage:
      "Model training.",
  },
  {
    title: "Hyperparameters",
    explanation:
      "Settings defined before training a model.",
    analogy:
      "Recipe settings like oven temperature.",
    example:
      "Learning rate, batch size.",
    usage:
      "Model tuning.",
  },
  {
    title: "Feature Engineering",
    explanation:
      "Creating meaningful input features from raw data.",
    analogy:
      "Preparing ingredients before cooking.",
    example:
      "Extracting day-of-week from dates.",
    usage:
      "Classical ML systems.",
  },
  {
    title: "Dimensionality Reduction",
    explanation:
      "Reducing number of input variables.",
    analogy:
      "Summarizing a long book.",
    example:
      "PCA.",
    usage:
      "Visualization, performance improvement.",
  },
  {
    title: "Principal Component Analysis (PCA)",
    explanation:
      "Technique to reduce data dimensions.",
    analogy:
      "Finding main themes in data.",
    example:
      "Customer behavior analysis.",
    usage:
      "Exploratory data analysis.",
  },
  {
    title: "Clustering",
    explanation:
      "Grouping similar data points together.",
    analogy:
      "Sorting books by genre.",
    example:
      "K-means clustering.",
    usage:
      "User segmentation.",
  },

  /* ---------------- 31–40 ---------------- */

  {
    title: "Anomaly Detection",
    explanation:
      "Identifying unusual data points.",
    analogy:
      "Spotting suspicious activity.",
    example:
      "Credit card fraud detection.",
    usage:
      "Security, monitoring systems.",
  },
  {
    title: "Recommendation Systems",
    explanation:
      "Suggesting items based on user behavior.",
    analogy:
      "Personal shopping assistant.",
    example:
      "Netflix recommendations.",
    usage:
      "E-commerce, media platforms.",
  },
  {
    title: "Collaborative Filtering",
    explanation:
      "Recommending based on similar users.",
    analogy:
      "Friends recommending movies.",
    example:
      "Amazon suggestions.",
    usage:
      "Personalization.",
  },
  {
    title: "Content-Based Filtering",
    explanation:
      "Recommending based on item similarity.",
    analogy:
      "Suggesting similar books.",
    example:
      "Spotify playlists.",
    usage:
      "Media recommendations.",
  },
  {
    title: "Natural Language Processing (NLP)",
    explanation:
      "Enabling machines to understand human language.",
    analogy:
      "Teaching computers to read.",
    example:
      "Chatbots.",
    usage:
      "Search, customer support.",
  },
  {
    title: "Sentiment Analysis",
    explanation:
      "Detecting emotions in text.",
    analogy:
      "Reading tone in messages.",
    example:
      "Twitter sentiment tracking.",
    usage:
      "Brand monitoring.",
  },
  {
    title: "Speech Recognition",
    explanation:
      "Converting speech to text.",
    analogy:
      "Dictation.",
    example:
      "Voice assistants.",
    usage:
      "Smart devices.",
  },
  {
    title: "Computer Vision",
    explanation:
      "Understanding images and videos.",
    analogy:
      "Teaching machines to see.",
    example:
      "Self-driving cars.",
    usage:
      "Healthcare, surveillance.",
  },
  {
    title: "Explainable AI (XAI)",
    explanation:
      "Making AI decisions understandable.",
    analogy:
      "Showing your working in math.",
    example:
      "Loan approval explanations.",
    usage:
      "Regulated industries.",
  },
  {
    title: "AI Ethics",
    explanation:
      "Ensuring responsible AI usage.",
    analogy:
      "Rules for fair play.",
    example:
      "Bias audits.",
    usage:
      "Policy, governance.",
  },
];
 // -------- CONTINUE SAME FORMAT --------

