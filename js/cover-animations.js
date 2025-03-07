/**
 * cover-animations.js - Cover-inspirierte Animationen und Effekte
 * Korrigierte Version mit verbesserter Level-Anzeige-Aktualisierung
 */

/**
 * Initialisiert alle Cover-inspirierten Design-Elemente
 */
function initCoverDesignElements() {
  // DOM-Elemente referenzieren
  const startScreen = document.getElementById('startScreen');
  const endScreen = document.getElementById('endScreen');
  const levelOverlay = document.getElementById('levelOverlay');
  
  // Stellt sicher, dass das Level-Overlay die richtigen Informationen anzeigt
  updateLevelNumbers();
  
  // Goldene Dreiecke zu Buttons hinzufügen
  addGoldTrianglesToButtons();
  
  // Doppelte Mandarinen animieren
  initMandarinAnimations();
}

/**
 * Aktualisiert die Levelnummern im Level-Overlay und im Footer
 * Mit verbesserter Protokollierung und Fehlerbehebung
 */
function updateLevelNumbers() {
  const currentLevelElem = document.getElementById('currentLevelNum');
  const footerLevelElem = document.getElementById('levelFooterNum');
  
  // Prüfe, ob das gameInstance-Objekt existiert und einen gültigen Level-Index enthält
  if (window.gameInstance && typeof window.gameInstance.currentLevelIndex !== 'undefined') {
    // Aktuelle Level-Nummer berechnen (Index + 1)
    const currentLevelNumber = window.gameInstance.currentLevelIndex + 1;
    console.log(`Aktualisiere Level-Anzeige auf Level ${currentLevelNumber}`);
    
    // Level-Nummer im Overlay aktualisieren
    if (currentLevelElem) {
      currentLevelElem.textContent = currentLevelNumber;
    } else {
      console.warn('Element für aktuelle Level-Nummer nicht gefunden (#currentLevelNum)');
    }
    
    // Level-Nummer im Footer aktualisieren
    if (footerLevelElem) {
      footerLevelElem.textContent = currentLevelNumber;
    } else {
      console.warn('Element für Footer-Level-Nummer nicht gefunden (#levelFooterNum)');
    }
  } else {
    console.warn('Game-Instance nicht gefunden oder currentLevelIndex undefiniert');
  }
}

/**
 * Fügt allen Primary-Buttons goldene Dreiecke hinzu, falls noch nicht vorhanden
 */
function addGoldTrianglesToButtons() {
  const primaryButtons = document.querySelectorAll('.btn.primary');
  
  primaryButtons.forEach(button => {
    // Prüfen, ob bereits ein Dreieck vorhanden ist
    if (!button.querySelector('.gold-triangle')) {
      // Button-Text speichern
      const buttonText = button.textContent.trim();
      // Dreieck hinzufügen
      button.innerHTML = `<span class="gold-triangle"></span>${buttonText}`;
    }
  });
}

/**
 * Initialisiert die Mandarinen-Animationen
 */
function initMandarinAnimations() {
  // Reguläres Mandarinen-Icon animieren
  const mandarinIcons = document.querySelectorAll('.mandarin-icon');
  
  mandarinIcons.forEach(icon => {
    // Glanz-Effekt beim Hovern
    icon.addEventListener('mouseover', () => {
      createMandarinGlowEffect(icon);
    });
  });
  
  // Doppelte Mandarinen mit Bewegungsanimation
  const doubleMandarins = document.querySelectorAll('.double-mandarins');
  
  doubleMandarins.forEach(container => {
    const leftMandarin = container.querySelector('.mandarin-left');
    const rightMandarin = container.querySelector('.mandarin-right');
    
    if (leftMandarin && rightMandarin) {
      container.addEventListener('mouseover', () => {
        // Mandarinen bewegen sich aufeinander zu
        leftMandarin.style.animation = 'none';
        rightMandarin.style.animation = 'none';
        
        setTimeout(() => {
          leftMandarin.style.animation = 'move-towards-right 1.5s forwards';
          rightMandarin.style.animation = 'move-towards-left 1.5s forwards';
          
          // Glanzeffekt hinzufügen
          createMandarinGlowEffect(leftMandarin);
          createMandarinGlowEffect(rightMandarin);
        }, 10);
      });
      
      container.addEventListener('mouseout', () => {
        // Nach kurzer Verzögerung zurück zur ursprünglichen Animation
        setTimeout(() => {
          leftMandarin.style.animation = 'float-left 3s infinite alternate ease-in-out';
          rightMandarin.style.animation = 'float-right 3s infinite alternate ease-in-out';
        }, 1500);
      });
    }
  });
}

/**
 * Erzeugt einen kurzen Glanz-Effekt auf einer Mandarine
 */
function createMandarinGlowEffect(element) {
  // Temporäres Glanz-Element erstellen
  const glowEffect = document.createElement('div');
  glowEffect.className = 'mandarin-glow-effect';
  glowEffect.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, 
      rgba(255, 255, 255, 0.8) 0%, 
      rgba(255, 255, 255, 0) 70%);
    opacity: 0;
    animation: glow-ping 0.8s ease-out;
    pointer-events: none;
    z-index: 10;
  `;
  
  element.appendChild(glowEffect);
  
  // Nach der Animation aufräumen
  setTimeout(() => {
    if (element.contains(glowEffect)) {
      element.removeChild(glowEffect);
    }
  }, 800);
}

/**
 * Prüft periodisch, ob sich die Level-Nummer geändert hat
 * und aktualisiert die Anzeige entsprechend
 */
function startLevelNumberPolling() {
  let lastKnownLevelIndex = -1;
  
  // Prüffunktion für die aktuelle Level-Nummer
  function checkLevelNumber() {
    if (window.gameInstance && typeof window.gameInstance.currentLevelIndex !== 'undefined') {
      const currentIndex = window.gameInstance.currentLevelIndex;
      
      // Nur aktualisieren, wenn sich der Level-Index geändert hat
      if (currentIndex !== lastKnownLevelIndex) {
        console.log(`Level-Änderung erkannt: ${lastKnownLevelIndex} -> ${currentIndex}`);
        lastKnownLevelIndex = currentIndex;
        updateLevelNumbers();
      }
    }
    
    // Weiter prüfen
    setTimeout(checkLevelNumber, 500);
  }
  
  // Erstmalige Prüfung starten
  checkLevelNumber();
}

/**
 * Erweitert die GameManager-Klasse um Level-Aktualisierungsfunktionen,
 * falls sie existiert.
 */
function enhanceGameManager() {
  if (window.gameInstance) {
    console.log('GameManager gefunden, erweitere Level-Aktualisierungsfunktionen');
    
    // Original nextLevel-Funktion erweitern
    if (typeof window.gameInstance.nextLevel === 'function') {
      const originalNextLevel = window.gameInstance.nextLevel;
      window.gameInstance.nextLevel = function() {
        // Original-Funktion ausführen
        originalNextLevel.apply(window.gameInstance);
        
        // Nach einer Verzögerung die Level-Nummer aktualisieren
        setTimeout(updateLevelNumbers, 100);
        
        console.log('nextLevel wurde aufgerufen, Level-Anzeige wird aktualisiert');
      };
      console.log('GameManager.nextLevel erfolgreich erweitert');
    }
    
    // Original setLevel-Funktion erweitern (falls vorhanden)
    if (typeof window.gameInstance.setLevel === 'function') {
      const originalSetLevel = window.gameInstance.setLevel;
      window.gameInstance.setLevel = function(levelIndex) {
        // Original-Funktion ausführen
        originalSetLevel.apply(window.gameInstance, [levelIndex]);
        
        // Nach einer Verzögerung die Level-Nummer aktualisieren
        setTimeout(updateLevelNumbers, 100);
        
        console.log(`setLevel(${levelIndex}) wurde aufgerufen, Level-Anzeige wird aktualisiert`);
      };
      console.log('GameManager.setLevel erfolgreich erweitert');
    }
  } else {
    console.warn('GameManager nicht gefunden, Level-Aktualisierung erfolgt über Polling');
  }
}

// Event-Handler für Levelwechsel
document.addEventListener('DOMContentLoaded', () => {
  // Erstinitialisierung
  initCoverDesignElements();
  
  // GameManager-Funktionen erweitern
  enhanceGameManager();
  
  // Level-Nummer-Polling starten
  startLevelNumberPolling();
  
  // Event-Listener für die GameManager-Klasse hinzufügen
  // Da wir keinen direkten Event für den Levelwechsel haben,
  // verwenden wir eine Mutation Observer für den levelOverlay
  const levelOverlay = document.getElementById('levelOverlay');
  if (levelOverlay) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (!levelOverlay.classList.contains('hidden')) {
            // Level-Overlay wurde angezeigt, Level wurde gewechselt
            console.log('Level-Overlay ist jetzt sichtbar, aktualisiere Level-Anzeige');
            updateLevelNumbers();
          }
        }
      });
    });
    
    observer.observe(levelOverlay, { attributes: true });
    console.log('MutationObserver für levelOverlay eingerichtet');
  } else {
    console.warn('levelOverlay-Element nicht gefunden, MutationObserver nicht eingerichtet');
  }
  
  // Event-Listener für den nextLevelButton
  const nextLevelButton = document.getElementById('nextLevelButton');
  if (nextLevelButton) {
    nextLevelButton.addEventListener('click', () => {
      console.log('nextLevelButton wurde geklickt');
      
      // WICHTIG: Level-Nummern aktualisieren
      // Verzögerung, da der gameInstance.currentLevelIndex eventuell
      // nicht sofort aktualisiert wird
      setTimeout(updateLevelNumbers, 500);
      
      // Nach kurzer Verzögerung Mandarinen neu initialisieren
      setTimeout(initMandarinAnimations, 500);
    });
    console.log('Event-Listener für nextLevelButton eingerichtet');
  } else {
    console.warn('nextLevelButton nicht gefunden, Event-Listener nicht eingerichtet');
  }
  
  // Event-Listener zum Aktualisieren der Level-Nummern nach Levelwechsel
  window.addEventListener('levelChanged', function(e) {
    console.log('levelChanged-Event erkannt, aktualisiere Level-Anzeige');
    updateLevelNumbers();
  });
});