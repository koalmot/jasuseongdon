import { useEffect, useState, type ReactNode } from "react";

export type StoryScene<TId extends string> = {
  id: TId;
  durationMs?: number;
};

type StorySequenceProps<TId extends string> = {
  scenes: StoryScene<TId>[];
  startIndex?: number;
  stopAtLast?: boolean;
  onSceneChange?: (scene: StoryScene<TId>, index: number) => void;
  renderScene: (
    scene: StoryScene<TId>,
    index: number,
    controls: {
      goTo: (index: number) => void;
      goToLast: () => void;
    },
  ) => ReactNode;
};

export function StorySequence<TId extends string>({
  scenes,
  startIndex = 0,
  stopAtLast = true,
  onSceneChange,
  renderScene,
}: StorySequenceProps<TId>) {
  const safeStart = Math.min(Math.max(startIndex, 0), scenes.length - 1);
  const [sceneIndex, setSceneIndex] = useState(safeStart);
  const scene = scenes[sceneIndex];

  useEffect(() => {
    onSceneChange?.(scene, sceneIndex);
  }, [onSceneChange, scene, sceneIndex]);

  useEffect(() => {
    if (!scene.durationMs) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSceneIndex((current) => {
        const next = current + 1;
        if (next >= scenes.length) {
          return stopAtLast ? current : 0;
        }

        return next;
      });
    }, scene.durationMs);

    return () => window.clearTimeout(timer);
  }, [scene.durationMs, scenes.length, stopAtLast]);

  return (
    <>
      {renderScene(scene, sceneIndex, {
        goTo: (index) => setSceneIndex(Math.min(Math.max(index, 0), scenes.length - 1)),
        goToLast: () => setSceneIndex(scenes.length - 1),
      })}
    </>
  );
}
