"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useSectionAnalytics } from "@/lib/use-section-analytics";
import styles from "./page.module.css";

type Region = "Hollywood" | "Bollywood";
type AnswerKey = "mood" | "pace" | "company" | "era";

type Movie = {
  title: string;
  year: number;
  region: Region;
  mood: string[];
  pace: string[];
  company: string[];
  era: string[];
  tags: string[];
  reason: string;
  posterUrl: string;
};

const QUESTIONS: Array<{
  key: AnswerKey;
  prompt: string;
  options: string[];
}> = [
  {
    key: "mood",
    prompt: "What kind of mood should the movie match tonight?",
    options: ["Feel-good", "Thrilling", "Emotional", "Thought-provoking"],
  },
  {
    key: "pace",
    prompt: "What pace sounds right?",
    options: ["Easy watch", "Fast and gripping", "Slow burn", "Big spectacle"],
  },
  {
    key: "company",
    prompt: "Who are you watching with?",
    options: ["Solo", "Friends", "Family", "Date night"],
  },
  {
    key: "era",
    prompt: "Pick the release style you prefer.",
    options: ["Recent", "Modern classic", "All-time classic", "Hidden gem"],
  },
];

const MOVIES: Movie[] = [
  {
    title: "The Martian",
    year: 2015,
    region: "Hollywood",
    mood: ["Feel-good", "Thought-provoking"],
    pace: ["Easy watch", "Big spectacle"],
    company: ["Family", "Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Sci-fi", "Survival", "Smart humor"],
    reason: "Optimistic problem-solving, clean momentum, and enough science to feel sharp without becoming heavy.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/c/cd/The_Martian_film_poster.jpg",
  },
  {
    title: "Knives Out",
    year: 2019,
    region: "Hollywood",
    mood: ["Thrilling", "Feel-good"],
    pace: ["Fast and gripping", "Easy watch"],
    company: ["Friends", "Family", "Date night"],
    era: ["Recent"],
    tags: ["Mystery", "Comedy", "Ensemble"],
    reason: "A polished mystery with playful tension, memorable characters, and a pace that keeps everyone involved.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/1f/Knives_Out_poster.jpeg",
  },
  {
    title: "Arrival",
    year: 2016,
    region: "Hollywood",
    mood: ["Thought-provoking", "Emotional"],
    pace: ["Slow burn"],
    company: ["Solo", "Date night"],
    era: ["Modern classic"],
    tags: ["Sci-fi", "Drama", "Language"],
    reason: "A quiet, moving sci-fi story that rewards attention and leaves you with something to talk about afterward.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/df/Arrival%2C_Movie_Poster.jpg",
  },
  {
    title: "Mad Max: Fury Road",
    year: 2015,
    region: "Hollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping", "Big spectacle"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Action", "Chase", "Visual"],
    reason: "Relentless action, practical spectacle, and simple stakes make it a high-energy pick.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/6e/Mad_Max_Fury_Road.jpg",
  },
  {
    title: "The Grand Budapest Hotel",
    year: 2014,
    region: "Hollywood",
    mood: ["Feel-good"],
    pace: ["Easy watch"],
    company: ["Date night", "Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Comedy", "Stylized", "Adventure"],
    reason: "A charming, beautifully composed caper with warmth, wit, and a crisp runtime.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/1c/The_Grand_Budapest_Hotel.png",
  },
  {
    title: "The Shawshank Redemption",
    year: 1994,
    region: "Hollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Slow burn"],
    company: ["Family", "Solo"],
    era: ["All-time classic"],
    tags: ["Drama", "Hope", "Friendship"],
    reason: "An enduring comfort drama built around patience, resilience, and a deeply satisfying finish.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg",
  },
  {
    title: "Nightcrawler",
    year: 2014,
    region: "Hollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Hidden gem"],
    tags: ["Crime", "Media", "Dark"],
    reason: "A tense character study with a sharp edge and a performance that keeps tightening the room.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/d4/Nightcrawlerfilm.jpg",
  },
  {
    title: "La La Land",
    year: 2016,
    region: "Hollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Easy watch"],
    company: ["Date night", "Solo"],
    era: ["Recent"],
    tags: ["Musical", "Romance", "Dreams"],
    reason: "A stylish romantic musical that balances brightness, ambition, and bittersweet emotion.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/ab/La_La_Land_%28film%29.png",
  },
  {
    title: "3 Idiots",
    year: 2009,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family", "Friends"],
    era: ["Modern classic"],
    tags: ["Comedy", "Campus", "Friendship"],
    reason: "A crowd-pleasing mix of comedy, emotion, and education-system critique that works across age groups.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/df/3_idiots_poster.jpg",
  },
  {
    title: "Andhadhun",
    year: 2018,
    region: "Bollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Solo", "Date night"],
    era: ["Recent"],
    tags: ["Thriller", "Dark comedy", "Twists"],
    reason: "A clever thriller with sharp turns, wicked humor, and a compact rhythm.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/47/Andhadhun_poster.jpg",
  },
  {
    title: "Zindagi Na Milegi Dobara",
    year: 2011,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Friends", "Date night"],
    era: ["Modern classic"],
    tags: ["Travel", "Friendship", "Drama"],
    reason: "A breezy friendship film with travel energy, emotional repair, and very rewatchable scenes.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/17/Zindagi_Na_Milegi_Dobara.jpg",
  },
  {
    title: "Dangal",
    year: 2016,
    region: "Bollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Big spectacle", "Fast and gripping"],
    company: ["Family"],
    era: ["Recent"],
    tags: ["Sports", "Family", "Inspiring"],
    reason: "A strong family sports drama with clear stakes, training arcs, and a big emotional payoff.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/99/Dangal_Poster.jpg",
  },
  {
    title: "Tumbbad",
    year: 2018,
    region: "Bollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo", "Friends"],
    era: ["Hidden gem"],
    tags: ["Horror", "Myth", "Atmosphere"],
    reason: "A visually distinct mythic horror film with patience, dread, and a memorable moral core.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/41/Tumbbad_poster.jpg",
  },
  {
    title: "Queen",
    year: 2013,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family", "Solo", "Date night"],
    era: ["Modern classic"],
    tags: ["Coming-of-age", "Comedy", "Travel"],
    reason: "A warm self-discovery story that stays light on its feet while still feeling personal.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/45/QueenMoviePoster7thMarch.jpg",
  },
  {
    title: "Swades",
    year: 2004,
    region: "Bollywood",
    mood: ["Thought-provoking", "Emotional"],
    pace: ["Slow burn"],
    company: ["Family", "Solo"],
    era: ["All-time classic"],
    tags: ["Drama", "Purpose", "Homecoming"],
    reason: "A grounded, reflective drama about identity, responsibility, and meaningful change.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/85/Swades_poster.jpg",
  },
  {
    title: "Gully Boy",
    year: 2019,
    region: "Bollywood",
    mood: ["Feel-good", "Thought-provoking"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Solo"],
    era: ["Recent"],
    tags: ["Music", "Ambition", "Drama"],
    reason: "A kinetic ambition story with strong music, social texture, and a satisfying rise.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/07/Gully_Boy_poster.jpg",
  },
];

function getInitialAnswers(): Record<AnswerKey, string> {
  return {
    mood: "",
    pace: "",
    company: "",
    era: "",
  };
}

function scoreMovie(movie: Movie, answers: Record<AnswerKey, string>) {
  return QUESTIONS.reduce((score, question) => {
    const value = answers[question.key];
    if (!value) return score;
    return movie[question.key].includes(value) ? score + 1 : score;
  }, 0);
}

export default function MoviesPage() {
  useSectionAnalytics("movies");

  const [region, setRegion] = useState<Region>("Hollywood");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<AnswerKey, string>>(getInitialAnswers);
  const [showResults, setShowResults] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const currentQuestion = QUESTIONS[step];
  const answeredCount = QUESTIONS.filter((question) => answers[question.key]).length;
  const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);

  const recommendations = useMemo(() => {
    return MOVIES.filter((movie) => movie.region === region)
      .map((movie) => ({ movie, score: scoreMovie(movie, answers) }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.movie.year - a.movie.year;
      })
      .slice(0, 4);
  }, [answers, region]);
  const activeSuggestion = recommendations[suggestionIndex] ?? recommendations[0];

  function selectRegion(nextRegion: Region) {
    if (nextRegion === region) return;
    setRegion(nextRegion);
    // Keep results visible so a new shortlist appears immediately on change.
    setSuggestionIndex(0);
  }

  function selectAnswer(value: string) {
    if (answers[currentQuestion.key] === value) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
    // Keep results visible so changing an option refreshes the suggestions live.
    setSuggestionIndex(0);
  }

  function goNext() {
    if (!answers[currentQuestion.key]) return;
    if (step === QUESTIONS.length - 1) {
      setShowResults(true);
      setSuggestionIndex(0);
      return;
    }
    setStep((prev) => prev + 1);
  }

  function goBack() {
    setShowResults(false);
    setStep((prev) => Math.max(0, prev - 1));
  }

  function restart() {
    setAnswers(getInitialAnswers());
    setStep(0);
    setShowResults(false);
    setSuggestionIndex(0);
  }

  function showPreviousSuggestion() {
    setSuggestionIndex((prev) =>
      prev === 0 ? recommendations.length - 1 : prev - 1
    );
  }

  function showNextSuggestion() {
    setSuggestionIndex((prev) =>
      prev + 1 >= recommendations.length ? 0 : prev + 1
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Movie Suggestion Agent</p>
            <h1 className={styles.title}>
              Find a movie for <span>tonight.</span>
            </h1>
            <p className={styles.subtitle}>
              Answer a few quick preference checks and get a focused shortlist from Hollywood or Bollywood.
            </p>
          </div>

          <aside className={styles.progressCard}>
            <p className={styles.progressLabel}>Profile complete</p>
            <p className={styles.progressValue}>{progressPct}%</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
          </aside>
        </header>

        <section className={styles.grid}>
          <div className={`${styles.panel} ${styles.agentPanel}`}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Choose library</p>
                <h2 className={styles.panelTitle}>{region} picks</h2>
              </div>
            </div>

            <div className={styles.regionToggle} aria-label="Movie industry">
              {(["Hollywood", "Bollywood"] as Region[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`${styles.toggleButton} ${
                    region === item ? styles.toggleButtonActive : ""
                  }`}
                  onClick={() => selectRegion(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className={styles.questionBlock}>
              <p className={styles.questionMeta}>
                Question {step + 1} of {QUESTIONS.length}
              </p>
              <h3 className={styles.question}>{currentQuestion.prompt}</h3>

              <div className={styles.optionsGrid}>
                {currentQuestion.options.map((option) => {
                  const active = answers[currentQuestion.key] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`${styles.optionButton} ${
                        active ? styles.optionButtonActive : ""
                      }`}
                      onClick={() => selectAnswer(option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={goBack}>
                Back
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={goNext}
                disabled={!answers[currentQuestion.key]}
              >
                {step === QUESTIONS.length - 1 ? "Show suggestions" : "Next"}
              </button>
            </div>

            <div className={styles.answerStack}>
              {QUESTIONS.map((question) => (
                <div key={question.key} className={styles.answerChip}>
                  <span>{question.key}</span>
                  <span>{answers[question.key] || "Pending"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.panel} ${styles.resultsPanel}`}>
            {!showResults ? (
              <div className={styles.emptyState}>
                <div>
                  <p className={styles.emptyTitle}>Your shortlist will appear here.</p>
                  <p className={styles.emptyText}>
                    The agent compares your answers with mood, pace, company, and release-style signals.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {activeSuggestion && (
                  <>
                    <div className={styles.resultsHeader}>
                      <h2>{region} suggestion</h2>
                      <span className={styles.matchBadge}>
                        {suggestionIndex + 1} of {recommendations.length}
                      </span>
                    </div>

                    <article className={styles.featuredMovie}>
                      <div className={styles.poster}>
                        <Image
                          src={activeSuggestion.movie.posterUrl}
                          alt={`${activeSuggestion.movie.title} official movie poster`}
                          fill
                          sizes="(max-width: 560px) 100vw, 260px"
                          className={styles.posterImage}
                        />
                      </div>

                      <div className={styles.movieDetails}>
                        <div className={styles.movieTopline}>
                          <h3 className={styles.movieTitle}>{activeSuggestion.movie.title}</h3>
                          <span className={styles.movieMeta}>
                            {activeSuggestion.movie.year} · {activeSuggestion.score}/
                            {QUESTIONS.length} match
                          </span>
                        </div>
                        <p className={styles.movieReason}>{activeSuggestion.movie.reason}</p>
                        <div className={styles.tagRow}>
                          {activeSuggestion.movie.tags.map((tag) => (
                            <span key={tag} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>

                    <div className={styles.suggestionControls}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={showPreviousSuggestion}
                      >
                        Previous suggestion
                      </button>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={showNextSuggestion}
                      >
                        Next suggestion
                      </button>
                    </div>
                  </>
                )}

                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryButton} onClick={restart}>
                    Start over
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
