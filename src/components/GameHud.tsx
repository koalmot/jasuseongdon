import { formatMoney } from "../utils/formatMoney";

type GameHudProps = {
  day: number;
  money: number;
  income: number;
  onSettings: () => void;
};

export function GameHud({ day, money, income, onSettings }: GameHudProps) {
  return (
    <header className="game-hud" aria-label="현재 상태">
      <div className="hud-chip day-chip">
        <span>DAY</span>
        <strong>{day}</strong>
      </div>
      <div className="hud-chip money-chip">
        <span>현재 돈</span>
        <strong>{formatMoney(money)}</strong>
      </div>
      <div className="hud-chip income-chip">
        <span>자동수입</span>
        <strong>{formatMoney(income)}/초</strong>
      </div>
      <button className="settings-button" type="button" aria-label="설정" onClick={onSettings}>
        ⚙
      </button>
    </header>
  );
}
