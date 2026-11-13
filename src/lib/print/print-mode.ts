// src/lib/print/print-mode.ts

export type PrintMode = "label" | "list";

const CLASSES: Record<PrintMode, string> = {
  label: "printing-label",
  list: "printing-list",
};

export function enterPrintMode(mode: PrintMode) {
  exitPrintMode();
  document.body.classList.add(CLASSES[mode]);
}

export function exitPrintMode() {
  document.body.classList.remove(CLASSES.label);
  document.body.classList.remove(CLASSES.list);
}
