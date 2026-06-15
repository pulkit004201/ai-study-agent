#!/usr/bin/env python3
"""Dev-only: fetch posters for 2026 candidate films and emit TS Movie literals.
Keeps only entries whose poster resolves on upload.wikimedia.org.
"""
import json
import subprocess
import sys
import urllib.parse

# (title, year, region, wiki, mood, pace, company, era, tags, reason)
CANDIDATES = [
    # ---------- Hollywood 2026 ----------
    ("Avengers: Doomsday", 2026, "Hollywood", "Avengers:_Doomsday",
     ["Thrilling", "Emotional"], ["Big spectacle", "Fast and gripping"], ["Friends", "Family"], ["Recent"],
     ["Action", "Comic-book", "Epic"], "The next blockbuster Avengers chapter — huge scale and ensemble stakes."),
    ("Spider-Man: Brand New Day", 2026, "Hollywood", "Spider-Man:_Brand_New_Day",
     ["Thrilling", "Feel-good"], ["Fast and gripping", "Big spectacle"], ["Friends", "Family"], ["Recent"],
     ["Action", "Comic-book", "Fun"], "A fresh Spider-Man outing with energy, heart, and big set pieces."),
    ("The Mandalorian and Grogu", 2026, "Hollywood", "The_Mandalorian_and_Grogu",
     ["Thrilling", "Feel-good"], ["Big spectacle"], ["Family", "Friends"], ["Recent"],
     ["Sci-fi", "Adventure", "Star Wars"], "The Mandalorian hits the big screen with adventure and warmth."),
    ("Project Hail Mary", 2026, "Hollywood", "Project_Hail_Mary_(film)",
     ["Thought-provoking", "Thrilling"], ["Big spectacle", "Fast and gripping"], ["Solo", "Friends"], ["Recent"],
     ["Sci-fi", "Space", "Survival"], "A high-concept space survival story built on smart problem-solving."),
    ("Toy Story 5", 2026, "Hollywood", "Toy_Story_5",
     ["Feel-good", "Emotional"], ["Easy watch"], ["Family"], ["Recent"],
     ["Animation", "Family", "Heart"], "The toys return for another warm, all-ages adventure."),
    ("Dune: Part Three", 2026, "Hollywood", "Dune:_Part_Three",
     ["Thought-provoking", "Thrilling"], ["Big spectacle", "Slow burn"], ["Solo", "Friends"], ["Recent"],
     ["Sci-fi", "Epic", "Visual"], "The next stunning chapter of the Dune saga, built for the biggest screen."),
    ("Supergirl", 2026, "Hollywood", "Supergirl_(2026_film)",
     ["Thrilling", "Feel-good"], ["Big spectacle", "Fast and gripping"], ["Friends", "Family"], ["Recent"],
     ["Action", "Comic-book", "Adventure"], "A bold new big-screen take on Supergirl with spectacle and spirit."),
    ("The Super Mario Galaxy Movie", 2026, "Hollywood", "The_Super_Mario_Galaxy_Movie",
     ["Feel-good"], ["Easy watch", "Big spectacle"], ["Family"], ["Recent"],
     ["Animation", "Adventure", "Fun"], "A colourful, playful animated romp the whole family can enjoy."),
    # ---------- Bollywood 2026 ----------
    ("Ramayana", 2026, "Bollywood", "Ramayana_(2026_film)",
     ["Emotional", "Thrilling"], ["Big spectacle", "Slow burn"], ["Family"], ["Recent"],
     ["Epic", "Mythology", "Visual"], "An ambitious, large-scale retelling of the Ramayana epic."),
    ("King", 2026, "Bollywood", "King_(2026_film)",
     ["Thrilling"], ["Fast and gripping", "Big spectacle"], ["Friends", "Family"], ["Recent"],
     ["Action", "Drama", "Star vehicle"], "A high-energy action drama anchored by a marquee lead."),
    ("Border 2", 2026, "Bollywood", "Border_2",
     ["Thrilling", "Emotional"], ["Big spectacle", "Fast and gripping"], ["Family", "Friends"], ["Recent"],
     ["War", "Action", "Patriotic"], "A big-canvas war film following the legacy of the original Border."),
    ("Spirit", 2026, "Bollywood", "Spirit_(2026_film)",
     ["Thrilling"], ["Fast and gripping", "Big spectacle"], ["Solo", "Friends"], ["Recent"],
     ["Action", "Crime", "Intense"], "A gritty, intense action thriller with a hard edge."),
    ("Alpha", 2026, "Bollywood", "Alpha_(2026_film)",
     ["Thrilling"], ["Fast and gripping", "Big spectacle"], ["Friends", "Solo"], ["Recent"],
     ["Action", "Spy", "Thriller"], "A slick spy-action entry with a fresh lead duo."),
    ("Love & War", 2026, "Bollywood", "Love_&_War_(2026_film)",
     ["Emotional", "Thrilling"], ["Big spectacle", "Slow burn"], ["Date night", "Family"], ["Recent"],
     ["Romance", "Drama", "Epic"], "A sweeping, large-scale romantic drama with grand staging."),
]


def fetch_poster(wiki: str) -> str:
    url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(wiki, safe="!:()&")
    try:
        res = subprocess.run(
            ["curl", "-sS", "-A", "ai-study-agent-dev/1.0", url],
            capture_output=True, text=True, timeout=30,
        )
        d = json.loads(res.stdout)
    except Exception as e:  # noqa: BLE001
        print(f"// WARN fetch failed for {wiki}: {e}", file=sys.stderr)
        return ""
    src = (d.get("originalimage") or {}).get("source") or (d.get("thumbnail") or {}).get("source") or ""
    return src if "upload.wikimedia.org" in src else ""


def ts_arr(items):
    return "[" + ", ".join(json.dumps(x) for x in items) + "]"


def main():
    kept, skipped = [], []
    for (title, year, region, wiki, mood, pace, company, era, tags, reason) in CANDIDATES:
        poster = fetch_poster(wiki)
        if not poster:
            skipped.append(title)
            continue
        kept.append(
            "  {\n"
            f"    title: {json.dumps(title)},\n"
            f"    year: {year},\n"
            f"    region: {json.dumps(region)},\n"
            f"    mood: {ts_arr(mood)},\n"
            f"    pace: {ts_arr(pace)},\n"
            f"    company: {ts_arr(company)},\n"
            f"    era: {ts_arr(era)},\n"
            f"    tags: {ts_arr(tags)},\n"
            f"    reason: {json.dumps(reason)},\n"
            f"    posterUrl: {json.dumps(poster)},\n"
            "  },"
        )
    print("\n".join(kept))
    print(f"\n// kept={len(kept)} skipped(no poster)={skipped}", file=sys.stderr)


if __name__ == "__main__":
    main()
