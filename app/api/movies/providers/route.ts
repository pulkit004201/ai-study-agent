import { NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const LOGO_BASE = "https://image.tmdb.org/t/p/w92";

const TMDB_TOKEN = (
  process.env.TMDB_ACCESS_TOKEN ||
  process.env.TMDB_Access_Token ||
  ""
).trim();
const TMDB_KEY = (process.env.TMDB_API_KEY || process.env.TMDB_Api_Key || "").trim();
const TOKEN_IS_VALID = TMDB_TOKEN.split(".").length === 3;

type Provider = { name: string; logoUrl: string };

type TmdbProvider = { provider_name: string; logo_path?: string };

function mapProviders(list: TmdbProvider[] | undefined): Provider[] {
  return (list || [])
    .filter((p) => p.logo_path)
    .map((p) => ({ name: p.provider_name, logoUrl: `${LOGO_BASE}${p.logo_path}` }));
}

export async function GET(request: Request) {
  if (!TOKEN_IS_VALID && !TMDB_KEY) {
    return NextResponse.json({ providers: [], link: null, source: "none" });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const region = (searchParams.get("region") || "IN").toUpperCase();
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ providers: [], link: null });
  }

  const params = new URLSearchParams();
  const headers: HeadersInit | undefined = TOKEN_IS_VALID
    ? { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" }
    : undefined;
  if (!TOKEN_IS_VALID && TMDB_KEY) params.set("api_key", TMDB_KEY);

  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${id}/watch/providers?${params.toString()}`,
      { headers, next: { revalidate: 21600 } }
    );
    if (!res.ok) {
      return NextResponse.json({ providers: [], link: null, status: res.status });
    }
    const data = await res.json();
    const regionData = data.results?.[region];

    // Prefer subscription streaming; fall back to rent/buy if none.
    const flatrate = mapProviders(regionData?.flatrate);
    const transactional = mapProviders([
      ...(regionData?.rent || []),
      ...(regionData?.buy || []),
    ]);
    // De-dupe transactional by name.
    const seen = new Set(flatrate.map((p) => p.name));
    const extra = transactional.filter((p) => !seen.has(p.name));

    return NextResponse.json({
      providers: flatrate,
      rentBuy: extra,
      link: regionData?.link ?? null,
      region,
    });
  } catch {
    return NextResponse.json({ providers: [], link: null });
  }
}
