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
    title: "From Meaning to Numbers: How Embeddings Work",
    summary: "Embedding models encode data into vectors that preserve semantic meaning.",
    detail:
      "An embedding model converts text, audio, or images into a high-dimensional numeric vector. Each value captures latent traits of the input, and nearby vectors represent semantically similar items, making retrieval and ranking efficient.",
    analogy:
      "Like assigning every concept a coordinate on a detailed map where nearby points mean similar meaning.",
    useCase:
      "Semantic search, recommendation systems, and grounding answers in RAG pipelines.",
    image: "/visualize/picture-embeddings-flow.svg",
  },
  {
    title: "The AI Family Tree: AI → ML → DL → LLMs/GenAI",
    summary: "Modern AI capabilities are nested layers, each more specialized than the previous one.",
    detail:
      "Artificial Intelligence is the broad umbrella. Machine Learning sits inside it, focused on learning from data. Deep Learning is a subset of ML that uses multi-layer neural networks. LLMs and Generative AI are specialized deep learning systems trained at large scale.",
    analogy:
      "Like moving from a country to state to city to neighborhood: each level is narrower and more specific.",
    useCase:
      "Scoping AI projects correctly, choosing model classes, and setting realistic expectations for system design.",
    image: "/visualize/picture-ai-hierarchy.svg",
  },
  {
    title: "One Vector Space for Many Data Types",
    summary: "Different formats can be represented in one shared embedding space.",
    detail:
      "Files, documents, images, audio snippets, and database entries are transformed into vectors through an embedding pipeline. Once embedded, the system can compare all of them using vector similarity, enabling cross-modal retrieval from one query.",
    analogy: "Like translating many languages into one shared language before searching for the closest meaning.",
    useCase:
      "Enterprise search across PDFs, media, and structured records; unified recommendation and discovery flows.",
    image: "/visualize/picture-embedding-pipeline.svg",
  },
  {
    title: "Layered Intelligence: Why Generative AI Sits Inside Deep Learning",
    summary: "Generative AI is an advanced application within deep learning, not a separate field.",
    detail:
      "Generative AI systems are built on deep neural architectures that learn rich representations from massive datasets. They inherit deep learning foundations, then extend them with next-token/objective learning to produce new text, images, code, or audio.",
    analogy:
      "Like a specialist built on top of general medical training: still part of the same discipline, but tuned for complex creation tasks.",
    useCase:
      "Copilots, content generation, conversational assistants, and rapid ideation tools with human supervision.",
    image: "/visualize/picture-genai-hierarchy.svg",
  },
];
