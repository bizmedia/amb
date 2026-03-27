const DOT_PALETTE = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-lime-600",
] as const;

/** Stable accent dot for epic chip (8-color hash). */
export function epicDotClass(epicId: string): string {
  let h = 0;
  for (let i = 0; i < epicId.length; i++) {
    h = (h * 31 + epicId.charCodeAt(i)) | 0;
  }
  const i = Math.abs(h) % DOT_PALETTE.length;
  return DOT_PALETTE[i] ?? DOT_PALETTE[0];
}
