import { NextResponse } from "next/server";

// Normalized suggestion shape the movies page consumes.
export type ApiSuggestion = {
  id: string;
  title: string;
  year: number | null;
  posterUrl: string;
  reason: string;
  tags: string[];
  rating: number | null;
};

type Region = "Hollywood" | "Bollywood";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// TMDB genre ids (https://developer.themoviedb.org/reference/genre-movie-list)
const GENRES: Record<string, number[]> = {
  // mood
  "Feel-good": [35, 10751, 10402], // Comedy, Family, Music
  Thrilling: [53, 28, 9648], // Thriller, Action, Mystery
  Emotional: [18, 10749], // Drama, Romance
  "Thought-provoking": [878, 18, 36], // Sci-Fi, Drama, History
  // pace (loose hints)
  "Easy watch": [35, 10751],
  "Fast and gripping": [53, 28],
  "Slow burn": [18, 9648],
  "Big spectacle": [12, 28, 14], // Adventure, Action, Fantasy
  // company
  Solo: [18, 53],
  Friends: [35, 28],
  Family: [10751, 16], // Family, Animation
  "Date night": [10749, 35], // Romance, Comedy
};

const GENRE_NAMES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

function eraDateRange(era: string | null): { gte?: string; lte?: string } {
  switch (era) {
    case "Recent":
      return { gte: "2026-01-01" };
    case "Modern classic":
      return { gte: "2000-01-01", lte: "2017-12-31" };
    case "All-time classic":
      return { lte: "1999-12-31" };
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
  // IMDb-style rating buckets mapped to TMDB vote_average bounds.
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
  region: Region,
  answers: Record<string, string>,
  page: number,
  rating: string
) {
  const params = new URLSearchParams({
    include_adult: "false",
    include_video: "false",
    language: "en-US",
    page: String(page),
  });

  params.set("with_original_language", region === "Bollywood" ? "hi" : "en");

  const { gte, lte } = eraDateRange(answers.era || null);
  if (gte) params.set("primary_release_date.gte", gte);
  if (lte) params.set("primary_release_date.lte", lte);

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
    params.set("vote_count.gte", "150");
  } else {
    params.set("sort_by", "popularity.desc");
    params.set("vote_count.gte", region === "Bollywood" ? "20" : "80");
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
  const region: Region =
    searchParams.get("region") === "Bollywood" ? "Bollywood" : "Hollywood";
  const answers = {
    mood: searchParams.get("mood") || "",
    pace: searchParams.get("pace") || "",
    company: searchParams.get("company") || "",
    era: searchParams.get("era") || "",
  };

  const pageParam = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) ? Math.min(Math.max(pageParam, 1), 500) : 1;
  const rating = searchParams.get("rating") || "all";

  const params = buildParams(region, answers, page, rating);
  if (!headers && apiKey) params.set("api_key", apiKey);

  try {
    const res = await fetch(`${TMDB_BASE}/discover/movie?${params.toString()}`, {
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
          title: string;
          release_date?: string;
          poster_path: string;
          overview?: string;
          genre_ids?: number[];
          vote_average?: number;
        }) => ({
          id: String(m.id),
          title: m.title,
          year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
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
