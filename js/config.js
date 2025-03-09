/**
 * Konfiguration für das Mandarinen-Spiel
 * Steuert den Spielmodus, die Stems und die Textinhalte
 */
const APP_CONFIG = {
  // Modus: "BETA", "PRE_RELEASE" oder "RELEASE"
  MODE: "PRE_RELEASE",
  
  // Release-Datum
  RELEASE_DATE: new Date("2025-03-21T00:00:00"),
  
  // Texte für jeden Modus
  TEXTS: {
    BETA: {
      ALBUM_STATUS: "Demo-Version",
      ALBUM_INFO: "Das neue Album kommt bald",
      END_MESSAGE: "Die Single 'Mandarinen' erscheint am 21. März 2025!"
    },
    PRE_RELEASE: {
      ALBUM_STATUS: "Vorankündigung",
      ALBUM_INFO: "Die neue Single erscheint am 21. März",
      END_MESSAGE: "Die Single 'Mandarinen' erscheint am 21. März 2025!"
    },
    RELEASE: {
      ALBUM_STATUS: "Jetzt erhältlich",
      ALBUM_INFO: "Die neue Single jetzt überall verfügbar",
      END_MESSAGE: "Die Single 'Mandarinen' ist jetzt überall erhältlich!"
    }
  },
  
  // Stem-Konfiguration für jeden Modus
  STEMS: {
    BETA: [
      { file: "01B_piano.mp3", name: "Piano (Basis)" },
      { file: "02B_bass.mp3", name: "Bass" },
      { file: "03B_drums.mp3", name: "Schlagzeug" },
      { file: "04B_guitars.mp3", name: "Gitarren" },
      { file: "05B_others.mp3", name: "Weitere Instrumente" },
      { file: "06B_vocals.mp3", name: "Gesang (Demo)" }
    ],
    PRE_RELEASE: [
      { file: "01_piano.mp3", name: "Piano (Basis)" },
      { file: "02_bass.mp3", name: "Bass" },
      { file: "03_drums.mp3", name: "Schlagzeug" },
      { file: "04_guitars.mp3", name: "Gitarren" },
      { file: "05_strings.mp3", name: "Streicher" },
      { file: "06_synths_fx.mp3", name: "Synths & FX" }
    ],
    RELEASE: [
      { file: "01_piano.mp3", name: "Piano (Basis)" },
      { file: "02R_bass_drums.mp3", name: "Bass & Drums" },
      { file: "04_guitars.mp3", name: "Gitarren" },
      { file: "05_strings.mp3", name: "Streicher" },
      { file: "06_synths_fx.mp3", name: "Synths & FX" },
      { file: "07_vocals.mp3", name: "Gesang" }
    ]
  }
};

// Konfiguration initialisieren und gespeicherten Modus laden
function initConfig() {
  // Modus aus URL-Parametern prüfen (für einfaches Testen)
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  
  if (modeParam && ['BETA', 'PRE_RELEASE', 'RELEASE'].includes(modeParam.toUpperCase())) {
    APP_CONFIG.MODE = modeParam.toUpperCase();
    console.log(`Modus aus URL gesetzt: ${APP_CONFIG.MODE}`);
    return;
  }
  
  // Modus aus localStorage prüfen
  const savedMode = localStorage.getItem('app_mode');
  if (savedMode && ['BETA', 'PRE_RELEASE', 'RELEASE'].includes(savedMode)) {
    APP_CONFIG.MODE = savedMode;
    console.log(`Modus aus Speicher geladen: ${APP_CONFIG.MODE}`);
  }
}

// Konfiguration initialisieren
initConfig();
