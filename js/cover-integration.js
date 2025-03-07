/**
 * cover-integration.js - Erweiterte Interaktionen mit dem Album-Cover
 * Verbesserte Version mit großem Plattenspieler neben dem Songtext
 * Optimierte Vinyl-Animation mit verbesserter Statusverwaltung
 */

// Globale Statusvariablen für die Vinyl-Animation
let vinylRotationAnimationId = null;
let isVinylAnimationActive = false;
let vinylPlayerElement = null;
let lastProcessedOverlayVisibility = false;

// Cover-Bild vorladen
const preloadCoverImage = function() {
  try {
    const coverImg = new Image();
    coverImg.src = '../assets/images/mandarinen_cover.jpg';
  } catch (e) {
    console.warn('Cover-Bild konnte nicht vorgeladen werden:', e);
  }
};

// Prüfen, ob das Cover bereits geladen wurde
const isCoverLoaded = function() {
  return document.getElementById('fullCoverImage') && 
         document.getElementById('fullCoverImage').complete;
};

/**
 * Erstellt einen Vinyl-Player und startet die Animation
 */
const createVinylPlayer = function() {
  try {
    // Wenn bereits eine aktive Animation läuft, nicht neu erstellen
    if (isVinylAnimationActive && vinylPlayerElement) {
      console.log('Vinyl-Animation läuft bereits, keine neue Animation wird gestartet');
      return vinylPlayerElement;
    }
    
    // Bestehenden Player entfernen und Animation stoppen
    stopVinylAnimation();

    // Finde den Songtext-Container
    const lyricsContainer = document.querySelector('#lyricDisplay');
    if (!lyricsContainer) {
      console.warn('Lyrics-Container nicht gefunden');
      return null;
    }

    // Erstelle den Player-Container
    const playerContainer = document.createElement('div');
    playerContainer.className = 'vinyl-player';
    
    // Vinyl-Platte mit Cover
    const vinylDisc = document.createElement('div');
    vinylDisc.className = 'vinyl-disc';
    
    // Alle CSS-Klassen und Stile zurücksetzen
    vinylDisc.classList.remove('spinning');
    vinylDisc.style.animation = 'none';
    vinylDisc.style.transform = 'none';
    vinylDisc.style.transition = 'none';
    
    // Cover als Label in der Mitte
    const coverLabel = document.createElement('div');
    coverLabel.className = 'vinyl-label';
    
    // Setze Fallback-Farbe
    coverLabel.style.backgroundColor = '#FF8C00'; // Mandarine als Fallback

    // Versuche diese Pfade für das Hintergrundbild
    const coverUrl = [
      '../assets/images/mandarinen_cover.jpg',
      './assets/images/mandarinen_cover.jpg',
      'assets/images/mandarinen_cover.jpg', 
      '/assets/images/mandarinen_cover.jpg'
    ].find(path => {
      try {
        // Teste jeden Pfad
        const img = new Image();
        img.src = path;
        return img.complete;
      } catch (e) {
        return false;
      }
    }) || '../assets/images/mandarinen_cover.jpg'; // Fallback auf ersten Pfad

    coverLabel.style.backgroundImage = `url('${coverUrl}')`;
    
    // Zusammensetzen
    vinylDisc.appendChild(coverLabel);
    playerContainer.appendChild(vinylDisc);
    
    // Zum Lyrics-Container hinzufügen
    lyricsContainer.appendChild(playerContainer);
    
    // Speichere Referenz auf das erstellte Element
    vinylPlayerElement = playerContainer;
    
    // Animation starten - mit einer Verzögerung um sicherzustellen,
    // dass DOM-Aktualisierungen abgeschlossen sind
    setTimeout(() => {
      // Nur starten, wenn noch keine Animation läuft
      if (!isVinylAnimationActive) {
        startVinylAnimation(vinylDisc);
      }
    }, 500);
    
    return playerContainer;
  } catch (e) {
    console.warn('Fehler beim Erstellen des Vinyl-Players:', e);
    return null;
  }
};

/**
 * Startet die Vinyl-Animation mit einem eigenen, unabhängigen Frame-Loop
 */
const startVinylAnimation = function(vinylDisc) {
  // Animation nur starten, wenn noch keine läuft
  if (isVinylAnimationActive || !vinylDisc) {
    return;
  }
  
  console.log('JavaScript-basierte Vinyl-Rotation wird gestartet');
  
  // Status setzen
  isVinylAnimationActive = true;
  
  // Rotationswinkel
  let rotationAngle = 0;
  
  // Rotation pro Frame
  const rotationSpeed = 0.5;
  
  // Animationsfunktion
  function animateRotation() {
    // Prüfen, ob das Element noch existiert
    if (!vinylDisc || !document.body.contains(vinylDisc)) {
      stopVinylAnimation();
      return;
    }
    
    // Winkel erhöhen
    rotationAngle += rotationSpeed;
    
    // Rotation setzen
    vinylDisc.style.transform = `rotate(${rotationAngle}deg)`;
    
    // Nächsten Frame anfordern, wenn die Animation noch aktiv ist
    if (isVinylAnimationActive) {
      vinylRotationAnimationId = requestAnimationFrame(animateRotation);
    }
  }
  
  // Animation starten
  vinylRotationAnimationId = requestAnimationFrame(animateRotation);
};

/**
 * Animation anhalten und Ressourcen freigeben
 */
const stopVinylAnimation = function() {
  if (vinylRotationAnimationId) {
    console.log('Vinyl-Rotation wird gestoppt');
    cancelAnimationFrame(vinylRotationAnimationId);
    vinylRotationAnimationId = null;
  }
  
  // Status zurücksetzen
  isVinylAnimationActive = false;
  
  // Vinyl-Player entfernen, wenn vorhanden
  if (vinylPlayerElement && vinylPlayerElement.parentNode) {
    vinylPlayerElement.parentNode.removeChild(vinylPlayerElement);
    vinylPlayerElement = null;
  }
};

/**
 * Spezialeffekt: Cover-Split
 * Teilt das Cover in mehrere Teile und animiert sie 
 * Mit verbesserter Fehlerbehandlung
 */
const createCoverSplitEffect = function(container) {
  try {
    if (!container) {
      console.warn('Kein Container für Cover-Split-Effekt angegeben');
      return;
    }
    
    // Anzahl der Spalten und Zeilen
    const cols = 3;
    const rows = 3;
    
    // Container für die Teile
    const fragmentsContainer = document.createElement('div');
    fragmentsContainer.className = 'cover-fragments';
    fragmentsContainer.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      height: 300px;
      z-index: 10;
    `;
    
    // Teile erstellen
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const fragment = document.createElement('div');
        fragment.className = 'cover-fragment';
        fragment.style.cssText = `
          position: absolute;
          width: ${100 / cols}%;
          height: ${100 / rows}%;
          top: ${i * (100 / rows)}%;
          left: ${j * (100 / cols)}%;
          background: url('../assets/images/mandarinen_cover.jpg');
          background-size: ${cols * 100}% ${rows * 100}%;
          background-position: ${j * -100}% ${i * -100}%;
          transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          opacity: 0;
          transform: translate(
            ${(Math.random() - 0.5) * 100}px, 
            ${(Math.random() - 0.5) * 100}px
          ) rotate(${(Math.random() - 0.5) * 60}deg);
        `;
        
        fragmentsContainer.appendChild(fragment);
        
        // Verzögerte Animation
        setTimeout(() => {
          fragment.style.opacity = '1';
          fragment.style.transform = 'translate(0, 0) rotate(0deg)';
        }, 100 + (i * cols + j) * 100);
      }
    }
    
    container.appendChild(fragmentsContainer);
    
    // Nach der Animation wieder entfernen
    setTimeout(() => {
      if (container.contains(fragmentsContainer)) {
        // Fade-Out Animation
        fragmentsContainer.style.opacity = '0';
        setTimeout(() => {
          if (container.contains(fragmentsContainer)) {
            container.removeChild(fragmentsContainer);
          }
        }, 1000);
      }
    }, 5000);
  } catch (e) {
    console.warn('Fehler beim Erstellen des Cover-Split-Effekts:', e);
  }
};

/**
 * Fügt kleine Cover-Partikel hinzu, die wie Konfetti umherfliegen
 * Mit verbesserter Fehlerbehandlung
 */
const createCoverParticles = function() {
  try {
    const particleCount = 15;
    const container = document.createElement('div');
    container.className = 'cover-particles';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
    `;
    
    for (let i = 0; i < particleCount; i++) {
      const size = 20 + Math.random() * 40;
      const particle = document.createElement('div');
      particle.className = 'cover-particle';
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: url('../assets/images/mandarinen_cover.jpg');
        background-size: cover;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation: particle-float ${5 + Math.random() * 10}s infinite alternate ease-in-out;
        opacity: 0.7;
      `;
      
      container.appendChild(particle);
    }
    
    document.body.appendChild(container);
    
    // CSS-Animation für die Partikel
    const style = document.createElement('style');
    style.textContent = `
      @keyframes particle-float {
        0% { transform: translate(0, 0) rotate(0deg); }
        100% { transform: translate(
          ${(Math.random() - 0.5) * 200}px, 
          ${(Math.random() - 0.5) * 200}px
        ) rotate(${Math.random() * 360}deg); }
      }
    `;
    document.head.appendChild(style);
    
    // Nach einiger Zeit entfernen
    setTimeout(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, 15000);
  } catch (e) {
    console.warn('Fehler beim Erstellen der Cover-Partikel:', e);
  }
};

/**
 * Verbesserte Methode zur Überwachung des Level-Overlays
 * Nutzt einen einzelnen Timer und Zustandsprüfung
 */
const monitorLevelOverlay = function() {
  const levelOverlay = document.getElementById('levelOverlay');
  
  if (levelOverlay) {
    const isOverlayVisible = !levelOverlay.classList.contains('hidden');
    
    // Nur handeln, wenn sich der Zustand geändert hat
    if (isOverlayVisible !== lastProcessedOverlayVisibility) {
      console.log(`Level-Overlay ist jetzt ${isOverlayVisible ? 'sichtbar' : 'versteckt'}`);
      
      if (isOverlayVisible) {
        // Level-Overlay wurde sichtbar
        try {
          // Cover-Hintergrund aktivieren
          levelOverlay.classList.add('show-cover');
          
          // Verzögert Vinyl-Player erstellen
          setTimeout(() => {
            const player = createVinylPlayer();
            
            if (player) {
              // Click-Event für zusätzlichen Effekt
              player.addEventListener('click', function() {
                console.log('Vinyl-Player geklickt, Split-Effekt wird gestartet');
                createCoverSplitEffect(levelOverlay);
                
                // Sound-Effekt wenn möglich
                if (window.gameInstance && window.gameInstance.audioManager) {
                  try {
                    window.gameInstance.audioManager.playSound('levelComplete');
                  } catch (e) {
                    console.warn('Sound konnte nicht abgespielt werden:', e);
                  }
                }
              });
            }
          }, 1000);
        } catch (e) {
          console.warn('Fehler bei Level-Abschluss-Verarbeitung:', e);
        }
      } else {
        // Overlay versteckt - Animation stoppen
        stopVinylAnimation();
      }
      
      // Status aktualisieren
      lastProcessedOverlayVisibility = isOverlayVisible;
    }
  }
  
  // Regelmäßige Prüfung fortsetzen
  setTimeout(monitorLevelOverlay, 1000);
};

/**
 * Verbesserte Methode zur Überwachung des Level-Overlays
 */
const waitForLevelCompletion = function() {
  // Initialen Status setzen
  lastProcessedOverlayVisibility = false;
  
  // Überwachung starten
  setTimeout(monitorLevelOverlay, 1000);
};

/**
 * Warten auf den End-Screen
 */
const checkEndScreen = function() {
  const endScreen = document.getElementById('endScreen');
  if (endScreen && !endScreen.classList.contains('hidden')) {
    console.log('End-Screen erkannt, Cover-Partikel werden initialisiert');
    setTimeout(createCoverParticles, 2000);
  } else {
    setTimeout(checkEndScreen, 1000);
  }
};

/**
 * Diese Funktion optimiert die Vinyl-Player-Verwaltung
 * Entfernt alte Observer und implementiert den verbesserten Ansatz
 */
const optimizeVinylPlayerHandling = function() {
  // Bestehende Animation stoppen
  stopVinylAnimation();
  
  // Vorhandene MutationObserver entfernen
  const levelOverlay = document.getElementById('levelOverlay');
  if (levelOverlay && window._vinylObserver) {
    window._vinylObserver.disconnect();
    window._vinylObserver = null;
  }
  
  // Überwachung mit verbessertem Ansatz starten
  waitForLevelCompletion();
  
  // Event Listener für Seitenwechsel hinzufügen
  window.addEventListener('beforeunload', stopVinylAnimation);
};

/**
 * Aktiviert die Cover-Integration, sobald das Dokument geladen ist
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Cover-Integration wird initialisiert');
  
  // Cover-Bild vorladen
  preloadCoverImage();
  
  // Cover-Modal-Funktionalität
  const coverButton = document.getElementById('coverRevealButton');
  const coverModal = document.getElementById('coverModal');
  const coverClose = document.getElementById('coverModalClose');
  const fullCoverImage = document.getElementById('fullCoverImage');
  
  if (coverButton && coverModal && coverClose) {
    // Cover-Button Klick-Handler
    coverButton.addEventListener('click', function() {
      coverModal.classList.add('active');
      // Optional: Sound-Effekt abspielen
      if (window.gameInstance && window.gameInstance.audioManager) {
        try {
          window.gameInstance.audioManager.playSound('click');
        } catch (e) {
          console.warn('Sound konnte nicht abgespielt werden:', e);
        }
      }
      
      // Animierte Bildvergrößerung
      if (fullCoverImage) {
        fullCoverImage.style.animation = 'none';
        setTimeout(() => {
          fullCoverImage.style.animation = 'image-zoom 15s alternate infinite';
        }, 10);
      }
    });
    
    // Schließen-Button
    coverClose.addEventListener('click', function() {
      coverModal.classList.remove('active');
    });
    
    // Schließen beim Klick außerhalb des Covers
    coverModal.addEventListener('click', function(e) {
      if (e.target === coverModal) {
        coverModal.classList.remove('active');
      }
    });
  }
  
  // End-Screen-Überwachung für Cover-Partikel
  setTimeout(checkEndScreen, 1000);
  
  // Spezielle Tastenkombination für Easteregg
  let keySequence = '';
  document.addEventListener('keydown', function(e) {
    keySequence += e.key.toLowerCase();
    
    // Die letzten 10 Zeichen betrachten
    if (keySequence.length > 10) {
      keySequence = keySequence.substring(keySequence.length - 10);
    }
    
    // Wenn "mandarinen" getippt wurde
    if (keySequence.includes('mandarinen')) {
      console.log('Easteregg aktiviert: Mandarinen-Tastenkombination erkannt');
      // Easteregg: Cover-Explosions-Effekt
      createCoverSplitEffect(document.body);
      
      // Sound-Effekt
      if (window.gameInstance && window.gameInstance.audioManager) {
        try {
          window.gameInstance.audioManager.playSound('gameComplete');
        } catch (e) {
          console.warn('Sound konnte nicht abgespielt werden:', e);
        }
      }
      
      // Sequenz zurücksetzen
      keySequence = '';
    }
  });
  
  // Direkte Verbindung zum GameManager, wenn verfügbar
  if (window.gameInstance) {
    console.log('GameManager gefunden, direkte Anbindung wird versucht');
    
    // Originale showLevelComplete-Funktion sichern und erweitern
    if (window.gameInstance.showLevelComplete) {
      const originalShowLevelComplete = window.gameInstance.showLevelComplete;
      window.gameInstance.showLevelComplete = function() {
        // Originale Funktion aufrufen
        originalShowLevelComplete.apply(window.gameInstance);
        
        // Nach einer Verzögerung unsere Ergänzungen einfügen
        setTimeout(() => {
          const levelOverlay = document.getElementById('levelOverlay');
          if (levelOverlay && !levelOverlay.classList.contains('hidden')) {
            levelOverlay.classList.add('show-cover');
            setTimeout(() => createVinylPlayer(), 1000);
          }
        }, 500);
      };
      console.log('GameManager.showLevelComplete erfolgreich erweitert');
    }
    
    // Originale nextLevel-Funktion sichern und erweitern
    if (window.gameInstance.nextLevel) {
      const originalNextLevel = window.gameInstance.nextLevel;
      window.gameInstance.nextLevel = function() {
        // Animation stoppen, bevor wir zum nächsten Level wechseln
        stopVinylAnimation();
        
        // Originale Funktion aufrufen
        originalNextLevel.apply(window.gameInstance);
      };
      console.log('GameManager.nextLevel erfolgreich erweitert');
    }
  }
  
  // Optimierte Vinyl-Player-Behandlung aktivieren
  optimizeVinylPlayerHandling();
  
  // Bei Seiten-Navigation oder Entladen Animation stoppen
  window.addEventListener('beforeunload', stopVinylAnimation);
});