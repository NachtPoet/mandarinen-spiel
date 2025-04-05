/**
 * babel-ui.js - Verbesserte UI für den Babel-Modus
 * Fügt visuelle Verbesserungen für den Babel-Modus hinzu
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Babel-UI: Initialisiere Babel-UI-Verbesserungen');
  
  // Finde das Schwierigkeitsgrad-Dropdown
  const difficultySelect = document.getElementById('difficultySelect');
  if (!difficultySelect) {
    console.warn('Babel-UI: Schwierigkeitsgrad-Dropdown nicht gefunden');
    return;
  }
  
  // Finde die Babel-Option
  const babelOption = difficultySelect.querySelector('option[value="babel"]');
  if (!babelOption) {
    console.warn('Babel-UI: Babel-Option nicht gefunden');
    return;
  }
  
  // Füge ein Regenbogen-Emoji hinzu, falls es noch nicht vorhanden ist
  if (!babelOption.textContent.includes('🌈')) {
    babelOption.textContent = '🌈 ' + babelOption.textContent;
    console.log('Babel-UI: Regenbogen-Emoji zur Babel-Option hinzugefügt');
  }
  
  // Füge einen Event-Listener hinzu, um den Regenbogen-Hintergrund zu aktualisieren
  difficultySelect.addEventListener('mousedown', function() {
    // Füge eine Klasse zum Body hinzu, um CSS-Regeln für das Dropdown zu aktivieren
    document.body.classList.add('babel-dropdown-open');
    
    // Entferne die Klasse nach einer kurzen Verzögerung
    setTimeout(function() {
      document.body.classList.remove('babel-dropdown-open');
    }, 1000);
  });
  
  console.log('Babel-UI: Initialisierung abgeschlossen');
});
