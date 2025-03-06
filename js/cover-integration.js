/**
 * cover-integration.js - Erweiterte Interaktionen mit dem Album-Cover
 * Verbesserte Version mit Fehlerbehandlung
 */

// Cover-Bild vorladen
const preloadCoverImage = function() {
  try {
    const coverImg = new Image();
    coverImg.src = 'assets/images/mandarinen_cover.jpg';
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
 * Fügt einen kleinen animierten Plattenspieler hinzu, der das Cover dreht
 * Mit verbesserter Fehlerbehandlung
 */
const createVinylPlayer = function() {
  try {
    const levelFrame = document.querySelector('#levelOverlay .level-frame');
    if (!levelFrame) {
      console.warn('Level-Frame nicht gefunden, Vinyl-Player wird nicht erstellt');
      return null;
    }
    
    // Prüfen, ob bereits ein Player existiert
    if (levelFrame.querySelector('.vinyl-player')) {
      console.log('Vinyl-Player existiert bereits');
      return levelFrame.querySelector('.vinyl-player');
    }

    const playerContainer = document.createElement('div');
    playerContainer.className = 'vinyl-player';
    
    // Vinyl-Platte mit Cover
    const vinylDisc = document.createElement('div');
    vinylDisc.className = 'vinyl-disc';
    
    // Cover als Label in der Mitte
    const coverLabel = document.createElement('div');
    coverLabel.className = 'vinyl-label';
    coverLabel.style.backgroundImage = "url('assets/images/mandarinen_cover.jpg')";
    
    // Zusammensetzen
    vinylDisc.appendChild(coverLabel);
    playerContainer.appendChild(vinylDisc);
    
    // Zum Level-Overlay hinzufügen
    levelFrame.insertBefore(playerContainer, levelFrame.firstChild);
    
    // Animation starten
    setTimeout(() => {
      vinylDisc.classList.add('spinning');
    }, 500);
    
    return playerContainer;
  } catch (e) {
    console.warn('Fehler beim Erstellen des Vinyl-Players:', e);
    return null;
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
          background: url('assets/images/mandarinen_cover.jpg');
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
        background: url('assets/images/mandarinen_cover.jpg');
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
 * Warten auf den Abschluss eines Levels mit verbesserter Sicherheit
 */
const waitForLevelCompletion = function() {
  // Mehr Kontrolle - den Original-GameManager-Prozess nicht stören
  const checkLevelOverlay = function() {
    const levelOverlay = document.getElementById('levelOverlay');
    if (levelOverlay && !levelOverlay.classList.contains('hidden')) {
      console.log('Level-Overlay erkannt, Cover-Funktionen werden initialisiert');
      
      // Level-Overlay wurde sichtbar
      try {
        // Cover-Hintergrund aktivieren
        levelOverlay.classList.add('show-cover');
        
        // Warten, bevor der Vinyl-Player erstellt wird, um Konflikte zu vermeiden
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
        }, 1500); // Längere Verzögerung für mehr Stabilität
      } catch (e) {
        console.warn('Fehler bei Level-Abschluss-Verarbeitung:', e);
      }
    }
    
    // Weiteres Prüfen, aber nicht zu häufig (Performance-Gründe)
    setTimeout(checkLevelOverlay, 1000);
  };
  
  // Starten der Prüfung
  setTimeout(checkLevelOverlay, 1000);
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
  
  // Verbesserte Methode für Level-Abschluss-Erkennung ohne Mutation Observer
  waitForLevelCompletion();
  
  // Cover-Partikel beim vollständigen Spielabschluss - verwendet den robusteren Polling-Ansatz
  const checkEndScreen = function() {
    const endScreen = document.getElementById('endScreen');
    if (endScreen && !endScreen.classList.contains('hidden')) {
      console.log('End-Screen erkannt, Cover-Partikel werden initialisiert');
      setTimeout(createCoverParticles, 2000);
    } else {
      setTimeout(checkEndScreen, 1000);
    }
  };
  
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
  }
});