# Offspring.exe

A small genetics toy you run in the browser. Give it two parents' trait
profiles and it simulates 20,000 possible kids, then draws an SVG avatar of the
most likely one next to the odds for every trait.

It's for fun and learning. The genetics is deliberately simplified, so don't
read anything medical into it.

## Run it

```bash
npm install
npm run dev
```

Open the URL it prints. No keys, no backend, nothing else to set up.

## Other scripts

- `npm run build` — type-check and build for production
- `npm run preview` — serve the production build
- `npm test` — run the unit tests
- `npm run typecheck` — type-check only

## How it works

Discrete traits (eye and hair color, hair texture, blood type, Rh factor, face
shape) use textbook Mendelian dominance rules. A seeded Monte Carlo run
estimates how likely each outcome is.

Height, skin tone, and build are polygenic, so they're modeled as a mid-parent
average plus some Gaussian spread and reported as a range rather than a single
number.

The avatar is plain parametric SVG built straight from the simulation — no image
models, no external APIs. The composite uses each trait's most likely outcome;
"Regenerate variation" rolls one random draw per trait so you can see individual
examples instead of just the average.

## Layout

```
src/
  App.tsx                    app shell + state
  data/traitDefinitions.ts   genotype tables, dominance rules, color ramps
  engine/                    PRNG, Mendelian + polygenic models, avatar mapping
  components/                parent panels, probability report, charts
  avatar/                    procedural SVG generator and its parts
```
