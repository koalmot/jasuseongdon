import { useEffect, useMemo, useReducer, useState, type CSSProperties } from "react";
import { CoinCharacter } from "./components/CoinCharacter";
import { AssetPanel } from "./components/AssetPanel";
import { EndingPage } from "./components/EndingPage";
import { GameHud } from "./components/GameHud";
import { IntroPage } from "./components/IntroPage";
import { PixelButton } from "./components/PixelButton";
import { ShopTree } from "./components/ShopTree";
import { upgrades } from "./data/upgrades";
import { businessAssets, houseAssets, vehicleAssets } from "./data/visualAssets";
import {
  canBuyUpgrade,
  createInitialState,
  gameReducer,
  getAssetSnapshot,
  getCurrentUpgrade,
  getNextUpgrade,
  isEndingReached,
} from "./features/game/gameReducer";
import {
  applyOfflineReward,
  clearEndingSeen,
  clearGame,
  clearIntroSeen,
  hasSeenEnding,
  hasSeenIntro,
  loadGame,
  markEndingSeen,
  markIntroSeen,
  saveGame,
} from "./features/game/gameStorage";
import type { GameCategory, GameReaction, GameState } from "./features/game/gameTypes";
import { formatMoney } from "./utils/formatMoney";
import "./styles/game.css";

type Screen = "intro" | "game" | "shop" | "assets" | "ending";

const reactionLines: Record<GameReaction, string> = {
  idle: "오늘도 차근차근 모아볼까?",
  earn: "짤랑! 돈이 조금 자랐어요.",
  buy: "우와, 삶이 더 포근해졌어요!",
  offline: "쉬는 동안에도 돈이가 부지런했어요.",
  ending: "드디어 자수성돈!",
};

function getDoniAsset(reaction: GameReaction, businessLevel: number) {
  if (reaction === "ending" || businessLevel >= 5) {
    return "/assets/character/doni_rich_clean.png";
  }

  if (reaction === "buy" || reaction === "earn" || reaction === "offline") {
    return "/assets/character/doni_happy_clean.png";
  }

  return "/assets/character/doni_idle_clean.png";
}

function bootGame(): { state: GameState; offlineReward: number } {
  if (import.meta.env.DEV) {
    const debugMode = new URLSearchParams(window.location.search).get("debug");
    const debugBoot = bootDebugGame(debugMode);

    if (debugBoot) {
      return debugBoot;
    }
  }

  const loaded = loadGame();
  const base = loaded ?? createInitialState();
  return applyOfflineReward(base);
}

function bootDebugGame(debugMode: string | null): { state: GameState; offlineReward: number } | null {
  if (!debugMode) {
    return null;
  }

  const now = Date.now();
  const startedAt = now - 8 * 60 * 1000;

  if (debugMode === "fresh") {
    clearGame();
    clearIntroSeen();
    clearEndingSeen();
    return applyOfflineReward(createInitialState(now), now);
  }

  if (debugMode === "offline") {
    clearEndingSeen();
    markIntroSeen();
    return applyOfflineReward(
      {
        ...createInitialState(startedAt),
        money: 20_000,
        incomePerSecond: 55,
        clickPower: 500,
        house: 2,
        vehicle: 2,
        business: 3,
        level: 3,
        day: 4,
        startedAt,
        lastTickAt: now - 10 * 60 * 1000,
        lastLoginTime: now - 10 * 60 * 1000,
        hasStarted: true,
      },
      now,
    );
  }

  const stageDebugStates: Record<string, Pick<GameState, "money" | "incomePerSecond" | "clickPower" | "house" | "vehicle" | "business" | "level" | "day">> = {
    "qa-a": {
      money: 100,
      incomePerSecond: 0,
      clickPower: 100,
      house: 1,
      vehicle: 1,
      business: 1,
      level: 1,
      day: 1,
    },
    "qa-b": {
      money: 1_800,
      incomePerSecond: 12,
      clickPower: 154,
      house: 2,
      vehicle: 2,
      business: 2,
      level: 2,
      day: 2,
    },
    "qa-c": {
      money: 18_000,
      incomePerSecond: 55,
      clickPower: 520,
      house: 3,
      vehicle: 3,
      business: 3,
      level: 3,
      day: 4,
    },
    "qa-d": {
      money: 160_000,
      incomePerSecond: 680,
      clickPower: 1_400,
      house: 4,
      vehicle: 4,
      business: 5,
      level: 5,
      day: 7,
    },
    "qa-e": {
      money: 720_000,
      incomePerSecond: 1_900,
      clickPower: 2_500,
      house: 5,
      vehicle: 5,
      business: 6,
      level: 6,
      day: 9,
    },
  };

  if (debugMode && debugMode in stageDebugStates) {
    clearEndingSeen();
    markIntroSeen();

    return applyOfflineReward(
      {
        ...createInitialState(startedAt),
        ...stageDebugStates[debugMode],
        startedAt,
        lastTickAt: now,
        lastLoginTime: now,
        hasStarted: true,
      },
      now,
    );
  }

  if (debugMode !== "ending-near" && debugMode !== "ending") {
    return null;
  }

  clearEndingSeen();
  markIntroSeen();

  return applyOfflineReward(
    {
      ...createInitialState(startedAt),
      money: debugMode === "ending-near" ? 999_900 : 1_245_000,
      incomePerSecond: 1_900,
      clickPower: 2_500,
      house: 5,
      vehicle: 5,
      business: 6,
      level: 6,
      day: 9,
      startedAt,
      lastTickAt: now,
      lastLoginTime: now,
      hasStarted: true,
    },
    now,
  );
}

function App() {
  const boot = useMemo(() => bootGame(), []);
  const [state, dispatch] = useReducer(gameReducer, boot.state);
  const [screen, setScreen] = useState<Screen>(
    boot.state.hasStarted ? "game" : "intro",
  );
  const [introReplay, setIntroReplay] = useState(false);
  const [continueAfterEnding, setContinueAfterEnding] = useState(false);
  const [endingSequenceSeen, setEndingSequenceSeen] = useState(() => hasSeenEnding());
  const [shopCategory, setShopCategory] = useState<GameCategory>("house");
  const [reaction, setReaction] = useState<GameReaction>(boot.offlineReward > 0 ? "offline" : "idle");
  const [offlineReward, setOfflineReward] = useState(boot.offlineReward);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [purchaseBurst, setPurchaseBurst] = useState(0);
  const [earnBurst, setEarnBurst] = useState(0);
  const snapshot = getAssetSnapshot(state);
  const endingReached = isEndingReached(state);
  const houseAssetStyle = {
    "--house-asset": `url("${houseAssets[snapshot.house.level - 1]}")`,
  } as CSSProperties;
  const doniAsset = getDoniAsset(reaction, snapshot.business.level);
  const vehicleAsset = vehicleAssets[snapshot.vehicle.level];
  const businessAsset = businessAssets[snapshot.business.level];

  useEffect(() => {
    saveGame(state);
  }, [state]);

  useEffect(() => {
    if (!state.hasStarted || screen === "ending") {
      return;
    }

    const timer = window.setInterval(() => {
      dispatch({ type: "tick", now: Date.now() });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen, state.hasStarted]);

  useEffect(() => {
    if (reaction === "idle" || reaction === "offline") {
      return;
    }

    const timer = window.setTimeout(() => setReaction("idle"), 1600);
    return () => window.clearTimeout(timer);
  }, [reaction]);

  const startGame = () => {
    markIntroSeen();
    setIntroReplay(false);
    dispatch({ type: "start", now: Date.now() });
    setReaction("idle");
    setScreen("game");
  };

  const earnMoney = () => {
    dispatch({ type: "earn", amount: state.clickPower, now: Date.now() });
    setReaction("earn");
    setEarnBurst((value) => value + 1);
  };

  const buyNext = (category: GameCategory) => {
    const next = getNextUpgrade(state, category);

    if (!next || !canBuyUpgrade(state, next)) {
      setReaction("idle");
      return;
    }

    dispatch({ type: "buy", category, upgrade: next, now: Date.now() });
    setReaction("buy");
    setPurchaseBurst((value) => value + 1);
  };

  const restart = () => {
    clearGame();
    clearEndingSeen();
    setEndingSequenceSeen(false);
    setContinueAfterEnding(false);
    setIntroReplay(false);
    dispatch({ type: "reset", now: Date.now() });
    setOfflineReward(0);
    setReaction("idle");
    setScreen("intro");
  };

  const shareResult = async () => {
    const shareText = `100원으로 시작한 돈이가 자수성돈에 성공했어요!
총자산: ${formatMoney(state.money)}
집: ${snapshot.house.name}
차: ${snapshot.vehicle.name}
사업: ${snapshot.business.name}
DAY ${state.day}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "자수성돈",
          text: shareText,
        });
        return;
      } catch {
        // Share sheets can be canceled. Copy keeps the result easy to share.
      }
    }

    await navigator.clipboard.writeText(shareText);
    setReaction("buy");
  };

  if (screen === "intro") {
    return <IntroPage onStart={startGame} startAtFinal={!introReplay && hasSeenIntro()} />;
  }

  if ((screen === "ending" || endingReached) && !continueAfterEnding) {
    return (
      <EndingPage
        business={snapshot.business}
        day={state.day}
        house={snapshot.house}
        money={state.money}
        playSequence={!endingSequenceSeen}
        vehicle={snapshot.vehicle}
        onContinue={() => setContinueAfterEnding(true)}
        onRestart={restart}
        onSeen={() => {
          markEndingSeen();
          setEndingSequenceSeen(true);
        }}
        onShare={shareResult}
      />
    );
  }

  return (
    <main className={`app home-${snapshot.house.visualKey}`}>
      <GameHud
        day={state.day}
        income={state.incomePerSecond}
        money={state.money}
        onSettings={() => setSettingsOpen(true)}
      />

      <p key={reaction} className="dialogue-panel" aria-live="polite">
        {reactionLines[reaction]}
      </p>

      <section className="life-scene" aria-label="돈이의 생활 공간" style={houseAssetStyle}>
        <img
          alt=""
          className="house-asset-img"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
          src={houseAssets[snapshot.house.level - 1]}
        />
        <div className="room-window" aria-hidden="true">
          <span className="sun" />
          <span className="cloud cloud-one" />
        </div>
        <div className="room-backdrop" aria-hidden="true">
          <span className="ceiling-light" />
          <span className="wall-art">{snapshot.house.icon}</span>
          <span className="shelf">{snapshot.business.icon}</span>
          <span className="plant" />
          <span className="comfort comfort-one" />
          <span className="comfort comfort-two" />
        </div>
        <CoinCharacter assetSrc={doniAsset} reaction={reaction} burstKey={earnBurst + purchaseBurst * 10} />
        <p className="stage-badge">Lv.{snapshot.house.level - 1} {snapshot.house.name}</p>
      </section>

      <section className="current-assets-strip" aria-label="현재 보유 사업과 이동수단">
        <CurrentAssetSlot
          assetSrc={businessAsset}
          emptyLabel="없음"
          label="현재 사업"
          name={businessAsset ? snapshot.business.name : "없음"}
          type="business"
        />
        <CurrentAssetSlot
          assetSrc={vehicleAsset}
          emptyLabel="발자국"
          label="현재 이동수단"
          name={snapshot.vehicle.name}
          type="vehicle"
        />
      </section>

      {offlineReward > 0 && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="오프라인 수익">
          <div className="reward-modal">
            <p>돈이가 쉬는 동안</p>
            <strong>{formatMoney(offlineReward)}을 벌었어요!</strong>
            <PixelButton label="좋아!" onClick={() => setOfflineReward(0)} variant="mint" />
          </div>
        </div>
      )}

      {screen === "shop" && (
        <ShopTree
          category={shopCategory}
          current={getCurrentUpgrade(state, shopCategory)}
          money={state.money}
          onBuy={() => buyNext(shopCategory)}
          onCategoryChange={setShopCategory}
          onClose={() => setScreen("game")}
          upgrades={upgrades[shopCategory]}
        />
      )}

      {screen === "assets" && (
        <AssetPanel
          day={state.day}
          house={snapshot.house}
          income={state.incomePerSecond}
          money={state.money}
          vehicle={snapshot.vehicle}
          business={snapshot.business}
          onClose={() => setScreen("game")}
          onShop={() => {
            setShopCategory("house");
            setScreen("shop");
          }}
        />
      )}

      {settingsOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="설정">
          <div className="reward-modal settings-modal">
            <p className="tiny-label">Settings</p>
            <strong>자수성돈</strong>
            <p>진행 상황은 자동으로 저장돼요.</p>
            <PixelButton
              label="인트로 다시 보기"
              onClick={() => {
                setSettingsOpen(false);
                setIntroReplay(true);
                setScreen("intro");
              }}
            />
            <PixelButton label="닫기" onClick={() => setSettingsOpen(false)} variant="mint" />
          </div>
        </div>
      )}

      <section className="bottom-panel" aria-label="게임 조작">
        <PixelButton label={`☝ 돈 벌기 +${formatMoney(state.clickPower)}`} onClick={earnMoney} size="large" />
        <div className="bottom-actions">
          <PixelButton label="🏠 상점" onClick={() => setScreen("shop")} variant="mint" />
          <PixelButton
            label="◔ 자산"
            onClick={() => setScreen("assets")}
            variant="pink"
          />
        </div>
      </section>
    </main>
  );
}

function CurrentAssetSlot({
  assetSrc,
  emptyLabel,
  label,
  name,
  type,
}: {
  assetSrc?: string;
  emptyLabel: string;
  label: string;
  name: string;
  type: "business" | "vehicle";
}) {
  return (
    <article className={`current-asset-card slot-${type} ${assetSrc ? "has-image" : "is-empty"}`}>
      <span>{label}</span>
      <div className="current-asset-visual">
        {assetSrc ? (
          <img
            alt=""
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
            src={assetSrc}
          />
        ) : (
          <strong>{emptyLabel}</strong>
        )}
      </div>
      <p>{name}</p>
    </article>
  );
}

export default App;
