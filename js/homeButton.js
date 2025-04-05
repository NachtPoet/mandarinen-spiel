/**
 * homeButton.js - Funktionalität für den Home-Button
 * Ermöglicht die Rückkehr zum Startbildschirm während des Spiels
 */

document.addEventListener('DOMContentLoaded', function() {
  // Home-Button finden
  const homeButton = document.getElementById('homeButton');
  
  // Event-Listener für den Home-Button hinzufügen
  if (homeButton) {
    homeButton.addEventListener('click', function() {
      // Sound abspielen, wenn verfügbar
      if (window.gameInstance && window.gameInstance.audioManager) {
        try {
          window.gameInstance.audioManager.playSound('click');
        } catch (e) {
          console.warn('Sound konnte nicht abgespielt werden:', e);
        }
      }
      
      // Bestätigungsdialog anzeigen
      const confirmReturn = confirm(
        window.localization ? 
        window.localization.translate('confirmReturnHome', { default: 'Möchtest du zum Startbildschirm zurückkehren? Dein Fortschritt wird gespeichert.' }) : 
        'Möchtest du zum Startbildschirm zurückkehren? Dein Fortschritt wird gespeichert.'
      );
      
      if (confirmReturn) {
        // Spielfortschritt speichern, wenn gameInstance verfügbar ist
        if (window.gameInstance && typeof window.gameInstance.saveGameProgress === 'function') {
          window.gameInstance.saveGameProgress();
        }
        
        // Spielcontainer ausblenden
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
          gameContainer.style.display = 'none';
        }
        
        // Level-Overlay ausblenden, falls sichtbar
        const levelOverlay = document.getElementById('levelOverlay');
        if (levelOverlay) {
          levelOverlay.classList.add('hidden');
        }
        
        // End-Screen ausblenden, falls sichtbar
        const endScreen = document.getElementById('endScreen');
        if (endScreen) {
          endScreen.classList.add('hidden');
        }
        
        // Startbildschirm anzeigen
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
          startScreen.style.display = 'flex';
        }
        
        // Timer stoppen, wenn vorhanden
        if (window.gameInstance && window.gameInstance.timerInterval) {
          clearInterval(window.gameInstance.timerInterval);
        }
        
        // Musik pausieren, wenn vorhanden
        if (window.gameInstance && window.gameInstance.stemAudioManager) {
          try {
            window.gameInstance.stemAudioManager.pauseAllStems();
          } catch (e) {
            console.warn('Stems konnten nicht pausiert werden:', e);
          }
        }
      }
    });
    
    console.log('Home-Button Event-Listener wurde hinzugefügt');
  } else {
    console.warn('Home-Button nicht gefunden, Event-Listener nicht eingerichtet');
  }
});
