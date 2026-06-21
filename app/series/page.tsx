"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Reuse the Playground (movies) styles — the layout is identical.
import styles from "../movies/page.module.css";

const SEEN_STORAGE_KEY = "seriesSeenIds";

function toDisplay(s: ApiSuggestion): DisplaySuggestion {
  return {
    id: s.id,
    title: s.title,
    year: s.year,
    posterUrl: s.posterUrl,
    reason: s.reason,
    tags: s.tags,
    metaLabel: [s.year, s.rating ? `⭐ ${s.rating.toFixed(1)}` : null]
      .filter(Boolean)
      .join(" · "),
  };
}

// Unified shape rendered in the results panel — fed by either the live TMDB
// API or the curated fallback list.
type DisplaySuggestion = {
  id: string;
  title: string;
  year: number | null;
  posterUrl: string;
  reason: string;
  tags: string[];
  metaLabel: string;
};

type ApiSuggestion = {
  id: string;
  title: string;
  year: number | null;
  posterUrl: string;
  reason: string;
  tags: string[];
  rating: number | null;
};

type RatingTab = "all" | "low" | "mid" | "high";

type WatchProvider = { name: string; logoUrl: string };
type ProviderInfo = {
  providers: WatchProvider[];
  rentBuy: WatchProvider[];
  link: string | null;
  seasons: number | null;
  episodes: number | null;
};

const RATING_TABS: { id: RatingTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "low", label: "< 5" },
  { id: "mid", label: "5 – 7" },
  { id: "high", label: "> 7" },
];

type Lang = "English" | "Hindi";
type AnswerKey = "mood" | "pace" | "company" | "era";

type Series = {
  title: string;
  year: number;
  lang: Lang;
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
    prompt: "What kind of mood should the series match?",
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

// Curated fallback used only when the TMDB API is unavailable. Posters are
// intentionally left blank so the page renders a clean title card rather than a
// broken image; the live API supplies real artwork.
const SERIES: Series[] = [
  // ---------------- English ----------------
  {
    title: "Breaking Bad",
    year: 2008,
    lang: "English",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping", "Slow burn"],
    company: ["Solo", "Friends"],
    era: ["All-time classic"],
    tags: ["Crime", "Drama", "Transformation"],
    reason: "A chemistry teacher's slide into crime, told with relentless tension and craft.",
    posterUrl: "",
  },
  {
    title: "Stranger Things",
    year: 2016,
    lang: "English",
    mood: ["Thrilling", "Feel-good"],
    pace: ["Fast and gripping", "Big spectacle"],
    company: ["Friends", "Family"],
    era: ["Modern classic"],
    tags: ["Sci-Fi & Fantasy", "Mystery", "80s"],
    reason: "Nostalgic small-town sci-fi adventure with heart, scares, and a great ensemble.",
    posterUrl: "",
  },
  {
    title: "The Office",
    year: 2005,
    lang: "English",
    mood: ["Feel-good"],
    pace: ["Easy watch"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Comedy", "Mockumentary", "Workplace"],
    reason: "The ultimate comfort-watch comedy — endlessly rewatchable and warm.",
    posterUrl: "",
  },
  {
    title: "Chernobyl",
    year: 2019,
    lang: "English",
    mood: ["Thought-provoking", "Emotional"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Modern classic"],
    tags: ["Drama", "History", "Disaster"],
    reason: "A harrowing, meticulous dramatization of the nuclear disaster and its cover-up.",
    posterUrl: "",
  },
  {
    title: "Dark",
    year: 2017,
    lang: "English",
    mood: ["Thought-provoking", "Thrilling"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Hidden gem"],
    tags: ["Sci-Fi & Fantasy", "Mystery", "Time travel"],
    reason: "A mind-bending time-travel puzzle that rewards close, patient attention.",
    posterUrl: "",
  },
  {
    title: "The Boys",
    year: 2019,
    lang: "English",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Action & Adventure", "Satire", "Superhero"],
    reason: "A savage, satirical take on superheroes with shocking momentum.",
    posterUrl: "",
  },
  {
    title: "Ted Lasso",
    year: 2020,
    lang: "English",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family", "Friends"],
    era: ["Recent"],
    tags: ["Comedy", "Sports", "Heart"],
    reason: "A relentlessly kind comedy about optimism that sneaks up on your emotions.",
    posterUrl: "",
  },
  {
    title: "The Last of Us",
    year: 2023,
    lang: "English",
    mood: ["Emotional", "Thrilling"],
    pace: ["Slow burn", "Big spectacle"],
    company: ["Solo", "Friends"],
    era: ["Recent"],
    tags: ["Drama", "Survival", "Post-apocalyptic"],
    reason: "A grounded, emotional post-apocalyptic journey about an unlikely bond.",
    posterUrl: "",
  },
  {
    title: "Severance",
    year: 2022,
    lang: "English",
    mood: ["Thought-provoking", "Thrilling"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Recent"],
    tags: ["Sci-Fi & Fantasy", "Mystery", "Workplace"],
    reason: "An eerie, stylish thriller about splitting work and personal memory.",
    posterUrl: "",
  },
  {
    title: "Peaky Blinders",
    year: 2013,
    lang: "English",
    mood: ["Thrilling"],
    pace: ["Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Crime", "Drama", "Period"],
    reason: "A stylish post-war gangster saga with swagger and tension.",
    posterUrl: "",
  },
  {
    title: "Friends",
    year: 1994,
    lang: "English",
    mood: ["Feel-good"],
    pace: ["Easy watch"],
    company: ["Friends", "Date night"],
    era: ["All-time classic"],
    tags: ["Comedy", "Sitcom", "Warm"],
    reason: "The definitive hangout sitcom — light, funny, and perfect background comfort.",
    posterUrl: "",
  },
  {
    title: "Game of Thrones",
    year: 2011,
    lang: "English",
    mood: ["Thrilling", "Emotional"],
    pace: ["Big spectacle", "Slow burn"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Sci-Fi & Fantasy", "Epic", "Drama"],
    reason: "A sprawling fantasy epic of power, betrayal, and huge set pieces.",
    posterUrl: "",
  },
  {
    title: "Black Mirror",
    year: 2011,
    lang: "English",
    mood: ["Thought-provoking", "Thrilling"],
    pace: ["Slow burn"],
    company: ["Solo", "Date night"],
    era: ["Modern classic"],
    tags: ["Sci-Fi & Fantasy", "Anthology", "Dark"],
    reason: "Standalone tech-dystopia stories that linger long after the credits.",
    posterUrl: "",
  },
  {
    title: "Wednesday",
    year: 2022,
    lang: "English",
    mood: ["Feel-good", "Thrilling"],
    pace: ["Easy watch"],
    company: ["Family", "Friends"],
    era: ["Recent"],
    tags: ["Comedy", "Mystery", "Supernatural"],
    reason: "A witty, gothic coming-of-age mystery with deadpan charm.",
    posterUrl: "",
  },
  {
    title: "The Crown",
    year: 2016,
    lang: "English",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo", "Date night"],
    era: ["Modern classic"],
    tags: ["Drama", "History", "Royals"],
    reason: "A lavish, restrained drama about duty and power across the decades.",
    posterUrl: "",
  },

  // ---------------- Hindi ----------------
  {
    title: "The Family Man",
    year: 2019,
    lang: "Hindi",
    mood: ["Thrilling", "Feel-good"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Action & Adventure", "Spy", "Drama"],
    reason: "A spy balancing a messy home life and national stakes — tense and funny.",
    posterUrl: "",
  },
  {
    title: "Scam 1992: The Harshad Mehta Story",
    year: 2020,
    lang: "Hindi",
    mood: ["Thought-provoking", "Thrilling"],
    pace: ["Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Drama", "Finance", "Biopic"],
    reason: "A gripping rise-and-fall of a stockbroker who gamed the markets.",
    posterUrl: "",
  },
  {
    title: "Panchayat",
    year: 2020,
    lang: "Hindi",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family", "Solo"],
    era: ["Modern classic"],
    tags: ["Comedy", "Slice-of-life", "Rural"],
    reason: "A gentle, warm comedy about a city grad posted to a village office.",
    posterUrl: "",
  },
  {
    title: "Sacred Games",
    year: 2018,
    lang: "Hindi",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping", "Slow burn"],
    company: ["Solo"],
    era: ["Modern classic"],
    tags: ["Crime", "Drama", "Mumbai"],
    reason: "A cop and a crime lord collide in a dense, ambitious Mumbai thriller.",
    posterUrl: "",
  },
  {
    title: "Mirzapur",
    year: 2018,
    lang: "Hindi",
    mood: ["Thrilling"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Crime", "Action & Adventure", "Drama"],
    reason: "A pulpy, brutal power struggle in the heartland's crime underworld.",
    posterUrl: "",
  },
  {
    title: "Paatal Lok",
    year: 2020,
    lang: "Hindi",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Modern classic"],
    tags: ["Crime", "Drama", "Investigation"],
    reason: "A bleak, layered crime drama that doubles as sharp social commentary.",
    posterUrl: "",
  },
  {
    title: "Delhi Crime",
    year: 2019,
    lang: "Hindi",
    mood: ["Thought-provoking", "Emotional"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Modern classic"],
    tags: ["Crime", "Drama", "Procedural"],
    reason: "A sober, gripping police procedural based on real investigations.",
    posterUrl: "",
  },
  {
    title: "Kota Factory",
    year: 2019,
    lang: "Hindi",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Easy watch"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Drama", "Coming-of-age", "Students"],
    reason: "A relatable look at coaching-hub pressure, shot in striking black and white.",
    posterUrl: "",
  },
  {
    title: "Aspirants",
    year: 2021,
    lang: "Hindi",
    mood: ["Emotional", "Feel-good"],
    pace: ["Easy watch"],
    company: ["Friends", "Solo"],
    era: ["Recent"],
    tags: ["Drama", "Friendship", "Students"],
    reason: "A heartfelt story of friends chasing the civil-services dream.",
    posterUrl: "",
  },
  {
    title: "Gullak",
    year: 2019,
    lang: "Hindi",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Comedy", "Slice-of-life", "Family"],
    reason: "Tender, funny vignettes of a middle-class family's everyday life.",
    posterUrl: "",
  },
  {
    title: "Asur",
    year: 2020,
    lang: "Hindi",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Crime", "Mystery", "Thriller"],
    reason: "A forensic cat-and-mouse hunt for a serial killer with a mythic streak.",
    posterUrl: "",
  },
  {
    title: "Special Ops",
    year: 2020,
    lang: "Hindi",
    mood: ["Thrilling"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Action & Adventure", "Spy", "Thriller"],
    reason: "A globe-trotting intelligence thriller with a dogged lead agent.",
    posterUrl: "",
  },
  {
    title: "Farzi",
    year: 2023,
    lang: "Hindi",
    mood: ["Thrilling"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Solo"],
    era: ["Recent"],
    tags: ["Crime", "Drama", "Con"],
    reason: "A slick caper about an artist pulled into a counterfeit-money racket.",
    posterUrl: "",
  },
  {
    title: "Rocket Boys",
    year: 2022,
    lang: "Hindi",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Family", "Solo"],
    era: ["Recent"],
    tags: ["Drama", "History", "Biopic"],
    reason: "An inspiring period drama about the scientists who built modern India's programs.",
    posterUrl: "",
  },
  {
    title: "Made in Heaven",
    year: 2019,
    lang: "Hindi",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo", "Date night"],
    era: ["Modern classic"],
    tags: ["Drama", "Society", "Weddings"],
    reason: "Big-fat weddings as a lens on class, tradition, and hidden lives.",
    posterUrl: "",
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

// "Recent" is defined strictly by first-air year so older shows can never count.
const RECENT_FROM_YEAR = 2023;

function seriesMatches(series: Series, key: AnswerKey, value: string) {
  if (key === "era" && value === "Recent") {
    return series.year >= RECENT_FROM_YEAR;
  }
  return series[key].includes(value);
}

// How many of the answered questions this series matches (integer, for display).
function matchCount(series: Series, answers: Record<AnswerKey, string>) {
  return QUESTIONS.reduce((count, question) => {
    const value = answers[question.key];
    if (!value) return count;
    return seriesMatches(series, question.key, value) ? count + 1 : count;
  }, 0);
}

// Ranking score that rewards specificity: a match counts for less when the
// series is tagged with many values in that category, so broadly-tagged shows
// stop dominating every result set.
function rankScore(series: Series, answers: Record<AnswerKey, string>) {
  return QUESTIONS.reduce((score, question) => {
    const value = answers[question.key];
    if (!value) return score;
    const options = series[question.key];
    return seriesMatches(series, question.key, value)
      ? score + 1 / options.length
      : score;
  }, 0);
}

// Stable hash used to rotate tied shows based on the current answer set, so
// changing a filter surfaces a different mix instead of the same titles.
function varietyHash(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function SeriesPoster({
  posterUrl,
  title,
  year,
}: {
  posterUrl: string;
  title: string;
  year: number | null;
}) {
  const [failed, setFailed] = useState(false);

  if (!posterUrl || failed) {
    return (
      <div className={styles.poster}>
        <div className={styles.posterFallback}>
          <span className={styles.posterFallbackTitle}>{title}</span>
          {year != null && <span className={styles.posterFallbackYear}>{year}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.poster}>
      <Image
        src={posterUrl}
        alt={`${title} poster`}
        fill
        sizes="(max-width: 560px) 100vw, 260px"
        className={styles.posterImage}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// A streaming-platform logo. Links out to the title's watch page (JustWatch via
// TMDB) when a link is available, otherwise renders a non-clickable badge.
// TMDB only provides one watch link per title, not per-platform deep links.
function ProviderBadge({
  provider,
  link,
  title,
}: {
  provider: WatchProvider;
  link: string | null;
  title?: string;
}) {
  const logo = (
    <Image
      src={provider.logoUrl}
      alt={provider.name}
      width={26}
      height={26}
      className={styles.watchLogo}
    />
  );
  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.watchProvider}
        title={title ?? `${provider.name} — open watch page`}
      >
        {logo}
      </a>
    );
  }
  return (
    <span className={styles.watchProvider} title={title ?? provider.name}>
      {logo}
    </span>
  );
}

export default function SeriesPage() {
  const [lang, setLang] = useState<Lang>("English");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<AnswerKey, string>>(getInitialAnswers);
  const [showResults, setShowResults] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [ratingTab, setRatingTab] = useState<RatingTab>("all");
  const [indiaOnly, setIndiaOnly] = useState(true);

  const currentQuestion = QUESTIONS[step];
  const answeredCount = QUESTIONS.filter((question) => answers[question.key]).length;
  const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);

  const recommendations = useMemo(() => {
    const answersKey = QUESTIONS.map((question) => answers[question.key]).join("|");
    return SERIES.filter(
      (series) =>
        series.lang === lang &&
        // Release style is a hard filter: e.g. "Recent" restricts the pool to
        // 2023+ shows so it never surfaces older ones.
        (!answers.era || seriesMatches(series, "era", answers.era))
    )
      .map((series) => ({
        series,
        matches: matchCount(series, answers),
        score: rankScore(series, answers),
        order: varietyHash(`${series.title}#${answersKey}`),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.order !== b.order) return a.order - b.order;
        return b.series.year - a.series.year;
      })
      .slice(0, 6);
  }, [answers, lang]);

  const allAnswered = answeredCount === QUESTIONS.length;
  const answersKey = QUESTIONS.map((question) => answers[question.key]).join("|");
  const filterKey = `${lang}|${answersKey}|${ratingTab}|${indiaOnly ? "in" : "all"}`;

  // De-duped, paginating stream of suggestions. `seenIds` persists across
  // sessions so a series never repeats in any form or order.
  const [stream, setStream] = useState<DisplaySuggestion[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const seenRef = useRef<Set<string>>(new Set());
  const recommendationsRef = useRef(recommendations);
  recommendationsRef.current = recommendations;

  // Load the persisted "seen" set once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEEN_STORAGE_KEY);
      if (raw) seenRef.current = new Set(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const persistSeen = useCallback(() => {
    try {
      localStorage.setItem(
        SEEN_STORAGE_KEY,
        JSON.stringify([...seenRef.current])
      );
    } catch {
      // storage may be unavailable; in-memory dedup still holds for the session
    }
  }, []);

  // Append only unseen suggestions, marking them seen so they can't return.
  const addUnseen = useCallback(
    (incoming: DisplaySuggestion[]) => {
      const fresh = incoming.filter((s) => !seenRef.current.has(s.id));
      fresh.forEach((s) => seenRef.current.add(s.id));
      if (fresh.length) {
        persistSeen();
        setStream((prev) => [...prev, ...fresh]);
      }
      return fresh.length;
    },
    [persistSeen]
  );

  const curatedFallback = useCallback((): DisplaySuggestion[] => {
    return recommendationsRef.current.map((r) => ({
      id: `curated:${r.series.title}`,
      title: r.series.title,
      year: r.series.year,
      posterUrl: r.series.posterUrl,
      reason: r.series.reason,
      tags: r.series.tags,
      metaLabel: `${r.series.year} · ${r.matches}/${QUESTIONS.length} match`,
    }));
  }, []);

  // Reset and load the first page whenever the filters change post-completion.
  useEffect(() => {
    if (!allAnswered) {
      setStream([]);
      setPage(0);
      setTotalPages(0);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setSuggestionIndex(0);
    setStream([]);
    const params = new URLSearchParams({
      region: lang,
      ...answers,
      rating: ratingTab,
      india: indiaOnly ? "1" : "0",
      page: "1",
    });
    fetch(`/api/series/discover?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.source === "tmdb" && Array.isArray(data.results)) {
          setTotalPages(data.totalPages || 1);
          setPage(1);
          addUnseen(data.results.map(toDisplay));
        } else {
          // API unavailable — fall back to the curated list (also de-duped).
          setTotalPages(1);
          setPage(1);
          addUnseen(curatedFallback());
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTotalPages(1);
          setPage(1);
          addUnseen(curatedFallback());
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // filterKey captures lang + answers; deliberately not re-running on the
    // helper identities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswered, filterKey]);

  // Fetch successive TMDB pages, skipping pages that are fully "seen", until we
  // find fresh shows or run out of pages.
  const fetchMore = useCallback(async () => {
    if (loading || page === 0 || page >= totalPages) return;
    setLoading(true);
    try {
      let nextPage = page;
      while (nextPage < totalPages) {
        nextPage += 1;
        const params = new URLSearchParams({
          region: lang,
          ...answers,
          rating: ratingTab,
          india: indiaOnly ? "1" : "0",
          page: String(nextPage),
        });
        const data = await fetch(`/api/series/discover?${params.toString()}`).then(
          (res) => res.json()
        );
        setPage(nextPage);
        if (data.source === "tmdb" && Array.isArray(data.results)) {
          const added = addUnseen(data.results.map(toDisplay));
          if (added > 0) break;
        } else {
          break;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [loading, page, totalPages, lang, answers, ratingTab, indiaOnly, addUnseen]);

  const activeSuggestion = stream[suggestionIndex] ?? stream[0];
  const canFetchMore = page > 0 && page < totalPages;

  // Streaming availability (TMDB/JustWatch) for the series currently shown.
  const [providersById, setProvidersById] = useState<Record<string, ProviderInfo>>({});
  const activeId = activeSuggestion?.id;
  useEffect(() => {
    if (!activeId || activeId.startsWith("curated:")) return;
    if (providersById[activeId]) return;
    let aborted = false;
    fetch(`/api/series/providers?id=${activeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (aborted) return;
        setProvidersById((prev) =>
          prev[activeId]
            ? prev
            : {
                ...prev,
                [activeId]: {
                  providers: data.providers || [],
                  rentBuy: data.rentBuy || [],
                  link: data.link || null,
                  seasons: typeof data.seasons === "number" ? data.seasons : null,
                  episodes: typeof data.episodes === "number" ? data.episodes : null,
                },
              }
        );
      })
      .catch(() => {});
    return () => {
      aborted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);
  const activeProviders =
    activeId && !activeId.startsWith("curated:") ? providersById[activeId] : undefined;

  // Prefetch more as the user nears the end so "Next" stays seamless.
  useEffect(() => {
    if (allAnswered && suggestionIndex >= stream.length - 2 && canFetchMore && !loading) {
      fetchMore();
    }
  }, [allAnswered, suggestionIndex, stream.length, canFetchMore, loading, fetchMore]);

  function selectLang(nextLang: Lang) {
    if (nextLang === lang) return;
    setLang(nextLang);
    setSuggestionIndex(0);
  }

  function selectAnswer(value: string) {
    const key = currentQuestion.key;
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);
    setSuggestionIndex(0);

    // Only reveal the shortlist once every question has an answer.
    const allDone = QUESTIONS.every((question) => nextAnswers[question.key]);
    if (allDone) {
      setShowResults(true);
    }
    // Auto-advance to the next question — no manual "Next" needed.
    if (step < QUESTIONS.length - 1) {
      setStep((prev) => prev + 1);
    }
  }

  function goBack() {
    setStep((prev) => Math.max(0, prev - 1));
  }

  // Return to the questions from the results view without losing answers.
  function editAnswers() {
    setShowResults(false);
  }

  function restart() {
    setAnswers(getInitialAnswers());
    setStep(0);
    setShowResults(false);
    setSuggestionIndex(0);
    // Forget history so a fresh run can surface everything again.
    seenRef.current = new Set();
    persistSeen();
    setStream([]);
    setPage(0);
    setTotalPages(0);
  }

  function showPreviousSuggestion() {
    setSuggestionIndex((prev) => Math.max(0, prev - 1));
  }

  function showNextSuggestion() {
    setSuggestionIndex((prev) => {
      if (prev + 1 < stream.length) return prev + 1;
      // At the end of the buffer: pull more pages, stay put until they arrive.
      if (canFetchMore) fetchMore();
      return prev;
    });
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Web Series Suggestion Agent</p>
            <h1 className={styles.title}>
              Find a web series to <span>binge.</span>
            </h1>
            <p className={styles.subtitle}>
              Answer a few quick preference checks and get a focused shortlist of
              English or Hindi web series.
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
          <div
            className={`${styles.panel} ${styles.agentPanel} ${
              showResults ? styles.hideOnMobile : ""
            }`}
          >
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>Choose language</p>
                <h2 className={styles.panelTitle}>{lang} picks</h2>
              </div>
            </div>

            <div className={styles.regionToggle} aria-label="Series language">
              {(["English", "Hindi"] as Lang[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`${styles.toggleButton} ${
                    lang === item ? styles.toggleButtonActive : ""
                  }`}
                  onClick={() => selectLang(item)}
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
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={goBack}
                disabled={step === 0}
              >
                Back
              </button>
              <p className={styles.actionHint}>
                Pick an option to continue automatically.
              </p>
            </div>
          </div>

          <div
            className={`${styles.panel} ${styles.resultsPanel} ${
              !showResults ? styles.hideOnMobile : ""
            }`}
          >
            {!allAnswered ? (
              <div className={styles.emptyState}>
                <div>
                  <p className={styles.emptyTitle}>
                    Answer all {QUESTIONS.length} questions to see your shortlist.
                  </p>
                  <p className={styles.emptyText}>
                    {answeredCount} of {QUESTIONS.length} selected — the agent compares
                    your answers with mood, pace, company, and release-style signals.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.ratingTabs} role="tablist" aria-label="Rating">
                  <span className={styles.ratingTabsLabel}>Rating</span>
                  {RATING_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={ratingTab === tab.id}
                      className={`${styles.ratingTab} ${
                        ratingTab === tab.id ? styles.ratingTabActive : ""
                      }`}
                      onClick={() => setRatingTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-pressed={indiaOnly}
                    title="Show only titles streaming in India"
                    className={`${styles.ratingTab} ${
                      indiaOnly ? styles.ratingTabActive : ""
                    }`}
                    onClick={() => setIndiaOnly((on) => !on)}
                  >
                    📺 On streaming (IN)
                  </button>
                </div>
                {stream.length === 0 ? (
              <div className={styles.emptyState}>
                <div>
                  <p className={styles.emptyTitle}>
                    {loading ? "Finding picks…" : `No new ${lang} matches right now.`}
                  </p>
                  <p className={styles.emptyText}>
                    {loading
                      ? "Matching your mood, pace, and release style."
                      : "Try a different style, switch language, or hit Start over to reset what you've seen."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {activeSuggestion && (
                  <>
                    <div className={styles.resultsHeader}>
                      <h2>{lang} suggestion</h2>
                      <span className={styles.matchBadge}>
                        Suggestion {suggestionIndex + 1}
                      </span>
                    </div>

                    <article className={styles.featuredMovie}>
                      <SeriesPoster
                        key={activeSuggestion.id}
                        posterUrl={activeSuggestion.posterUrl}
                        title={activeSuggestion.title}
                        year={activeSuggestion.year}
                      />

                      <div className={styles.movieDetails}>
                        <div className={styles.movieTopline}>
                          <h3 className={styles.movieTitle}>{activeSuggestion.title}</h3>
                          <span className={styles.movieMeta}>
                            {activeSuggestion.metaLabel}
                            {activeProviders?.seasons
                              ? ` · ${activeProviders.seasons} season${
                                  activeProviders.seasons > 1 ? "s" : ""
                                }`
                              : ""}
                          </span>
                        </div>
                        <p className={styles.movieReason}>{activeSuggestion.reason}</p>
                        <div className={styles.tagRow}>
                          {activeSuggestion.tags.map((tag) => (
                            <span key={tag} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        {activeId && !activeId.startsWith("curated:") && (
                          <div className={styles.watchRow}>
                            <span className={styles.watchLabel}>Watch on</span>
                            {activeProviders === undefined ? (
                              <span className={styles.watchHint}>Checking…</span>
                            ) : activeProviders.providers.length > 0 ? (
                              activeProviders.providers.map((provider) => (
                                <ProviderBadge
                                  key={provider.name}
                                  provider={provider}
                                  link={activeProviders.link}
                                />
                              ))
                            ) : activeProviders.rentBuy.length > 0 ? (
                              <>
                                {activeProviders.rentBuy.slice(0, 4).map((provider) => (
                                  <ProviderBadge
                                    key={provider.name}
                                    provider={provider}
                                    link={activeProviders.link}
                                    title={`${provider.name} (rent/buy) — open watch page`}
                                  />
                                ))}
                                <span className={styles.watchHint}>rent / buy</span>
                              </>
                            ) : (
                              <span className={styles.watchHint}>
                                Not on streaming in India
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </article>

                    <div className={styles.suggestionControls}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={showPreviousSuggestion}
                        disabled={suggestionIndex === 0}
                      >
                        Previous suggestion
                      </button>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={showNextSuggestion}
                        disabled={
                          suggestionIndex + 1 >= stream.length && !canFetchMore
                        }
                      >
                        {loading && suggestionIndex + 1 >= stream.length
                          ? "Loading…"
                          : "Next suggestion"}
                      </button>
                    </div>
                  </>
                )}

                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryButton} onClick={editAnswers}>
                    ← Edit answers
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={restart}>
                    Start over
                  </button>
                </div>
              </>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
