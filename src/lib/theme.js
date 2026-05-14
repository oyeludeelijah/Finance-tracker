export const M3 = {
  surface: "#1C1B1F",
  surfaceVariant: "#49454F",
  surfaceContainer: "#211F26",
  surfaceContainerHigh: "#2B2930",
  surfaceContainerHighest: "#36343B",
  primary: "#D0BCFF",
  primaryContainer: "#4F378B",
  onPrimaryContainer: "#EADDFF",
  secondary: "#CCC2DC",
  secondaryContainer: "#4A4458",
  tertiary: "#EFB8C8",
  tertiaryContainer: "#633B48",
  onSurface: "#E6E1E5",
  onSurfaceVariant: "#CAC4D0",
  outline: "#49454F",
  outlineVariant: "#49454F44",
  error: "#F2B8B8",
  errorContainer: "#8C1D18",
  green: "#6DD58C",
  greenContainer: "#0A3818",
};

export const card = {
  background: M3.surfaceContainerHigh,
  border: `1px solid ${M3.outlineVariant}`,
  borderRadius: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.32)",
};

export const inputStyle = {
  background: M3.surfaceContainerHighest,
  border: `1px solid ${M3.outline}`,
  borderRadius: 12,
  color: M3.onSurface,
  padding: "10px 14px",
  outline: "none",
  fontSize: 14,
  width: "100%",
};

export const CATEGORY_COLORS = ["#D0BCFF", "#CCC2DC", "#EFB8C8", "#80CBC4", "#FFB74D"];
