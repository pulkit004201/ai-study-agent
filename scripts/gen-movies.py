#!/usr/bin/env python3
"""Dev-only generator: fetches real poster URLs from Wikipedia REST API and
emits TypeScript Movie object literals for the new curated titles.

Run: python3 scripts/gen-movies.py > /tmp/new-movies.ts
"""
import json
import subprocess
import sys
import time
import urllib.parse

# (title, year, region, wiki, mood, pace, company, era, tags, reason)
NEW = [
    # ---------- Hollywood ----------
    ("Inception", 2010, "Hollywood", "Inception",
     ["Thrilling", "Thought-provoking"], ["Fast and gripping", "Big spectacle"], ["Friends", "Solo"], ["Modern classic"],
     ["Sci-fi", "Heist", "Mind-bending"], "A layered heist-in-dreams puzzle with big set pieces and a debate-worthy ending."),
    ("Interstellar", 2014, "Hollywood", "Interstellar_(film)",
     ["Emotional", "Thought-provoking"], ["Big spectacle", "Slow burn"], ["Family", "Solo"], ["Modern classic"],
     ["Sci-fi", "Space", "Father-daughter"], "An ambitious space epic that pairs cosmic scale with a deeply human core."),
    ("The Dark Knight", 2008, "Hollywood", "The_Dark_Knight",
     ["Thrilling"], ["Fast and gripping", "Big spectacle"], ["Friends", "Solo"], ["Modern classic"],
     ["Action", "Crime", "Comic-book"], "A tense crime thriller anchored by an unforgettable villain and real stakes."),
    ("Forrest Gump", 1994, "Hollywood", "Forrest_Gump",
     ["Emotional", "Feel-good"], ["Easy watch"], ["Family", "Solo"], ["All-time classic"],
     ["Drama", "Life story", "Warm"], "A warm, sweeping life story that moves easily through decades and emotions."),
    ("Pulp Fiction", 1994, "Hollywood", "Pulp_Fiction",
     ["Thrilling", "Thought-provoking"], ["Fast and gripping"], ["Friends", "Solo"], ["All-time classic"],
     ["Crime", "Nonlinear", "Cult"], "A sharp, quotable crime mosaic with style and bite in every scene."),
    ("The Godfather", 1972, "Hollywood", "The_Godfather",
     ["Emotional", "Thought-provoking"], ["Slow burn"], ["Solo", "Family"], ["All-time classic"],
     ["Crime", "Family", "Epic"], "A patient, towering crime saga about power, loyalty, and family."),
    ("Whiplash", 2014, "Hollywood", "Whiplash_(2014_film)",
     ["Thrilling", "Emotional"], ["Fast and gripping"], ["Solo", "Friends"], ["Modern classic"],
     ["Music", "Drama", "Intense"], "A nerve-shredding music drama about ambition pushed to the edge."),
    ("Gone Girl", 2014, "Hollywood", "Gone_Girl_(film)",
     ["Thrilling"], ["Fast and gripping"], ["Date night", "Solo"], ["Modern classic"],
     ["Thriller", "Mystery", "Twists"], "A slick, unsettling marriage thriller with a wicked midpoint turn."),
    ("Get Out", 2017, "Hollywood", "Get_Out",
     ["Thrilling", "Thought-provoking"], ["Fast and gripping"], ["Friends", "Solo"], ["Modern classic"],
     ["Horror", "Satire", "Social"], "A sharp social horror that keeps tightening while it makes you think."),
    ("Up", 2009, "Hollywood", "Up_(2009_film)",
     ["Emotional", "Feel-good"], ["Easy watch"], ["Family"], ["Modern classic"],
     ["Animation", "Adventure", "Heart"], "A tender animated adventure with one of cinema's most moving openings."),
    ("Spider-Man: Into the Spider-Verse", 2018, "Hollywood", "Spider-Man:_Into_the_Spider-Verse",
     ["Feel-good", "Thrilling"], ["Fast and gripping", "Big spectacle"], ["Family", "Friends"], ["Recent"],
     ["Animation", "Comic-book", "Stylish"], "A dazzling, kinetic animated take that feels fresh from frame one."),
    ("Avengers: Endgame", 2019, "Hollywood", "Avengers:_Endgame",
     ["Thrilling", "Emotional"], ["Big spectacle"], ["Friends", "Family"], ["Recent"],
     ["Action", "Comic-book", "Finale"], "A massive crowd-pleasing finale that pays off years of buildup."),
    ("The Social Network", 2010, "Hollywood", "The_Social_Network",
     ["Thought-provoking"], ["Fast and gripping"], ["Solo", "Friends"], ["Modern classic"],
     ["Drama", "Tech", "Ambition"], "A razor-sharp, fast-talking drama about ambition and fallout."),
    ("Dune", 2021, "Hollywood", "Dune_(2021_film)",
     ["Thought-provoking", "Thrilling"], ["Big spectacle", "Slow burn"], ["Solo", "Friends"], ["Recent"],
     ["Sci-fi", "Epic", "Visual"], "A stunning, immersive sci-fi epic built for the biggest screen you have."),
    ("Blade Runner 2049", 2017, "Hollywood", "Blade_Runner_2049",
     ["Thought-provoking", "Emotional"], ["Slow burn"], ["Solo"], ["Modern classic"],
     ["Sci-fi", "Noir", "Atmosphere"], "A meditative, gorgeous sci-fi noir that rewards patience."),
    ("The Prestige", 2006, "Hollywood", "The_Prestige_(film)",
     ["Thrilling", "Thought-provoking"], ["Fast and gripping"], ["Solo", "Friends"], ["Modern classic"],
     ["Mystery", "Rivalry", "Twists"], "A twisty rivalry mystery that keeps misdirecting until the last trick."),
    ("No Country for Old Men", 2007, "Hollywood", "No_Country_for_Old_Men_(film)",
     ["Thrilling", "Thought-provoking"], ["Slow burn"], ["Solo"], ["Modern classic"],
     ["Crime", "Thriller", "Tense"], "A lean, dread-soaked chase thriller with one of film's coldest villains."),
    ("Django Unchained", 2012, "Hollywood", "Django_Unchained",
     ["Thrilling"], ["Fast and gripping", "Big spectacle"], ["Friends", "Solo"], ["Modern classic"],
     ["Western", "Revenge", "Stylish"], "A bold, stylish revenge western with sharp dialogue and big swings."),
    ("The Wolf of Wall Street", 2013, "Hollywood", "The_Wolf_of_Wall_Street_(2013_film)",
     ["Thrilling", "Thought-provoking"], ["Fast and gripping"], ["Friends", "Solo"], ["Modern classic"],
     ["Drama", "Excess", "Dark comedy"], "A relentless, high-energy ride through greed and excess."),
    ("1917", 2019, "Hollywood", "1917_(2019_film)",
     ["Thrilling", "Emotional"], ["Big spectacle", "Fast and gripping"], ["Solo", "Friends"], ["Recent"],
     ["War", "Survival", "One-shot"], "A breathless, immersive war mission shot to feel like one take."),
    ("Joker", 2019, "Hollywood", "Joker_(2019_film)",
     ["Thought-provoking", "Emotional"], ["Slow burn"], ["Solo"], ["Recent"],
     ["Drama", "Character study", "Dark"], "A bleak, magnetic character study carried by a transformative lead."),
    ("Coco", 2017, "Hollywood", "Coco_(2017_film)",
     ["Emotional", "Feel-good"], ["Easy watch"], ["Family"], ["Modern classic"],
     ["Animation", "Music", "Family"], "A vibrant, heartfelt animated story about family and memory."),
    ("Inside Out", 2015, "Hollywood", "Inside_Out_(2015_film)",
     ["Emotional", "Feel-good"], ["Easy watch"], ["Family"], ["Modern classic"],
     ["Animation", "Emotions", "Clever"], "A clever, moving look inside the mind that lands for all ages."),
    ("Jurassic Park", 1993, "Hollywood", "Jurassic_Park_(film)",
     ["Thrilling", "Feel-good"], ["Big spectacle"], ["Family", "Friends"], ["All-time classic"],
     ["Adventure", "Sci-fi", "Iconic"], "A timeless adventure spectacle with wonder and white-knuckle set pieces."),
    ("Titanic", 1997, "Hollywood", "Titanic_(1997_film)",
     ["Emotional"], ["Big spectacle", "Slow burn"], ["Date night"], ["All-time classic"],
     ["Romance", "Epic", "Tragedy"], "A sweeping epic romance built around a disaster you can't look away from."),
    ("The Lord of the Rings: The Fellowship of the Ring", 2001, "Hollywood", "The_Lord_of_the_Rings:_The_Fellowship_of_the_Ring",
     ["Thrilling", "Emotional"], ["Big spectacle", "Slow burn"], ["Friends", "Family"], ["Modern classic"],
     ["Fantasy", "Epic", "Adventure"], "An immersive fantasy epic that sets a gold standard for the genre."),
    ("Gladiator", 2000, "Hollywood", "Gladiator_(2000_film)",
     ["Thrilling", "Emotional"], ["Big spectacle"], ["Friends", "Solo"], ["Modern classic"],
     ["Action", "Historical", "Revenge"], "A grand historical revenge epic with weight and momentum."),
    ("Casino Royale", 2006, "Hollywood", "Casino_Royale_(2006_film)",
     ["Thrilling"], ["Fast and gripping", "Big spectacle"], ["Friends", "Date night"], ["Modern classic"],
     ["Action", "Spy", "Reboot"], "A grounded, propulsive spy reboot with real tension and style."),
    ("Ford v Ferrari", 2019, "Hollywood", "Ford_v_Ferrari",
     ["Thrilling", "Feel-good"], ["Fast and gripping"], ["Friends", "Family"], ["Recent"],
     ["Sports", "Racing", "Underdog"], "A slick, satisfying racing drama with great chemistry and momentum."),
    ("A Quiet Place", 2018, "Hollywood", "A_Quiet_Place",
     ["Thrilling"], ["Fast and gripping"], ["Friends", "Date night"], ["Recent"],
     ["Horror", "Survival", "Tense"], "A taut, inventive survival horror that weaponizes silence."),
    ("Sicario", 2015, "Hollywood", "Sicario_(2015_film)",
     ["Thrilling", "Thought-provoking"], ["Slow burn"], ["Solo"], ["Hidden gem"],
     ["Thriller", "Crime", "Tense"], "A tense, morally murky border thriller with relentless dread."),
    ("Little Miss Sunshine", 2006, "Hollywood", "Little_Miss_Sunshine",
     ["Feel-good", "Emotional"], ["Easy watch"], ["Family", "Friends"], ["Hidden gem"],
     ["Comedy", "Road trip", "Family"], "A warm, funny road-trip comedy about a wonderfully imperfect family."),
    # ---------- Bollywood ----------
    ("Lagaan", 2001, "Bollywood", "Lagaan",
     ["Emotional", "Feel-good"], ["Big spectacle", "Slow burn"], ["Family"], ["Modern classic"],
     ["Sports", "Period", "Underdog"], "A rousing period underdog epic with a huge, earned payoff."),
    ("Dilwale Dulhania Le Jayenge", 1995, "Bollywood", "Dilwale_Dulhania_Le_Jayenge",
     ["Feel-good", "Emotional"], ["Easy watch"], ["Date night", "Family"], ["All-time classic"],
     ["Romance", "Iconic", "Classic"], "The definitive feel-good romance that still charms decades later."),
    ("Sholay", 1975, "Bollywood", "Sholay",
     ["Thrilling", "Feel-good"], ["Big spectacle"], ["Friends", "Family"], ["All-time classic"],
     ["Action", "Adventure", "Iconic"], "A landmark action-adventure with unforgettable characters and lines."),
    ("Taare Zameen Par", 2007, "Bollywood", "Taare_Zameen_Par",
     ["Emotional", "Thought-provoking"], ["Easy watch", "Slow burn"], ["Family"], ["Modern classic"],
     ["Drama", "Childhood", "Heart"], "A gentle, deeply moving story about seeing a child for who they are."),
    ("Rang De Basanti", 2006, "Bollywood", "Rang_De_Basanti",
     ["Thought-provoking", "Emotional"], ["Fast and gripping"], ["Friends"], ["Modern classic"],
     ["Drama", "Youth", "Patriotic"], "A fiery, emotional youth drama that turns friendship into purpose."),
    ("Barfi!", 2012, "Bollywood", "Barfi!",
     ["Feel-good", "Emotional"], ["Easy watch"], ["Family", "Date night"], ["Modern classic"],
     ["Romance", "Charming", "Drama"], "A charming, warmhearted romance told with playful visual flair."),
    ("PK", 2014, "Bollywood", "PK_(film)",
     ["Feel-good", "Thought-provoking"], ["Easy watch"], ["Family", "Friends"], ["Modern classic"],
     ["Comedy", "Satire", "Drama"], "A crowd-pleasing satire that mixes big laughs with bigger questions."),
    ("Drishyam", 2015, "Bollywood", "Drishyam_(2015_film)",
     ["Thrilling"], ["Slow burn"], ["Family", "Solo"], ["Modern classic"],
     ["Thriller", "Crime", "Cat-and-mouse"], "A patient, clever thriller about a father outwitting an investigation."),
    ("Kahaani", 2012, "Bollywood", "Kahaani",
     ["Thrilling"], ["Fast and gripping"], ["Solo", "Friends"], ["Modern classic"],
     ["Thriller", "Mystery", "Twists"], "A gripping, twist-laden mystery set against a vivid Kolkata backdrop."),
    ("Talvar", 2015, "Bollywood", "Talvar_(film)",
     ["Thrilling", "Thought-provoking"], ["Slow burn"], ["Solo"], ["Hidden gem"],
     ["Crime", "Drama", "Investigation"], "A sharp, sobering investigation drama told from clashing viewpoints."),
    ("Article 15", 2019, "Bollywood", "Article_15_(film)",
     ["Thought-provoking", "Thrilling"], ["Slow burn"], ["Solo", "Friends"], ["Recent"],
     ["Crime", "Social", "Drama"], "A tense, unflinching procedural with a strong social conscience."),
    ("Newton", 2017, "Bollywood", "Newton_(film)",
     ["Thought-provoking", "Feel-good"], ["Easy watch", "Slow burn"], ["Solo"], ["Hidden gem"],
     ["Comedy", "Satire", "Drama"], "A dry, smart satire about doing the right thing against the odds."),
    ("Masaan", 2015, "Bollywood", "Masaan",
     ["Emotional", "Thought-provoking"], ["Slow burn"], ["Solo"], ["Hidden gem"],
     ["Drama", "Grief", "Poetic"], "A quiet, poetic drama about loss, class, and second chances."),
    ("Udaan", 2010, "Bollywood", "Udaan_(2010_film)",
     ["Emotional", "Thought-provoking"], ["Slow burn"], ["Solo"], ["Hidden gem"],
     ["Drama", "Coming-of-age", "Freedom"], "A raw, resonant coming-of-age story about breaking free."),
    ("Dil Chahta Hai", 2001, "Bollywood", "Dil_Chahta_Hai",
     ["Feel-good", "Emotional"], ["Easy watch"], ["Friends"], ["Modern classic"],
     ["Friendship", "Drama", "Modern"], "A breezy, era-defining friendship film that still feels fresh."),
    ("Chak De! India", 2007, "Bollywood", "Chak_De!_India",
     ["Emotional", "Feel-good"], ["Fast and gripping"], ["Family", "Friends"], ["Modern classic"],
     ["Sports", "Team", "Inspiring"], "A stirring team-sports drama with a rousing underdog rhythm."),
    ("Bhaag Milkha Bhaag", 2013, "Bollywood", "Bhaag_Milkha_Bhaag",
     ["Emotional", "Feel-good"], ["Big spectacle", "Slow burn"], ["Family"], ["Modern classic"],
     ["Sports", "Biopic", "Inspiring"], "An inspiring sports biopic with grit, scale, and emotion."),
    ("Stree", 2018, "Bollywood", "Stree_(2018_film)",
     ["Feel-good", "Thrilling"], ["Easy watch"], ["Friends"], ["Recent"],
     ["Horror comedy", "Fun", "Folk"], "A fun horror-comedy that balances scares with genuine laughs."),
    ("Badhaai Ho", 2018, "Bollywood", "Badhaai_Ho",
     ["Feel-good", "Emotional"], ["Easy watch"], ["Family"], ["Recent"],
     ["Comedy", "Family", "Warm"], "A warm, funny family comedy with a refreshingly honest premise."),
    ("Raazi", 2018, "Bollywood", "Raazi",
     ["Thrilling", "Emotional"], ["Fast and gripping", "Slow burn"], ["Solo", "Family"], ["Recent"],
     ["Spy", "Drama", "Tense"], "A tense, emotionally grounded spy drama with a strong central turn."),
    ("Uri: The Surgical Strike", 2019, "Bollywood", "Uri:_The_Surgical_Strike",
     ["Thrilling"], ["Big spectacle", "Fast and gripping"], ["Friends", "Family"], ["Recent"],
     ["Action", "War", "Patriotic"], "A high-octane military action film with a steady forward drive."),
    ("Bajrangi Bhaijaan", 2015, "Bollywood", "Bajrangi_Bhaijaan",
     ["Emotional", "Feel-good"], ["Easy watch", "Big spectacle"], ["Family"], ["Modern classic"],
     ["Drama", "Journey", "Heart"], "A big-hearted journey film that works across every age group."),
    ("Munna Bhai M.B.B.S.", 2003, "Bollywood", "Munna_Bhai_M.B.B.S.",
     ["Feel-good", "Emotional"], ["Easy watch"], ["Family", "Friends"], ["Modern classic"],
     ["Comedy", "Heart", "Feel-good"], "A warm, funny comedy with real heart and rewatch value."),
    ("Gangs of Wasseypur", 2012, "Bollywood", "Gangs_of_Wasseypur",
     ["Thrilling", "Thought-provoking"], ["Slow burn"], ["Solo", "Friends"], ["Hidden gem"],
     ["Crime", "Epic", "Gritty"], "A sprawling, gritty crime saga with dark humor and serious bite."),
    ("Haider", 2014, "Bollywood", "Haider_(film)",
     ["Emotional", "Thought-provoking"], ["Slow burn"], ["Solo"], ["Hidden gem"],
     ["Drama", "Tragedy", "Adaptation"], "A bold, brooding tragedy adaptation with striking atmosphere."),
    ("Paan Singh Tomar", 2012, "Bollywood", "Paan_Singh_Tomar_(film)",
     ["Emotional", "Thrilling"], ["Slow burn"], ["Solo"], ["Hidden gem"],
     ["Biopic", "Sports", "Drama"], "A gripping true-story biopic about an athlete pushed to the margins."),
    ("English Vinglish", 2012, "Bollywood", "English_Vinglish",
     ["Feel-good", "Emotional"], ["Easy watch"], ["Family"], ["Modern classic"],
     ["Drama", "Self-worth", "Warm"], "A gentle, uplifting story about dignity and quiet self-belief."),
    ("Piku", 2015, "Bollywood", "Piku",
     ["Feel-good", "Emotional"], ["Easy watch"], ["Family"], ["Modern classic"],
     ["Comedy", "Family", "Slice-of-life"], "A charming slice-of-life comedy about family, quirks, and care."),
    ("Special 26", 2013, "Bollywood", "Special_26",
     ["Thrilling"], ["Fast and gripping"], ["Friends", "Family"], ["Modern classic"],
     ["Heist", "Con", "Period"], "A smooth, clever heist caper with confident period style."),
    ("A Wednesday!", 2008, "Bollywood", "A_Wednesday!",
     ["Thrilling", "Thought-provoking"], ["Fast and gripping"], ["Solo", "Friends"], ["Hidden gem"],
     ["Thriller", "Drama", "Tense"], "A tight, punchy thriller that says a lot in a lean runtime."),
    ("Wake Up Sid", 2009, "Bollywood", "Wake_Up_Sid",
     ["Feel-good", "Emotional"], ["Easy watch"], ["Solo", "Friends"], ["Modern classic"],
     ["Coming-of-age", "City", "Warm"], "A relaxed coming-of-age charmer about growing up at your own pace."),
    ("My Name Is Khan", 2010, "Bollywood", "My_Name_Is_Khan",
     ["Emotional", "Thought-provoking"], ["Slow burn"], ["Family", "Solo"], ["Modern classic"],
     ["Drama", "Journey", "Heart"], "An earnest, emotional journey drama about identity and decency."),
]


def fetch_poster(wiki: str) -> str:
    url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(wiki, safe="!:()")
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
    if "upload.wikimedia.org" not in src:
        print(f"// WARN no upload.wikimedia poster for {wiki}: {src!r}", file=sys.stderr)
        return ""
    return src


def ts_arr(items):
    return "[" + ", ".join(json.dumps(x) for x in items) + "]"


def main():
    out = []
    missing = []
    for (title, year, region, wiki, mood, pace, company, era, tags, reason) in NEW:
        poster = fetch_poster(wiki)
        if not poster:
            missing.append(title)
        out.append(
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
        time.sleep(0.05)
    print("\n".join(out))
    print(f"\n// total={len(NEW)} missing={len(missing)} -> {missing}", file=sys.stderr)


if __name__ == "__main__":
    main()
