/**
 * Komplette überarbeitete config.js
 * Das Hauptproblem: APP_CONFIG muss explizit global sein
 */

// WICHTIG: Explizit window.APP_CONFIG verwenden, um es global zu machen
window.APP_CONFIG = {
  // Modus: "BETA", "PRE_RELEASE" oder "RELEASE"
  MODE: "RELEASE",  // Geändert von PRE_RELEASE auf RELEASE
  
  // Release-Datum
  RELEASE_DATE: new Date("2025-03-21T00:00:00"),
  
  // Texte für jeden Modus (Keys für die Übersetzung)
  TEXTS: {
    BETA: {
      ALBUM_STATUS_KEY: "config_texts_beta_status",
      ALBUM_INFO_KEY: "config_texts_beta_info",
      END_MESSAGE_KEY: "config_texts_beta_end"
    },
    PRE_RELEASE: {
      ALBUM_STATUS_KEY: "config_texts_prerelease_status",
      ALBUM_INFO_KEY: "config_texts_prerelease_info",
      END_MESSAGE_KEY: "config_texts_prerelease_end"
    },
    RELEASE: {
      ALBUM_STATUS_KEY: "config_texts_release_status",
      ALBUM_INFO_KEY: "config_texts_release_info",
      END_MESSAGE_KEY: "config_texts_release_end"
    }
  },

  // Stem-Konfiguration für jeden Modus (nur Dateinamen, Namen werden über Keys geladen)
  STEMS: {
    BETA: [
      { file: "01B_piano.mp3" }, // name removed
      { file: "02B_bass.mp3" },
      { file: "03B_drums.mp3" },
      { file: "04B_guitars.mp3" },
      { file: "05B_others.mp3" },
      { file: "06B_vocals.mp3" }
    ],
    PRE_RELEASE: [
      { file: "01_piano.mp3" },
      { file: "02_bass.mp3" },
      { file: "03_drums.mp3" },
      { file: "04_guitars.mp3" },
      { file: "05_strings.mp3" },
      { file: "06_synths_fx.mp3" }
    ],
    RELEASE: [
      { file: "01_piano.mp3" },
      { file: "02R_bass_drums.mp3" },
      { file: "04_guitars.mp3" },
      { file: "05_strings.mp3" },
      { file: "06_synths_fx.mp3" },
      { file: "07_vocals.mp3" }
    ]
  }
};

// DEBUG-Log
console.log("config.js: APP_CONFIG global initialisiert", window.APP_CONFIG);

/**
 * Initialisiert die Konfiguration aus URL-Parametern oder localStorage
 */
function initConfig() {
  // FORCE RELEASE bei jedem Laden
  localStorage.setItem('app_mode', 'RELEASE');
  
  // Modus aus URL-Parametern prüfen (für einfaches Testen)
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  
  if (modeParam && ['BETA', 'PRE_RELEASE', 'RELEASE'].includes(modeParam.toUpperCase())) {
    window.APP_CONFIG.MODE = modeParam.toUpperCase();
    console.log(`Modus aus URL gesetzt: ${window.APP_CONFIG.MODE}`);
    localStorage.setItem('app_mode', window.APP_CONFIG.MODE); // Auch im Storage speichern
    return;
  }
  
  // Modus aus localStorage prüfen
  const savedMode = localStorage.getItem('app_mode');
  if (savedMode && ['BETA', 'PRE_RELEASE', 'RELEASE'].includes(savedMode)) {
    window.APP_CONFIG.MODE = savedMode;
    console.log(`Modus aus Speicher geladen: ${window.APP_CONFIG.MODE}`);
  } else {
    console.log(`Standard-Modus verwendet: ${window.APP_CONFIG.MODE}`);
  }
  
  // Event auslösen, wenn die Konfiguration bereit ist
  document.dispatchEvent(new CustomEvent('app-config-ready'));
}

// Konfiguration initialisieren
initConfig();

/**
 * Event-Listener für den app-config-ready Event (für mode-manager.js)
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("config.js: Dokument geladen, APP_CONFIG Status:", !!window.APP_CONFIG);
  
  // Nach kurzer Verzögerung das Event erneut auslösen (falls mode-manager das erste verpasst hat)
  setTimeout(function() {
    document.dispatchEvent(new CustomEvent('app-config-ready'));
    console.log("config.js: app-config-ready Event erneut ausgelöst");
  }, 500);
});
