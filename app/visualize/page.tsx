"use client";

import { useState } from "react";
import Image from "next/image";
import { VISUALIZE_CONCEPTS } from "@/data/visualize";
import styles from "./visualize.module.css";

const GLOSSARY = {
  Attention: {
    meaning:
      "Attention is the mechanism that lets a model decide which words or inputs are most relevant for understanding the current token.",
    detail:
      "Instead of treating all words equally, attention computes importance scores between tokens. Higher-score tokens contribute more to the final representation, which improves context handling and long-range understanding.",
    example:
      "In the sentence 'The cat didn't cross the road because it was tired', attention helps the model link 'it' to 'cat'.",
  },
  Embeddings: {
    meaning:
      "Embeddings are numeric vectors that represent meaning in a machine-readable form.",
    detail:
      "They place similar items close together in vector space and dissimilar items farther apart. This makes semantic search, clustering, recommendation, and retrieval much more effective.",
    example:
      "Queries like 'best budget phone' can retrieve results about 'affordable smartphones' even without exact keyword matches.",
  },
  Transformer: {
    meaning:
      "A Transformer is a neural architecture built around attention, designed to process relationships across an entire sequence efficiently.",
    detail:
      "Transformers replaced many older sequence models because they capture long-range dependencies better and train efficiently at scale. They are the foundation of modern LLMs.",
    example:
      "GPT-style models and many translation systems are built on transformer blocks.",
  },
  Encoder: {
    meaning:
      "The encoder reads input and converts it into contextual representations.",
    detail:
      "Each encoder layer refines token understanding using attention and feed-forward networks, so later components can use richer context rather than raw input.",
    example:
      "In translation, the encoder builds the source-language meaning before decoding the target sentence.",
  },
  Decoder: {
    meaning:
      "The decoder generates output token-by-token using previous output context and, in seq2seq systems, encoder context.",
    detail:
      "It uses masked self-attention to prevent seeing future tokens during generation, which ensures valid autoregressive output.",
    example:
      "When generating a summary, the decoder predicts each next word using earlier generated words.",
  },
  Vector: {
    meaning:
      "A vector is an ordered list of numbers representing an item in a mathematical space.",
    detail:
      "Vector operations like cosine similarity and nearest-neighbor search help measure semantic closeness between items at scale.",
    example:
      "Two product descriptions with similar meaning will have vectors that are close together.",
  },
  Semantic: {
    meaning:
      "Semantic means 'related to meaning', not just literal words.",
    detail:
      "Semantic methods try to understand intent and context, so they match concepts even when wording is different.",
    example:
      "'Car insurance quote' and 'auto policy estimate' are semantically similar.",
  },
  Token: {
    meaning:
      "A token is a basic unit the model processes, often a word piece rather than a full word.",
    detail:
      "Text is split into tokens before being fed to the model. Attention and generation operate over token sequences.",
    example:
      "The word 'unbelievable' may be split into multiple tokens depending on tokenizer rules.",
  },
  Context: {
    meaning:
      "Context is the surrounding information a model uses to interpret the current input.",
    detail:
      "Better context handling reduces ambiguity and improves correctness by grounding predictions in nearby and related information.",
    example:
      "The meaning of 'bank' changes depending on whether nearby words mention money or a river.",
  },
} as const;

const GLOSSARY_ALIAS_TO_TERM: Record<string, keyof typeof GLOSSARY> = {
  attention: "Attention",
  embeddings: "Embeddings",
  embedding: "Embeddings",
  transformer: "Transformer",
  transformers: "Transformer",
  encoder: "Encoder",
  decoder: "Decoder",
  vector: "Vector",
  vectors: "Vector",
  semantic: "Semantic",
  token: "Token",
  tokens: "Token",
  context: "Context",
};

export default function VisualizePage() {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<keyof typeof GLOSSARY | null>(
    null
  );

  const concept = VISUALIZE_CONCEPTS[index];
  const conceptImages = [concept.image, ...(concept.extraImages ?? [])];
  const glossary = selectedTerm ? GLOSSARY[selectedTerm] : null;

  function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function renderWithGlossary(text: string) {
    const pattern = new RegExp(
      `\\b(${Object.keys(GLOSSARY_ALIAS_TO_TERM)
        .sort((a, b) => b.length - a.length)
        .map(escapeRegex)
        .join("|")})\\b`,
      "gi"
    );
    const parts = text.split(pattern);
    const seenTerms = new Set<keyof typeof GLOSSARY>();

    return parts.map((part, i) => {
      const mapped = GLOSSARY_ALIAS_TO_TERM[part.toLowerCase()];
      if (!mapped) return <span key={`${part}-${i}`}>{part}</span>;
      if (seenTerms.has(mapped)) return <span key={`${part}-${i}`}>{part}</span>;
      seenTerms.add(mapped);

      return (
        <button
          key={`${part}-${i}`}
          type="button"
          className={styles.glossaryWord}
          onClick={() => setSelectedTerm(mapped)}
        >
          {part}
        </button>
      );
    });
  }

  function goNext() {
    setIndex((i) => (i >= VISUALIZE_CONCEPTS.length - 1 ? i : i + 1));
  }

  function goPrev() {
    setIndex((i) => (i <= 0 ? i : i - 1));
  }

  function onTouchStart(e: React.TouchEvent) {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }

  function onTouchMove(e: React.TouchEvent) {
    setTouchEnd(e.targetTouches[0].clientX);
  }

  function onTouchEnd() {
    if (touchStart === null || touchEnd === null) return;
    const delta = touchStart - touchEnd;
    if (Math.abs(delta) < 45) return;
    if (delta > 0) goNext();
    else goPrev();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>PICTURE IN THE MIND&apos;S EYE</p>
        <h1 className={styles.heading}>Understand core AI concepts with diagrams</h1>
        <p className={styles.subhead}>
          Swipe on mobile or tap concepts to explore a visual breakdown.
        </p>
      </header>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          {VISUALIZE_CONCEPTS.map((item, i) => {
            const active = i === index;
            return (
              <button
                key={item.title}
                className={`${styles.sidebarItem} ${active ? styles.sidebarItemActive : ""}`}
                onClick={() => setIndex(i)}
              >
                <span className={styles.sidebarIndex}>{String(i + 1).padStart(2, "0")}</span>
                <span>{item.title}</span>
              </button>
            );
          })}
        </aside>

        <div
          className={styles.mainPane}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <section className={styles.visualCard}>
            <div className={styles.imageStack}>
              {conceptImages.map((img, idx) => (
                <div className={styles.imagePanel} key={`${img}-${idx}`}>
                  <Image
                    src={img}
                    alt={`${concept.title} visual representation ${idx + 1}`}
                    width={1200}
                    height={560}
                    className={styles.image}
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.contentPanel}>
            <h2 className={styles.title}>{concept.title}</h2>
            <p className={styles.summary}>{concept.summary}</p>

            <div className={styles.block}>
              <p className={styles.label}>Concept Breakdown</p>
              <p className={styles.text}>{renderWithGlossary(concept.detail)}</p>
            </div>

            <div className={styles.block}>
              <p className={styles.label}>Analogy</p>
              <p className={styles.text}>{concept.analogy}</p>
            </div>

            <div className={styles.block}>
              <p className={styles.label}>Where it is used</p>
              <p className={styles.text}>{concept.useCase}</p>
            </div>
          </section>
        </div>
      </section>

      <footer className={styles.footer}>
        <button className={styles.navBtn} onClick={goPrev} disabled={index === 0}>
          ← Previous
        </button>
        <span className={styles.counter}>
          {index + 1} / {VISUALIZE_CONCEPTS.length}
        </span>
        <button
          className={styles.navBtn}
          onClick={goNext}
          disabled={index === VISUALIZE_CONCEPTS.length - 1}
        >
          Next →
        </button>
      </footer>

      {glossary && (
        <>
          <button
            type="button"
            className={styles.drawerBackdrop}
            onClick={() => setSelectedTerm(null)}
            aria-label="Close glossary panel"
          />
          <aside className={styles.drawer} role="dialog" aria-modal="true">
            <div className={styles.drawerHeader}>
              <p className={styles.drawerEyebrow}>Glossary</p>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setSelectedTerm(null)}
              >
                ✕
              </button>
            </div>
            <h3 className={styles.drawerTitle}>{selectedTerm}</h3>

            <div className={styles.drawerBlock}>
              <p className={styles.drawerLabel}>Meaning</p>
              <p className={styles.drawerText}>{glossary.meaning}</p>
            </div>

            <div className={styles.drawerBlock}>
              <p className={styles.drawerLabel}>Detailed Explanation</p>
              <p className={styles.drawerText}>{glossary.detail}</p>
            </div>

            <div className={styles.drawerBlock}>
              <p className={styles.drawerLabel}>Example</p>
              <p className={styles.drawerText}>{glossary.example}</p>
            </div>
          </aside>
        </>
      )}
    </main>
  );
}
