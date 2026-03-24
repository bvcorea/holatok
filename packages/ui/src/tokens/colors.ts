export const colors = {
  brand: {
    coral: "#FF6B6B",
    coralLight: "#FF8E8E",
    coralDark: "#E54E4E",
    seoulBlue: "#4A90D9",
    seoulBlueDark: "#2E71BE",
    seoulBlueLight: "#6BA8E8",
  },
  neutral: {
    white: "#FFFFFF",
    black: "#000000",
    gray50: "#F9FAFB",
    gray100: "#F3F4F6",
    gray200: "#E5E7EB",
    gray300: "#D1D5DB",
    gray400: "#9CA3AF",
    gray500: "#6B7280",
    gray600: "#4B5563",
    gray700: "#374151",
    gray800: "#1F2937",
    gray900: "#111827",
  },
  semantic: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
} as const;

export type Colors = typeof colors;
