/**
 * connectedScript.js - Unterstützung für Sprachen mit verbundenen Buchstaben
 * Ermöglicht Umschaltung zwischen verbundener und isolierter Buchstabenansicht
 */

// Liste der Sprachen mit verbundener Schrift
const connectedScriptLanguages = ['ar', 'he', 'fa', 'ur'];

// Prüfen, ob eine Sprache verbundene Schrift verwendet
function isConnectedScriptLanguage(lang) {
  return connectedScriptLanguages.includes(lang);
}

// Funktion zum Extrahieren einzelner Buchstaben aus arabischen Wörtern
function getIndividualLetters(word) {
  // Arabische Buchstaben benötigen zusätzlichen Abstand
  return word.split('').join(' ');
}

// Funktion zur Initialisierung des Schalters
function initScriptToggle() {
  console.log("ScriptToggle wird initialisiert...");
  const toggle = document.getElementById('scriptToggle');
  const container = document.getElementById('scriptToggleContainer');
  
  if (!toggle || !container) {
    console.warn("ScriptToggle-Elemente nicht gefunden!");
    return;
  }
  
  // Prüfen ob die aktuelle Sprache verbundene Schrift verwendet
  const currentLang = window.localization ? window.localization.getCurrentLanguage() : 'de';
  const useConnectedScript = isConnectedScriptLanguage(currentLang);
  
  console.log(`Aktuelle Sprache: ${currentLang}, Verbundene Schrift verwenden: ${useConnectedScript}`);
  
  // Toggle-Container nur anzeigen, wenn die Sprache verbundene Schrift verwendet
  container.style.display = useConnectedScript ? 'flex' : 'none';
  
  // Gespeicherte Präferenz laden (Standard: verbundene Schrift)
  const showConnected = localStorage.getItem('showConnectedScript') !== 'false';
  toggle.checked = showConnected;
  
  // Labels aktualisieren
  updateToggleLabels(showConnected);
  
  // Bestehende Event-Listener entfernen, um Dopplungen zu vermeiden
  toggle.removeEventListener('change', handleToggleChange);
  
  // Event-Listener für Änderungen neu hinzufügen
  toggle.addEventListener('change', handleToggleChange);
  
  console.log(`ScriptToggle initialisiert: showConnected=${showConnected}, checked=${toggle.checked}`);
  
  // Event-Listener für Sprachwechsel
  document.removeEventListener('translations-loaded', handleLanguageChange);
  document.addEventListener('translations-loaded', handleLanguageChange);
}

// Handler für Toggle-Änderungen - als benannte Funktion für einfacheres Entfernen
function handleToggleChange(event) {
  const toggle = event.target;
  const showConnected = toggle.checked;
  console.log(`Toggle geändert: showConnected=${showConnected}`);
  
  localStorage.setItem('showConnectedScript', showConnected);
  updateToggleLabels(showConnected);
  
  // UI-Aktualisierung auslösen
  if (document.getElementById('gameContainer').style.display === 'flex') {
    console.log("Spiel aktiv, aktualisiere UI...");
    
    // Versuch 1: Über gameInstance
    if (window.gameInstance && typeof window.gameInstance.refreshLevelUI === 'function') {
      console.log("Verwende gameInstance.refreshLevelUI()");
      window.gameInstance.refreshLevelUI();
    }
    // Versuch 2: Über globale gameManager-Variable (falls vorhanden)
    else if (window.gameManager && typeof window.gameManager.refreshLevelUI === 'function') {
      console.log("Verwende gameManager.refreshLevelUI()");
      window.gameManager.refreshLevelUI();
    } 
    // Versuch 3: Manuelles Neurendern der Wortliste
    else {
      console.log("Kein gameInstance/gameManager gefunden, versuche direkte UI-Aktualisierung");
      // Wir versuchen die wichtigsten UI-Komponenten direkt zu aktualisieren
      const currentInstance = getGameInstance();
      if (currentInstance) {
        updateWordListDisplay(currentInstance);
      } else {
        console.warn("Konnte keine Spiel-Instanz finden!");
      }
    }
  } else {
    console.log("Spiel nicht aktiv, keine UI-Aktualisierung nötig");
  }
  
  // Feedback-Sound abspielen, wenn verfügbar
  if (window.audioManager && window.audioManager.playSound) {
    window.audioManager.playSound('click');
  }
}

// Handler für Sprachwechsel-Events
function handleLanguageChange(event) {
  const newLang = event.detail ? event.detail.lang : (window.localization ? window.localization.getCurrentLanguage() : 'de');
  const useConnectedScript = isConnectedScriptLanguage(newLang);
  
  console.log(`Sprache geändert zu: ${newLang}, Verbundene Schrift: ${useConnectedScript}`);
  
  const container = document.getElementById('scriptToggleContainer');
  if (container) {
    container.style.display = useConnectedScript ? 'flex' : 'none';
  }
  
  // UI aktualisieren, wenn nötig
  if (useConnectedScript && document.getElementById('gameContainer').style.display === 'flex') {
    console.log("Sprache auf verbundene Schrift geändert, aktualisiere UI...");
    // Stelle sicher, dass Toggle-Status berücksichtigt wird
    const toggle = document.getElementById('scriptToggle');
    const currentShowConnected = toggle?.checked ?? true;
    updateToggleLabels(currentShowConnected);
    
    // Spielinstanz finden und UI aktualisieren
    const currentInstance = getGameInstance();
    if (currentInstance) {
      if (typeof currentInstance.refreshLevelUI === 'function') {
        currentInstance.refreshLevelUI();
      } else {
        updateWordListDisplay(currentInstance);
      }
    }
  }
}

// Funktion zur Aktualisierung der Toggle-Labels
function updateToggleLabels(showConnected) {
  const connectedLabel = document.querySelector('.toggle-label[data-connected]');
  const separatedLabel = document.querySelector('.toggle-label[data-separated]');
  
  if (connectedLabel && separatedLabel) {
    connectedLabel.style.display = showConnected ? 'inline' : 'none';
    separatedLabel.style.display = showConnected ? 'none' : 'inline';
  }
}

// Hilfsfunktion zum Finden der aktuellen Spielinstanz
function getGameInstance() {
  // Mögliche Orte, an denen die Spielinstanz gespeichert sein könnte
  if (window.gameInstance) {
    return window.gameInstance;
  } else if (window.gameManager) {
    return window.gameManager;
  } else if (typeof gameInstance !== 'undefined') {
    return gameInstance;
  }
  return null;
}

// Hilfsfunktion zum manuellen Aktualisieren der Wortliste
function updateWordListDisplay(gameInstance) {
  if (!gameInstance) return;
  
  const wordListElement = document.getElementById('wordList');
  if (!wordListElement) {
    console.warn("Wortliste nicht gefunden!");
    return;
  }
  
  // Notwendige Daten aus der Spielinstanz extrahieren
  const targetWords = gameInstance.targetWords || [];
  const foundWords = gameInstance.foundWords || new Set();
  const difficulty = gameInstance.currentDifficulty || 'easy';
  
  // UI-Helfer-Funktion verwenden, wenn verfügbar
  if (typeof renderWordList === 'function') {
    console.log("Verwende renderWordList() Funktion");
    // Überprüfen und übergeben der translate-Funktion
    const translateFn = window.localization && typeof window.localization.translate === 'function' 
      ? window.localization.translate 
      : (key) => key;
    
    // Verwende getStemNameKey vom Spielobjekt oder erstelle einen Fallback
    const getStemNameKey = gameInstance.getStemNameKey 
      ? gameInstance.getStemNameKey.bind(gameInstance) 
      : (stemIndex) => `stemName${stemIndex}`;
    
    renderWordList(targetWords, foundWords, difficulty, wordListElement, translateFn, getStemNameKey);
  } else {
    console.warn("renderWordList() Funktion nicht gefunden!");
  }
}

// Funktion zur Initialisierung beim Spielstart
function initConnectedScriptSupport() {
  console.log("Initialisiere Connected Script Support...");
  
  // Bei DOMContentLoaded oder direkt, wenn das Dokument bereits geladen ist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log("DOM geladen, initialisiere Toggle");
      initScriptToggle();
      
      // Zusätzlich: Auf Spielinitialisierung warten und dann erneut initialisieren
      const checkGameInstance = setInterval(function() {
        if (getGameInstance()) {
          console.log("Spielinstanz gefunden, initialisiere Toggle erneut");
          clearInterval(checkGameInstance);
          initScriptToggle();
        }
      }, 500);
    });
  } else {
    console.log("DOM bereits geladen, initialisiere Toggle direkt");
    initScriptToggle();
    
    // Auch hier auf Spielinitialisierung warten
    const checkGameInstance = setInterval(function() {
      if (getGameInstance()) {
        console.log("Spielinstanz gefunden, initialisiere Toggle erneut");
        clearInterval(checkGameInstance);
        initScriptToggle();
      }
    }, 500);
  }
  
  // Listener für mögliche Spiel-Statusänderungen
  window.addEventListener('levelChanged', function() {
    console.log("Level geändert, aktualisiere Toggle");
    initScriptToggle();
  });
}

// Zusätzliche Hilfsfunktion zum manuellen Auslösen der Toggle-Änderung
function forceToggleUpdate() {
  const toggle = document.getElementById('scriptToggle');
  if (toggle) {
    // Zustand umkehren und dann zurücksetzen, um Änderung zu erzwingen
    const currentState = toggle.checked;
    toggle.checked = !currentState;
    // Manuell Event auslösen
    toggle.dispatchEvent(new Event('change'));
    // Zustand wiederherstellen und erneut Event auslösen
    setTimeout(() => {
      toggle.checked = currentState;
      toggle.dispatchEvent(new Event('change'));
    }, 50);
  }
}

// Initialisierung starten
initConnectedScriptSupport();

// Globales Objekt für Zugriff aus anderen Modulen
window.connectedScript = {
  isConnectedScriptLanguage,
  getIndividualLetters,
  initScriptToggle,
  forceToggleUpdate // neue Hilfsfunktion exportieren
};

// Debug-Konsolen-Befehl zum manuellen Aktualisieren
console.log("Connected Script Support geladen. Verwende window.connectedScript.forceToggleUpdate() zur manuellen Aktualisierung.");
