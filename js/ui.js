// UI-bezogene Funktionen

/**
 * Aktualisiert die Visualisierung des Schwierigkeitsgrads
 * @param {HTMLElement} selectElement - Das Select-Element für den Schwierigkeitsgrad
 */
function updateDifficultyVisual(selectElement) {
  let difficulty = selectElement.value;

  if (difficulty === "easy") {
    selectElement.style.backgroundColor = "rgba(168, 230, 207, 0.8)";
    selectElement.style.color = "#000";
  } else if (difficulty === "hard") {
    selectElement.style.backgroundColor = "rgba(255, 139, 148, 0.8)";
    selectElement.style.color = "#000";
  } else if (difficulty === "loose") {
    selectElement.style.backgroundColor = "rgba(211, 211, 211, 0.8)";
    selectElement.style.color = "#000";
  }
}

/**
 * Setzt das Farbschema basierend auf dem aktuellen Level
 * @param {Object} scheme - Das Farbschema-Objekt
 */
function setColorScheme(scheme) {
  document.documentElement.style.setProperty('--bg-gradient-start', scheme.bg);
  document.documentElement.style.setProperty('--bg-gradient-end', darkenColor(scheme.bg, 20));
  document.documentElement.style.setProperty('--cell-bg', scheme.cellBg);
  document.documentElement.style.setProperty('--cell-border', scheme.cellBorder);
  document.documentElement.style.setProperty('--cell-selected', scheme.cellSelected);
  document.documentElement.style.setProperty('--cell-found', scheme.cellFound);
  document.documentElement.style.setProperty('--text-shadow', scheme.textShadow);
  document.documentElement.style.setProperty('--title-shadow', scheme.titleShadow);
}

/**
 * Aktualisiert die Timer-Anzeige
 * @param {number} startTime - Die Startzeit des Spiels in Millisekunden
 * @param {HTMLElement} timerElement - Das HTML-Element, das den Timer anzeigt
 * @param {string} timePrefix - The translated prefix (e.g., "Time: ")
 */
function updateTimer(startTime, timerElement, timePrefix = "Zeit: ") { // Add prefix parameter with default
  let elapsed = Math.floor((Date.now() - startTime) / 1000);
  let minutes = Math.floor(elapsed / 60);
  let seconds = elapsed % 60;
  timerElement.textContent = `${timePrefix}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`; // Use prefix
}

/**
 * Rendert das Rätselgitter basierend auf den aktuellen Daten
 * @param {Array} grid - Das 2D-Array, das das Spielraster darstellt
 * @param {number} gridSize - Die Größe des Gitters
 * @param {HTMLElement} gridContainer - Das Container-Element für das Gitter
 */
function renderGrid(grid, gridSize, gridContainer) {
  gridContainer.innerHTML = "";

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.textContent = grid[y][x];
      cell.dataset.row = y;
      cell.dataset.col = x;
      gridContainer.appendChild(cell);
    }
  }
}

/**
 * Rendert die Wortliste basierend auf dem aktuellen Spielstand
 * @param {Array} targetWords - Liste der zu findenden Wörter
 * @param {Set} foundWords - Set der bereits gefundenen Wörter
 * @param {string} difficulty - Aktueller Schwierigkeitsgrad
 * @param {HTMLElement} wordListDiv - Container für die Wortliste
 * @param {function} translateFunc - The localization translate function
 * @param {function} getStemNameKeyFunc - Function to get the translation key for a stem name
 */
function renderWordList(targetWords, foundWords, difficulty, wordListDiv, translateFunc, getStemNameKeyFunc) {
  wordListDiv.innerHTML = "";

  // Icons für jeden Stem - dynamisch basierend auf dem Modus
  const stemIcons = getStemIcons();

  targetWords.forEach((word, index) => {
    const span = document.createElement("span");
    span.classList.add("word");
    span.id = "word-" + word;
    
    // Verbesserte Stem-Index-Zuordnung für verschiedene Modi
    let stemIndex;
    const mode = window.APP_CONFIG ? window.APP_CONFIG.MODE.toUpperCase() : 'BETA';
    
    if (mode === 'RELEASE') {
        // Release-Stem-Mapping für die 5 Stems
        switch(index) {
            case 0: stemIndex = 1; break; // 02R_bass_drums.mp3 (Index 1)
            case 1: stemIndex = 2; break; // 04_guitars.mp3 (Index 2)
            case 2: stemIndex = 3; break; // 05_strings.mp3 (Index 3)
            case 3: stemIndex = 4; break; // 06_synths_fx.mp3 (Index 4)
            case 4: stemIndex = 5; break; // 07_vocals.mp3 (Index 5)
            default: stemIndex = 0;
        }
    } else {
        // Ursprüngliche Berechnung für BETA und PRE_RELEASE
        stemIndex = index < 5 ? index + 1 : 0;
    }
    
    // Get translated stem name for title attribute
    if (stemIndex > 0) {
      span.setAttribute('data-stem', stemIndex);
      const stemNameKey = getStemNameKeyFunc(stemIndex); // Use passed function
      span.setAttribute('title', translateFunc(stemNameKey)); // Use passed translate function
    }

    // Text-Inhalt basierend auf Schwierigkeitsgrad
    if (difficulty === "loose") {
      span.textContent = word[0] + "-".repeat(word.length - 1);
    } else {
      span.textContent = word;
    }

    // Icon-Container hinzufügen
    if (stemIndex > 0) {
      const iconSpan = document.createElement("span");
      iconSpan.classList.add("stem-icon-container");
      iconSpan.innerHTML = stemIcons[stemIndex];
      span.appendChild(iconSpan);
    }

    if (foundWords.has(word)) {
      span.classList.add("found");
      if (difficulty === "loose") {
        span.textContent = word;
      }
      
      // Bei gefundenen Wörtern volle Transparenz für das Icon
      if (stemIndex > 0) {
        span.classList.add("stem-active");
      }
    }

    wordListDiv.appendChild(span);
  });
}

/**
 * Gibt die Stem-Icons basierend auf dem aktuellen Modus zurück
 * @returns {Array} Array mit SVG-Icons für jeden Stem
 */
function getStemIcons() {
  // Standard-Icons (BETA-Modus)
  const defaultIcons = [
    '', // Leeres erstes Icon (für den Index 0)
    '<svg class="stem-icon bass-icon" viewBox="0 0 24 24"><path d="M6 18V6h12v12H6z" class="stem-icon-base" /><path d="M11 8h2v8h-2v-8z" class="stem-icon-detail" /></svg>', // Bass
    '<svg class="stem-icon drums-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5.5" class="stem-icon-base" /><circle cx="12" cy="12" r="2" class="stem-icon-detail" /></svg>', // Drums
    '<svg class="stem-icon guitar-icon" viewBox="0 0 24 24"><path d="M7 19l10-14 M10 19.5l7-15" class="stem-icon-detail" /></svg>', // Guitar
    '<svg class="stem-icon other-icon" viewBox="0 0 24 24"><rect x="8" y="8" width="8" height="8" class="stem-icon-base" /><path d="M8 12h8 M12 8v8" class="stem-icon-detail" /></svg>', // Others
    '<svg class="stem-icon vocal-icon" viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" class="stem-icon-base" /><path d="M8 16c0-2 2-3 4-3s4 1 4 3" class="stem-icon-detail" /></svg>' // Vocals
  ];
  
  // PRE_RELEASE-Modus Icons
  const preReleaseIcons = [
    '', // Leeres erstes Icon
    '<svg class="stem-icon bass-icon" viewBox="0 0 24 24"><path d="M6 18V6h12v12H6z" class="stem-icon-base" /><path d="M11 8h2v8h-2v-8z" class="stem-icon-detail" /></svg>', // Bass
    '<svg class="stem-icon drums-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5.5" class="stem-icon-base" /><circle cx="12" cy="12" r="2" class="stem-icon-detail" /></svg>', // Drums
    '<svg class="stem-icon guitar-icon" viewBox="0 0 24 24"><path d="M7 19l10-14 M10 19.5l7-15" class="stem-icon-detail" /></svg>', // Guitar
    '<svg class="stem-icon strings-icon" viewBox="0 0 24 24"><path d="M5 19c0-5 14-5 14-10" class="stem-icon-detail" /><path d="M5 10c0 5 14 5 14 10" class="stem-icon-detail" /></svg>', // Strings
    '<svg class="stem-icon synth-icon" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="1" class="stem-icon-base" /><circle cx="12" cy="12" r="2" class="stem-icon-detail" /></svg>' // Synths & FX
  ];
  
  // RELEASE-Modus Icons
  const releaseIcons = [
    '', // Leeres erstes Icon
    '<svg class="stem-icon bass-drums-icon" viewBox="0 0 24 24"><path d="M6 18V6h12v12H6z" class="stem-icon-base" /><circle cx="12" cy="12" r="4" class="stem-icon-detail" /></svg>', // Bass+Drums
    '<svg class="stem-icon guitar-icon" viewBox="0 0 24 24"><path d="M7 19l10-14 M10 19.5l7-15" class="stem-icon-detail" /></svg>', // Guitar
    '<svg class="stem-icon strings-icon" viewBox="0 0 24 24"><path d="M5 19c0-5 14-5 14-10" class="stem-icon-detail" /><path d="M5 10c0 5 14 5 14 10" class="stem-icon-detail" /></svg>', // Strings
    '<svg class="stem-icon synth-icon" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="1" class="stem-icon-base" /><circle cx="12" cy="12" r="2" class="stem-icon-detail" /></svg>', // Synths & FX
    '<svg class="stem-icon vocal-icon" viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" class="stem-icon-base" /><path d="M8 16c0-2 2-3 4-3s4 1 4 3" class="stem-icon-detail" /></svg>' // Vocals
  ];
  
  // Je nach aktuellem Modus die entsprechenden Icons zurückgeben
  if (window.APP_CONFIG) {
    if (APP_CONFIG.MODE === 'PRE_RELEASE') {
      return preReleaseIcons;
    } else if (APP_CONFIG.MODE === 'RELEASE') {
      return releaseIcons;
    }
  }
  
  // Fallback zu Standard-Icons (BETA)
  return defaultIcons;
}

/**
 * Gibt den Namen eines Stems basierend auf seinem Index zurück
 * @param {number} stemIndex - Index des Stems (1-5)
 * @returns {string} - Name des Stems (DEPRECATED - use getStemNameKey in GameManager and translate)
 */
// function getStemName(stemIndex) {
//   // This function is now less useful as names are handled by translation keys.
//   // Kept for reference or potential fallback, but should ideally be removed.
//   if (window.APP_CONFIG && APP_CONFIG.STEMS && APP_CONFIG.STEMS[APP_CONFIG.MODE]) {
//     const stems = APP_CONFIG.STEMS[APP_CONFIG.MODE];
//     if (stemIndex >= 0 && stemIndex < stems.length) {
//       // Try to get translated name via key derived in GameManager
//       const key = gameInstance ? gameInstance.getStemNameKey(stemIndex) : `stemName${stemIndex}`; // Needs access to gameInstance or pass function
//       return localization.translate(key, { default: stems[stemIndex].name }); // Use translate with fallback
//     }
//   }
//   // Fallback keys
//   const fallbackKeys = [
//     '', 'config_stems_beta_piano', 'config_stems_beta_bass', 'config_stems_beta_drums',
//     'config_stems_beta_guitars', 'config_stems_beta_others', 'config_stems_beta_vocals'
//   ];
//   return localization.translate(fallbackKeys[stemIndex] || `stemName${stemIndex}`, { default: `Stem ${stemIndex}` });
// }

/**
 * Aktualisiert die Fortschrittsanzeige
 * @param {number} foundCount - Anzahl der gefundenen Wörter
 * @param {number} totalCount - Gesamtanzahl der zu findenden Wörter
 * @param {HTMLElement} progressBarElement - Das Fortschrittsbalken-Element
 */
function updateProgressBar(foundCount, totalCount, progressBarElement) {
  const progress = (foundCount / totalCount) * 100;
  progressBarElement.style.width = `${progress}%`;
}

/**
 * Öffnet die Belohnung am Ende des Spiels
 * @param {HTMLElement} rewardBoxElement - Das Belohnungsbox-Element
 * @param {AudioManager} audioManager - Die Audio-Manager-Instanz
 */
function openReward(rewardBoxElement, audioManager) {
  audioManager.playSound('levelComplete');
  triggerMemoryFlash(audioManager);
  rewardBoxElement.style.animation = 'none';

  setTimeout(() => {
    // Verkleinerte Skalierung (1.2 statt 1.5)
    rewardBoxElement.style.transform = 'scale(1.2) rotateY(180deg)';
    rewardBoxElement.style.background = 'radial-gradient(circle, #ffdc00, #ff851b)';
    rewardBoxElement.style.boxShadow = '0 0 50px rgba(255, 140, 0, 0.9)';

    // Gutscheincode sichtbar machen
    const couponCodeElement = document.getElementById('couponCode');
    if (couponCodeElement) {
      couponCodeElement.style.display = 'block';
      // Mehr Abstand nach oben hinzufügen
      couponCodeElement.style.marginTop = '80px';
    }

    setTimeout(() => {
      createConfetti(80);
    }, 300);
  }, 100);
}

/**
 * Entfernt die "selected"-Klasse von allen Zellen
 */
function clearCellSelection() {
  document.querySelectorAll(".cell.selected").forEach(cell => cell.classList.remove("selected"));
}

/**
 * Zeigt einen Tipp für ein Wort
 * @param {Array} targetWords - Liste der zu findenden Wörter
 * @param {Set} foundWords - Set der bereits gefundenen Wörter
 * @param {AudioManager} audioManager - Die Audio-Manager-Instanz
 * @returns {number} - 1 wenn ein Tipp gegeben wurde, 0 sonst
 */
function giveWordHint(targetWords, foundWords, audioManager) {
  // Finde ungelöste Wörter
  const unsolvedWords = targetWords.filter(word => !foundWords.has(word));
  if (unsolvedWords.length === 0) return 0;

  // Wähle ein zufälliges ungelöstes Wort
  const randomWord = unsolvedWords[Math.floor(Math.random() * unsolvedWords.length)];
  const letter = randomWord[0];
  let firstLetterCells = [];

  // Finde alle Zellen mit dem ersten Buchstaben
  document.querySelectorAll(".cell").forEach(cell => {
    if (cell.textContent === letter) {
      firstLetterCells.push(cell);
    }
  });

  // Markiere die Zellen mit dem ersten Buchstaben
  if (firstLetterCells.length > 0) {
    firstLetterCells.forEach(cell => {
      cell.style.transition = "all 0.3s ease";
      cell.style.backgroundColor = "var(--cell-selected)";
      cell.style.color = "#000";
      cell.style.transform = "scale(1.2)";
      cell.style.zIndex = "10";
      cell.style.boxShadow = "0 0 15px var(--cell-selected)";

      setTimeout(() => {
        cell.style.backgroundColor = "";
        cell.style.color = "";
        cell.style.transform = "";
        cell.style.zIndex = "";
        cell.style.boxShadow = "";
      }, 1000);
    });

    audioManager.playSound('hint');
    return 1;
  }

  return 0;
}

/**
 * Zeigt visuell an, dass ein neuer Stem aktiviert wurde
 * Angepasst für unterschiedliche Modi
 * @param {string} stemName - Name des aktivierten Stems
 * @param {number} stemIndex - Index des Stems
 */
function showStemActivation(stemName, stemIndex) {
  const gameContainer = document.getElementById('gameContainer');
  if (!gameContainer) return;
  
  // Stem-Namen aus dem aktuellen Modus beziehen
  const currentStemName = window.APP_CONFIG ? 
    (APP_CONFIG.STEMS[APP_CONFIG.MODE][stemIndex]?.name || stemName) : 
    stemName;
  
  // Erstelle ein temporäres Element zur Anzeige
  const notification = document.createElement('div');
  notification.className = 'stem-notification';
  notification.setAttribute('data-stem', stemIndex);
  
  // Musikalisches Notensymbol hinzufügen und dabei basierend auf dem Stem variieren
  const noteSymbols = ['♪', '♫', '🎵', '🎶'];
  const randomNote = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
  const endNote = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];

  // Use translation key for the notification text
  const notificationText = localization.translate('stemActivationNotification', { stemName: currentStemName });

  notification.innerHTML = `
    <div class="stem-notification-icon"></div>
    ${randomNote} ${notificationText} ${endNote}
  `;

  // Füge es zum Spielbereich hinzu
  gameContainer.appendChild(notification);
  
  // Animation starten und dann Element entfernen
  setTimeout(() => {
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => notification.remove(), 500);
    }, 2000);
  }, 10);
}

// Füge Debug-Information hinzu, um zu sehen, ob die Event-Listener korrekt initialisiert werden
console.log('UI-Script wird geladen');

document.addEventListener('DOMContentLoaded', function() {
  console.log('UI: DOM vollständig geladen, initialisiere UI-Module...');
  
  // Deklariere UI-Elemente
  const startButton = document.getElementById('startButton');
  const startNewButton = document.getElementById('startNewButton');
  const helpButton = document.getElementById('helpButton');
  
  console.log('UI: Hauptelemente gefunden:', {
    startButton: !!startButton,
    startNewButton: !!startNewButton,
    helpButton: !!helpButton
  });
  
  // Event-Listener für den Start-Button
  if (startButton) {
    console.log('UI: Füge Startbutton-Listener hinzu');
    startButton.addEventListener('click', function() {
      console.log('UI: Start-Button geklickt');
      
      // Überprüfe, ob die Audio-Manager ordnungsgemäß initialisiert wurden
      const stemAudioReady = window.stemAudioManager && typeof window.stemAudioManager.play === 'function';
      console.log('UI: StemAudioManager bereit:', stemAudioReady);
      
      // Spiel starten, wenn vorhanden
      if (window.gameManager && typeof window.gameManager.startGame === 'function') {
        console.log('UI: Rufe gameManager.startGame() auf');
        window.gameManager.startGame();
      } else {
        console.error('UI: GameManager nicht verfügbar oder startGame-Methode fehlt');
      }
    });
  }
});

// Exportiere UI-Funktionen für die globale Nutzung
window.ui = {
  // Zeigt eine Benachrichtigung an (z.B. für aktivierte Stems)
  showNotification: function(message, stemIndex) {
    const notification = document.querySelector('.stem-notification');
    if (!notification) return;
    
    // Setze Stem-Attribut für spezielles Styling
    notification.setAttribute('data-stem', stemIndex || '1');
    
    // Ändere den Text
    const textElement = notification.querySelector('.stem-notification-text');
    if (textElement) {
      textElement.textContent = message;
    }
    
    // Animation starten
    notification.classList.remove('hide');
    notification.classList.add('show');
    
    // Nach 3 Sekunden ausblenden
    setTimeout(() => {
      notification.classList.remove('show');
      notification.classList.add('hide');
    }, 3000);
  },
  
  // Aktiviert einen epischen Badge für perfekte Levels
  showEpicBadge: function(show) {
    const badge = document.querySelector('.epic-badge');
    if (badge) {
      if (show) {
        badge.classList.add('visible');
      } else {
        badge.classList.remove('visible');
      }
    }
  },
  
  // Setzt die aktuelle Levelanzeige
  updateLevelIndicator: function(current, total) {
    const indicator = document.getElementById('levelIndicator');
    if (indicator) {
      // Prüfen, ob Lokalisierung verfügbar ist
      if (window.localization) {
        indicator.textContent = window.localization.translate('levelIndicator', { 
          current: current, 
          total: total 
        });
      } else {
        indicator.textContent = `Level: ${current}/${total}`;
      }
    }
  },
  
  debug: {
    logUIElements: function() {
      console.log('UI Debug - Wichtige Elemente:');
      console.log('Start Button:', document.getElementById('startButton'));
      console.log('Start New Button:', document.getElementById('startNewButton'));
      console.log('Grid:', document.getElementById('grid'));
      console.log('Word List:', document.getElementById('wordList'));
      console.log('Subtitles Container:', document.getElementById('subtitlesContainer'));
    }
  }
};
