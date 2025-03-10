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
  if (!window.APP_CONFIG) {
    console.warn("APP_CONFIG nicht gefunden, UI-Update übersprungen");
    return;
  }
  
  const mode = window.APP_CONFIG.MODE;
  const texts = window.APP_CONFIG.TEXTS[mode];
  
  if (!texts) {
    console.warn(`Texte für Modus ${mode} nicht gefunden`);
    return;
  }
  
  console.log(`UI wird für Modus ${mode} aktualisiert...`);
  
  // Album-Info im Cover-Modal aktualisieren
  const coverInfo = document.querySelector('.cover-info p');
  if (coverInfo) {
    coverInfo.textContent = texts.ALBUM_INFO;
  }
  
  // Album-Status im Cover-Modal aktualisieren
  const coverTitle = document.querySelector('.cover-info h3');
  if (coverTitle) {
    coverTitle.textContent = "Alexandra Janzen - Mandarinen";
  }
  
  // End-Message aktualisieren
  const endMessage = document.getElementById('endMessage');
  if (endMessage) {
    endMessage.innerHTML = texts.END_MESSAGE;
  }
  
  // Wenn im PRE_RELEASE oder BETA Modus, evtl. Release-Datum anzeigen
  if (mode === 'BETA' || mode === 'PRE_RELEASE') {
    // Optional: Release-Countdown hinzufügen
    addReleaseCountdown();
  }
  
  // Modus-Badge anzeigen (optional)
  showModeBadge(mode);
  
  // WICHTIG: Wortliste neu rendern, wenn GameInstance existiert
  refreshWordList();
  
  console.log(`UI für Modus ${mode} aktualisiert`);
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
 * Zeigt einen Countdown zum Release an
 */
function addReleaseCountdown() {
  if (!window.APP_CONFIG.RELEASE_DATE) return;
  
  const releaseDate = new Date(window.APP_CONFIG.RELEASE_DATE);
  const now = new Date();
  
  // Wenn das Release-Datum bereits vorbei ist, nichts anzeigen
  if (now >= releaseDate) return;
  
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
  countdown.innerHTML = `<span>Release in ${diffDays} Tagen</span>`;
  
  // Zum Dokument hinzufügen
  document.body.appendChild(countdown);
}

/**
 * Zeigt das Admin-Panel zum Umschalten zwischen Modi an
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
          ${window.APP_CONFIG.STEMS[window.APP_CONFIG.MODE].map(stem => 
            `<li>${stem.name}: ${stem.file}</li>`
          ).join('')}
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
      updateUIByMode();
      
      // StemAudioManager aktualisieren, falls ein Spiel läuft
      if (window.gameInstance && gameInstance.stemAudioManager) {
        try {
          // Stems zurücksetzen (sonst könnten alte bestehen bleiben)
          gameInstance.stemAudioManager.resetToBaseStem();
          
          // Stemfiles in der Konfiguration aktualisieren
          gameInstance.stemAudioManager.stemFiles = window.APP_CONFIG.STEMS[window.APP_CONFIG.MODE].map(stem => stem.file);
          
          // Aktualisierung des Managers anzeigen
          console.log("StemAudioManager für neuen Modus aktualisiert");
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
    }
    
    // Forciertes Update der Wortliste
    if (typeof renderWordList === 'function' && window.gameInstance) {
      try {
        renderWordList(
          gameInstance.targetWords,
          gameInstance.foundWords,
          gameInstance.currentDifficulty,
          gameInstance.domElements.wordList
        );
        console.log("Wortliste manuell neu gerendert");
        showModalMessage("Wortliste aktualisiert");
      } catch (err) {
        console.error("Fehler beim manuellen Rendern:", err);
        showModalMessage("Fehler beim Update: " + err.message);
      }
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
 * Aktualisiert die Wortliste und Icons im aktuellen Spiel
 */
function refreshWordList() {
  // Prüfen, ob ein Spiel läuft
  if (window.gameInstance) {
    console.log("Versuche Wortliste zu aktualisieren für Modus:", window.APP_CONFIG.MODE);
    
    // Wenn renderWordList und die erforderlichen Eigenschaften existieren
    if (typeof renderWordList === 'function' && 
        gameInstance.targetWords && 
        gameInstance.foundWords && 
        gameInstance.currentDifficulty && 
        gameInstance.domElements && 
        gameInstance.domElements.wordList) {
      
      try {
        // Wortliste mit den aktuellen Spielwerten neu rendern
        renderWordList(
          gameInstance.targetWords,
          gameInstance.foundWords,
          gameInstance.currentDifficulty,
          gameInstance.domElements.wordList
        );
        
        console.log("Wortliste erfolgreich aktualisiert");
      } catch (err) {
        console.error("Fehler beim Aktualisieren der Wortliste:", err);
      }
    } else {
      console.warn("Kann Wortliste nicht aktualisieren - nicht alle erforderlichen Eigenschaften verfügbar");
    }
  } else {
    console.log("Kein laufendes Spiel gefunden, Wortliste nicht aktualisiert");
  }
}

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
  setTimeout(function() {
    if (window.APP_CONFIG) {
      updateUIByMode();
    } else {
      console.warn("APP_CONFIG immer noch nicht verfügbar trotz ready-Event");
    }
  }, 50);
});

/**
 * UI aktualisieren, wenn das Dokument geladen ist
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOMContentLoaded in mode-manager.js");
  
  // Versuche direktes Update, falls APP_CONFIG bereits verfügbar ist
  if (window.APP_CONFIG) {
    console.log("APP_CONFIG bereits verfügbar, starte direktes UI-Update");
    setTimeout(updateUIByMode, 50);
  } else {
    console.log("APP_CONFIG noch nicht verfügbar, warte auf Event");
    
    // Falls das Event nicht ausgelöst wird, Fallback mit Polling
    let attempts = 0;
    const maxAttempts = 10;
    
    function checkConfig() {
      attempts++;
      
      if (window.APP_CONFIG) {
        console.log("APP_CONFIG gefunden nach " + attempts + " Versuchen, UI wird aktualisiert");
        updateUIByMode();
      } else if (attempts < maxAttempts) {
        console.log("Warte auf APP_CONFIG... (Versuch " + attempts + "/" + maxAttempts + ")");
        setTimeout(checkConfig, 300);
      } else {
        console.error("APP_CONFIG konnte nicht gefunden werden nach " + maxAttempts + " Versuchen");
      }
    }
    
    // Starte das Polling nach einer kurzen Verzögerung
    setTimeout(checkConfig, 300);
  }
});

/**
 * Hinzufügen eines CSS-Styles für die Nachrichtenbox
 */
const messageStyle = document.createElement('style');
messageStyle.textContent = `
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