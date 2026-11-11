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

/** Show kilometres once spacing is strictly greater than 1000 m. */
function usesKm(metres: number): boolean {
  return metres > 1000;
}

function formatMetresAsKm(metres: number): string {
  const km = metres / 1000;
  return km.toFixed(3).replace(/\.?0+$/, "");
}

export function createUi(
  onSpacing: (spacing: number) => void,
  onCount: (count: number) => void,
): UiController {
  const spacingRange = document.querySelector<HTMLInputElement>("#spacing");
  const countRange = document.querySelector<HTMLInputElement>("#count");
  const spacingNumber = document.querySelector<HTMLInputElement>("#spacing-number");
  const countNumber = document.querySelector<HTMLInputElement>("#count-number");
  const spacingUnit = document.querySelector<HTMLElement>(".unit");

  if (
    !spacingRange ||
    !countRange ||
    !spacingNumber ||
    !countNumber ||
    !spacingUnit
  ) {
    throw new Error("Missing control elements");
  }

  function showSpacing(metres: number): void {
    spacingRange!.value = String(metres);

    if (usesKm(metres)) {
      spacingNumber!.value = formatMetresAsKm(metres);
      spacingNumber!.min = formatMetresAsKm(SPACING_MIN);
      spacingNumber!.max = formatMetresAsKm(SPACING_MAX);
      spacingNumber!.step = "0.001";
      spacingNumber!.setAttribute("aria-label", "Spacing in kilometres");
      spacingUnit!.textContent = "km";
    } else {
      spacingNumber!.value = String(metres);
      spacingNumber!.min = String(SPACING_MIN);
      spacingNumber!.max = String(SPACING_MAX);
      spacingNumber!.step = "1";
      spacingNumber!.setAttribute("aria-label", "Spacing in metres");
      spacingUnit!.textContent = "m";
    }
  }

  function showCount(count: number): void {
    countRange!.value = String(count);
    countNumber!.value = String(count);
  }

  function parseSpacingInput(): number | null {
    const raw = Number(spacingNumber!.value);
    if (!Number.isFinite(raw)) return null;
    if (spacingUnit!.textContent === "km") {
      return Math.round(raw * 1000);
    }
    return Math.round(raw);
  }

  function commitSpacingMetres(metres: number): void {
    const spacing = clampSpacing(metres);
    showSpacing(spacing);
    onSpacing(spacing);
  }

  function commitCount(raw: number): void {
    const count = clampCount(raw);
    showCount(count);
    onCount(count);
  }

  spacingRange.addEventListener("input", () => {
    commitSpacingMetres(Number(spacingRange.value));
  });

  countRange.addEventListener("input", () => {
    commitCount(Number(countRange.value));
  });

  spacingNumber.addEventListener("change", () => {
    const metres = parseSpacingInput();
    if (metres === null) {
      showSpacing(Number(spacingRange.value));
      return;
    }
    commitSpacingMetres(metres);
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

  countNumber.min = String(COUNT_MIN);
  countNumber.max = String(COUNT_MAX);
  countRange.max = String(COUNT_MAX);

  return {
    sync(state: AppState) {
      showSpacing(state.spacing);
      showCount(state.count);
    },
  };
}
