// Haupteintrittspunkt für das Spiel

// Globale Variable für die Spielinstanz
let gameInstance;

// Main.js - zentrale Initialisierung des Spiels
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded, initializing game...');
  
  // Globale Debugging-Funktion für Fehler
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Fehler aufgetreten:', message, 'in', source, 'Zeile:', lineno);
    return false;
  };
  
  // Audio-Manager testen und Debug-Informationen ausgeben
  setTimeout(function() {
    console.log('Debug: AudioManager Status');
    if (window.audioManager) {
      console.log('- AudioManager geladen');
      console.log('- Musik geladen:', window.audioManager.isMusicReady());
      console.log('- Musik aktiviert:', window.audioManager.musicEnabled);
    } else {
      console.error('! AudioManager fehlt');
    }

    console.log('Debug: StemAudioManager Status');
    if (window.stemAudioManager) {
      console.log('- StemAudioManager geladen');
      const status = window.stemAudioManager.checkStatus();
      console.log('- Status:', status);
    } else {
      console.error('! StemAudioManager fehlt');
    }
  }, 500);
  
  // Event-Listener für audio-looped Events
  document.addEventListener('audio-looped', function(event) {
    console.log('Audio-Loop erkannt - Untertitel werden zurückgesetzt');
    if (window.subtitlesManager) {
      window.subtitlesManager.resetSubtitles();
      window.subtitlesManager.updateSubtitle(0.01); // Kleiner Wert um sicherzustellen, dass die Untertitel aktualisiert werden
    }
  });
  
  // Spielinstanz erstellen
  gameInstance = new GameManager();
  
  // Spielinstanz initialisieren
  gameInstance.init();

  // Touch-Events für das Spielraster optimieren
  document.addEventListener('touchmove', function(e) {
    if (e.target.closest('#grid')) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Überprüfe, ob die wichtigsten Module geladen sind
  setTimeout(function() {
    console.log('Überprüfe Module:', {
      'UI': window.ui ? 'geladen' : 'fehlt',
      'GameManager': window.gameManager ? 'geladen' : 'fehlt',
      'AudioManager': window.audioManager ? 'geladen' : 'fehlt',
      'StemAudioManager': window.stemAudioManager ? 'geladen' : 'fehlt',
      'SubtitlesManager': window.subtitlesManager ? 'geladen' : 'fehlt'
    });
  }, 1000);
});
