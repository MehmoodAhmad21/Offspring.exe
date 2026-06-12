// Top-level orchestrator: runs all discrete + polygenic traits for one seed
// and packages the results into a single SimulationResult.

import type { ParentProfile, SimulationResult } from '../types';
import { mulberry32, runAllDiscreteTraits } from './inheritance';
import {
  simulateHeight,
  simulateIndex,
  summarize,
} from './polygenic';
import {
  DEFAULT_TRIALS,
  FRAME_SD,
  HEIGHT_SD,
  MELANIN_SD,
} from '../data/traitDefinitions';

/**
 * Run the full simulation for two parents using a single seeded RNG, so the
 * entire batch (discrete + polygenic) is reproducible from `seed`.
 */
export function runSimulation(
  parentA: ParentProfile,
  parentB: ParentProfile,
  seed: number,
  trials: number = DEFAULT_TRIALS,
): SimulationResult {
  const rng = mulberry32(seed);

  const discrete = runAllDiscreteTraits(parentA, parentB, trials, rng);

  const heightSamples = simulateHeight(
    parentA.heightCm,
    parentB.heightCm,
    trials,
    rng,
    HEIGHT_SD,
  );
  const melaninSamples = simulateIndex(
    parentA.melaninIndex,
    parentB.melaninIndex,
    trials,
    rng,
    MELANIN_SD,
  );
  const frameSamples = simulateIndex(
    parentA.frameIndex,
    parentB.frameIndex,
    trials,
    rng,
    FRAME_SD,
  );

  return {
    seed,
    trials,
    discrete,
    height: summarize(heightSamples),
    melanin: summarize(melaninSamples),
    frame: summarize(frameSamples),
  };
}
