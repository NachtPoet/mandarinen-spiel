// Haupteintrittspunkt für das Spiel

// Globale Variable für die Spielinstanz
let gameInstance;

// Initialisierung des Spiels nach dem Laden des DOMs
document.addEventListener("DOMContentLoaded", () => {
  // Spielinstanz erstellen
  gameInstance = new GameManager();

  // Touch-Events für das Spielraster optimieren
  document.addEventListener('touchmove', function(e) {
    if (e.target.closest('#grid')) {
      e.preventDefault();
    }
  }, { passive: false });
});
