import type { GameCategory, Upgrade } from "../features/game/gameTypes";

export const houseAssets = [
  "/assets/houses/house0_empty.png",
  "/assets/houses/house1_studio.png",
  "/assets/houses/house2_apartment.png",
  "/assets/houses/house3_penthouse.png",
  "/assets/houses/house4_mansion.png",
];

export const vehicleAssets: Record<number, string | undefined> = {
  2: "/assets/vehicles/bike_clean.png",
  3: "/assets/vehicles/sedan_clean.png",
  4: "/assets/vehicles/sportscar_clean.png",
  5: "/assets/vehicles/supercar_clean.png",
};

export const businessAssets: Record<number, string | undefined> = {
  2: "/assets/business/business0_vending_clean.png",
  3: "/assets/business/business1_cafe_clean.png",
  4: "/assets/business/business2_restaurant_clean.png",
  5: "/assets/business/business3_company_clean.png",
  6: "/assets/business/business4_group_clean.png",
};

export function getUpgradeAsset(upgrade: Upgrade): string | undefined {
  if (upgrade.category === "house") {
    return houseAssets[upgrade.level - 1];
  }

  if (upgrade.category === "vehicle") {
    return vehicleAssets[upgrade.level];
  }

  return businessAssets[upgrade.level];
}

export function getEmptyVisualLabel(category: GameCategory) {
  if (category === "vehicle") {
    return "발자국";
  }

  if (category === "business") {
    return "없음";
  }

  return "이미지";
}
