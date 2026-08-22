// Dayflow design tokens — shared across auth screens and dashboard.
export const COLORS = {
  ink: "#17203A",
  paper: "#FAF7F2",
  flow: "#E3A23B",
  tide: "#2F6F62",
  coral: "#C6553D",
  mist: "#D8D2C2",
  card: "#FFFFFF",
};

const FONT_IMPORT_ID = "dayflow-fonts";
export function loadDayflowFonts() {
  if (typeof document === "undefined" || document.getElementById(FONT_IMPORT_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
}
