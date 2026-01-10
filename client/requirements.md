## Packages
framer-motion | For smooth page transitions, progress steps, and UI animations
lucide-react | Icon system
date-fns | Formatting dates for case history
clsx | Utility for conditional classes
tailwind-merge | Utility for merging tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["'Heebo'", "sans-serif"], // Clean, modern Hebrew-compatible font
  serif: ["'Frank Ruhl Libre'", "serif"], // Classic, authoritative Hebrew serif for legal text
  mono: ["'IBM Plex Mono'", "monospace"], // Tech/Code look for agent logs
}

App direction should be RTL (`dir="rtl"` on body/root).
File upload uses FormData (multipart/form-data).
Polling required for case status updates (pending -> processing -> completed).
