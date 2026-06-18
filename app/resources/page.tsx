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
              Curated reading to go deeper. Preview a guide right here, or
              download it to keep.
            </p>
          </div>
        </header>

        <section className={styles.grid}>
          {GUIDES.map((guide) => {
            const open = openId === guide.id;
            return (
              <article key={guide.id} className={styles.card}>
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <h2 className={styles.cardTitle}>{guide.title}</h2>
                    <span className={styles.pageBadge}>{guide.pages} pages</span>
                  </div>
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
                      onClick={() => setOpenId(open ? null : guide.id)}
                    >
                      {open ? "Hide preview" : "View"}
                    </button>
                    <a
                      className={styles.secondaryButton}
                      href={guide.file}
                      download
                    >
                      Download PDF
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

                {open && (
                  <div className={styles.viewer}>
                    <iframe
                      src={guide.file}
                      title={guide.title}
                      className={styles.viewerFrame}
                    />
                    <p className={styles.viewerHint}>
                      Can&apos;t see the preview?{" "}
                      <a href={guide.file} target="_blank" rel="noopener noreferrer">
                        Open the PDF in a new tab
                      </a>
                      .
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
