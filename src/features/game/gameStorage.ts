import { createInitialState } from "./gameReducer";
import type { GameState, SavedGameState } from "./gameTypes";

const STORAGE_KEY = "jasuseongdon.save.v1";
const INTRO_SEEN_KEY = "jasuseongdon.introSeen.v1";
const ENDING_SEEN_KEY = "jasuseongdon.endingSeen.v1";
const MAX_OFFLINE_SECONDS = 2 * 60 * 60;

export function loadGame(): GameState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const saved = JSON.parse(raw) as SavedGameState;
    const now = Date.now();
    const initial = createInitialState(now);

    return {
      ...initial,
      ...saved,
      clickPower: saved.clickPower ?? initial.clickPower,
      startedAt: saved.startedAt ?? now,
      lastTickAt: saved.lastTickAt ?? saved.lastLoginTime ?? now,
      lastLoginTime: saved.lastLoginTime ?? now,
      hasStarted: saved.hasStarted ?? true,
    };
  } catch {
    return null;
  }
}

export function saveGame(state: GameState) {
  const saved: SavedGameState = {
    money: state.money,
    incomePerSecond: state.incomePerSecond,
    house: state.house,
    vehicle: state.vehicle,
    business: state.business,
    level: state.level,
    day: state.day,
    lastLoginTime: Date.now(),
    clickPower: state.clickPower,
    startedAt: state.startedAt,
    lastTickAt: state.lastTickAt,
    hasStarted: state.hasStarted,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function clearGame() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function clearIntroSeen() {
  window.localStorage.removeItem(INTRO_SEEN_KEY);
}

export function hasSeenIntro() {
  return window.localStorage.getItem(INTRO_SEEN_KEY) === "true";
}

export function markIntroSeen() {
  window.localStorage.setItem(INTRO_SEEN_KEY, "true");
}

export function hasSeenEnding() {
  return window.localStorage.getItem(ENDING_SEEN_KEY) === "true";
}

export function markEndingSeen() {
  window.localStorage.setItem(ENDING_SEEN_KEY, "true");
}

export function clearEndingSeen() {
  window.localStorage.removeItem(ENDING_SEEN_KEY);
}

export function applyOfflineReward(state: GameState, now = Date.now()) {
  if (!state.hasStarted || state.incomePerSecond <= 0) {
    return {
      state: {
        ...state,
        lastLoginTime: now,
        lastTickAt: now,
      },
      offlineReward: 0,
    };
  }

  const offlineSeconds = Math.min(
    MAX_OFFLINE_SECONDS,
    Math.max(0, Math.floor((now - state.lastLoginTime) / 1000)),
  );
  const offlineReward = state.incomePerSecond * offlineSeconds;

  return {
    state: {
      ...state,
      money: state.money + offlineReward,
      lastLoginTime: now,
      lastTickAt: now,
    },
    offlineReward,
  };
}

export { STORAGE_KEY, INTRO_SEEN_KEY, ENDING_SEEN_KEY, MAX_OFFLINE_SECONDS };
