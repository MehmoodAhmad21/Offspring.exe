# Project prompt: Offspring trait simulator with generated avatar

Copy everything below the line into Claude Code as a single prompt.

---

Build a standalone web application called **GenePool** — an educational genetics
simulator that takes two parents' genetic profiles, runs a Monte Carlo simulation
of Mendelian and polygenic inheritance, and renders a procedurally generated SVG
avatar representing the most probable offspring, alongside full probability
breakdowns for every trait.

## 1. Project setup

- Scaffold with **Vite + React + TypeScript**.
- Styling: plain CSS modules (no Tailwind needed, but fine if you prefer it —
  keep it lightweight). Use a clinical/lab-report aesthetic: off-white
  background (#FAFAF8), deep navy-slate text (#1B2838), clinical blue accent
  (#3B6E91), sage secondary (#7FA98E), amber highlight (#D4A24E) used sparingly.
  Use a monospace font (JetBrains Mono) for all numeric/data readouts and a
  clean sans (Inter) for labels and body text.
- File structure:
  ```
  src/
    main.tsx
    App.tsx
    types.ts                 -- shared TS types/interfaces
    data/
      traitDefinitions.ts    -- all genotype tables + dominance rules
    engine/
      inheritance.ts         -- Mendelian segregation + Monte Carlo core
      polygenic.ts            -- height, build, skin tone models
      avatarMapper.ts         -- maps simulation output -> avatar parameter object
    components/
      ParentPanel.tsx
      TraitSelector.tsx
      ProbabilityReport.tsx
      ProbabilityBar.tsx
      HeightHistogram.tsx
      AvatarRenderer.tsx       -- SVG avatar component
      DnaDivider.tsx
    avatar/
      AvatarSVG.tsx            -- the procedural SVG generator
      avatarParts/
        Head.tsx
        Eyes.tsx
        Hair.tsx
        Body.tsx
        SkinTone.tsx
  ```

## 2. Inheritance engine — algorithms

Implement everything in TypeScript with pure functions so it's testable and
the avatar mapper can call it deterministically with a seeded RNG (use a
small seedable PRNG like mulberry32 so results are reproducible per "run").

### 2.1 Discrete (Mendelian) traits

For each discrete trait, define a `Genotype` as a tuple of two allele symbols,
and a `dominanceMap` function `phenotype(pair: [string, string]): string`.

Implement these traits with the exact dominance rules below:

**Eye color** (2-allele simplified model, dominance order B > g > b):
- Alleles: `B` (brown), `g` (green), `b` (blue)
- Genotype options per parent (selectable in UI): BB, Bg, Bb, gg, gb, bb
- Phenotype: if pair contains B -> "Brown"; else if contains g -> "Green"; else -> "Blue"

**Hair color** (alleles D > l > r, where r/r is the recessive red exception):
- Alleles: `D` (dark), `l` (light), `r` (red-carrier)
- Genotype options: DD, Dl, Dr, ll, lr, rr
- Phenotype: if pair contains D -> "Dark brown/black"; else if pair === ['r','r'] -> "Red";
  else if pair contains both l and r -> "Light brown/strawberry"; else -> "Blonde"

**ABO blood type** (A and B co-dominant, O recessive):
- Alleles: A, B, O
- Genotype options: AA, AO, BB, BO, AB, OO
- Phenotype: contains both A and B -> "AB"; contains A -> "A"; contains B -> "B"; else "O"

**Rh factor**:
- Alleles: `+`, `-`
- Genotype options: ++, +-, --
- Phenotype: contains `+` -> "Rh+"; else "Rh-"

**Hair texture** (simplified, alleles C (curly) > w (wavy) > s (straight)):
- Genotype options: CC, Cw, Cs, ww, ws, ss
- Phenotype: contains C -> "Curly"; else if contains w -> "Wavy"; else -> "Straight"

**Face shape** (NEW — for the avatar; alleles O (oval-dominant) > r (round) > q (square)):
- Genotype options: OO, Or, Oq, rr, rq, qq
- Phenotype: contains O -> "Oval"; else if contains r -> "Round"; else -> "Square"
  This is a deliberate simplification for visualization purposes — note this in
  a code comment and in the UI's methodology disclosure (see section 5).

### 2.2 Monte Carlo simulation core (`inheritance.ts`)

```ts
function sampleAllele(genotype: [string, string], rng: () => number): string {
  return genotype[Math.floor(rng() * 2)];
}

function runDiscreteTrait(
  parentA: [string, string],
  parentB: [string, string],
  phenotypeFn: (pair: [string, string]) => string,
  trials: number,
  rng: () => number
): { label: string; pct: number }[] {
  const counts: Record<string, number> = {};
  for (let i = 0; i < trials; i++) {
    const pair: [string, string] = [sampleAllele(parentA, rng), sampleAllele(parentB, rng)];
    const ph = phenotypeFn(pair);
    counts[ph] = (counts[ph] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, pct: (count / trials) * 100 }))
    .sort((a, b) => b.pct - a.pct);
}
```

Run **N = 20000 trials** by default (configurable constant). All discrete
trait simulations share one mulberry32 RNG instance seeded from a "Run
simulation" button click (`Date.now()` as seed), so re-running produces a
fresh but reproducible-if-logged distribution.

### 2.3 Polygenic traits (`polygenic.ts`)

**Height**: mid-parental value model.
```ts
function simulateHeight(fatherCm: number, motherCm: number, trials: number, rng): number[] {
  const mid = (fatherCm + motherCm) / 2;
  const sd = 6.5; // cm, approximates residual variance after heritability ~0.8
  const samples: number[] = [];
  for (let i = 0; i < trials; i++) {
    const u1 = rng(), u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); // Box-Muller
    samples.push(mid + z * sd);
  }
  return samples;
}
```
Report mean, and 10th/90th percentile range. Bucket into 3cm bins for a
histogram component (`HeightHistogram.tsx`, simple CSS bar chart, no chart
library needed).

**Skin tone**: model as a 1-100 "melanin index" scale. Each parent has a
melanin index (UI: slider 1-100 mapped to a tone swatch preview). Offspring
melanin index = average of parents +/- N(0, 8) noise (same Box-Muller
approach), clamped to [1,100]. Map the resulting index to one of 10 discrete
skin tone swatches (provide a `SKIN_TONE_RAMP` array of 10 hex values from
light to deep, evenly spaced, in `traitDefinitions.ts`) for rendering.

**Build/body type**: model as a 1-100 "frame index" (1 = slim/narrow frame,
100 = broad/heavy frame). Same mid-parent + noise model as skin tone, noise
sd = 12. Maps to avatar body silhouette width scaling (0.85x to 1.25x base
width).

## 3. UI flow

### Parent input panels (side by side, responsive to stack on mobile)
Each parent panel has:
- A `<select>` dropdown for each discrete trait (eye color, hair color, hair
  texture, blood type, Rh factor, face shape) — labelled by phenotype +
  genotype code, e.g. "Brown / Green (Bg)"
- A height slider (140-210cm)
- A skin tone slider (1-100) with a live color swatch preview next to it
- A build/frame slider (1-100)

### "Run simulation" button
Triggers the Monte Carlo run (seeded RNG from click timestamp) across all
traits and updates all results in one batch (avoid recomputation per
keystroke — only recompute on explicit button press, but show a subtle
"inputs changed, re-run to update" indicator if sliders/selects change after
a run).

### Results layout (below a DNA-strand divider component)
Two-column layout on desktop, stacked on mobile:

**Left column — Avatar panel**:
- The procedurally generated SVG avatar (see section 4), large, centered
- A small caption: "Most probable offspring — generated from highest-probability
  trait outcomes"
- A "Regenerate variation" button that re-samples ONE specific offspring
  instance (not the aggregate "most likely" composite) by drawing one random
  outcome per trait from the computed distributions — lets users see example
  individual outcomes, not just the statistical mode

**Right column — Probability report**:
- One card per discrete trait showing horizontal probability bars (component
  already exists in style from prior work — replicate that ProbabilityBar
  pattern: label left, percentage right in monospace, thin rounded bar below)
- Height histogram card
- Skin tone card: show a horizontal gradient bar across the 10-swatch ramp
  with a marker at the predicted mean position, plus +/- 1 std range shading
- Build card: similar bar showing frame index distribution

## 4. Avatar generation system (`AvatarSVG.tsx` + `avatarMapper.ts`)

This is the centerpiece. Build a **procedural SVG avatar**, NOT an ML image
model and NOT an external image generation API call — those introduce
licensing, identity, and reproducibility problems and are out of scope. The
"ML model" framing from earlier brainstorming is replaced here with a
**deterministic parametric SVG system** driven directly by simulation output;
this is the right architecture for a live, instantly-updating, dependency-free
avatar that scales with arbitrary trait combinations.

### 4.1 Avatar parameter object (`avatarMapper.ts`)

Map simulation results to a single typed object:

```ts
interface AvatarParams {
  skinHex: string;        // from SKIN_TONE_RAMP[meanMelaninIndex bucket]
  eyeColorHex: string;     // mapped from eye phenotype: Brown #6B4423, Green #5B8C5A, Blue #6FA8C9
  hairColorHex: string;    // Dark #2B1B12, Blonde #D9B97A, Red #A8512E, Light brown/strawberry #B8845A
  hairTexture: 'curly' | 'wavy' | 'straight';
  faceShape: 'oval' | 'round' | 'square';
  heightCm: number;        // drives overall <svg> viewBox scale and body proportions
  frameIndex: number;      // 1-100, drives body silhouette width multiplier
}
```

For the "most probable composite" avatar: take the top-probability outcome
for each discrete trait, the mean for height/skin/build.

For "regenerate variation": draw one weighted-random sample per trait from
the already-computed distributions (weighted by their pct values).

### 4.2 SVG construction

Build the avatar as layered SVG groups in a fixed `viewBox="0 0 300 400"`,
front-facing head-and-shoulders-to-waist illustration, flat-design style
(matching the lab aesthetic — no gradients/shadows, solid fills, thin
strokes). Layer order (back to front):

1. **Body silhouette** (`Body.tsx`): a rounded-shoulder torso shape using a
   single `<path>`. Width controlled by `frameIndex` (interpolate path control
   points between a "slim" and "broad" path variant — precompute both path
   strings and linearly interpolate the numeric coordinates between them based
   on `frameIndex / 100`). Fill = a muted neutral clothing color (e.g. #7FA98E
   sage, fixed — this is "clothing" not skin).
2. **Neck** — simple rect/path, filled with `skinHex`.
3. **Head** (`Head.tsx`): shape varies by `faceShape`:
   - Oval: tall ellipse
   - Round: circle
   - Square: rounded rectangle
   All three pre-defined as separate `<path>`/shape strings; component picks
   the right one. Fill = `skinHex`.
4. **Hair** (`Hair.tsx`): three texture variants (curly = layered overlapping
   circles/bumps along the hairline, wavy = sinuous path with S-curves,
   straight = clean flat shape following head outline with a straight
   fringe). Each texture variant pre-built as SVG path/shape data, parameterized
   only by `hairColorHex` for fill. Position behind/around the head shape
   appropriately for each face shape (define 3 face-shapes x 3 textures = 9
   small path variants, or build texture paths generically enough to overlay
   on all three head shapes via consistent anchor points).
5. **Eyes** (`Eyes.tsx`): two simple almond shapes with iris circles filled
   `eyeColorHex`, pupil filled dark navy, positioned proportionally on the head
   shape (adjust vertical position slightly per face shape so they sit
   naturally).
6. **Simple facial features**: minimal nose (small path/line) and mouth
   (simple curved line), neutral expression, in a muted line color — keep
   these extremely simple/abstract, matching flat-illustration style, not
   trying to be photorealistic.

### 4.3 Height scaling

Use `heightCm` to set the outer wrapper's max-height via inline style
(interpolate between e.g. 240px for 150cm and 340px for 200cm), so taller
predicted offspring render visibly larger/taller on screen relative to a
fixed-width frame — this is a visualization device, not anatomically precise
scaling.

## 5. Methodology disclosure

Include a collapsible "How this works" section (use a native `<details>`
element) containing:
- Plain-language explanation of Mendelian inheritance and why results are
  probabilities, not certainties
- Explicit statement that eye color, hair color, face shape etc. are
  simplified single/double-gene models for educational and illustrative
  purposes — real traits involve many genes and environmental factors
- Statement that the avatar is a stylized illustration generated from a fixed
  set of shape/color parameters, not a photorealistic prediction, and is not
  intended to resemble any real person
- Note that height/skin tone/build use statistical distributions (mid-parent
  + variance), reflecting polygenic inheritance patterns

## 6. Testing & polish

- Add a `src/engine/inheritance.test.ts` (Vitest) with unit tests verifying:
  - `runDiscreteTrait` percentages sum to ~100 and respond correctly to known
    genotype combos (e.g. bb x bb parents -> 100% Blue eyes)
  - Dominance logic for each trait's edge cases (e.g. rr x rr -> 100% Red hair)
- Ensure the app runs with `npm install && npm run dev` with zero additional
  API keys, external services, or build steps.
- Responsive down to ~375px width; avatar panel stacks above probability
  report on narrow screens.
- Respect `prefers-reduced-motion` — keep any transitions (probability bar
  fills, etc.) instant if reduced motion is requested.

## 7. Out of scope (do not implement)

- No AI image generation (DALL-E, Stable Diffusion, etc.)
- No real genomic/VCF file parsing
- No persistence/accounts/backend — fully client-side single-page app
- No claims of medical or reproductive predictive accuracy anywhere in UI copy
