import { useMemo, useState, type ReactNode } from "react";
import type { Upgrade } from "../features/game/gameTypes";
import { formatMoney } from "../utils/formatMoney";
import { CoinCharacter } from "./CoinCharacter";
import { PixelButton } from "./PixelButton";
import { StorySequence, type StoryScene } from "./StorySequence";

type EndingSceneId = "memory" | "steps" | "homes" | "success" | "compare" | "result" | "thanks";

type EndingPageProps = {
  business: Upgrade;
  day: number;
  house: Upgrade;
  money: number;
  playSequence: boolean;
  vehicle: Upgrade;
  onContinue: () => void;
  onRestart: () => void;
  onSeen: () => void;
  onShare: () => void;
};

const endingScenes: StoryScene<EndingSceneId>[] = [
  { id: "memory", durationMs: 1500 },
  { id: "steps", durationMs: 1800 },
  { id: "homes", durationMs: 2800 },
  { id: "success", durationMs: 1800 },
  { id: "compare", durationMs: 1600 },
  { id: "result", durationMs: 1700 },
  { id: "thanks" },
];

const endingHouseAssets = [
  { label: "빈방", src: "/assets/houses/house0_empty.png" },
  { label: "원룸", src: "/assets/houses/house1_studio.png" },
  { label: "아파트", src: "/assets/houses/house2_apartment.png" },
  { label: "펜트하우스", src: "/assets/houses/house3_penthouse.png" },
  { label: "대저택", src: "/assets/houses/house4_mansion.png" },
];

export function EndingPage({
  business,
  day,
  house,
  money,
  playSequence,
  vehicle,
  onContinue,
  onRestart,
  onSeen,
  onShare,
}: EndingPageProps) {
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const startIndex = playSequence ? 0 : endingScenes.length - 1;
  const finalSceneId = endingScenes[endingScenes.length - 1].id;

  return (
    <main className="app story-app ending-story">
      <StorySequence
        scenes={endingScenes}
        startIndex={startIndex}
        onSceneChange={(scene) => {
          if (scene.id === finalSceneId) {
            onSeen();
          }
        }}
        renderScene={(scene, _index, controls) => (
          <section className={`story-screen ending-scene ending-scene-${scene.id}`} aria-label="자수성돈 엔딩">
            {scene.id !== "thanks" && (
              <button aria-label="엔딩 건너뛰기" className="story-skip" onClick={controls.goToLast} type="button">
                SKIP
              </button>
            )}
            <EndingScene sceneId={scene.id} business={business} day={day} house={house} money={money} vehicle={vehicle} />
            {scene.id === "thanks" && (
              <div className="ending-final-actions">
                <PixelButton label="결과 공유하기" onClick={onShare} />
                <PixelButton label="계속 보기" onClick={onContinue} variant="mint" />
                <PixelButton label="처음부터 다시 시작" onClick={() => setConfirmingRestart(true)} variant="pink" />
              </div>
            )}
          </section>
        )}
      />

      {confirmingRestart && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="다시 시작 확인">
          <div className="reward-modal confirm-modal">
            <strong>돈이의 인생을 처음부터 다시 시작할까요?</strong>
            <p>현재 진행 상황은 사라지고 100원으로 돌아가요.</p>
            <div className="confirm-actions">
              <PixelButton label="취소" onClick={() => setConfirmingRestart(false)} variant="mint" />
              <PixelButton label="다시 시작" onClick={onRestart} variant="pink" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function EndingScene({
  business,
  day,
  house,
  money,
  sceneId,
  vehicle,
}: {
  business: Upgrade;
  day: number;
  house: Upgrade;
  money: number;
  sceneId: EndingSceneId;
  vehicle: Upgrade;
}) {
  const resultRows = useMemo(
    () => [
      ["총자산", formatMoney(money)],
      ["DAY", `${day}`],
      ["최종 집", house.name],
      ["최종 이동수단", vehicle.name],
      ["최종 사업", business.name],
    ],
    [business.name, day, house.name, money, vehicle.name],
  );

  if (sceneId === "steps") {
    return (
      <StoryMansionFrame>
        <p className="ending-narration">
          작은 자판기 하나를 사고,
          <br />
          조금씩 모으고,
          <br />
          조금씩 성장했습니다.
        </p>
      </StoryMansionFrame>
    );
  }

  if (sceneId === "homes") {
    return (
      <div className="ending-home-tour">
        <h2>돈이의 집도 이렇게 변했어요.</h2>
        <div className="ending-house-grid">
          {endingHouseAssets.map((asset) => (
            <EndingHouseCard key={asset.src} label={asset.label} src={asset.src} />
          ))}
        </div>
      </div>
    );
  }

  if (sceneId === "success") {
    return (
      <StoryMansionFrame rich>
        <p className="ending-narration">
          그리고 오늘,
          <br />
          돈이는
          <br />
          자수성돈에 성공했습니다.
        </p>
      </StoryMansionFrame>
    );
  }

  if (sceneId === "compare") {
    return (
      <div className="ending-compare">
        <ComparePane label="START" money="100원" src="/assets/character/doni_idle_clean.png" />
        <span className="ending-arrow">↓</span>
        <ComparePane label="NOW" money={formatMoney(money)} src="/assets/character/doni_rich_clean.png" />
      </div>
    );
  }

  if (sceneId === "result") {
    return (
      <div className="ending-result-card">
        <p className="tiny-label">Doni's Graduation</p>
        <h1>자수성돈 완료!</h1>
        <p className="ending-money">{formatMoney(money)}</p>
        <div className="ending-result-grid">
          {resultRows.map(([label, value]) => (
            <span key={label}>
              <small>{label}</small>
              <strong>{value}</strong>
            </span>
          ))}
        </div>
        <p className="ending-main-copy">처음엔 100원뿐이었는데.</p>
        <p className="ending-sub-copy">돈이가 자수성돈에 성공했어요!</p>
      </div>
    );
  }

  if (sceneId === "thanks") {
    return (
      <div className="ending-thanks">
        <img
          alt=""
          className="story-house-bg"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
          src="/assets/houses/house4_mansion.png"
        />
        <div className="story-doni-wrap ending-rich-doni">
          <CoinCharacter assetSrc="/assets/character/doni_rich_clean.png" reaction="ending" burstKey={7} />
        </div>
        <p className="ending-narration">
          현실에서는
          <br />
          돈이 천천히 모입니다.
          <br />
          <br />
          그래도
          <br />
          오늘도 차근차근.
        </p>
        <p className="ending-thanks-copy">Thank you for raising Doni.</p>
      </div>
    );
  }

  return (
    <StoryMansionFrame>
      <p className="ending-narration">
        처음엔
        <br />
        <br />
        100원뿐이었습니다.
      </p>
    </StoryMansionFrame>
  );
}

function EndingHouseCard({ label, src }: { label: string; src: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <article className="ending-house-card">
      {failed ? (
        <strong>{label}</strong>
      ) : (
        <img
          alt=""
          onError={() => {
            setFailed(true);
          }}
          src={src}
        />
      )}
      <span>{label}</span>
    </article>
  );
}

function StoryMansionFrame({ children, rich = false }: { children: ReactNode; rich?: boolean }) {
  return (
    <>
      <img
        alt=""
        className="story-house-bg"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
        src="/assets/houses/house4_mansion.png"
      />
      <div className={`story-doni-wrap ending-rich-doni${rich ? " bigger" : ""}`}>
        <CoinCharacter assetSrc="/assets/character/doni_rich_clean.png" reaction="ending" burstKey={rich ? 4 : 1} />
      </div>
      {children}
    </>
  );
}

function ComparePane({ label, money, src }: { label: string; money: string; src: string }) {
  return (
    <article className="compare-pane">
      <p>{label}</p>
      <div className="compare-doni">
        <CoinCharacter assetSrc={src} reaction={label === "NOW" ? "ending" : "idle"} burstKey={0} />
      </div>
      <strong>{money}</strong>
    </article>
  );
}
