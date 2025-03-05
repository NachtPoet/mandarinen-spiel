// Leveldaten für das Mandarinen-Spiel
const GAME_LEVELS = [
  {
    lyric: `Ich versteck mich
Und du zählst bis zehn
Mein Kinderlachen
Durch die Gardinen zu sehen
Reißt alle Schränke auf
Nur Liebe hier im Haus
Wir sehen glücklich aus`,
    colorScheme: {
      bg: "#0a1721",
      cellBg: "#152736",
      cellBorder: "#ff8c00",
      cellSelected: "#ff8c00",
      cellFound: "#ffd700",
      textShadow: "0 0 5px #ff8c00",
      titleShadow: "0 0 10px #ff8c00"
    },
    targetWords: ["VERSTECK", "KINDER", "GARDINEN", "SCHRÄNKE", "GLÜCKLICH"],
    quote: "Kindheit ist wie eine Mandarinenschale - ihr Duft bleibt ein Leben lang in Erinnerung."
  },
  {
    lyric: `Du spielst Gitarre
Und wir singen "Let It Be"
Wir bauen Burgen
Sofakissen-Fantasien
Und wenn wir Abschied nehmen
Gibst du mir Mandarinen
Bis wir uns wiedersehen`,
    colorScheme: {
      bg: "#001f3f",
      cellBg: "#002f4b",
      cellBorder: "#0074D9",
      cellSelected: "#0074D9",
      cellFound: "#7FDBFF",
      textShadow: "0 0 5px #0074D9",
      titleShadow: "0 0 10px #0074D9"
    },
    targetWords: ["GITARRE", "BURGEN", "FANTASIEN", "ABSCHIED", "MANDARINEN"],
    quote: "In jedem Abschied liegt der Keim eines Wiedersehens, in jeder Mandarine die Süße der Erinnerung."
  },
  {
    lyric: `Doch aus Tagen wurden Jahre
Zwischen uns wurden Mauern gebaut
Hast mir gefehlt, so viele Male
Und ich dir auch`,
    colorScheme: {
      bg: "#2e003e",
      cellBg: "#3a0f4a",
      cellBorder: "#b10dc9",
      cellSelected: "#b10dc9",
      cellFound: "#e4a1f7",
      textShadow: "0 0 5px #b10dc9",
      titleShadow: "0 0 10px #b10dc9"
    },
    targetWords: ["TAGEN", "JAHRE", "MAUERN", "FEHLT", "VIELE"],
    quote: "Zeit baut manchmal Mauern, doch wahre Verbindungen finden immer einen Weg hindurch."
  },
  {
    lyric: `Wir sind immer miteinander verbunden
Können uns nie verloren gehen
Auch getrennt in den dunkelsten Stunden
Was wir haben wird nie vergehen`,
    colorScheme: {
      bg: "#003300",
      cellBg: "#004d00",
      cellBorder: "#00cc00",
      cellSelected: "#00cc00",
      cellFound: "#99ff99",
      textShadow: "0 0 5px #00cc00",
      titleShadow: "0 0 10px #00cc00"
    },
    targetWords: ["VERBUNDEN", "VERLOREN", "DUNKELSTEN", "VERGEHEN", "HABEN"],
    quote: "Selbst in den dunkelsten Stunden leuchten die hellsten Erinnerungen am stärksten."
  },
  {
    lyric: `Durch alle Kurven, Serpentinen
An Regentagen Fehler verzieh'n
Du warst so viele Jahre nicht da
Aber nie weg
Ich hab immer Mandarinen im Gepäck`,
    colorScheme: {
      bg: "#3e1f0f",
      cellBg: "#4a2f1b",
      cellBorder: "#ff851b",
      cellSelected: "#ff8c00",
      cellFound: "#ffdc00",
      textShadow: "0 0 5px #ff851b",
      titleShadow: "0 0 10px #ff851b"
    },
    targetWords: ["KURVEN", "SERPENTINEN", "REGENTAGEN", "FEHLER", "MANDARINEN"],
    quote: "Auf kurvenreichen Wegen des Lebens sind es die kleinen Symbole, die uns Halt geben."
  },
  {
    lyric: `Gedanken zittern
Klopf an deine Tür
Entspannte Schritte
Und dann stehst du vor mir
In deinen Armen
Das letzte Puzzleteil
So viele Wunden heilen`,
    colorScheme: {
      bg: "#330033",
      cellBg: "#440044",
      cellBorder: "#cc33ff",
      cellSelected: "#cc33ff",
      cellFound: "#e6b3ff",
      textShadow: "0 0 5px #cc33ff",
      titleShadow: "0 0 10px #cc33ff"
    },
    targetWords: ["ZITTERN", "TÜR", "SCHRITTE", "PUZZLETEIL", "WUNDEN"],
    quote: "Manchmal heilen alte Wunden erst, wenn wir den Mut finden, an vergessene Türen zu klopfen."
  },
  {
    lyric: `Die Haare grau doch
Ein vertrauter Blick
Wir beide lachen
Verlorene Zeit zurück
Vergilbte Bilder
In alten Holzvitrinen
Und da zwei Mandarinen`,
    colorScheme: {
      bg: "#222222",
      cellBg: "#333333",
      cellBorder: "#aaaaaa",
      cellSelected: "#aaaaaa",
      cellFound: "#dddddd",
      textShadow: "0 0 5px #aaaaaa",
      titleShadow: "0 0 10px #aaaaaa"
    },
    targetWords: ["HAARE", "BLICK", "LACHEN", "BILDER", "VITRINEN"],
    quote: "In einem vertrauten Blick liegt mehr Geschichte als in tausend Bildern."
  },
  {
    lyric: `Und aus Jahren wurden Tage
Aus Mauersteinen bauten wir einen Weg
All die verpassten ersten Male
Tun nicht mehr so weh`,
    colorScheme: {
      bg: "#1a1a1a",
      cellBg: "#2a2a2a",
      cellBorder: "#ff6600",
      cellSelected: "#ff6600",
      cellFound: "#ffcc00",
      textShadow: "0 0 5px #ff6600",
      titleShadow: "0 0 10px #ff6600"
    },
    targetWords: ["TAGE", "MAUERSTEINE", "ERSTEN", "MALE", "WEH"],
    quote: "Aus den Steinen, die uns einst trennten, bauen wir heute die Brücken, die uns verbinden."
  },
  {
    lyric: `Wir sind immer miteinander verbunden
Können uns nie verloren gehen
Auch getrennt in den dunkelsten Stunden
Was wir haben wird nie vergehen`,
    colorScheme: {
      bg: "#003300",
      cellBg: "#004d00",
      cellBorder: "#00cc00",
      cellSelected: "#00cc00",
      cellFound: "#99ff99",
      textShadow: "0 0 5px #00cc00",
      titleShadow: "0 0 10px #00cc00"
    },
    targetWords: ["VERBUNDEN", "VERLOREN", "DUNKELSTEN", "VERGEHEN", "HABEN"],
    quote: "Wahre Verbindungen kennen keine Entfernung, keine Zeit und keine Grenzen."
  },
  {
    lyric: `Durch alle Kurven, Serpentinen
An Regentagen Fehler verzieh'n
Du warst so viele Jahre nicht da
Aber nie weg
Ich hab immer Mandarinen im Gepäck`,
    colorScheme: {
      bg: "#3e1f0f",
      cellBg: "#4a2f1b",
      cellBorder: "#ff851b",
      cellSelected: "#ff851b",
      cellFound: "#ffdc00",
      textShadow: "0 0 5px #ff851b",
      titleShadow: "0 0 10px #ff851b"
    },
    targetWords: ["KURVEN", "SERPENTINEN", "REGENTAGEN", "FEHLER", "MANDARINEN"],
    quote: "Am Ende jeder Reise steht die Erkenntnis: Es sind nicht die Orte, die wir besuchen, sondern die Menschen, die wir mitnehmen."
  }
];
