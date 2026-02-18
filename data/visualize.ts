export type VisualizeConcept = {
  title: string;
  summary: string;
  detail: string;
  analogy: string;
  useCase: string;
  image: string;
  extraImages?: string[];
};

export const VISUALIZE_CONCEPTS: VisualizeConcept[] = [
  {
    title: "RAG (Retrieval-Augmented Generation): Search First, Answer Better",
    summary:
      "RAG combines retrieval and generation so responses are grounded in relevant source context instead of model memory alone.",
    detail:
      "In a RAG pipeline, the system converts user queries into embeddings, retrieves the most relevant chunks from a knowledge base, and then passes those chunks to the LLM for answer generation. This architecture improves factuality, reduces hallucinations, and makes answers more traceable to source material. It is especially useful when knowledge changes frequently or when enterprise policy requires response grounding.",
    analogy:
      "Like taking an open-book exam: first find the right pages, then write the answer using those references.",
    useCase:
      "Internal knowledge assistants, customer support copilots, policy Q&A, and document-grounded enterprise chatbots.",
    image: "/visualize/RAG.png",
    extraImages: ["/visualize/Understanding-RAG-Part2.png"],
  },
  {
    title: "Attention Layer: Connecting Every Word to Meaning",
    summary: "Attention reads all words together, then assigns higher focus to the words that matter most.",
    detail:
      "In a sentence, each word may depend on other words far away from it. Attention solves this by letting each token compare itself with all other tokens, scoring relevance, and combining context dynamically. That means the model does not read left to right blindly; it builds a context-aware understanding at each step, which is why modern NLP handles ambiguity much better than older sequence methods.",
    analogy:
      "Like reading a paragraph with a highlighter: you scan everything, but highlight the most useful clues before answering.",
    useCase:
      "Translation, question answering, summarization, and coreference resolution in chat systems.",
    image: "/visualize/attention-layer-words.png",
  },
  {
    title: "Transformer Blueprint: Encoder and Decoder Working Together",
    summary: "Transformers split understanding and generation into encoder-decoder blocks powered by attention.",
    detail:
      "The encoder transforms input into rich contextual representations. The decoder generates output token by token, using masked self-attention to avoid peeking at future tokens and encoder-decoder attention to pull relevant information from the encoded input. This architecture gives strong performance for machine translation and many sequence-to-sequence tasks.",
    analogy:
      "Like one teammate understanding all notes deeply (encoder), while another writes the final answer step by step (decoder).",
    useCase:
      "Machine translation, summarization pipelines, and structured text generation workflows.",
    image: "/visualize/transformer-architecture.jpg",
  },
  {
    title: "AI Hierarchy Map: AI, ML, DL, and LLMs",
    summary: "This map shows that each layer is a subset of the broader layer above it.",
    detail:
      "Artificial Intelligence includes all intelligent machine methods. Machine Learning is a subset that learns from data. Deep Learning is a deeper subset using neural networks with many layers. LLMs are a specialized deep learning branch focused on language understanding and generation. The nesting helps teams choose suitable methods instead of treating all AI models as identical.",
    analogy:
      "Like organizational levels: company, department, team, and role.",
    useCase:
      "Learning roadmaps, stakeholder communication, and model selection discussions.",
    image: "/visualize/ai-ml-dl-llm-realtion.jpg",
  },
  {
    title: "Layered Intelligence: Where Generative AI Fits",
    summary: "Generative AI sits inside deep learning and inherits its strengths and constraints.",
    detail:
      "Generative AI is not a separate universe from ML. It is built on deep neural architectures and large-scale training, then optimized for content generation tasks. Understanding this hierarchy clarifies why data quality, compute, and model architecture decisions remain critical for GenAI performance and reliability.",
    analogy:
      "Like a specialist doctor built on top of medical school and residency foundations.",
    useCase:
      "Designing GenAI products, setting expectations for hallucination risk, and planning evaluation workflows.",
    image: "/visualize/ai-ml-dl-llm-hero.png",
  },
  {
    title: "Unified Embedding Pipeline: From Data Source to Vectors",
    summary: "Many data formats can be converted into one vector space for similarity search.",
    detail:
      "Documents, images, audio, and records are passed through an embedding model to produce dense numeric vectors. These vectors are then indexed for fast nearest-neighbor retrieval. Because all items share one geometric space, applications can search semantically rather than keyword-by-keyword, making retrieval smarter and more flexible.",
    analogy:
      "Like converting many local maps into one global coordinate system.",
    useCase:
      "Enterprise search, recommendation systems, multimodal retrieval, and retrieval-augmented generation.",
    image: "/visualize/embeddings-detail.png",
  },
  {
    title: "Embedding Flow: Turning Meaning into Numbers",
    summary: "Embedding models transform input objects into numeric representations that preserve meaning.",
    detail:
      "Each input object is encoded into a vector where distance corresponds to semantic relatedness. Similar concepts appear close together while unrelated concepts spread apart. This allows ranking, clustering, and similarity lookups to operate efficiently at scale using vector math instead of handcrafted rules.",
    analogy:
      "Like giving each concept an address in a large semantic city.",
    useCase:
      "Semantic ranking, duplicate detection, recommendation, and contextual retrieval in AI assistants.",
    image: "/visualize/embeddings-hero.png",
  },
];
