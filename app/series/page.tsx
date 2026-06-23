"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./series.module.css";

type RatingTab = "all" | "low" | "mid" | "high";

const RATING_TABS: { id: RatingTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "low", label: "< 5" },
  { id: "mid", label: "5 – 7" },
  { id: "high", label: "> 7" },
];

type Lang = "English" | "Hindi";
type AnswerKey = "mood" | "pace" | "company" | "era";

// Unified grid item, fed by either the live TMDB API or the curated fallback.
type CardItem = {
  id: string;
  title: string;
  year: number | null;
  posterUrl: string;
  rating: number | null;
  tags: string[];
  overview: string;
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

type WatchProvider = { name: string; logoUrl: string };
type ProviderInfo = {
  providers: WatchProvider[];
  rentBuy: WatchProvider[];
  link: string | null;
  seasons: number | null;
};

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

// Filter definitions — the old guided questions, now an always-visible bar.
const FILTERS: Array<{ key: AnswerKey; label: string; options: string[] }> = [
  { key: "mood", label: "Mood", options: ["Feel-good", "Thrilling", "Emotional", "Thought-provoking"] },
  { key: "pace", label: "Pace", options: ["Easy watch", "Fast and gripping", "Slow burn", "Big spectacle"] },
  { key: "company", label: "Watching with", options: ["Solo", "Friends", "Family", "Date night"] },
  { key: "era", label: "Release", options: ["Recent", "Modern classic", "All-time classic", "Hidden gem"] },
];

// Curated fallback used only when the TMDB API is unavailable. Posters are
// intentionally blank so the card renders a clean title card; the live API
// supplies real artwork.
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

function getInitialFilters(): Record<AnswerKey, string> {
  return { mood: "", pace: "", company: "", era: "" };
}

// "Recent" is defined strictly by first-air year so older shows never count.
const RECENT_FROM_YEAR = 2023;

function seriesMatches(series: Series, key: AnswerKey, value: string) {
  if (key === "era" && value === "Recent") {
    return series.year >= RECENT_FROM_YEAR;
  }
  return series[key].includes(value);
}

// Specificity-weighted score used to order the curated fallback.
function rankScore(series: Series, filters: Record<AnswerKey, string>) {
  return FILTERS.reduce((score, f) => {
    const value = filters[f.key];
    if (!value) return score;
    return seriesMatches(series, f.key, value) ? score + 1 / series[f.key].length : score;
  }, 0);
}

function apiToCard(s: ApiSuggestion): CardItem {
  return {
    id: s.id,
    title: s.title,
    year: s.year,
    posterUrl: s.posterUrl,
    rating: s.rating,
    tags: s.tags,
    overview: s.reason,
  };
}

function CardPoster({
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
      <div className={styles.posterFallback}>
        <span className={styles.posterFallbackTitle}>{title}</span>
        {year != null && <span className={styles.posterFallbackYear}>{year}</span>}
      </div>
    );
  }
  return (
    <Image
      src={posterUrl}
      alt={`${title} poster`}
      fill
      sizes="(max-width: 640px) 45vw, 200px"
      className={styles.cardPosterImg}
      onError={() => setFailed(true)}
    />
  );
}

// A streaming-platform logo. Links to the title's watch page (JustWatch via
// TMDB) when available; TMDB exposes one watch link per title.
function ProviderLink({ provider, link }: { provider: WatchProvider; link: string | null }) {
  const logo = (
    <Image
      src={provider.logoUrl}
      alt={provider.name}
      width={24}
      height={24}
      className={styles.providerLogo}
    />
  );
  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.providerLink}
        title={`${provider.name} — open watch page`}
      >
        {logo}
      </a>
    );
  }
  return (
    <span className={styles.providerLink} title={provider.name}>
      {logo}
    </span>
  );
}

// One grid card. Lazily fetches its own season count + watch providers (the
// discover list endpoint carries neither).
function SeriesCard({ item }: { item: CardItem }) {
  const [info, setInfo] = useState<ProviderInfo | null>(null);
  const isCurated = item.id.startsWith("curated:");

  useEffect(() => {
    if (isCurated) return;
    let aborted = false;
    fetch(`/api/series/providers?id=${item.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (aborted) return;
        setInfo({
          providers: data.providers || [],
          rentBuy: data.rentBuy || [],
          link: data.link || null,
          seasons: typeof data.seasons === "number" ? data.seasons : null,
        });
      })
      .catch(() => {});
    return () => {
      aborted = true;
    };
  }, [item.id, isCurated]);

  const meta = [
    item.year,
    info?.seasons ? `${info.seasons} season${info.seasons > 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const watchProviders =
    info && info.providers.length > 0
      ? info.providers
      : info && info.rentBuy.length > 0
        ? info.rentBuy.slice(0, 4)
        : [];

  return (
    <article className={styles.card}>
      <div className={styles.cardPoster}>
        <CardPoster posterUrl={item.posterUrl} title={item.title} year={item.year} />
        {item.rating != null && item.rating > 0 && (
          <span className={styles.ratingPill}>⭐ {item.rating.toFixed(1)}</span>
        )}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        {meta && <span className={styles.cardMeta}>{meta}</span>}
        {item.tags.length > 0 && (
          <div className={styles.cardTags}>
            {item.tags.slice(0, 2).map((tag) => (
              <span key={tag} className={styles.cardTag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {!isCurated && watchProviders.length > 0 && (
          <div className={styles.cardWatch}>
            {watchProviders.map((p) => (
              <ProviderLink key={p.name} provider={p} link={info?.link ?? null} />
            ))}
            {info && info.providers.length === 0 && info.rentBuy.length > 0 && (
              <span className={styles.watchHint}>rent / buy</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function SeriesPage() {
  const [lang, setLang] = useState<Lang>("English");
  const [filters, setFilters] = useState<Record<AnswerKey, string>>(getInitialFilters);
  const [ratingTab, setRatingTab] = useState<RatingTab>("all");
  const [indiaOnly, setIndiaOnly] = useState(true);

  const [items, setItems] = useState<CardItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"tmdb" | "curated" | "">("");
  const seenRef = useRef<Set<string>>(new Set());

  const filterKey = useMemo(
    () =>
      [lang, filters.mood, filters.pace, filters.company, filters.era, ratingTab, indiaOnly]
        .join("|"),
    [lang, filters, ratingTab, indiaOnly]
  );

  const curatedItems = useCallback((): CardItem[] => {
    return SERIES.filter(
      (s) => s.lang === lang && (!filters.era || seriesMatches(s, "era", filters.era))
    )
      .sort((a, b) => rankScore(b, filters) - rankScore(a, filters) || b.year - a.year)
      .map((s) => ({
        id: `curated:${s.title}`,
        title: s.title,
        year: s.year,
        posterUrl: s.posterUrl,
        rating: null,
        tags: s.tags,
        overview: s.reason,
      }));
  }, [lang, filters]);

  // Append only unseen items (dedup is reset per filter run, below).
  const addUnseen = useCallback((incoming: CardItem[]) => {
    const fresh = incoming.filter((s) => !seenRef.current.has(s.id));
    fresh.forEach((s) => seenRef.current.add(s.id));
    if (fresh.length) setItems((prev) => [...prev, ...fresh]);
    return fresh.length;
  }, []);

  const buildParams = useCallback(
    (pageNum: number) =>
      new URLSearchParams({
        region: lang,
        mood: filters.mood,
        pace: filters.pace,
        company: filters.company,
        era: filters.era,
        rating: ratingTab,
        india: indiaOnly ? "1" : "0",
        page: String(pageNum),
      }),
    [lang, filters, ratingTab, indiaOnly]
  );

  // Reset and load page 1 whenever any filter changes.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setItems([]);
    setPage(0);
    setTotalPages(0);
    setTotal(0);
    // Fresh dedup slate so each selection surfaces its full pool.
    seenRef.current = new Set();

    fetch(`/api/series/discover?${buildParams(1).toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.source === "tmdb" && Array.isArray(data.results)) {
          setSource("tmdb");
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || data.results.length);
          setPage(1);
          addUnseen((data.results as ApiSuggestion[]).map(apiToCard));
        } else {
          const curated = curatedItems();
          setSource("curated");
          setTotalPages(1);
          setTotal(curated.length);
          setPage(1);
          addUnseen(curated);
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        const curated = curatedItems();
        setSource("curated");
        setTotalPages(1);
        setTotal(curated.length);
        setPage(1);
        addUnseen(curated);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const canLoadMore = source === "tmdb" && page > 0 && page < totalPages;

  // Fetch successive TMDB pages, skipping fully-seen pages, until fresh items
  // appear or pages run out.
  const loadMore = useCallback(async () => {
    if (loading || !canLoadMore) return;
    setLoading(true);
    try {
      let next = page;
      while (next < totalPages) {
        next += 1;
        const data = await fetch(`/api/series/discover?${buildParams(next).toString()}`).then(
          (res) => res.json()
        );
        setPage(next);
        if (data.source === "tmdb" && Array.isArray(data.results)) {
          const added = addUnseen((data.results as ApiSuggestion[]).map(apiToCard));
          if (added > 0) break;
        } else {
          break;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [loading, canLoadMore, page, totalPages, buildParams, addUnseen]);

  function setFilter(key: AnswerKey, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const activeFilterCount =
    FILTERS.filter((f) => filters[f.key]).length +
    (ratingTab !== "all" ? 1 : 0);

  const countLabel =
    source === "curated"
      ? `${total} curated ${total === 1 ? "pick" : "picks"}`
      : `${total.toLocaleString()} ${total === 1 ? "match" : "matches"}`;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        {/* Hero */}
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Web Series Suggestion Agent</p>
          <h1 className={styles.title}>
            Find a web series to <span>binge.</span>
          </h1>
          <p className={styles.subtitle}>
            Filter by mood, pace, company and release style to get a focused shortlist
            of English or Hindi web series — with ratings, seasons, and where to stream.
          </p>
          <div className={styles.langToggle} role="tablist" aria-label="Series language">
            {(["English", "Hindi"] as Lang[]).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={lang === item}
                className={`${styles.langButton} ${lang === item ? styles.langButtonActive : ""}`}
                onClick={() => setLang(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </header>

        {/* Sticky filter bar */}
        <section className={styles.filterBar} aria-label="Filters">
          {FILTERS.map((f) => (
            <div key={f.key} className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor={`filter-${f.key}`}>
                {f.label}
              </label>
              <select
                id={`filter-${f.key}`}
                className={styles.select}
                value={filters[f.key]}
                onChange={(e) => setFilter(f.key, e.target.value)}
              >
                <option value="">Any</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className={styles.spacer} />

          <div className={styles.chipRow}>
            <span className={styles.filterLabel}>Rating</span>
            <div className={styles.chips}>
              {RATING_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.chip} ${ratingTab === tab.id ? styles.chipActive : ""}`}
                  onClick={() => setRatingTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={indiaOnly}
                title="Show only titles streaming in India"
                className={`${styles.chip} ${indiaOnly ? styles.chipActive : ""}`}
                onClick={() => setIndiaOnly((on) => !on)}
              >
                📺 On streaming (IN)
              </button>
            </div>
          </div>
        </section>

        {/* Results */}
        <div className={styles.resultsHead}>
          <h2 className={styles.resultsTitle}>{lang} web series</h2>
          <span className={styles.count}>
            {loading && items.length === 0
              ? "Finding picks…"
              : `${countLabel}${activeFilterCount ? ` · ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}` : ""}`}
          </span>
        </div>

        {loading && items.length === 0 ? (
          <div className={styles.grid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonPoster} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <div>
              <p className={styles.emptyTitle}>No {lang} matches right now.</p>
              <p className={styles.emptyText}>
                Try a different mood, pace or release style — or turn off the
                “On streaming (IN)” filter to widen the pool.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {items.map((item) => (
                <SeriesCard key={item.id} item={item} />
              ))}
            </div>
            {canLoadMore && (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMore}
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
