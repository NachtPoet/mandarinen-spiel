/**
 * Verwaltet den Spielmodus und aktualisiert die UI
 */

// UI-Elemente nach Modus aktualisieren
function updateUIByMode() {
  const mode = APP_CONFIG.MODE;
  const texts = APP_CONFIG.TEXTS[mode];
  
  // Album-Info aktualisieren
  const coverInfo = document.querySelector('.cover-info p');
  if (coverInfo) {
    coverInfo.textContent = texts.ALBUM_INFO;
  }
  
  // End-Message aktualisieren
  const endMessage = document.getElementById('endMessage');
  if (endMessage) {
    endMessage.innerHTML = texts.END_MESSAGE;
  }
  
  console.log(`UI für Modus aktualisiert: ${mode}`);
}

// Admin-Panel zum Umschalten zwischen Modi anzeigen
function showAdminPanel() {
  const modal = document.createElement('div');
  modal.className = 'admin-modal';
  modal.innerHTML = `
    <div class="admin-panel">
      <h3>Admin-Einstellungen</h3>
      <label>
        Spielmodus:
        <select id="mode-selector">
          <option value="BETA" ${APP_CONFIG.MODE === 'BETA' ? 'selected' : ''}>Beta</option>
          <option value="PRE_RELEASE" ${APP_CONFIG.MODE === 'PRE_RELEASE' ? 'selected' : ''}>Pre-Release</option>
          <option value="RELEASE" ${APP_CONFIG.MODE === 'RELEASE' ? 'selected' : ''}>Release</option>
        </select>
      </label>
      <div class="admin-buttons">
        <button id="save-mode">Speichern</button>
        <button id="cancel-mode">Abbrechen</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event-Handler
  document.getElementById('save-mode').addEventListener('click', function() {
    const newMode = document.getElementById('mode-selector').value;
    localStorage.setItem('app_mode', newMode);
    location.reload(); // Seite neu laden
  });
  
  document.getElementById('cancel-mode').addEventListener('click', function() {
    document.body.removeChild(modal);
  });
}

// Strg+Shift+A öffnet das Admin-Panel
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    showAdminPanel();
  }
});

/**
 * Ergänzungen für mode-manager.js
 * Diese Funktionen sorgen dafür, dass die Benutzeroberfläche komplett aktualisiert wird
 */

/**
 * Aktualisiert die UI basierend auf dem aktuellen Modus
 * Erweitert mit kompletter Aktualisierung der Wortliste
 */
function updateUIByMode() {
  if (!window.APP_CONFIG) {
    console.warn("APP_CONFIG nicht gefunden, UI-Update übersprungen");
    return;
  }
  
  const mode = APP_CONFIG.MODE;
  const texts = APP_CONFIG.TEXTS[mode];
  
  if (!texts) {
    console.warn(`Texte für Modus ${mode} nicht gefunden`);
    return;
  }
  
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
  
  console.log(`UI für Modus aktualisiert: ${mode}`);
}

/**
 * Aktualisiert die Wortliste und Icons im aktuellen Spiel
 * Dies ist entscheidend, um die modusspezifischen Icons anzuzeigen
 */
function refreshWordList() {
  // Prüfen, ob ein Spiel läuft
  if (window.gameInstance) {
    console.log("Aktualisiere Wortliste für Modus: " + APP_CONFIG.MODE);
    
    // Wenn renderWordList und die erforderlichen Eigenschaften existieren
    if (typeof renderWordList === 'function' && 
        gameInstance.targetWords && 
        gameInstance.foundWords && 
        gameInstance.currentDifficulty && 
        gameInstance.domElements && 
        gameInstance.domElements.wordList) {
      
      // Wortliste mit den aktuellen Spielwerten neu rendern
      renderWordList(
        gameInstance.targetWords,
        gameInstance.foundWords,
        gameInstance.currentDifficulty,
        gameInstance.domElements.wordList
      );
      
      console.log("Wortliste erfolgreich aktualisiert");
    } else {
      console.warn("Kann Wortliste nicht aktualisieren - nicht alle erforderlichen Eigenschaften verfügbar");
    }
  } else {
    console.log("Kein laufendes Spiel gefunden, Wortliste nicht aktualisiert");
  }
}

/**
 * Zeigt das Admin-Panel zum Umschalten zwischen Modi an
 * Erweitert mit Wortlisten-Aktualisierung
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
          <option value="BETA" ${APP_CONFIG.MODE === 'BETA' ? 'selected' : ''}>Beta</option>
          <option value="PRE_RELEASE" ${APP_CONFIG.MODE === 'PRE_RELEASE' ? 'selected' : ''}>Pre-Release</option>
          <option value="RELEASE" ${APP_CONFIG.MODE === 'RELEASE' ? 'selected' : ''}>Release</option>
        </select>
      </label>
      <div class="admin-info">
        <p>Aktiver Modus: <strong>${APP_CONFIG.MODE}</strong></p>
        <p>Aktuelle Stems:</p>
        <ul>
          ${APP_CONFIG.STEMS[APP_CONFIG.MODE].map(stem => 
            `<li>${stem.name}: ${stem.file}</li>`
          ).join('')}
        </ul>
      </div>
      <div class="admin-buttons">
        <button id="save-mode">Speichern & Neu laden</button>
        <button id="apply-mode">Anwenden (ohne Neuladen)</button>
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
  
  // Neuer Button: Modus anwenden ohne Neuladen
  document.getElementById('apply-mode').addEventListener('click', function() {
    const newMode = document.getElementById('mode-selector').value;
    if (newMode !== APP_CONFIG.MODE) {
      // Modus speichern
      localStorage.setItem('app_mode', newMode);
      APP_CONFIG.MODE = newMode;
      
      // UI aktualisieren
      updateUIByMode();
      
      // StemAudioManager aktualisieren, falls ein Spiel läuft
      if (window.gameInstance && gameInstance.stemAudioManager) {
        // Stems zurücksetzen (sonst könnten alte bestehen bleiben)
        gameInstance.stemAudioManager.resetToBaseStem();
        
        // Stemfiles in der Konfiguration aktualisieren
        gameInstance.stemAudioManager.stemFiles = APP_CONFIG.STEMS[APP_CONFIG.MODE].map(stem => stem.file);
        
        // Aktualisierung des Managers anzeigen
        console.log("StemAudioManager für neuen Modus aktualisiert");
      }
      
      // Modal schließen und Erfolg anzeigen
      modal.remove();
      showModalMessage(`Modus auf ${newMode} geändert. Die UI wurde aktualisiert.`);
    } else {
      // Wenn der Modus gleich bleibt
      modal.remove();
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
 * Füge diese zur style.css hinzu
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
`;
document.head.appendChild(stemIconStyle);

// UI beim Laden initialisieren
document.addEventListener('DOMContentLoaded', function() {
  updateUIByMode();
});
