import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/fetch-retry";

// Normalized suggestion shape the series page consumes.
export type ApiSuggestion = {
  id: string;
  title: string;
  year: number | null;
  posterUrl: string;
  reason: string;
  tags: string[];
  rating: number | null;
};

type Lang = "English" | "Hindi";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// TMDB *TV* genre ids (https://developer.themoviedb.org/reference/genre-tv-list).
// These differ from the movie genre list (e.g. no standalone Action/Thriller).
const GENRES: Record<string, number[]> = {
  // mood
  "Feel-good": [35, 10751], // Comedy, Family
  Thrilling: [80, 9648, 10759], // Crime, Mystery, Action & Adventure
  Emotional: [18, 10766], // Drama, Soap
  "Thought-provoking": [10765, 18, 99], // Sci-Fi & Fantasy, Drama, Documentary
  // pace (loose hints)
  "Easy watch": [35, 10751],
  "Fast and gripping": [80, 10759, 9648],
  "Slow burn": [18, 9648],
  "Big spectacle": [10765, 10759], // Sci-Fi & Fantasy, Action & Adventure
  // company
  Solo: [18, 80],
  Friends: [35, 10759],
  Family: [10751, 16], // Family, Animation
  "Date night": [18, 35], // Drama, Comedy (no Romance genre in the TV list)
};

const GENRE_NAMES: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

function eraDateRange(era: string | null): { gte?: string; lte?: string } {
  switch (era) {
    case "Recent":
      return { gte: "2023-01-01" };
    case "Modern classic":
      return { gte: "2010-01-01", lte: "2022-12-31" };
    case "All-time classic":
      return { lte: "2009-12-31" };
    default:
      return {};
  }
}

// Env var names are case-sensitive; accept the common casings so a dashboard
// typo (e.g. TMDB_Access_Token) still works.
const TMDB_TOKEN = (
  process.env.TMDB_ACCESS_TOKEN ||
  process.env.TMDB_Access_Token ||
  ""
).trim();
const TMDB_KEY = (
  process.env.TMDB_API_KEY ||
  process.env.TMDB_Api_Key ||
  ""
).trim();

// A valid v4 token is a JWT with exactly three dot-separated segments; ignore
// anything malformed (e.g. a truncated paste) so we can fall back to the key.
const TOKEN_IS_VALID = TMDB_TOKEN.split(".").length === 3;

function authHeaders(): HeadersInit | null {
  // Prefer a well-formed v4 token; otherwise fall back to a v3 key.
  if (TOKEN_IS_VALID) {
    return { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" };
  }
  return null;
}

function applyRating(params: URLSearchParams, rating: string) {
  // Rating buckets mapped to TMDB vote_average bounds.
  switch (rating) {
    case "low": // < 5
      params.set("vote_average.lte", "4.9");
      break;
    case "mid": // 5 – 7
      params.set("vote_average.gte", "5");
      params.set("vote_average.lte", "7");
      break;
    case "high": // > 7
      params.set("vote_average.gte", "7.1");
      break;
    default: // all — no bound
      break;
  }
}

function buildParams(
  lang: Lang,
  answers: Record<string, string>,
  page: number,
  rating: string,
  indiaOnly: boolean
) {
  const params = new URLSearchParams({
    include_adult: "false",
    language: "en-US",
    page: String(page),
  });

  params.set("with_original_language", lang === "Hindi" ? "hi" : "en");

  // Restrict to titles available on streaming/subscription services in India.
  if (indiaOnly) {
    params.set("watch_region", "IN");
    params.set("with_watch_monetization_types", "flatrate|free|ads");
  }

  const { gte, lte } = eraDateRange(answers.era || null);
  if (gte) params.set("first_air_date.gte", gte);
  if (lte) params.set("first_air_date.lte", lte);

  // Collect candidate genres from mood/pace/company (OR-combined).
  const genreSet = new Set<number>();
  for (const key of ["mood", "pace", "company"]) {
    const value = answers[key];
    if (value && GENRES[value]) GENRES[value].forEach((g) => genreSet.add(g));
  }
  if (genreSet.size) params.set("with_genres", [...genreSet].join("|"));

  // "Hidden gem" = well-rated but not blockbuster; otherwise popularity.
  if (answers.era === "Hidden gem") {
    params.set("sort_by", "vote_average.desc");
    params.set("vote_count.gte", "100");
  } else {
    params.set("sort_by", "popularity.desc");
    params.set("vote_count.gte", lang === "Hindi" ? "15" : "60");
  }

  applyRating(params, rating);

  return params;
}

export async function GET(request: Request) {
  const headers = authHeaders();
  const apiKey = TMDB_KEY;
  if (!headers && !apiKey) {
    // No credentials configured — signal the client to use its fallback.
    return NextResponse.json({ source: "none", results: [] }, { status: 200 });
  }

  const { searchParams } = new URL(request.url);
  const lang: Lang = searchParams.get("region") === "Hindi" ? "Hindi" : "English";
  const answers = {
    mood: searchParams.get("mood") || "",
    pace: searchParams.get("pace") || "",
    company: searchParams.get("company") || "",
    era: searchParams.get("era") || "",
  };

  const pageParam = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) ? Math.min(Math.max(pageParam, 1), 500) : 1;
  const rating = searchParams.get("rating") || "all";
  // Default to India-streaming titles unless explicitly disabled (india=0).
  const indiaOnly = searchParams.get("india") !== "0";

  const params = buildParams(lang, answers, page, rating, indiaOnly);
  if (!headers && apiKey) params.set("api_key", apiKey);

  try {
    const res = await fetchWithRetry(`${TMDB_BASE}/discover/tv?${params.toString()}`, {
      headers: headers ?? undefined,
      // Cache identical queries briefly to stay well under rate limits.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { source: "error", status: res.status, page, totalPages: 0, results: [] },
        { status: 200 }
      );
    }
    const data = await res.json();
    const results: ApiSuggestion[] = (data.results || [])
      .filter((m: { poster_path?: string }) => m.poster_path)
      .map(
        (m: {
          id: number;
          name: string;
          first_air_date?: string;
          poster_path: string;
          overview?: string;
          genre_ids?: number[];
          vote_average?: number;
        }) => ({
          id: String(m.id),
          title: m.name,
          year: m.first_air_date ? Number(m.first_air_date.slice(0, 4)) : null,
          posterUrl: `${IMG_BASE}${m.poster_path}`,
          reason:
            m.overview?.trim() ||
            "A live pick matched to your selected mood, pace, and release style.",
          tags: (m.genre_ids || [])
            .map((g) => GENRE_NAMES[g])
            .filter(Boolean)
            .slice(0, 3),
          rating: typeof m.vote_average === "number" ? m.vote_average : null,
        })
      );

    return NextResponse.json({
      source: "tmdb",
      page: data.page ?? page,
      totalPages: Math.min(data.total_pages ?? 1, 500),
      results,
    });
  } catch {
    return NextResponse.json(
      { source: "error", page, totalPages: 0, results: [] },
      { status: 200 }
    );
  }
}
