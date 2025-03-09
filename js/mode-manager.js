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

// UI beim Laden initialisieren
document.addEventListener('DOMContentLoaded', function() {
  updateUIByMode();
});