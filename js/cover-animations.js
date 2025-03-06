/**
 * cover-animations.js - Cover-inspirierte Animationen und Effekte
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
 * Aktualisiert die Levelnummern im Level-Overlay
 */
function updateLevelNumbers() {
  const currentLevelElem = document.getElementById('currentLevelNum');
  const footerLevelElem = document.getElementById('levelFooterNum');
  
  if (currentLevelElem && window.gameInstance) {
    currentLevelElem.textContent = (window.gameInstance.currentLevelIndex + 1);
  }
  
  if (footerLevelElem && window.gameInstance) {
    footerLevelElem.textContent = (window.gameInstance.currentLevelIndex + 1);
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

// Event-Handler für Levelwechsel
document.addEventListener('DOMContentLoaded', () => {
  // Erstinitialisierung
  initCoverDesignElements();
  
  // Event-Listener für die GameManager-Klasse hinzufügen
  // Da wir keinen direkten Event für den Levelwechsel haben,
  // verwenden wir eine Mutation Observer für den levelOverlay
  const levelOverlay = document.getElementById('levelOverlay');
  if (levelOverlay) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && 
            !levelOverlay.classList.contains('hidden')) {
          // Level-Overlay wurde angezeigt, Level wurde gewechselt
          updateLevelNumbers();
        }
      });
    });
    
    observer.observe(levelOverlay, { attributes: true });
  }
  
  // Event-Listener für den nextLevelButton
  const nextLevelButton = document.getElementById('nextLevelButton');
  if (nextLevelButton) {
    nextLevelButton.addEventListener('click', () => {
      // Nach kurzer Verzögerung Mandarinen neu initialisieren
      setTimeout(initMandarinAnimations, 500);
    });
  }
});