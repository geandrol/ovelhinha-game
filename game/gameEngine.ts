export type GameState = {
  hunger: number;
  sleep: number;
  happiness: number;
  lastUpdate: number;
};

const HUNGER_DECAY_PER_MS = 1 / 60000;     // 1 por minuto
const SLEEP_DECAY_PER_MS = 2 / 300000;     // 1 a cada 5 min
const HAPPINESS_DECAY_PER_MS = 1 / 60000;  // 1 por minuto sem interação

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function updateGame(state: GameState): GameState {
  const now = Date.now();
  const delta = now - state.lastUpdate;

  const newHunger = clamp(state.hunger - delta * HUNGER_DECAY_PER_MS, 0, 100);
  const newSleep = clamp(state.sleep - delta * SLEEP_DECAY_PER_MS, 0, 100);
  const newHappiness = clamp(state.happiness - delta * HAPPINESS_DECAY_PER_MS, 0, 100);

  return {
    hunger: newHunger,
    sleep: newSleep,
    happiness: newHappiness,
    lastUpdate: now,
  };
}
export function feedPet(game: GameState): GameState {
  if (game.hunger >= 100) return game;

  return {
    ...game,
    hunger: Math.min(100, game.hunger + 10),
    lastUpdate: Date.now(),
  };
}

export function canFeed(game: GameState) {
  return game.hunger < 100;
}



