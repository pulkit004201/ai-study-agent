export const CONCEPTS = [
  {
    title: "Artificial Intelligence (AI)",
    explanation:
      "AI is the broader field of building systems that perform tasks requiring human-like intelligence, such as reasoning, planning, perception, and decision-making. It includes rule-based methods and learning-based methods.",
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
      "ML is a branch of AI where models learn patterns from historical data and improve predictions without being explicitly programmed for every rule. Performance depends on data quality, features, and training strategy.",
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
      "Deep learning is a subset of ML that uses multi-layer neural networks to automatically learn complex representations from raw data, especially for images, audio, and text.",
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
      "LLMs are transformer-based models trained on large text corpora to predict next tokens, enabling capabilities like question answering, summarization, reasoning assistance, and code generation.",
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
      "Prompt engineering is the practice of structuring instructions, context, constraints, and examples so an AI model produces more accurate, consistent, and usable outputs for a specific task.",
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
      "Embeddings map text, images, or items into dense numeric vectors where semantic similarity is captured as geometric closeness, enabling meaning-based search and matching.",
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
      "Vector databases store embeddings and perform fast nearest-neighbor search, allowing applications to retrieve semantically related content at scale with low latency.",
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
      "RAG combines a retriever that fetches relevant documents with a generator that uses that context to produce grounded answers, reducing hallucinations and improving factuality.",
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
      "Fine-tuning adapts a pretrained model on task-specific data so it learns domain language, style, and output behavior beyond generic training.",
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
      "Inference is the runtime phase where a trained model receives new input and generates predictions or outputs. It emphasizes speed, cost, and reliability in production.",
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
      "Supervised learning trains models on labeled examples, learning a mapping from inputs to known outputs so it can predict unseen cases accurately.",
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
      "Unsupervised learning finds hidden structures, groups, or patterns in unlabeled data, often used for exploration, segmentation, and anomaly discovery.",
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
      "Reinforcement learning trains an agent through trial and error, using rewards to learn a policy that maximizes long-term cumulative returns.",
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
      "Neural networks are layered function approximators that transform input data through weighted connections and nonlinear activations to learn complex relationships.",
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
      "CNNs are neural networks designed for spatial data. They use convolution filters to capture local patterns like edges, textures, and shapes in images.",
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
      "RNNs process sequential data by carrying hidden state across time steps, making them useful for tasks where earlier inputs influence later outputs.",
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
      "Transformers use self-attention to model relationships between all tokens in parallel, making them highly effective for language understanding and generation.",
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
      "Attention lets models weigh different input parts by relevance, improving context handling, long-range dependency learning, and overall prediction quality.",
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
      "In transfer settings, fine-tuning updates some or all pretrained model layers on a new dataset to improve performance for a narrower objective.",
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
      "Transfer learning reuses features learned on one large task and applies them to another related task, reducing data and training requirements.",
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
      "Overfitting occurs when a model learns noise and specifics of training data too closely, causing poor generalization to unseen real-world data.",
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
      "Underfitting happens when a model is too simple or insufficiently trained, so it cannot capture core data patterns even on training examples.",
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
      "This tradeoff balances model simplicity and flexibility: high bias causes underfitting, while high variance causes overfitting. Good performance needs an optimal middle point.",
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
      "A loss function quantifies prediction error by comparing model outputs with true targets, giving the training process a measurable objective to minimize.",
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
      "Gradient descent iteratively updates model parameters in the direction that most reduces loss, typically using backpropagation and a chosen learning rate.",
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
      "Hyperparameters are external training settings, such as learning rate or model depth, chosen before or during tuning and not learned directly from data.",
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
      "Feature engineering transforms raw data into informative variables that better represent the problem, often improving model performance and interpretability.",
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
      "Dimensionality reduction compresses high-dimensional data into fewer variables while preserving useful structure, helping with visualization, speed, and noise reduction.",
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
      "PCA is a linear technique that projects data onto orthogonal components capturing maximum variance, reducing dimensions with minimal information loss.",
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
      "Clustering groups data points by similarity without labels, revealing natural segments that support exploratory analysis and downstream targeting.",
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
      "Anomaly detection identifies rare or unusual patterns that differ from normal behavior, useful for fraud prevention, fault detection, and security monitoring.",
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
      "Recommendation systems predict items a user is likely to prefer by combining user behavior, item attributes, and interaction patterns.",
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
      "Collaborative filtering recommends items using patterns from similar users or similar item interactions, often without needing rich item metadata.",
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
      "Content-based filtering recommends items similar to what a user already liked by comparing item features such as genre, tags, or embeddings.",
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
      "NLP enables computers to process, understand, and generate human language using methods from linguistics, statistics, and deep learning.",
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
      "Sentiment analysis classifies emotional tone in text, such as positive, neutral, or negative, to summarize opinions at scale.",
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
      "Speech recognition converts spoken language into text by modeling acoustic signals and language patterns, enabling hands-free interaction.",
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
      "Computer vision allows machines to interpret images and videos for tasks like detection, segmentation, tracking, and classification.",
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
      "XAI focuses on making model decisions transparent and interpretable so humans can understand, trust, and audit AI-driven outcomes.",
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
      "AI ethics covers principles and practices that reduce harm, bias, privacy violations, and misuse while promoting fairness, accountability, and responsible deployment.",
    analogy:
      "Rules for fair play.",
    example:
      "Bias audits.",
    usage:
      "Policy, governance.",
  },
];
