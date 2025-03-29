/**
 * mode-manager.js - Verwaltet die verschiedenen Modi des Spiels
 * Steuert die UI-Anpassungen und das Admin-Panel
 */

// DEBUG-Info
console.log("mode-manager.js geladen, APP_CONFIG verfügbar:", !!window.APP_CONFIG);

/**
 * Aktualisiert die UI basierend auf dem aktuellen Modus
 */
function updateUIByMode() {
  // WICHTIG: Verwenden von window.APP_CONFIG statt APP_CONFIG
  if (!window.APP_CONFIG || !window.localization) {
    console.warn("APP_CONFIG oder localization nicht gefunden, UI-Update übersprungen");
    return;
  }

  const mode = window.APP_CONFIG.MODE;
  const textKeys = window.APP_CONFIG.TEXTS[mode]; // Get keys for the current mode

  if (!textKeys) {
    console.warn(`Text-Keys für Modus ${mode} nicht gefunden`);
    return;
  }

  console.log(`UI wird für Modus ${mode} aktualisiert...`);

  // Album-Info im Cover-Modal aktualisieren (using key)
  const coverInfo = document.querySelector('.cover-info p[data-translate="coverModalInfo"]');
  if (coverInfo) {
    // The actual text update is handled by localization.updateUI() via data-translate attribute.
    // We might need to trigger an update here if this runs before the main updateUI.
    // However, let's rely on the data-translate attribute for now.
    // If specific elements need immediate update based on mode *before* localization runs,
    // we might need to translate here:
    // coverInfo.textContent = localization.translate(textKeys.ALBUM_INFO_KEY);
  }

  // Album-Status im Cover-Modal aktualisieren (Titel bleibt gleich, Info wird übersetzt)
  const coverTitle = document.querySelector('.cover-info h3[data-translate="coverModalTitle"]');
  // Title text is handled by data-translate

  // End-Message aktualisieren (wird in GameManager.updateEndScreenContent gehandhabt)
  // const endMessage = document.getElementById('endMessage');
  // if (endMessage) {
  //   endMessage.innerHTML = localization.translate(textKeys.END_MESSAGE_KEY);
  // }

  // Wenn im PRE_RELEASE oder BETA Modus, evtl. Release-Datum anzeigen
  if (mode === 'BETA' || mode === 'PRE_RELEASE') {
    // Optional: Release-Countdown hinzufügen
    addReleaseCountdown();
  } else {
      // Remove countdown if in RELEASE mode
      const existingCountdown = document.getElementById('release-countdown');
      if (existingCountdown) existingCountdown.remove();
  }

  // Modus-Badge anzeigen (optional)
  showModeBadge(mode);

  // WICHTIG: Wortliste neu rendern, wenn GameInstance existiert
  // This should happen automatically when language changes trigger refreshLevelUI in GameManager
  // refreshWordList(); // Removed direct call, handled by GameManager listener

  console.log(`UI für Modus ${mode} aktualisiert`);
  // Trigger a general UI update to apply all translations based on data-attributes
  if (window.localization && typeof window.localization.updateUI === 'function') {
      window.localization.updateUI();
  }
}

/**
 * Zeigt ein dezentes Badge an, das den aktuellen Modus anzeigt
 */
function showModeBadge(mode) {
  // Vorhandenes Badge entfernen, falls es existiert
  const existingBadge = document.getElementById('mode-badge');
  if (existingBadge) {
    existingBadge.remove();
  }

  // Nur im BETA oder PRE_RELEASE Modus ein Badge anzeigen
  if (mode === 'RELEASE') {
    return;
  }

  // Badge erstellen
  const badge = document.createElement('div');
  badge.id = 'mode-badge';
  badge.className = 'mode-badge';

  // Text und Farbe je nach Modus
  if (mode === 'BETA') {
    badge.textContent = 'BETA';
    badge.style.backgroundColor = 'rgba(99, 29, 118, 0.7)';
  } else {
    badge.textContent = 'PRE-RELEASE';
    badge.style.backgroundColor = 'rgba(255, 140, 0, 0.7)';
  }

  // Zum Dokument hinzufügen
  document.body.appendChild(badge);

  // Nach Klick auf Badge Admin-Panel öffnen
  badge.addEventListener('click', function(e) {
    if (e.shiftKey || e.ctrlKey) {
      showAdminPanel();
    }
  });
}

/**
 * Zeigt einen Countdown zum Release an - KORRIGIERTE VERSION
 */
function addReleaseCountdown() {
  if (!window.APP_CONFIG || !window.APP_CONFIG.RELEASE_DATE) {
    console.warn("Release-Datum nicht verfügbar, Countdown wird nicht angezeigt");
    return;
  }

  const releaseDate = new Date(window.APP_CONFIG.RELEASE_DATE);
  const now = new Date();

  // Wenn das Release-Datum bereits vorbei ist, nichts anzeigen
  if (now >= releaseDate) {
    console.log("Release-Datum bereits vergangen, Countdown wird nicht angezeigt");
    // Ensure existing countdown is removed if date passed
    const existingCountdown = document.getElementById('release-countdown');
    if (existingCountdown) existingCountdown.remove();
    return;
  }

  // Tage bis zum Release berechnen
  const diffTime = releaseDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Vorhandenen Countdown entfernen, falls er existiert
  const existingCountdown = document.getElementById('release-countdown');
  if (existingCountdown) {
    existingCountdown.remove();
  }

  // Countdown-Element erstellen
  const countdown = document.createElement('div');
  countdown.id = 'release-countdown';
  countdown.className = 'release-countdown';

  // Aktuellen Modus als data-Attribut für CSS speichern
  countdown.setAttribute('data-mode', window.APP_CONFIG.MODE);

  // Nur "Release in X Tagen" - ohne PRE-RELEASE (kommt per CSS)
  // TODO: Translate this string if needed
  countdown.innerHTML = `<span>Release in ${diffDays} Tagen</span>`;

  // Zum Dokument hinzufügen
  document.body.appendChild(countdown);

  console.log(`Release-Countdown wurde erstellt: noch ${diffDays} Tage bis zum Release am ${releaseDate.toLocaleDateString()}`);
}

/**
 * Öffnet das Admin-Panel zum Umschalten zwischen Modi an
 */
function showAdminPanel() {
  // Vorhandenes Panel entfernen, falls es existiert
  const existingModal = document.querySelector('.admin-modal');
  if (existingModal) {
    existingModal.remove();
    return;
  }

  // Modal-Container erstellen
  const modal = document.createElement('div');
  modal.className = 'admin-modal';

  // Get current stem names using translation
  let stemListHTML = 'Stems nicht verfügbar';
  if (window.APP_CONFIG && window.APP_CONFIG.STEMS && window.APP_CONFIG.STEMS[window.APP_CONFIG.MODE] && window.localization && window.gameInstance) {
      stemListHTML = window.APP_CONFIG.STEMS[window.APP_CONFIG.MODE].map((stem, index) => {
          const stemKey = window.gameInstance.getStemNameKey(index + 1); // Use helper from GameManager
          const stemName = localization.translate(stemKey);
          return `<li>${stemName}: ${stem.file}</li>`;
      }).join('');
  }


  modal.innerHTML = `
    <div class="admin-panel">
      <h3>Admin-Einstellungen</h3>
      <label>
        Spielmodus:
        <select id="mode-selector">
          <option value="BETA" ${window.APP_CONFIG.MODE === 'BETA' ? 'selected' : ''}>Beta</option>
          <option value="PRE_RELEASE" ${window.APP_CONFIG.MODE === 'PRE_RELEASE' ? 'selected' : ''}>Pre-Release</option>
          <option value="RELEASE" ${window.APP_CONFIG.MODE === 'RELEASE' ? 'selected' : ''}>Release</option>
        </select>
      </label>
      <div class="admin-info">
        <p>Aktiver Modus: <strong>${window.APP_CONFIG.MODE}</strong></p>
        <p>Aktuelle Stems:</p>
        <ul>
          ${stemListHTML}
        </ul>
      </div>
      <div class="admin-buttons">
        <button id="save-mode">Speichern & Neu laden</button>
        <button id="apply-mode">Anwenden (ohne Neuladen)</button>
        <button id="debug-mode">Debug-Update</button>
        <button id="cancel-mode">Schließen</button>
      </div>
    </div>
  `;

  // Zum Dokument hinzufügen
  document.body.appendChild(modal);

  // Event-Handler
  document.getElementById('save-mode').addEventListener('click', function() {
    const newMode = document.getElementById('mode-selector').value;
    localStorage.setItem('app_mode', newMode);
    location.reload(); // Seite neu laden
  });

  // Anwenden ohne Neuladen
  document.getElementById('apply-mode').addEventListener('click', function() {
    const newMode = document.getElementById('mode-selector').value;
    if (newMode !== window.APP_CONFIG.MODE) {
      // Modus speichern
      localStorage.setItem('app_mode', newMode);
      window.APP_CONFIG.MODE = newMode;

      // UI aktualisieren
      updateUIByMode(); // This will trigger localization.updateUI()

      // StemAudioManager aktualisieren, falls ein Spiel läuft
      if (window.gameInstance && gameInstance.stemAudioManager) {
        try {
          // Stems zurücksetzen (sonst könnten alte bestehen bleiben)
          gameInstance.stemAudioManager.resetToBaseStem();

          // Stemfiles in der Konfiguration aktualisieren (nur file nötig)
          gameInstance.stemAudioManager.stemFiles = window.APP_CONFIG.STEMS[window.APP_CONFIG.MODE].map(stem => stem.file);

          // Aktualisierung des Managers anzeigen
          console.log("StemAudioManager für neuen Modus aktualisiert");

          // Wortliste neu rendern, da Stem-Namen sich ändern könnten
          gameInstance.refreshLevelUI();

        } catch (err) {
          console.error("Fehler bei StemAudioManager-Update:", err);
        }
      }

      // Modal schließen und Erfolg anzeigen
      modal.remove();
      showModalMessage(`Modus auf ${newMode} geändert. Die UI wurde aktualisiert.`);
    } else {
      // Wenn der Modus gleich bleibt
      modal.remove();
    }
  });

  // Debug-Button hinzugefügt
  document.getElementById('debug-mode').addEventListener('click', function() {
    console.log("=== DEBUG INFO ===");
    console.log("APP_CONFIG global verfügbar:", !!window.APP_CONFIG);
    console.log("Aktueller Modus:", window.APP_CONFIG.MODE);
    console.log("GameInstance verfügbar:", !!window.gameInstance);

    if (window.gameInstance) {
      console.log("StemAudioManager verfügbar:", !!gameInstance.stemAudioManager);
      console.log("Wortliste verfügbar:", !!gameInstance.domElements.wordList);
      console.log("RenderWordList Funktion verfügbar:", typeof renderWordList === 'function');
      console.log("Localization verfügbar:", !!window.localization);
      console.log("Aktuelle Sprache:", localization.getCurrentLanguage());
      console.log("Target Words:", gameInstance.targetWords);
    }

    // Forciertes Update der Wortliste
    if (typeof renderWordList === 'function' && window.gameInstance && window.localization) {
      try {
        renderWordList(
          gameInstance.targetWords,
          gameInstance.foundWords,
          gameInstance.currentDifficulty,
          gameInstance.domElements.wordList,
          localization.translate, // Pass translate function
          gameInstance.getStemNameKey.bind(gameInstance) // Pass key function
        );
        console.log("Wortliste manuell neu gerendert");
        showModalMessage("Wortliste aktualisiert");
      } catch (err) {
        console.error("Fehler beim manuellen Rendern:", err);
        showModalMessage("Fehler beim Update: " + err.message);
      }
    }

    // Countdown manuell aktualisieren
    try {
      addReleaseCountdown();
      console.log("Release-Countdown manuell aktualisiert");
    } catch (err) {
      console.error("Fehler beim manuellen Countdown-Update:", err);
    }
  });

  document.getElementById('cancel-mode').addEventListener('click', function() {
    modal.remove();
  });

  // Schließen, wenn außerhalb geklickt wird
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/**
 * Aktualisiert die Wortliste und Icons im aktuellen Spiel (DEPRECATED - handled by GameManager)
 */
// function refreshWordList() {
//   // Prüfen, ob ein Spiel läuft
//   if (window.gameInstance && window.localization) {
//     console.log("Versuche Wortliste zu aktualisieren für Modus:", window.APP_CONFIG.MODE);

//     // Wenn renderWordList und die erforderlichen Eigenschaften existieren
//     if (typeof renderWordList === 'function' &&
//         gameInstance.targetWords &&
//         gameInstance.foundWords &&
//         gameInstance.currentDifficulty &&
//         gameInstance.domElements &&
//         gameInstance.domElements.wordList &&
//         typeof gameInstance.getStemNameKey === 'function') { // Check for key function

//       try {
//         // Wortliste mit den aktuellen Spielwerten neu rendern
//         renderWordList(
//           gameInstance.targetWords,
//           gameInstance.foundWords,
//           gameInstance.currentDifficulty,
//           gameInstance.domElements.wordList,
//           localization.translate, // Pass translate function
//           gameInstance.getStemNameKey.bind(gameInstance) // Pass key function
//         );

//         console.log("Wortliste erfolgreich aktualisiert");
//       } catch (err) {
//         console.error("Fehler beim Aktualisieren der Wortliste:", err);
//       }
//     } else {
//       console.warn("Kann Wortliste nicht aktualisieren - nicht alle erforderlichen Eigenschaften verfügbar");
//     }
//   } else {
//     console.log("Kein laufendes Spiel gefunden oder localization fehlt, Wortliste nicht aktualisiert");
//   }
// }

/**
 * Zeigt eine kurze Nachricht an
 * @param {string} message - Die anzuzeigende Nachricht
 */
function showModalMessage(message) {
  const messageBox = document.createElement('div');
  messageBox.className = 'modal-message';
  messageBox.innerHTML = `<p>${message}</p>`;

  document.body.appendChild(messageBox);

  // Nach kurzer Zeit ausblenden und entfernen
  setTimeout(() => {
    messageBox.classList.add('fade-out');
    setTimeout(() => {
      if (document.body.contains(messageBox)) {
        document.body.removeChild(messageBox);
      }
    }, 500);
  }, 2000);
}

/**
 * Tastenkombination Ctrl+Shift+A öffnet das Admin-Panel
 */
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault(); // Browser-Standardverhalten verhindern
    showAdminPanel();
  }
});

/**
 * Event-Listener für den app-config-ready Event
 * Wird in config.js ausgelöst, wenn die Konfiguration bereit ist
 */
document.addEventListener('app-config-ready', function() {
  console.log("app-config-ready Event erkannt, starte UI-Update");

  // Kurze Verzögerung, um sicherzustellen, dass das DOM geladen ist
  // und localization.js initialisiert wurde
  setTimeout(function() {
    if (window.APP_CONFIG && window.localization) { // Check for localization too
      updateUIByMode();
    } else {
      console.warn("APP_CONFIG oder localization immer noch nicht verfügbar trotz ready-Event");
    }
  }, 100); // Increased delay slightly
});

/**
 * UI aktualisieren, wenn das Dokument geladen ist
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOMContentLoaded in mode-manager.js");

  // Versuche direktes Update, falls APP_CONFIG und localization bereits verfügbar sind
  if (window.APP_CONFIG && window.localization) {
    console.log("APP_CONFIG & localization bereits verfügbar, starte direktes UI-Update");
    setTimeout(updateUIByMode, 50);
  } else {
    console.log("APP_CONFIG oder localization noch nicht verfügbar, warte auf Events");

    // Fallback mit Polling, falls Events fehlschlagen
    let attempts = 0;
    const maxAttempts = 15; // Increased attempts

    function checkConfigAndLocalization() {
      attempts++;

      if (window.APP_CONFIG && window.localization) {
        console.log("APP_CONFIG & localization gefunden nach " + attempts + " Versuchen, UI wird aktualisiert");
        updateUIByMode();
      } else if (attempts < maxAttempts) {
        console.log(`Warte auf APP_CONFIG & localization... (Versuch ${attempts}/${maxAttempts})`);
        setTimeout(checkConfigAndLocalization, 300);
      } else {
        console.error("APP_CONFIG oder localization konnte nicht gefunden werden nach " + maxAttempts + " Versuchen");
      }
    }

    // Starte das Polling nach einer kurzen Verzögerung
    setTimeout(checkConfigAndLocalization, 300);
  }
});

/**
 * Hinzufügen eines CSS-Styles für die Nachrichtenbox
 */
const messageStyle = document.createElement('style');
messageStyle.textContent = `
  .admin-modal { /* Style for the admin modal itself */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1999; /* Below message box */
  }
  .admin-panel {
    background: #333;
    color: #eee;
    padding: 20px 30px;
    border-radius: 10px;
    box-shadow: 0 5px 25px rgba(0,0,0,0.5);
    border: 1px solid var(--color-mandarin-bright);
    max-width: 500px;
    width: 90%;
  }
  .admin-panel h3 {
    margin-top: 0;
    color: var(--color-mandarin-bright);
    text-align: center;
  }
  .admin-panel label {
    display: block;
    margin-bottom: 15px;
  }
  .admin-panel select {
    margin-left: 10px;
    padding: 5px;
    background: #444;
    color: #eee;
    border: 1px solid #666;
  }
  .admin-info {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #555;
    font-size: 0.9em;
  }
  .admin-info ul {
    padding-left: 20px;
    max-height: 150px;
    overflow-y: auto;
  }
  .admin-buttons {
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
  }
   .admin-buttons button {
     margin: 5px;
     padding: 8px 12px;
     cursor: pointer;
     background-color: #555;
     color: white;
     border: 1px solid #777;
     border-radius: 4px;
   }
   .admin-buttons button:hover {
     background-color: #666;
   }
   .admin-buttons button#save-mode {
     background-color: var(--color-mandarin-dark);
     border-color: var(--color-mandarin-bright);
   }


  .modal-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 2000;
    box-shadow: 0 0 20px rgba(255, 140, 0, 0.6);
    border: 1px solid var(--color-mandarin-bright);
    animation: fade-in 0.3s ease;
    transition: opacity 0.5s ease;
  }

  .modal-message.fade-out {
    opacity: 0;
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translate(-50%, -60%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
`;
document.head.appendChild(messageStyle);

/**
 * Zusätzliche CSS-Styles für die Icons der neuen Stems
 */
const stemIconStyle = document.createElement('style');
stemIconStyle.textContent = `
  /* Styles für die neuen Stem-Icons */

  /* Streicher-Icon */
  .stem-icon.strings-icon .stem-icon-detail {
    stroke: var(--color-turquoise);
    stroke-width: 1.5;
    fill: none;
  }

  /* Synth-Icon */
  .stem-icon.synth-icon .stem-icon-base {
    stroke: var(--color-mandarin-bright);
    fill: rgba(255, 140, 0, 0.2);
  }

  .stem-icon.synth-icon .stem-icon-detail {
    stroke: var(--color-mandarin-dark);
    fill: none;
  }

  /* Bass+Drums kombiniertes Icon */
  .stem-icon.bass-drums-icon .stem-icon-base {
    stroke: var(--color-red);
    fill: rgba(214, 41, 65, 0.3);
  }

  .stem-icon.bass-drums-icon .stem-icon-detail {
    stroke: var(--color-red-dark);
    fill: rgba(214, 41, 65, 0.1);
  }

  /* PRE_RELEASE spezifische Farben */
  [data-stem="4"].word.found .stem-icon .stem-icon-detail,
  [data-stem="5"].word.found .stem-icon .stem-icon-detail {
    stroke: white !important;
  }

  /* RELEASE spezifische Farben */
  [data-stem="1"].word.found .stem-icon .stem-icon-base {
    fill: rgba(214, 41, 65, 0.5) !important;
  }

  /* Stärkere Badge-Hervorhebung */
  .mode-badge {
    padding: 7px 12px;
    font-weight: bold;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
`;
document.head.appendChild(stemIconStyle);
