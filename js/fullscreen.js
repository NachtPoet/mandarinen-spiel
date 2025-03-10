/**
 * fullscreen.js - Fügt Fullscreen-Funktionalität für Mobilgeräte hinzu
 */

// DOM geladen abwarten
document.addEventListener('DOMContentLoaded', function() {
  // Fullscreen-Button finden
  const fullscreenButton = document.getElementById('fullscreenButton');
  
  // Prüfen, ob Fullscreen API verfügbar ist
  const fullscreenAvailable = 
    document.documentElement.requestFullscreen || 
    document.documentElement.webkitRequestFullscreen || 
    document.documentElement.mozRequestFullScreen || 
    document.documentElement.msRequestFullscreen;
  
  // Wenn die API nicht verfügbar ist, Button ausblenden
  if (!fullscreenAvailable) {
    if (fullscreenButton) {
      fullscreenButton.style.display = 'none';
    }
    return;
  }
  
  // Nur auf Mobilgeräten anzeigen
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (fullscreenButton && isMobile) {
    fullscreenButton.style.display = 'block';
    
    // Event-Listener hinzufügen
    fullscreenButton.addEventListener('click', function() {
      toggleFullScreen();
    });
  }
  
  // Fullscreen umschalten
  function toggleFullScreen() {
    if (!document.fullscreenElement &&    // Standard
        !document.mozFullScreenElement && // Firefox
        !document.webkitFullscreenElement && // Chrome, Safari
        !document.msFullscreenElement) {  // IE/Edge
      
      // Vollbild aktivieren
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
      
      // Body-Klasse für CSS-Styling hinzufügen
      document.body.classList.add('fullscreen');
      
      // Button-Text ändern
      if (fullscreenButton) {
        fullscreenButton.innerHTML = '<span class="fullscreen-icon"></span>Beenden';
      }
      
    } else {
      // Vollbild beenden
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      
      // Body-Klasse entfernen
      document.body.classList.remove('fullscreen');
      
      // Button-Text zurücksetzen
      if (fullscreenButton) {
        fullscreenButton.innerHTML = '<span class="fullscreen-icon"></span>Vollbild';
      }
    }
  }
  
  // Event-Listener für Fullscreen-Änderungen
  document.addEventListener('fullscreenchange', updateFullscreenStatus);
  document.addEventListener('webkitfullscreenchange', updateFullscreenStatus);
  document.addEventListener('mozfullscreenchange', updateFullscreenStatus);
  document.addEventListener('MSFullscreenChange', updateFullscreenStatus);
  
  // Status aktualisieren
  function updateFullscreenStatus() {
    if (document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement ||
        document.msFullscreenElement) {
      document.body.classList.add('fullscreen');
      if (fullscreenButton) {
        fullscreenButton.innerHTML = '<span class="fullscreen-icon"></span>Beenden';
      }
    } else {
      document.body.classList.remove('fullscreen');
      if (fullscreenButton) {
        fullscreenButton.innerHTML = '<span class="fullscreen-icon"></span>Vollbild';
      }
    }
  }
  
  // Bildschirmorientierung optimieren (wenn verfügbar)
  if (screen.orientation && screen.orientation.lock) {
    try {
      // Vollbild wird in Landscape-Modus besser dargestellt
      screen.orientation.lock('landscape').catch(function() {
        // Orientierung kann nicht gesperrt werden, ignorieren
      });
    } catch (e) {
      // Nicht unterstützt
    }
  }
});
