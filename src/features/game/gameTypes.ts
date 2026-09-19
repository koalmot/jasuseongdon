export type GameCategory = "house" | "vehicle" | "business";

export type GameReaction = "idle" | "earn" | "buy" | "offline" | "ending";

export type Upgrade = {
  id: string;
  category: GameCategory;
  level: number;
  name: string;
  price: number;
  incomeBonus: number;
  icon: string;
  visualKey: string;
  description: string;
};

export type GameState = {
  money: number;
  incomePerSecond: number;
  clickPower: number;
  house: number;
  vehicle: number;
  business: number;
  level: number;
  day: number;
  startedAt: number;
  lastTickAt: number;
  lastLoginTime: number;
  hasStarted: boolean;
};

export type SavedGameState = Pick<
  GameState,
  "money" | "incomePerSecond" | "house" | "vehicle" | "business" | "level" | "day" | "lastLoginTime"
> &
  Partial<Pick<GameState, "clickPower" | "startedAt" | "lastTickAt" | "hasStarted">>;
