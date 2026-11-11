import {
  COUNT_MAX,
  COUNT_MIN,
  SPACING_MAX,
  SPACING_MIN,
  STEPS_MAX,
  STEPS_MIN,
  clampCount,
  clampSpacing,
  clampSteps,
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
  onSteps: (steps: number) => void,
): UiController {
  const spacingRange = document.querySelector<HTMLInputElement>("#spacing");
  const countRange = document.querySelector<HTMLInputElement>("#count");
  const stepsRange = document.querySelector<HTMLInputElement>("#steps");
  const spacingNumber = document.querySelector<HTMLInputElement>("#spacing-number");
  const countNumber = document.querySelector<HTMLInputElement>("#count-number");
  const stepsNumber = document.querySelector<HTMLInputElement>("#steps-number");
  const spacingUnit = document.querySelector<HTMLElement>(".unit");

  if (
    !spacingRange ||
    !countRange ||
    !stepsRange ||
    !spacingNumber ||
    !countNumber ||
    !stepsNumber ||
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

  function showSteps(steps: number): void {
    stepsRange!.value = String(steps);
    stepsNumber!.value = String(steps);
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

  function commitSteps(raw: number): void {
    const steps = clampSteps(raw);
    showSteps(steps);
    onSteps(steps);
  }

  spacingRange.addEventListener("input", () => {
    commitSpacingMetres(Number(spacingRange.value));
  });

  countRange.addEventListener("input", () => {
    commitCount(Number(countRange.value));
  });

  stepsRange.addEventListener("input", () => {
    commitSteps(Number(stepsRange.value));
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

  stepsNumber.addEventListener("change", () => {
    const raw = Number(stepsNumber.value);
    if (!Number.isFinite(raw)) {
      showSteps(Number(stepsRange.value));
      return;
    }
    commitSteps(raw);
  });

  spacingNumber.addEventListener("keydown", (e) => {
    if (e.key === "Enter") spacingNumber.blur();
  });

  countNumber.addEventListener("keydown", (e) => {
    if (e.key === "Enter") countNumber.blur();
  });

  stepsNumber.addEventListener("keydown", (e) => {
    if (e.key === "Enter") stepsNumber.blur();
  });

  countNumber.min = String(COUNT_MIN);
  countNumber.max = String(COUNT_MAX);
  countRange.max = String(COUNT_MAX);

  stepsNumber.min = String(STEPS_MIN);
  stepsNumber.max = String(STEPS_MAX);
  stepsRange.min = String(STEPS_MIN);
  stepsRange.max = String(STEPS_MAX);

  return {
    sync(state: AppState) {
      showSpacing(state.spacing);
      showCount(state.count);
      showSteps(state.steps);
    },
  };
}
