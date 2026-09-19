import type { Upgrade } from "../features/game/gameTypes";
import { getEmptyVisualLabel, getUpgradeAsset } from "../data/visualAssets";
import { formatMoney } from "../utils/formatMoney";
import { PixelButton } from "./PixelButton";

type AssetPanelProps = {
  day: number;
  money: number;
  income: number;
  house: Upgrade;
  vehicle: Upgrade;
  business: Upgrade;
  onClose: () => void;
  onShop: () => void;
};

export function AssetPanel({
  day,
  money,
  income,
  house,
  vehicle,
  business,
  onClose,
  onShop,
}: AssetPanelProps) {
  return (
    <div className="asset-sheet" role="dialog" aria-modal="true" aria-label="자산 확인">
      <div className="shop-header">
        <div>
          <p className="tiny-label">Doni's Life</p>
          <h2>현재 자산</h2>
        </div>
        <button className="icon-close" type="button" aria-label="자산 닫기" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="asset-total">
        <span>총 보유금</span>
        <strong>{formatMoney(money)}</strong>
        <small>DAY {day} · 자동수입 {formatMoney(income)}/초</small>
      </div>

      <div className="asset-grid">
        <AssetCard label="집" upgrade={house} />
        <AssetCard label="이동수단" upgrade={vehicle} />
        <AssetCard label="사업" upgrade={business} />
      </div>

      <div className="asset-note">
        <strong>돈이의 삶이 이렇게 바뀌었어요.</strong>
        <p>집과 이동수단은 생활 보상, 사업은 자동수입을 만들어줘요.</p>
      </div>

      <div className="bottom-actions ending-actions">
        <PixelButton label="상점 가기" onClick={onShop} variant="mint" />
        <PixelButton label="돌아가기" onClick={onClose} variant="pink" />
      </div>
    </div>
  );
}

function AssetCard({ label, upgrade }: { label: string; upgrade: Upgrade }) {
  const asset = getUpgradeAsset(upgrade);

  return (
    <article>
      <span className={`asset-thumb ${asset ? "has-image" : "is-empty"}`}>
        {asset ? (
          <img
            alt=""
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
            src={asset}
          />
        ) : (
          <small>{getEmptyVisualLabel(upgrade.category)}</small>
        )}
      </span>
      <p>{label}</p>
      <strong>{upgrade.name}</strong>
    </article>
  );
}
