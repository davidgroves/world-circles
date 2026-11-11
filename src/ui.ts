import { formatSpacing, type AppState } from "./state";

export type UiController = {
  sync: (state: AppState) => void;
};

export function createUi(
  onSpacing: (spacing: number) => void,
  onCount: (count: number) => void,
): UiController {
  const spacingInput = document.querySelector<HTMLInputElement>("#spacing");
  const countInput = document.querySelector<HTMLInputElement>("#count");
  const spacingValue = document.querySelector<HTMLOutputElement>("#spacing-value");
  const countValue = document.querySelector<HTMLOutputElement>("#count-value");

  if (!spacingInput || !countInput || !spacingValue || !countValue) {
    throw new Error("Missing control elements");
  }

  function renderLabels(spacing: number, count: number): void {
    spacingValue!.textContent = formatSpacing(spacing);
    countValue!.textContent = String(count);
  }

  spacingInput.addEventListener("input", () => {
    const spacing = Number(spacingInput.value);
    renderLabels(spacing, Number(countInput.value));
    onSpacing(spacing);
  });

  countInput.addEventListener("input", () => {
    const count = Number(countInput.value);
    renderLabels(Number(spacingInput.value), count);
    onCount(count);
  });

  return {
    sync(state: AppState) {
      spacingInput.value = String(state.spacing);
      countInput.value = String(state.count);
      renderLabels(state.spacing, state.count);
    },
  };
}
