"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSectionAnalytics } from "@/lib/use-section-analytics";
import styles from "./page.module.css";

const SEEN_STORAGE_KEY = "movieSeenIds";

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
};

function ProviderLogo({
  provider,
  link,
  title,
}: {
  provider: WatchProvider;
  link: string | null;
  title: string;
}) {
  const badge = (
    <span className={styles.watchProvider} title={title}>
      <Image
        src={provider.logoUrl}
        alt={provider.name}
        width={26}
        height={26}
        className={styles.watchLogo}
      />
    </span>
  );
  if (!link) return badge;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.watchLink}
      aria-label={`Watch on ${provider.name}`}
    >
      {badge}
    </a>
  );
}

const RATING_TABS: { id: RatingTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "low", label: "< 5" },
  { id: "mid", label: "5 – 7" },
  { id: "high", label: "> 7" },
];

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
    era: ["Modern classic"],
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
    era: ["Modern classic"],
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
    era: ["Modern classic"],
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
    era: ["Modern classic"],
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
    era: ["Modern classic"],
    tags: ["Music", "Ambition", "Drama"],
    reason: "A kinetic ambition story with strong music, social texture, and a satisfying rise.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/07/Gully_Boy_poster.jpg",
  },
  {
    title: "Inception",
    year: 2010,
    region: "Hollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping", "Big spectacle"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Sci-fi", "Heist", "Mind-bending"],
    reason: "A layered heist-in-dreams puzzle with big set pieces and a debate-worthy ending.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg",
  },
  {
    title: "Interstellar",
    year: 2014,
    region: "Hollywood",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Big spectacle", "Slow burn"],
    company: ["Family", "Solo"],
    era: ["Modern classic"],
    tags: ["Sci-fi", "Space", "Father-daughter"],
    reason: "An ambitious space epic that pairs cosmic scale with a deeply human core.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
  },
  {
    title: "The Dark Knight",
    year: 2008,
    region: "Hollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping", "Big spectacle"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Action", "Crime", "Comic-book"],
    reason: "A tense crime thriller anchored by an unforgettable villain and real stakes.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg",
  },
  {
    title: "Forrest Gump",
    year: 1994,
    region: "Hollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Easy watch"],
    company: ["Family", "Solo"],
    era: ["All-time classic"],
    tags: ["Drama", "Life story", "Warm"],
    reason: "A warm, sweeping life story that moves easily through decades and emotions.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/67/Forrest_Gump_poster.jpg",
  },
  {
    title: "Pulp Fiction",
    year: 1994,
    region: "Hollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Solo"],
    era: ["All-time classic"],
    tags: ["Crime", "Nonlinear", "Cult"],
    reason: "A sharp, quotable crime mosaic with style and bite in every scene.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg",
  },
  {
    title: "The Godfather",
    year: 1972,
    region: "Hollywood",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo", "Family"],
    era: ["All-time classic"],
    tags: ["Crime", "Family", "Epic"],
    reason: "A patient, towering crime saga about power, loyalty, and family.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg",
  },
  {
    title: "Whiplash",
    year: 2014,
    region: "Hollywood",
    mood: ["Thrilling", "Emotional"],
    pace: ["Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Music", "Drama", "Intense"],
    reason: "A nerve-shredding music drama about ambition pushed to the edge.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/01/Whiplash_poster.jpg",
  },
  {
    title: "Gone Girl",
    year: 2014,
    region: "Hollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping"],
    company: ["Date night", "Solo"],
    era: ["Modern classic"],
    tags: ["Thriller", "Mystery", "Twists"],
    reason: "A slick, unsettling marriage thriller with a wicked midpoint turn.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/05/Gone_Girl_Poster.jpg",
  },
  {
    title: "Get Out",
    year: 2017,
    region: "Hollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Horror", "Satire", "Social"],
    reason: "A sharp social horror that keeps tightening while it makes you think.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/a3/Get_Out_poster.png",
  },
  {
    title: "Up",
    year: 2009,
    region: "Hollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Easy watch"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Animation", "Adventure", "Heart"],
    reason: "A tender animated adventure with one of cinema's most moving openings.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/05/Up_%282009_film%29.jpg",
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    year: 2018,
    region: "Hollywood",
    mood: ["Feel-good", "Thrilling"],
    pace: ["Fast and gripping", "Big spectacle"],
    company: ["Family", "Friends"],
    era: ["Modern classic"],
    tags: ["Animation", "Comic-book", "Stylish"],
    reason: "A dazzling, kinetic animated take that feels fresh from frame one.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/fa/Spider-Man_Into_the_Spider-Verse_poster.png",
  },
  {
    title: "Avengers: Endgame",
    year: 2019,
    region: "Hollywood",
    mood: ["Thrilling", "Emotional"],
    pace: ["Big spectacle"],
    company: ["Friends", "Family"],
    era: ["Modern classic"],
    tags: ["Action", "Comic-book", "Finale"],
    reason: "A massive crowd-pleasing finale that pays off years of buildup.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg",
  },
  {
    title: "The Social Network",
    year: 2010,
    region: "Hollywood",
    mood: ["Thought-provoking"],
    pace: ["Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Drama", "Tech", "Ambition"],
    reason: "A razor-sharp, fast-talking drama about ambition and fallout.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/8c/The_Social_Network_film_poster.png",
  },
  {
    title: "Dune",
    year: 2021,
    region: "Hollywood",
    mood: ["Thought-provoking", "Thrilling"],
    pace: ["Big spectacle", "Slow burn"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Sci-fi", "Epic", "Visual"],
    reason: "A stunning, immersive sci-fi epic built for the biggest screen you have.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg",
  },
  {
    title: "Blade Runner 2049",
    year: 2017,
    region: "Hollywood",
    mood: ["Thought-provoking", "Emotional"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Modern classic"],
    tags: ["Sci-fi", "Noir", "Atmosphere"],
    reason: "A meditative, gorgeous sci-fi noir that rewards patience.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/9b/Blade_Runner_2049_poster.png",
  },
  {
    title: "The Prestige",
    year: 2006,
    region: "Hollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Mystery", "Rivalry", "Twists"],
    reason: "A twisty rivalry mystery that keeps misdirecting until the last trick.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/d2/Prestige_poster.jpg",
  },
  {
    title: "No Country for Old Men",
    year: 2007,
    region: "Hollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Modern classic"],
    tags: ["Crime", "Thriller", "Tense"],
    reason: "A lean, dread-soaked chase thriller with one of film's coldest villains.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/8b/No_Country_for_Old_Men_poster.jpg",
  },
  {
    title: "Django Unchained",
    year: 2012,
    region: "Hollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping", "Big spectacle"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Western", "Revenge", "Stylish"],
    reason: "A bold, stylish revenge western with sharp dialogue and big swings.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/8b/Django_Unchained_Poster.jpg",
  },
  {
    title: "The Wolf of Wall Street",
    year: 2013,
    region: "Hollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Drama", "Excess", "Dark comedy"],
    reason: "A relentless, high-energy ride through greed and excess.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/d8/The_Wolf_of_Wall_Street_%282013%29.png",
  },
  {
    title: "1917",
    year: 2019,
    region: "Hollywood",
    mood: ["Thrilling", "Emotional"],
    pace: ["Big spectacle", "Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["War", "Survival", "One-shot"],
    reason: "A breathless, immersive war mission shot to feel like one take.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/fe/1917_%282019%29_Film_Poster.jpeg",
  },
  {
    title: "Joker",
    year: 2019,
    region: "Hollywood",
    mood: ["Thought-provoking", "Emotional"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Modern classic"],
    tags: ["Drama", "Character study", "Dark"],
    reason: "A bleak, magnetic character study carried by a transformative lead.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/e1/Joker_%282019_film%29_poster.jpg",
  },
  {
    title: "Coco",
    year: 2017,
    region: "Hollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Easy watch"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Animation", "Music", "Family"],
    reason: "A vibrant, heartfelt animated story about family and memory.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/98/Coco_%282017_film%29_poster.jpg",
  },
  {
    title: "Inside Out",
    year: 2015,
    region: "Hollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Easy watch"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Animation", "Emotions", "Clever"],
    reason: "A clever, moving look inside the mind that lands for all ages.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/0a/Inside_Out_%282015_film%29_poster.jpg",
  },
  {
    title: "Jurassic Park",
    year: 1993,
    region: "Hollywood",
    mood: ["Thrilling", "Feel-good"],
    pace: ["Big spectacle"],
    company: ["Family", "Friends"],
    era: ["All-time classic"],
    tags: ["Adventure", "Sci-fi", "Iconic"],
    reason: "A timeless adventure spectacle with wonder and white-knuckle set pieces.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg",
  },
  {
    title: "Titanic",
    year: 1997,
    region: "Hollywood",
    mood: ["Emotional"],
    pace: ["Big spectacle", "Slow burn"],
    company: ["Date night"],
    era: ["All-time classic"],
    tags: ["Romance", "Epic", "Tragedy"],
    reason: "A sweeping epic romance built around a disaster you can't look away from.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png",
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
    region: "Hollywood",
    mood: ["Thrilling", "Emotional"],
    pace: ["Big spectacle", "Slow burn"],
    company: ["Friends", "Family"],
    era: ["Modern classic"],
    tags: ["Fantasy", "Epic", "Adventure"],
    reason: "An immersive fantasy epic that sets a gold standard for the genre.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/fb/Lord_Rings_Fellowship_Ring.jpg",
  },
  {
    title: "Gladiator",
    year: 2000,
    region: "Hollywood",
    mood: ["Thrilling", "Emotional"],
    pace: ["Big spectacle"],
    company: ["Friends", "Solo"],
    era: ["Modern classic"],
    tags: ["Action", "Historical", "Revenge"],
    reason: "A grand historical revenge epic with weight and momentum.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/fb/Gladiator_%282000_film_poster%29.png",
  },
  {
    title: "Casino Royale",
    year: 2006,
    region: "Hollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping", "Big spectacle"],
    company: ["Friends", "Date night"],
    era: ["Modern classic"],
    tags: ["Action", "Spy", "Reboot"],
    reason: "A grounded, propulsive spy reboot with real tension and style.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/82/Casino_Royale_%282006_film_poster%29.jpg",
  },
  {
    title: "Ford v Ferrari",
    year: 2019,
    region: "Hollywood",
    mood: ["Thrilling", "Feel-good"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Family"],
    era: ["Modern classic"],
    tags: ["Sports", "Racing", "Underdog"],
    reason: "A slick, satisfying racing drama with great chemistry and momentum.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/a4/Ford_v._Ferrari_%282019_film_poster%29.png",
  },
  {
    title: "A Quiet Place",
    year: 2018,
    region: "Hollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Date night"],
    era: ["Modern classic"],
    tags: ["Horror", "Survival", "Tense"],
    reason: "A taut, inventive survival horror that weaponizes silence.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/a0/A_Quiet_Place_film_poster.png",
  },
  {
    title: "Sicario",
    year: 2015,
    region: "Hollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Hidden gem"],
    tags: ["Thriller", "Crime", "Tense"],
    reason: "A tense, morally murky border thriller with relentless dread.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4b/Sicario_poster.jpg",
  },
  {
    title: "Little Miss Sunshine",
    year: 2006,
    region: "Hollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family", "Friends"],
    era: ["Hidden gem"],
    tags: ["Comedy", "Road trip", "Family"],
    reason: "A warm, funny road-trip comedy about a wonderfully imperfect family.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/16/Little_miss_sunshine_poster.jpg",
  },
  {
    title: "Lagaan",
    year: 2001,
    region: "Bollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Big spectacle", "Slow burn"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Sports", "Period", "Underdog"],
    reason: "A rousing period underdog epic with a huge, earned payoff.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/b/b6/Lagaan.jpg",
  },
  {
    title: "Dilwale Dulhania Le Jayenge",
    year: 1995,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Date night", "Family"],
    era: ["All-time classic"],
    tags: ["Romance", "Iconic", "Classic"],
    reason: "The definitive feel-good romance that still charms decades later.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/80/Dilwale_Dulhania_Le_Jayenge_poster.jpg",
  },
  {
    title: "Sholay",
    year: 1975,
    region: "Bollywood",
    mood: ["Thrilling", "Feel-good"],
    pace: ["Big spectacle"],
    company: ["Friends", "Family"],
    era: ["All-time classic"],
    tags: ["Action", "Adventure", "Iconic"],
    reason: "A landmark action-adventure with unforgettable characters and lines.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/52/Sholay-poster.jpg",
  },
  {
    title: "Taare Zameen Par",
    year: 2007,
    region: "Bollywood",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Easy watch", "Slow burn"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Drama", "Childhood", "Heart"],
    reason: "A gentle, deeply moving story about seeing a child for who they are.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/b/b4/Taare_Zameen_Par_Like_Stars_on_Earth_poster.png",
  },
  {
    title: "Rang De Basanti",
    year: 2006,
    region: "Bollywood",
    mood: ["Thought-provoking", "Emotional"],
    pace: ["Fast and gripping"],
    company: ["Friends"],
    era: ["Modern classic"],
    tags: ["Drama", "Youth", "Patriotic"],
    reason: "A fiery, emotional youth drama that turns friendship into purpose.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/08/Rang_De_Basanti_poster.jpg",
  },
  {
    title: "Barfi!",
    year: 2012,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family", "Date night"],
    era: ["Modern classic"],
    tags: ["Romance", "Charming", "Drama"],
    reason: "A charming, warmhearted romance told with playful visual flair.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/2/2e/Barfi%21_poster.jpg",
  },
  {
    title: "PK",
    year: 2014,
    region: "Bollywood",
    mood: ["Feel-good", "Thought-provoking"],
    pace: ["Easy watch"],
    company: ["Family", "Friends"],
    era: ["Modern classic"],
    tags: ["Comedy", "Satire", "Drama"],
    reason: "A crowd-pleasing satire that mixes big laughs with bigger questions.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/c/c3/PK_poster.jpg",
  },
  {
    title: "Drishyam",
    year: 2015,
    region: "Bollywood",
    mood: ["Thrilling"],
    pace: ["Slow burn"],
    company: ["Family", "Solo"],
    era: ["Modern classic"],
    tags: ["Thriller", "Crime", "Cat-and-mouse"],
    reason: "A patient, clever thriller about a father outwitting an investigation.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/8a/Drishyam_2015_film.jpg",
  },
  {
    title: "Kahaani",
    year: 2012,
    region: "Bollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Thriller", "Mystery", "Twists"],
    reason: "A gripping, twist-laden mystery set against a vivid Kolkata backdrop.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/f2/Kahaani_poster.jpg",
  },
  {
    title: "Talvar",
    year: 2015,
    region: "Bollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Hidden gem"],
    tags: ["Crime", "Drama", "Investigation"],
    reason: "A sharp, sobering investigation drama told from clashing viewpoints.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/91/TalvarFilmPoster.jpg",
  },
  {
    title: "Article 15",
    year: 2019,
    region: "Bollywood",
    mood: ["Thought-provoking", "Thrilling"],
    pace: ["Slow burn"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Crime", "Social", "Drama"],
    reason: "A tense, unflinching procedural with a strong social conscience.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/11/Article_15_Poster.jpg",
  },
  {
    title: "Newton",
    year: 2017,
    region: "Bollywood",
    mood: ["Thought-provoking", "Feel-good"],
    pace: ["Easy watch", "Slow burn"],
    company: ["Solo"],
    era: ["Hidden gem"],
    tags: ["Comedy", "Satire", "Drama"],
    reason: "A dry, smart satire about doing the right thing against the odds.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/68/Newton_%28film%29.png",
  },
  {
    title: "Masaan",
    year: 2015,
    region: "Bollywood",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Hidden gem"],
    tags: ["Drama", "Grief", "Poetic"],
    reason: "A quiet, poetic drama about loss, class, and second chances.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/1/1c/Masaan_poster.jpg",
  },
  {
    title: "Udaan",
    year: 2010,
    region: "Bollywood",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Hidden gem"],
    tags: ["Drama", "Coming-of-age", "Freedom"],
    reason: "A raw, resonant coming-of-age story about breaking free.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/7/71/Udaan_Movie_Poster.jpg",
  },
  {
    title: "Dil Chahta Hai",
    year: 2001,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Friends"],
    era: ["Modern classic"],
    tags: ["Friendship", "Drama", "Modern"],
    reason: "A breezy, era-defining friendship film that still feels fresh.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/db/Dil_Chahta_Hai.jpg",
  },
  {
    title: "Chak De! India",
    year: 2007,
    region: "Bollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Fast and gripping"],
    company: ["Family", "Friends"],
    era: ["Modern classic"],
    tags: ["Sports", "Team", "Inspiring"],
    reason: "A stirring team-sports drama with a rousing underdog rhythm.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/0c/Chak_De%21_India.jpg",
  },
  {
    title: "Bhaag Milkha Bhaag",
    year: 2013,
    region: "Bollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Big spectacle", "Slow burn"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Sports", "Biopic", "Inspiring"],
    reason: "An inspiring sports biopic with grit, scale, and emotion.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/42/Bhaag_Milkha_Bhaag_poster.jpg",
  },
  {
    title: "Stree",
    year: 2018,
    region: "Bollywood",
    mood: ["Feel-good", "Thrilling"],
    pace: ["Easy watch"],
    company: ["Friends"],
    era: ["Modern classic"],
    tags: ["Horror comedy", "Fun", "Folk"],
    reason: "A fun horror-comedy that balances scares with genuine laughs.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4f/Stree_-_2018_Movie_Poster.jpg",
  },
  {
    title: "Badhaai Ho",
    year: 2018,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Comedy", "Family", "Warm"],
    reason: "A warm, funny family comedy with a refreshingly honest premise.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/f5/Badhaai_Ho_Official_Poster.jpg",
  },
  {
    title: "Raazi",
    year: 2018,
    region: "Bollywood",
    mood: ["Thrilling", "Emotional"],
    pace: ["Fast and gripping", "Slow burn"],
    company: ["Solo", "Family"],
    era: ["Modern classic"],
    tags: ["Spy", "Drama", "Tense"],
    reason: "A tense, emotionally grounded spy drama with a strong central turn.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/2/2f/Raazi_-_Poster.jpg",
  },
  {
    title: "Uri: The Surgical Strike",
    year: 2019,
    region: "Bollywood",
    mood: ["Thrilling"],
    pace: ["Big spectacle", "Fast and gripping"],
    company: ["Friends", "Family"],
    era: ["Modern classic"],
    tags: ["Action", "War", "Patriotic"],
    reason: "A high-octane military action film with a steady forward drive.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/3/3b/URI_-_New_poster.jpg",
  },
  {
    title: "Bajrangi Bhaijaan",
    year: 2015,
    region: "Bollywood",
    mood: ["Emotional", "Feel-good"],
    pace: ["Easy watch", "Big spectacle"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Drama", "Journey", "Heart"],
    reason: "A big-hearted journey film that works across every age group.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/dd/Bajrangi_Bhaijaan_Poster.jpg",
  },
  {
    title: "Munna Bhai M.B.B.S.",
    year: 2003,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family", "Friends"],
    era: ["Modern classic"],
    tags: ["Comedy", "Heart", "Feel-good"],
    reason: "A warm, funny comedy with real heart and rewatch value.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/84/Munna_Bhai_M.B.B.S._poster.jpg",
  },
  {
    title: "Gangs of Wasseypur",
    year: 2012,
    region: "Bollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo", "Friends"],
    era: ["Hidden gem"],
    tags: ["Crime", "Epic", "Gritty"],
    reason: "A sprawling, gritty crime saga with dark humor and serious bite.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/6a/Gangs_of_Wasseypur_poster.jpg",
  },
  {
    title: "Haider",
    year: 2014,
    region: "Bollywood",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Hidden gem"],
    tags: ["Drama", "Tragedy", "Adaptation"],
    reason: "A bold, brooding tragedy adaptation with striking atmosphere.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/f1/Haider_Poster.jpg",
  },
  {
    title: "Paan Singh Tomar",
    year: 2012,
    region: "Bollywood",
    mood: ["Emotional", "Thrilling"],
    pace: ["Slow burn"],
    company: ["Solo"],
    era: ["Hidden gem"],
    tags: ["Biopic", "Sports", "Drama"],
    reason: "A gripping true-story biopic about an athlete pushed to the margins.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/93/Paan_Singh_Tomar_Poster.jpg",
  },
  {
    title: "English Vinglish",
    year: 2012,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Drama", "Self-worth", "Warm"],
    reason: "A gentle, uplifting story about dignity and quiet self-belief.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/6/6e/English_Vinglish_poster.jpg",
  },
  {
    title: "Piku",
    year: 2015,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family"],
    era: ["Modern classic"],
    tags: ["Comedy", "Family", "Slice-of-life"],
    reason: "A charming slice-of-life comedy about family, quirks, and care.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/98/Piku.jpg",
  },
  {
    title: "Special 26",
    year: 2013,
    region: "Bollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping"],
    company: ["Friends", "Family"],
    era: ["Modern classic"],
    tags: ["Heist", "Con", "Period"],
    reason: "A smooth, clever heist caper with confident period style.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/7/7c/Special_26_poster.jpg",
  },
  {
    title: "A Wednesday!",
    year: 2008,
    region: "Bollywood",
    mood: ["Thrilling", "Thought-provoking"],
    pace: ["Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Hidden gem"],
    tags: ["Thriller", "Drama", "Tense"],
    reason: "A tight, punchy thriller that says a lot in a lean runtime.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/7/77/A_Wednesday_Poster.JPG",
  },
  {
    title: "Wake Up Sid",
    year: 2009,
    region: "Bollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Solo", "Friends"],
    era: ["Modern classic"],
    tags: ["Coming-of-age", "City", "Warm"],
    reason: "A relaxed coming-of-age charmer about growing up at your own pace.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/9f/Wake_up_Sid.jpg",
  },
  {
    title: "My Name Is Khan",
    year: 2010,
    region: "Bollywood",
    mood: ["Emotional", "Thought-provoking"],
    pace: ["Slow burn"],
    company: ["Family", "Solo"],
    era: ["Modern classic"],
    tags: ["Drama", "Journey", "Heart"],
    reason: "An earnest, emotional journey drama about identity and decency.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/5d/My_Name_Is_Khan_film_poster.jpg",
  },

  {
    title: "Avengers: Doomsday",
    year: 2026,
    region: "Hollywood",
    mood: ["Thrilling", "Emotional"],
    pace: ["Big spectacle", "Fast and gripping"],
    company: ["Friends", "Family"],
    era: ["Recent"],
    tags: ["Action", "Comic-book", "Epic"],
    reason: "The next blockbuster Avengers chapter \u2014 huge scale and ensemble stakes.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/ee/Avengers_Doomsday_poster.jpg",
  },
  {
    title: "Spider-Man: Brand New Day",
    year: 2026,
    region: "Hollywood",
    mood: ["Thrilling", "Feel-good"],
    pace: ["Fast and gripping", "Big spectacle"],
    company: ["Friends", "Family"],
    era: ["Recent"],
    tags: ["Action", "Comic-book", "Fun"],
    reason: "A fresh Spider-Man outing with energy, heart, and big set pieces.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/9a/Spider-Man_Brand_New_Day_poster.jpg",
  },
  {
    title: "The Mandalorian and Grogu",
    year: 2026,
    region: "Hollywood",
    mood: ["Thrilling", "Feel-good"],
    pace: ["Big spectacle"],
    company: ["Family", "Friends"],
    era: ["Recent"],
    tags: ["Sci-fi", "Adventure", "Star Wars"],
    reason: "The Mandalorian hits the big screen with adventure and warmth.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4c/The_Mandalorian_and_Grogu_poster.jpg",
  },
  {
    title: "Project Hail Mary",
    year: 2026,
    region: "Hollywood",
    mood: ["Thought-provoking", "Thrilling"],
    pace: ["Big spectacle", "Fast and gripping"],
    company: ["Solo", "Friends"],
    era: ["Recent"],
    tags: ["Sci-fi", "Space", "Survival"],
    reason: "A high-concept space survival story built on smart problem-solving.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/3/3b/Project_Hail_Mary_poster.jpg",
  },
  {
    title: "Toy Story 5",
    year: 2026,
    region: "Hollywood",
    mood: ["Feel-good", "Emotional"],
    pace: ["Easy watch"],
    company: ["Family"],
    era: ["Recent"],
    tags: ["Animation", "Family", "Heart"],
    reason: "The toys return for another warm, all-ages adventure.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/08/Toy_Story_5_poster.jpg",
  },
  {
    title: "Dune: Part Three",
    year: 2026,
    region: "Hollywood",
    mood: ["Thought-provoking", "Thrilling"],
    pace: ["Big spectacle", "Slow burn"],
    company: ["Solo", "Friends"],
    era: ["Recent"],
    tags: ["Sci-fi", "Epic", "Visual"],
    reason: "The next stunning chapter of the Dune saga, built for the biggest screen.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/7/7b/Dune_Part_Three_poster.jpg",
  },
  {
    title: "Supergirl",
    year: 2026,
    region: "Hollywood",
    mood: ["Thrilling", "Feel-good"],
    pace: ["Big spectacle", "Fast and gripping"],
    company: ["Friends", "Family"],
    era: ["Recent"],
    tags: ["Action", "Comic-book", "Adventure"],
    reason: "A bold new big-screen take on Supergirl with spectacle and spirit.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/58/Supergirl_%282026_film%29_poster.jpg",
  },
  {
    title: "The Super Mario Galaxy Movie",
    year: 2026,
    region: "Hollywood",
    mood: ["Feel-good"],
    pace: ["Easy watch", "Big spectacle"],
    company: ["Family"],
    era: ["Recent"],
    tags: ["Animation", "Adventure", "Fun"],
    reason: "A colourful, playful animated romp the whole family can enjoy.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/b/bf/The_Super_Mario_Galaxy_Movie_poster.jpeg",
  },
  {
    title: "King",
    year: 2026,
    region: "Bollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping", "Big spectacle"],
    company: ["Friends", "Family"],
    era: ["Recent"],
    tags: ["Action", "Drama", "Star vehicle"],
    reason: "A high-energy action drama anchored by a marquee lead.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/fd/King_%28Hindi_film%29.jpg",
  },
  {
    title: "Border 2",
    year: 2026,
    region: "Bollywood",
    mood: ["Thrilling", "Emotional"],
    pace: ["Big spectacle", "Fast and gripping"],
    company: ["Family", "Friends"],
    era: ["Recent"],
    tags: ["War", "Action", "Patriotic"],
    reason: "A big-canvas war film following the legacy of the original Border.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/2/26/Border_2_Poster.jpg",
  },
  {
    title: "Alpha",
    year: 2026,
    region: "Bollywood",
    mood: ["Thrilling"],
    pace: ["Fast and gripping", "Big spectacle"],
    company: ["Friends", "Solo"],
    era: ["Recent"],
    tags: ["Action", "Spy", "Thriller"],
    reason: "A slick spy-action entry with a fresh lead duo.",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/0/0d/Alpha_official_poster.JPG",
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

// "Recent" is defined strictly by release year (current-year films) rather
// than a static tag, so older movies can never count as Recent.
const RECENT_FROM_YEAR = 2026;

function movieMatches(movie: Movie, key: AnswerKey, value: string) {
  if (key === "era" && value === "Recent") {
    return movie.year >= RECENT_FROM_YEAR;
  }
  return movie[key].includes(value);
}

// How many of the answered questions this movie matches (integer, for display).
function matchCount(movie: Movie, answers: Record<AnswerKey, string>) {
  return QUESTIONS.reduce((count, question) => {
    const value = answers[question.key];
    if (!value) return count;
    return movieMatches(movie, question.key, value) ? count + 1 : count;
  }, 0);
}

// Ranking score that rewards specificity: a match counts for less when the
// movie is tagged with many values in that category, so broadly-tagged films
// (e.g. Dangal) stop dominating every result set.
function rankScore(movie: Movie, answers: Record<AnswerKey, string>) {
  return QUESTIONS.reduce((score, question) => {
    const value = answers[question.key];
    if (!value) return score;
    const options = movie[question.key];
    return movieMatches(movie, question.key, value)
      ? score + 1 / options.length
      : score;
  }, 0);
}

// Stable hash used to rotate tied movies based on the current answer set, so
// changing a filter surfaces a different mix instead of the same newest films.
function varietyHash(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function MoviePoster({
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
        alt={`${title} movie poster`}
        fill
        sizes="(max-width: 560px) 100vw, 260px"
        className={styles.posterImage}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function MoviesPage() {
  useSectionAnalytics("movies");

  const [region, setRegion] = useState<Region>("Hollywood");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<AnswerKey, string>>(getInitialAnswers);
  const [showResults, setShowResults] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [ratingTab, setRatingTab] = useState<RatingTab>("all");

  const currentQuestion = QUESTIONS[step];
  const answeredCount = QUESTIONS.filter((question) => answers[question.key]).length;
  const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);

  const recommendations = useMemo(() => {
    const answersKey = QUESTIONS.map((question) => answers[question.key]).join("|");
    return MOVIES.filter(
      (movie) =>
        movie.region === region &&
        // Release style is a hard filter: e.g. "Recent" restricts the pool to
        // 2026+ films so it never surfaces older movies.
        (!answers.era || movieMatches(movie, "era", answers.era))
    )
      .map((movie) => ({
        movie,
        matches: matchCount(movie, answers),
        score: rankScore(movie, answers),
        order: varietyHash(`${movie.title}#${answersKey}`),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Tie-break with the answer-seeded hash so the mix rotates per
        // selection; year is a final, deterministic fallback.
        if (a.order !== b.order) return a.order - b.order;
        return b.movie.year - a.movie.year;
      })
      .slice(0, 6);
  }, [answers, region]);

  const allAnswered = answeredCount === QUESTIONS.length;
  const answersKey = QUESTIONS.map((question) => answers[question.key]).join("|");
  const filterKey = `${region}|${answersKey}|${ratingTab}`;

  // De-duped, paginating stream of suggestions. `seenIds` persists across
  // sessions so a movie never repeats in any form or order.
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
      id: `curated:${r.movie.title}`,
      title: r.movie.title,
      year: r.movie.year,
      posterUrl: r.movie.posterUrl,
      reason: r.movie.reason,
      tags: r.movie.tags,
      metaLabel: `${r.movie.year} · ${r.matches}/${QUESTIONS.length} match`,
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
      region,
      ...answers,
      rating: ratingTab,
      page: "1",
    });
    fetch(`/api/movies/discover?${params.toString()}`, { signal: controller.signal })
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
    // filterKey captures region + answers; deliberately not re-running on the
    // helper identities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswered, filterKey]);

  // Fetch successive TMDB pages, skipping pages that are fully "seen", until we
  // find fresh movies or run out of pages.
  const fetchMore = useCallback(async () => {
    if (loading || page === 0 || page >= totalPages) return;
    setLoading(true);
    try {
      let nextPage = page;
      while (nextPage < totalPages) {
        nextPage += 1;
        const params = new URLSearchParams({
          region,
          ...answers,
          rating: ratingTab,
          page: String(nextPage),
        });
        const data = await fetch(`/api/movies/discover?${params.toString()}`).then(
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
  }, [loading, page, totalPages, region, answers, ratingTab, addUnseen]);

  const activeSuggestion = stream[suggestionIndex] ?? stream[0];
  const canFetchMore = page > 0 && page < totalPages;

  // Streaming availability (TMDB/JustWatch) in India for the movie shown.
  const [providersById, setProvidersById] = useState<Record<string, ProviderInfo>>({});
  const activeId = activeSuggestion?.id;
  const isApiMovie = Boolean(activeId && !activeId.startsWith("curated:"));
  useEffect(() => {
    if (!activeId || !isApiMovie) return;
    if (providersById[activeId]) return;
    let aborted = false;
    fetch(`/api/movies/providers?id=${activeId}&region=IN`)
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
  const activeProviders = isApiMovie && activeId ? providersById[activeId] : undefined;

  // Prefetch more as the user nears the end so "Next" stays seamless.
  useEffect(() => {
    if (allAnswered && suggestionIndex >= stream.length - 2 && canFetchMore && !loading) {
      fetchMore();
    }
  }, [allAnswered, suggestionIndex, stream.length, canFetchMore, loading, fetchMore]);

  function selectRegion(nextRegion: Region) {
    if (nextRegion === region) return;
    setRegion(nextRegion);
    setSuggestionIndex(0);
  }

  function selectAnswer(value: string) {
    const key = currentQuestion.key;
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);
    setSuggestionIndex(0);

    // Only reveal the shortlist once every question has an answer.
    const allAnswered = QUESTIONS.every((question) => nextAnswers[question.key]);
    if (allAnswered) {
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
          <div
            className={`${styles.panel} ${styles.agentPanel} ${
              showResults ? styles.hideOnMobile : ""
            }`}
          >
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
                </div>
                {stream.length === 0 ? (
              <div className={styles.emptyState}>
                <div>
                  <p className={styles.emptyTitle}>
                    {loading ? "Finding picks…" : `No new ${region} matches right now.`}
                  </p>
                  <p className={styles.emptyText}>
                    {loading
                      ? "Matching your mood, pace, and release style."
                      : "Try a different style, switch library, or hit Start over to reset what you've seen."}
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
                        Suggestion {suggestionIndex + 1}
                      </span>
                    </div>

                    <article className={styles.featuredMovie}>
                      <MoviePoster
                        key={activeSuggestion.id}
                        posterUrl={activeSuggestion.posterUrl}
                        title={activeSuggestion.title}
                        year={activeSuggestion.year}
                      />

                      <div className={styles.movieDetails}>
                        <div className={styles.movieTopline}>
                          <h3 className={styles.movieTitle}>{activeSuggestion.title}</h3>
                          <span className={styles.movieMeta}>{activeSuggestion.metaLabel}</span>
                        </div>
                        <p className={styles.movieReason}>{activeSuggestion.reason}</p>
                        <div className={styles.tagRow}>
                          {activeSuggestion.tags.map((tag) => (
                            <span key={tag} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        {isApiMovie && (
                          <div className={styles.watchRow}>
                            <span className={styles.watchLabel}>Watch on</span>
                            {activeProviders === undefined ? (
                              <span className={styles.watchHint}>Checking…</span>
                            ) : activeProviders.providers.length > 0 ? (
                              activeProviders.providers.map((provider) => (
                                <ProviderLogo
                                  key={provider.name}
                                  provider={provider}
                                  link={activeProviders.link}
                                  title={provider.name}
                                />
                              ))
                            ) : activeProviders.rentBuy.length > 0 ? (
                              <>
                                {activeProviders.rentBuy.slice(0, 4).map((provider) => (
                                  <ProviderLogo
                                    key={provider.name}
                                    provider={provider}
                                    link={activeProviders.link}
                                    title={`${provider.name} (rent / buy)`}
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
