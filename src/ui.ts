import {
  COUNT_MAX,
  COUNT_MIN,
  SPACING_MAX,
  SPACING_MIN,
  clampCount,
  clampSpacing,
  type AppState,
} from "./state";

export type UiController = {
  sync: (state: AppState) => void;
};

export function createUi(
  onSpacing: (spacing: number) => void,
  onCount: (count: number) => void,
): UiController {
  const spacingRange = document.querySelector<HTMLInputElement>("#spacing");
  const countRange = document.querySelector<HTMLInputElement>("#count");
  const spacingNumber = document.querySelector<HTMLInputElement>("#spacing-number");
  const countNumber = document.querySelector<HTMLInputElement>("#count-number");

  if (!spacingRange || !countRange || !spacingNumber || !countNumber) {
    throw new Error("Missing control elements");
  }

  function showSpacing(spacing: number): void {
    spacingRange!.value = String(spacing);
    spacingNumber!.value = String(spacing);
  }

  function showCount(count: number): void {
    countRange!.value = String(count);
    countNumber!.value = String(count);
  }

  function commitSpacing(raw: number): void {
    const spacing = clampSpacing(raw);
    showSpacing(spacing);
    onSpacing(spacing);
  }

  function commitCount(raw: number): void {
    const count = clampCount(raw);
    showCount(count);
    onCount(count);
  }

  spacingRange.addEventListener("input", () => {
    commitSpacing(Number(spacingRange.value));
  });

  countRange.addEventListener("input", () => {
    commitCount(Number(countRange.value));
  });

  spacingNumber.addEventListener("change", () => {
    const raw = Number(spacingNumber.value);
    if (!Number.isFinite(raw)) {
      showSpacing(Number(spacingRange.value));
      return;
    }
    commitSpacing(raw);
  });

  countNumber.addEventListener("change", () => {
    const raw = Number(countNumber.value);
    if (!Number.isFinite(raw)) {
      showCount(Number(countRange.value));
      return;
    }
    commitCount(raw);
  });

  spacingNumber.addEventListener("keydown", (e) => {
    if (e.key === "Enter") spacingNumber.blur();
  });

  countNumber.addEventListener("keydown", (e) => {
    if (e.key === "Enter") countNumber.blur();
  });

  spacingNumber.min = String(SPACING_MIN);
  spacingNumber.max = String(SPACING_MAX);
  countNumber.min = String(COUNT_MIN);
  countNumber.max = String(COUNT_MAX);

  return {
    sync(state: AppState) {
      showSpacing(state.spacing);
      showCount(state.count);
    },
  };
}
