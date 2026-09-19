import type { GameCategory, Upgrade } from "../features/game/gameTypes";
import { getEmptyVisualLabel, getUpgradeAsset } from "../data/visualAssets";
import { formatMoney } from "../utils/formatMoney";
import { PixelButton } from "./PixelButton";

const categoryLabels: Record<GameCategory, string> = {
  house: "집",
  vehicle: "이동수단",
  business: "사업",
};

const categoryIcons: Record<GameCategory, string> = {
  house: "🏠",
  vehicle: "🚲",
  business: "📈",
};

type ShopTreeProps = {
  category: GameCategory;
  current: Upgrade;
  money: number;
  upgrades: Upgrade[];
  onBuy: () => void;
  onClose: () => void;
  onCategoryChange: (category: GameCategory) => void;
};

export function ShopTree({
  category,
  current,
  money,
  upgrades,
  onBuy,
  onClose,
  onCategoryChange,
}: ShopTreeProps) {
  const next = upgrades.find((item) => item.level === current.level + 1);
  const canBuy = Boolean(next && money >= next.price);

  return (
    <div className="shop-sheet" role="dialog" aria-modal="true" aria-label="인생 성장 트리">
      <div className="shop-header">
        <div>
          <p className="tiny-label">Life Upgrade Tree</p>
          <h2>돈이의 인생 성장</h2>
        </div>
        <button className="icon-close" type="button" aria-label="상점 닫기" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="category-tabs" role="tablist" aria-label="상점 카테고리">
        {(Object.keys(categoryLabels) as GameCategory[]).map((item) => (
          <button
            aria-selected={item === category}
            className={item === category ? "active" : ""}
            key={item}
            onClick={() => onCategoryChange(item)}
            role="tab"
            type="button"
          >
            <span>{categoryIcons[item]}</span>
            {categoryLabels[item]}
          </button>
        ))}
      </div>

      <div className="upgrade-track">
        {upgrades.map((item) => {
          const isOwned = item.level <= current.level;
          const isNext = item.level === current.level + 1;
          const asset = getUpgradeAsset(item);

          return (
            <article className={`upgrade-node ${isOwned ? "owned" : ""} ${isNext ? "next" : ""}`} key={item.id}>
              <span className={`node-icon ${asset ? "has-image" : "is-empty"}`}>
                {asset ? (
                  <img
                    alt=""
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                    src={asset}
                  />
                ) : (
                  <small>{getEmptyVisualLabel(item.category)}</small>
                )}
              </span>
              <div>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </div>
              <small>
                {isOwned ? "현재" : isNext ? `${formatMoney(item.price)}` : "미래"}
              </small>
            </article>
          );
        })}
      </div>

      <div className="shop-action">
        <p>{next ? `${current.name} 다음은 ${next.name}` : `${categoryLabels[category]}은 이미 최고 단계예요.`}</p>
        <PixelButton
          disabled={!canBuy}
          label={next ? `${formatMoney(next.price)} 구매` : "완료"}
          onClick={onBuy}
          variant={canBuy ? "yellow" : "mint"}
        />
      </div>
    </div>
  );
}
