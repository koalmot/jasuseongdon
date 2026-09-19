import { CoinCharacter } from "./CoinCharacter";
import { PixelButton } from "./PixelButton";
import { StorySequence, type StoryScene } from "./StorySequence";

type IntroSceneId = "drop" | "hello" | "promise" | "room" | "start";

type IntroPageProps = {
  startAtFinal?: boolean;
  onStart: () => void;
};

const introScenes: StoryScene<IntroSceneId>[] = [
  { id: "drop", durationMs: 700 },
  { id: "hello", durationMs: 1100 },
  { id: "promise", durationMs: 1100 },
  { id: "room", durationMs: 2300 },
  { id: "start" },
];

export function IntroPage({ startAtFinal = false, onStart }: IntroPageProps) {
  const startIndex = startAtFinal ? introScenes.length - 1 : 0;

  return (
    <main className="app story-app intro-story">
      <StorySequence
        scenes={introScenes}
        startIndex={startIndex}
        renderScene={(scene, index, controls) => (
          <section className={`story-screen intro-scene intro-scene-${scene.id}`} aria-label="자수성돈 인트로">
            {scene.id !== "start" && (
              <button
                aria-label="인트로 건너뛰기"
                className="story-skip"
                onClick={controls.goToLast}
                type="button"
              >
                SKIP
              </button>
            )}
            <IntroScene sceneId={scene.id} sequenceKey={index} onStart={onStart} />
          </section>
        )}
      />
    </main>
  );
}

function IntroScene({
  sceneId,
  sequenceKey,
  onStart,
}: {
  sceneId: IntroSceneId;
  sequenceKey: number;
  onStart: () => void;
}) {
  if (sceneId === "start") {
    return (
      <div className="story-final-card intro-final-card">
        <p className="tiny-label">Pixel Idle Life</p>
        <h1>자수성돈</h1>
        <div className="intro-hero-doni">
          <CoinCharacter assetSrc="/assets/character/doni_idle_clean.png" reaction="idle" burstKey={sequenceKey} />
        </div>
        <p className="story-subcopy">100원에서 시작하는 돈이의 인생</p>
        <PixelButton label="START" onClick={onStart} size="large" />
      </div>
    );
  }

  const bubble =
    sceneId === "hello" ? (
      <>
        안녕!
        <br />
        나는 돈이야!
      </>
    ) : sceneId === "promise" ? (
      <>
        오늘도
        <br />
        차근차근
        <br />
        모아볼까?
      </>
    ) : null;

  return (
    <>
      {sceneId === "room" && (
        <img
          alt=""
          className="story-house-bg"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
          src="/assets/houses/house0_empty.png"
        />
      )}
      <div className="story-doni-wrap">
        <CoinCharacter assetSrc="/assets/character/doni_idle_clean.png" reaction="buy" burstKey={sequenceKey} />
      </div>
      {sceneId === "drop" && <p className="story-whisper">딸랑...</p>}
      {bubble && <p className="story-bubble">{bubble}</p>}
    </>
  );
}
