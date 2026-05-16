// All values are CSS custom properties — the active theme class on <html>
// determines which set of values applies (dark by default, light via .light class).
export const M3 = {
  surface:                  "var(--m3-surface)",
  surfaceVariant:           "var(--m3-surface-variant)",
  surfaceContainer:         "var(--m3-surface-container)",
  surfaceContainerHigh:     "var(--m3-surface-container-high)",
  surfaceContainerHighest:  "var(--m3-surface-container-highest)",
  primary:                  "var(--m3-primary)",
  primaryContainer:         "var(--m3-primary-container)",
  onPrimaryContainer:       "var(--m3-on-primary-container)",
  secondary:                "var(--m3-secondary)",
  secondaryContainer:       "var(--m3-secondary-container)",
  onSurface:                "var(--m3-on-surface)",
  onSurfaceVariant:         "var(--m3-on-surface-variant)",
  outline:                  "var(--m3-outline)",
  outlineVariant:           "var(--m3-outline-variant)",
  error:                    "var(--m3-error)",
  errorContainer:           "var(--m3-error-container)",
  green:                    "var(--m3-green)",
  greenContainer:           "var(--m3-green-container)",
  // Pre-computed alpha tokens (avoids `${M3.primary}14` string appending)
  primaryAlpha10:           "var(--m3-primary-10)",
  primaryAlpha14:           "var(--m3-primary-14)",
  primaryAlpha20:           "var(--m3-primary-20)",
  primaryAlphaAA:           "var(--m3-primary-aa)",
  outlineAlpha22:           "var(--m3-outline-22)",
  outlineAlpha44:           "var(--m3-outline-44)",
};

export const card = {
  background: "var(--m3-surface-container-high)",
  border: "1px solid var(--m3-outline-variant)",
  borderRadius: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
};

export const inputStyle = {
  background: "var(--m3-surface-container-highest)",
  border: "1px solid var(--m3-outline)",
  borderRadius: 12,
  color: "var(--m3-on-surface)",
  padding: "10px 14px",
  outline: "none",
  fontSize: 14,
  width: "100%",
};

export const CATEGORY_COLORS = ["#D0BCFF", "#CCC2DC", "#EFB8C8", "#80CBC4", "#FFB74D"];
