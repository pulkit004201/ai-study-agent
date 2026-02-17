export type VisualizeConcept = {
  title: string;
  summary: string;
  detail: string;
  analogy: string;
  useCase: string;
  image: string;
};

export const VISUALIZE_CONCEPTS: VisualizeConcept[] = [
  {
    title: "Artificial Intelligence",
    summary: "Systems that perform tasks needing human-like intelligence.",
    detail:
      "Artificial Intelligence is the broader discipline of creating software that can reason, make decisions, and adapt from feedback. It includes rule-based methods and learning-based methods.",
    analogy: "Like a digital teammate that can analyze and decide quickly.",
    useCase: "Virtual assistants, fraud detection, and recommendation engines.",
    image: "/visualize/artificial-intelligence.svg",
  },
  {
    title: "Machine Learning",
    summary: "Models learn patterns from data instead of fixed rules.",
    detail:
      "Machine Learning trains algorithms on historical examples so they can predict outcomes for new data. Performance depends heavily on data quality and model tuning.",
    analogy: "Learning from experience instead of memorizing instructions.",
    useCase: "Demand forecasting, spam detection, and personalization.",
    image: "/visualize/machine-learning.svg",
  },
  {
    title: "Neural Networks",
    summary: "Layered models that learn complex input-output mappings.",
    detail:
      "Neural networks use weighted layers and activations to transform raw input into useful predictions. They are especially effective when patterns are non-linear and high-dimensional.",
    analogy: "A network of connected decision units passing signals.",
    useCase: "Image classification, forecasting, and voice understanding.",
    image: "/visualize/neural-networks.svg",
  },
  {
    title: "Deep Learning",
    summary: "Neural networks with many layers for richer pattern learning.",
    detail:
      "Deep Learning models automatically learn feature hierarchies, making them powerful for text, audio, and image tasks where manual feature engineering is difficult.",
    analogy: "Many stacked filters refining understanding step-by-step.",
    useCase: "Speech recognition, autonomous driving, and medical imaging.",
    image: "/visualize/deep-learning.svg",
  },
  {
    title: "Natural Language Processing",
    summary: "Techniques for understanding and generating human language.",
    detail:
      "NLP combines linguistic structure with statistical modeling so machines can interpret meaning, classify text, answer questions, and generate coherent responses.",
    analogy: "Teaching software to read, write, and interpret context.",
    useCase: "Chatbots, sentiment analysis, and document search.",
    image: "/visualize/nlp.svg",
  },
  {
    title: "Computer Vision",
    summary: "AI that interprets images and videos.",
    detail:
      "Computer Vision models detect objects, classify scenes, and track motion by extracting visual patterns from pixel data using convolutional and transformer-based architectures.",
    analogy: "Giving software eyes that detect meaningful details.",
    useCase: "Defect detection, face unlock, and traffic analytics.",
    image: "/visualize/computer-vision.svg",
  },
  {
    title: "Transformers",
    summary: "Attention-based architecture for sequence modeling.",
    detail:
      "Transformers process all tokens in parallel and use attention to capture relationships across long contexts. This architecture powers modern language and multimodal models.",
    analogy: "Reading a full paragraph while focusing on relevant words.",
    useCase: "LLMs, translation, and summarization systems.",
    image: "/visualize/transformers.svg",
  },
  {
    title: "Embeddings",
    summary: "Numerical vectors that represent semantic meaning.",
    detail:
      "Embeddings convert text, images, or entities into dense vectors where semantic similarity maps to geometric closeness, enabling relevance search and recommendation.",
    analogy: "A map where similar ideas appear near each other.",
    useCase: "Semantic search, clustering, and recommendation ranking.",
    image: "/visualize/embeddings.svg",
  },
  {
    title: "Retrieval-Augmented Generation (RAG)",
    summary: "Combines search retrieval with language generation.",
    detail:
      "RAG fetches relevant documents first and then asks a model to answer using that context, improving factual grounding and reducing hallucinations.",
    analogy: "Answering with notes open instead of memory alone.",
    useCase: "Enterprise assistants and internal knowledge bots.",
    image: "/visualize/rag.svg",
  },
  {
    title: "Fine-Tuning",
    summary: "Specializing a pre-trained model for a focused task.",
    detail:
      "Fine-Tuning updates model weights using domain-specific examples so outputs align with business vocabulary, tone, and quality expectations.",
    analogy: "Advanced coaching after general training.",
    useCase: "Custom support bots, legal drafting, and clinical workflows.",
    image: "/visualize/fine-tuning.svg",
  },
];
