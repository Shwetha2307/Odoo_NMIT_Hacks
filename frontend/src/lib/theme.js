// Dayflow's shared palette. Keep this the single source of truth for color —
// pages should import COLORS rather than hard-coding hex values.
export const COLORS = {
  paper: "#FAF7F1",   // page background
  card: "#FFFFFF",    // card/panel background
  mist: "#E7E1D5",    // borders/dividers
  ink: "#211C15",     // primary text
  muted: "#8A8578",   // secondary text
  flow: "#BFEAD1",    // primary accent (buttons, highlights)
  flowDark: "#8FCDA9",// accent hover/active
  amber: "#F1C97A",   // secondary accent (badges, warnings)
  coral: "#D9695A",   // errors/destructive
  sky: "#AFD3E6",     // info accent
};

export const FONT_HEADING = "'Space Grotesk', sans-serif";
export const FONT_BODY = "'Inter', sans-serif";
