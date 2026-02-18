"use client";

import { useState } from "react";
import Image from "next/image";
import { VISUALIZE_CONCEPTS } from "@/data/visualize";
import styles from "./visualize.module.css";

export default function VisualizePage() {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const concept = VISUALIZE_CONCEPTS[index];

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
        <p className={styles.eyebrow}>VISUALISE MODE</p>
        <h1 className={styles.heading}>Understand AI concepts with diagrams</h1>
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
            <div className={styles.imagePanel}>
              <Image
                src={concept.image}
                alt={`${concept.title} visual representation`}
                width={1200}
                height={560}
                className={styles.image}
                priority
              />
            </div>
          </section>

          <section className={styles.contentPanel}>
            <h2 className={styles.title}>{concept.title}</h2>
            <p className={styles.summary}>{concept.summary}</p>

            <div className={styles.block}>
              <p className={styles.label}>Concept Breakdown</p>
              <p className={styles.text}>{concept.detail}</p>
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
    </main>
  );
}
