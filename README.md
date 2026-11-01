# The Chain — A Fleetwood Mac Word Adventure

A free, fan-made browser word game that travels through Fleetwood Mac's history, with a special place for Stevie Nicks. Three word puzzles (a Wordle-style **Setlist**, a Scrabble-style **Songwriter**, and a word-ladder **Chain**) carry you from a 1967 blues festival to the Rock and Roll Hall of Fame, unlocking a sourced historical scrapbook as you go.

Built as a gift. No accounts, no servers, no tracking. Open the link and play.

## Play

- **The Tour**: 8 eras, 25 concerts, 73 puzzles. Each concert is a short set of puzzles; finishing one unlocks the next venue, a story page, and a piece of memorabilia.
- **Jam Session**: a Words With Friends-style board game against a computer bandmate at three difficulty levels. Any word tied to Fleetwood Mac (song and album words, the band's names, the places where the music was made) scores double and shows a short fact. Names count even when they are not dictionary words.
- **Backstage Trivia**: rounds of ten multiple-choice questions with no clock, drawn only from the verified research notes, each answer followed by the story and its source.
- **Daily Encore**: one five-letter word a day, the same for everyone, no streaks.
- **Free Play**: any mode, any time, without affecting the tour.
- **Scrapbook**: stories, memorabilia, band profiles, albums, achievements.

Progress saves automatically in the browser. Settings offers larger text, high-contrast colour-blind tiles, reduced motion, optional sound, optional lo-fi era music, and save export/import for moving to another device.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (it ends in `/the-chain/`).

Other commands:

```bash
npm test          # engine tests + save tests + content validator
npm run validate  # content validator only (every puzzle must be solvable)
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Deploy to GitHub Pages

1. Create a GitHub repository named `the-chain` (or any name) and push this project to its `main` branch.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` runs the tests, builds, and publishes to `https://<your-user>.github.io/<repo>/`.

The build base path comes from the repository name automatically in CI. For a local production build with a different base, set `VITE_BASE`, for example `VITE_BASE=/ npm run build`.

## Personalise the gift

Edit `src/data/dedication.ts` to change the name and message on the title screen and About page.

## Project layout

```
public/words/         word lists (ENABLE 2–8 letters, public domain; a frequency-ranked "common" subset for hints)
src/engine/           pure game logic, no React: scoring, validation, ladders, tile stream, board game and opponent, RNG
src/data/             campaign, puzzles, history (with sources), collectibles, achievements
src/state/            versioned save system, store, hash router
src/ui/               screens, puzzle modes, components
src/audio/            synthesized sound effects and generative lo-fi era music (Web Audio)
scripts/              content validator (runs in the test suite)
docs/research/        verified history notes with source URLs
```

## Content and rights

This is an unofficial, non-commercial fan project. It is not affiliated with or endorsed by Fleetwood Mac, Stevie Nicks, or their labels. It contains no recordings, lyrics, photographs, or album art. Illustrations are original line drawings; all audio is synthesized in the browser, and the era music is original and does not reproduce any Fleetwood Mac melody. Historical facts are sourced in `docs/research/history-notes.md` and on every scrapbook page. The player's road-crew role is a game device, and venues labelled as game stages are not documented performances.

Word validation uses the public-domain ENABLE word list. Letter values follow the classic Scrabble scheme in the Songwriter and a Words With Friends-style scheme on the Jam Session board; neither scheme is protected by copyright. Scrabble, Words With Friends, and Wordle are trademarks of their respective owners.

Fonts: Playfair Display and Lora (SIL Open Font License), self-hosted.

## Tech

React 19, TypeScript, Vite, Vitest. No runtime dependencies beyond React and the two fonts.
