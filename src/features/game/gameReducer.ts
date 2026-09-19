import { upgrades } from "../../data/upgrades";
import type { GameCategory, GameState, Upgrade } from "./gameTypes";

const DAY_LENGTH_MS = 60 * 1000;
const ENDING_MONEY = 1_000_000;

type GameAction =
  | { type: "start"; now: number }
  | { type: "tick"; now: number }
  | { type: "earn"; amount: number; now: number }
  | { type: "buy"; category: GameCategory; upgrade: Upgrade; now: number }
  | { type: "reset"; now: number };

export function createInitialState(now = Date.now()): GameState {
  return {
    money: 100,
    incomePerSecond: 0,
    clickPower: 100,
    house: 1,
    vehicle: 1,
    business: 1,
    level: 1,
    day: 1,
    startedAt: now,
    lastTickAt: now,
    lastLoginTime: now,
    hasStarted: false,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "reset") {
    return createInitialState(action.now);
  }

  if (action.type === "start") {
    return {
      ...state,
      hasStarted: true,
      startedAt: state.startedAt || action.now,
      lastTickAt: action.now,
      lastLoginTime: action.now,
    };
  }

  if (action.type === "tick") {
    const elapsedSeconds = Math.max(0, Math.floor((action.now - state.lastTickAt) / 1000));
    const elapsedDays = Math.floor((action.now - state.startedAt) / DAY_LENGTH_MS);

    if (elapsedSeconds <= 0) {
      return state;
    }

    return {
      ...state,
      money: state.money + state.incomePerSecond * elapsedSeconds,
      day: Math.max(1, elapsedDays + 1),
      lastTickAt: action.now,
      lastLoginTime: action.now,
    };
  }

  if (action.type === "earn") {
    const levelBonus = 1 + Math.floor((state.house + state.vehicle + state.business) / 4);

    return {
      ...state,
      money: state.money + action.amount,
      clickPower: Math.min(2500, state.clickPower + levelBonus),
      lastLoginTime: action.now,
    };
  }

  if (action.type === "buy") {
    if (!canBuyUpgrade(state, action.upgrade)) {
      return state;
    }

    return {
      ...state,
      money: state.money - action.upgrade.price,
      [action.category]: action.upgrade.level,
      incomePerSecond:
        action.category === "business"
          ? action.upgrade.incomeBonus
          : state.incomePerSecond,
      level: Math.max(state.level, action.upgrade.level),
      lastLoginTime: action.now,
    };
  }

  return state;
}

export function getCurrentUpgrade(state: GameState, category: GameCategory): Upgrade {
  const level = state[category];
  return upgrades[category].find((item) => item.level === level) ?? upgrades[category][0];
}

export function getNextUpgrade(state: GameState, category: GameCategory): Upgrade | undefined {
  const current = getCurrentUpgrade(state, category);
  return upgrades[category].find((item) => item.level === current.level + 1);
}

export function canBuyUpgrade(state: GameState, upgrade: Upgrade): boolean {
  return state.money >= upgrade.price;
}

export function getAssetSnapshot(state: GameState) {
  return {
    house: getCurrentUpgrade(state, "house"),
    vehicle: getCurrentUpgrade(state, "vehicle"),
    business: getCurrentUpgrade(state, "business"),
  };
}

export function isEndingReached(state: GameState): boolean {
  return state.money >= ENDING_MONEY;
}

export { DAY_LENGTH_MS, ENDING_MONEY };
