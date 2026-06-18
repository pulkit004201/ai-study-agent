"use client";

import { useState } from "react";
import { useSectionAnalytics } from "@/lib/use-section-analytics";
import styles from "./resources.module.css";

type Guide = {
  id: string;
  title: string;
  description: string;
  pages: number;
  file: string;
  tags: string[];
};

const GUIDES: Guide[] = [
  {
    id: "pm-app-management",
    title: "The Product Manager's Guide to Mobile Apps",
    description:
      "A practical guide for product managers on planning, launching, and managing mobile apps — covering lifecycle, metrics, releases, and day-to-day app management.",
    pages: 21,
    file: "/guides/pm-app-management-guide.pdf",
    tags: ["Product", "Mobile", "Management"],
  },
  {
    id: "pm-healthcare-products",
    title: "The Product Manager's Guide to Healthcare Products",
    description:
      "A practical guide for product managers building in healthcare — covering domain context, regulation and compliance, stakeholders, and shipping product in a high-stakes environment.",
    pages: 29,
    file: "/guides/pm-healthcare-products-guide.pdf",
    tags: ["Product", "Healthcare", "Compliance"],
  },
  {
    id: "ai-pm-handbook",
    title: "The AI Product Manager's Handbook",
    description:
      "A hands-on handbook for product managers building with AI — covering core concepts, model and data thinking, evaluation, and how to scope, ship, and iterate on AI-powered products.",
    pages: 36,
    file: "/guides/ai-pm-handbook.pdf",
    tags: ["Product", "AI", "Playbook"],
  },
];

export default function ResourcesPage() {
  useSectionAnalytics("resources");

  const [openId, setOpenId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewGuide = GUIDES.find((guide) => guide.id === previewId) ?? null;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Resources</p>
            <h1 className={styles.title}>
              Guides &amp; <span>playbooks.</span>
            </h1>
            <p className={styles.subtitle}>
              Curated reading to go deeper. Tap a guide for details, then preview
              or download it.
            </p>
          </div>
        </header>

        <section className={styles.grid}>
          {GUIDES.map((guide, index) => {
            const open = openId === guide.id;
            return (
              <article
                key={guide.id}
                className={`${styles.card} ${open ? styles.cardOpen : ""}`}
              >
                <button
                  type="button"
                  className={styles.cardHead}
                  onClick={() => setOpenId(open ? null : guide.id)}
                  aria-expanded={open}
                >
                  <span className={styles.serial}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.cardHeadMain}>
                    <span className={styles.cardTitle}>{guide.title}</span>
                    <span className={styles.cardSub}>
                      {guide.pages} pages · {guide.tags[0]}
                    </span>
                  </span>
                  <span className={styles.chevron} aria-hidden="true">
                    {open ? "▲" : "▼"}
                  </span>
                </button>

                {open && (
                  <div className={styles.cardBody}>
                    <p className={styles.cardDescription}>{guide.description}</p>
                    <div className={styles.tagRow}>
                      {guide.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => setPreviewId(guide.id)}
                      >
                        View
                      </button>
                      <a className={styles.secondaryButton} href={guide.file} download>
                        Download
                      </a>
                      <a
                        className={styles.ghostButton}
                        href={guide.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in new tab
                      </a>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>

      {previewGuide && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={previewGuide.title}
          onClick={() => setPreviewId(null)}
        >
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{previewGuide.title}</h2>
              <div className={styles.modalActions}>
                <a
                  className={styles.ghostButton}
                  href={previewGuide.file}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in new tab
                </a>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setPreviewId(null)}
                  aria-label="Close preview"
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={previewGuide.file}
              title={previewGuide.title}
              className={styles.modalFrame}
            />
          </div>
        </div>
      )}
    </main>
  );
}
