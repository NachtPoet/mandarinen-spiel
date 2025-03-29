// Leveldaten für das Mandarinen-Spiel
// Texte (lyric, quote, targetWords) werden jetzt über localization.js geladen.
// Hier bleiben nur die Farbschemata pro Level.

const GAME_LEVELS = [
  { // Level 1
    colorScheme: {
      bg: "#2a0d32", // Dunkles Violett für Hintergrund
      cellBg: "#3a1142", // Etwas helleres Violett für Zellen
      cellBorder: "#631D76", // Hauptviolett für Umrandung
      cellSelected: "#9b4dba", // Helleres Violett für Auswahl
      cellFound: "#d6a6f1", // Noch helleres Violett für gefundene Zellen
      textShadow: "0 0 5px rgba(155, 77, 186, 0.8)", // Violett-Glow für Text
      titleShadow: "0 0 10px rgba(155, 77, 186, 0.9)" // Stärkerer Violett-Glow für Titel
    }
    // targetWords, lyric, quote removed - loaded via localization keys
  },
  { // Level 2
    colorScheme: {
      bg: "#593240", // Dunkles Rosé für Hintergrund
      cellBg: "#6a3c4b", // Etwas helleres Rosé für Zellen
      cellBorder: "#F7C1BB", // Haupt-Rosa für Umrandung
      cellSelected: "#ffada3", // Helleres Rosa für Auswahl
      cellFound: "#ffd6cf", // Noch helleres Rosa für gefundene Zellen
      textShadow: "0 0 5px rgba(247, 193, 187, 0.8)", // Rosa-Glow für Text
      titleShadow: "0 0 10px rgba(247, 193, 187, 0.9)" // Stärkerer Rosa-Glow für Titel
    }
  },
  { // Level 3
    colorScheme: {
      bg: "#4a0d17", // Dunkles Rot für Hintergrund
      cellBg: "#5c1720", // Etwas helleres Rot für Zellen
      cellBorder: "#D62941", // Haupt-Rot für Umrandung
      cellSelected: "#ff5066", // Helleres Rot für Auswahl
      cellFound: "#ff8c98", // Noch helleres Rot für gefundene Zellen
      textShadow: "0 0 5px rgba(214, 41, 65, 0.8)", // Rot-Glow für Text
      titleShadow: "0 0 10px rgba(214, 41, 65, 0.9)" // Stärkerer Rot-Glow für Titel
    }
  },
  { // Level 4
    colorScheme: {
      bg: "#2c3c33", // Dunkles Grün für Hintergrund
      cellBg: "#3a4a41", // Etwas helleres Grün für Zellen
      cellBorder: "#99B9AB", // Haupt-Grün für Umrandung
      cellSelected: "#b5d1c6", // Helleres Grün für Auswahl
      cellFound: "#d1e8df", // Noch helleres Grün für gefundene Zellen
      textShadow: "0 0 5px rgba(153, 185, 171, 0.8)", // Grün-Glow für Text
      titleShadow: "0 0 10px rgba(153, 185, 171, 0.9)" // Stärkerer Grün-Glow für Titel
    }
  },
  { // Level 5
    colorScheme: {
      bg: "#5c4a10", // Dunkles Goldgelb für Hintergrund
      cellBg: "#6e5918", // Etwas helleres Goldgelb für Zellen
      cellBorder: "#FDC840", // Haupt-Gelb für Umrandung
      cellSelected: "#ffdb70", // Helleres Gelb für Auswahl
      cellFound: "#ffe9a1", // Noch helleres Gelb für gefundene Zellen
      textShadow: "0 0 5px rgba(253, 200, 64, 0.8)", // Gelb-Glow für Text
      titleShadow: "0 0 10px rgba(253, 200, 64, 0.9)" // Stärkerer Gelb-Glow für Titel
    }
  },
  { // Level 6
    colorScheme: {
      bg: "#3d0e24", // Dunkles Violett-Rot für Hintergrund
      cellBg: "#4d1730", // Etwas helleres Violett-Rot für Zellen
      cellBorder: "#b5265e", // Mischung aus Violett und Rot
      cellSelected: "#e85588", // Hellere Mischung für Auswahl
      cellFound: "#ff9ebb", // Noch hellere Mischung für gefundene Zellen
      textShadow: "0 0 5px rgba(214, 41, 118, 0.8)", // Violett-Rot-Glow für Text
      titleShadow: "0 0 10px rgba(214, 41, 118, 0.9)" // Stärkerer Violett-Rot-Glow für Titel
    }
  },
  { // Level 7
    colorScheme: {
      bg: "#3c4020", // Dunkles Grün-Gelb für Hintergrund
      cellBg: "#4a4e2a", // Etwas helleres Grün-Gelb für Zellen
      cellBorder: "#b3c161", // Mischung aus Grün und Gelb
      cellSelected: "#d1dd83", // Hellere Mischung für Auswahl
      cellFound: "#edf4b5", // Noch hellere Mischung für gefundene Zellen
      textShadow: "0 0 5px rgba(179, 193, 97, 0.8)", // Grün-Gelb-Glow für Text
      titleShadow: "0 0 10px rgba(179, 193, 97, 0.9)" // Stärkerer Grün-Gelb-Glow für Titel
    }
  },
  { // Level 8
    colorScheme: {
      bg: "#511a20", // Dunkles Rosa-Rot für Hintergrund
      cellBg: "#63222a", // Etwas helleres Rosa-Rot für Zellen
      cellBorder: "#e6747e", // Mischung aus Rosa und Rot
      cellSelected: "#ff97a0", // Hellere Mischung für Auswahl
      cellFound: "#ffbbc1", // Noch hellere Mischung für gefundene Zellen
      textShadow: "0 0 5px rgba(230, 116, 126, 0.8)", // Rosa-Rot-Glow für Text
      titleShadow: "0 0 10px rgba(230, 116, 126, 0.9)" // Stärkerer Rosa-Rot-Glow für Titel
    }
  },
  { // Level 9
    colorScheme: {
      bg: "#2c3c33", // Dunkles Grün für Hintergrund
      cellBg: "#3a4a41", // Etwas helleres Grün für Zellen
      cellBorder: "#99B9AB", // Haupt-Grün für Umrandung
      cellSelected: "#b5d1c6", // Helleres Grün für Auswahl
      cellFound: "#d1e8df", // Noch helleres Grün für gefundene Zellen
      textShadow: "0 0 5px rgba(153, 185, 171, 0.8)", // Grün-Glow für Text
      titleShadow: "0 0 10px rgba(153, 185, 171, 0.9)" // Stärkerer Grün-Glow für Titel
    }
  },
  { // Level 10
    colorScheme: {
      bg: "#47204a", // Dunkle Mischung für Hintergrund
      cellBg: "#562959", // Etwas hellere Mischung für Zellen
      cellBorder: "#d69f46", // Mischung aus Gelb und Violett
      cellSelected: "#e9b86a", // Hellere Mischung für Auswahl
      cellFound: "#ffd492", // Noch hellere Mischung für gefundene Zellen
      textShadow: "0 0 5px rgba(214, 159, 70, 0.8)", // Gelb-Violett-Glow für Text
      titleShadow: "0 0 10px rgba(214, 159, 70, 0.9)" // Stärkerer Gelb-Violett-Glow für Titel
    }
  }
];
