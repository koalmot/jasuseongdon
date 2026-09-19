import type { GameReaction } from "../features/game/gameTypes";

type CoinCharacterProps = {
  reaction: GameReaction;
  burstKey: number;
  assetSrc?: string;
};

export function CoinCharacter({ reaction, burstKey, assetSrc }: CoinCharacterProps) {
  return (
    <div className={`coin-wrap reaction-${reaction}`} key={burstKey}>
      <div className="coin-sparkle sparkle-one" />
      <div className="coin-sparkle sparkle-two" />
      {assetSrc && (
        <img
          alt="100원짜리 동전 캐릭터 돈이"
          className="doni-sprite"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
          src={assetSrc}
        />
      )}
      <div className="coin-character" aria-label="100원짜리 동전 캐릭터 돈이">
        <div className="coin-shine" />
        <div className="coin-face">
          <span className="eye eye-left" />
          <span className="eye eye-right" />
          <span className="cheek cheek-left" />
          <span className="cheek cheek-right" />
          <span className="mouth" />
        </div>
        <strong>100</strong>
      </div>
    </div>
  );
}
