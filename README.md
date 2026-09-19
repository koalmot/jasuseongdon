# 자수성돈

100원짜리 동전 캐릭터 돈이를 키우는 모바일 우선 픽셀 방치 게임 MVP입니다.

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 주요 구조

- `src/App.tsx`: 화면 흐름과 게임 UI
- `src/data/upgrades.ts`: 집, 자동차, 사업 성장 데이터
- `src/features/game/gameReducer.ts`: 클릭 수입, 자동수입, 구매, DAY, 엔딩 규칙
- `src/features/game/gameStorage.ts`: LocalStorage 저장과 오프라인 보상
- `src/components/`: 돈이 캐릭터, HUD, 버튼, 성장 트리
- `public/assets/`: 추후 실제 픽셀 이미지 교체용 폴더
