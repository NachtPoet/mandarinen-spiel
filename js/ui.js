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
 */
function updateTimer(startTime, timerElement) {
  let elapsed = Math.floor((Date.now() - startTime) / 1000);
  let minutes = Math.floor(elapsed / 60);
  let seconds = elapsed % 60;
  timerElement.textContent = `Zeit: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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
 */
function renderWordList(targetWords, foundWords, difficulty, wordListDiv) {
  wordListDiv.innerHTML = "";

  // Icons für jeden Stem
  const stemIcons = [
    '',
    '<svg class="stem-icon bass-icon" viewBox="0 0 24 24"><path d="M6 18V6h12v12H6z" class="stem-icon-base" /><path d="M11 8h2v8h-2v-8z" class="stem-icon-detail" /></svg>',
    '<svg class="stem-icon drums-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5.5" class="stem-icon-base" /><circle cx="12" cy="12" r="2" class="stem-icon-detail" /></svg>',
    '<svg class="stem-icon guitar-icon" viewBox="0 0 24 24"><path d="M7 19l10-14 M10 19.5l7-15" class="stem-icon-detail" /></svg>',
    '<svg class="stem-icon other-icon" viewBox="0 0 24 24"><rect x="8" y="8" width="8" height="8" class="stem-icon-base" /><path d="M8 12h8 M12 8v8" class="stem-icon-detail" /></svg>',
    '<svg class="stem-icon vocal-icon" viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" class="stem-icon-base" /><path d="M8 16c0-2 2-3 4-3s4 1 4 3" class="stem-icon-detail" /></svg>'
  ];

  targetWords.forEach((word, index) => {
    const span = document.createElement("span");
    span.classList.add("word");
    span.id = "word-" + word;
    
    // Stem-Index für dieses Wort (maximal 5 Stems zu aktivieren, wie in gameManager.js)
    const stemIndex = index < 5 ? index + 1 : 0;
    
    if (stemIndex > 0) {
      span.setAttribute('data-stem', stemIndex);
      span.setAttribute('title', getStemName(stemIndex));
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
 * Gibt den Namen eines Stems basierend auf seinem Index zurück
 * @param {number} stemIndex - Index des Stems (1-5)
 * @returns {string} - Name des Stems
 */
function getStemName(stemIndex) {
  const stemNames = [
    "Piano (Basis)",
    "Bass",
    "Schlagzeug",
    "Gitarren",
    "Weitere Instrumente",
    "Gesang"
  ];
  
  return stemNames[stemIndex] || "";
}

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
    rewardBoxElement.style.transform = 'scale(1.5) rotateY(180deg)';
    rewardBoxElement.style.background = 'radial-gradient(circle, #ffdc00, #ff851b)';
    rewardBoxElement.style.boxShadow = '0 0 50px rgba(255, 140, 0, 0.9)';

    // Gutscheincode sichtbar machen
    const couponCodeElement = document.getElementById('couponCode');
    if (couponCodeElement) {
      couponCodeElement.style.display = 'block';
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
 * @param {string} stemName - Name des aktivierten Stems
 * @param {number} stemIndex - Index des Stems (1-5)
 */
function showStemActivation(stemName, stemIndex) {
  const gameContainer = document.getElementById('gameContainer');
  if (!gameContainer) return;
  
  // Erstelle ein temporäres Element zur Anzeige
  const notification = document.createElement('div');
  notification.className = 'stem-notification';
  notification.setAttribute('data-stem', stemIndex);
  
  // Musikalisches Notensymbol hinzufügen und dabei basierend auf dem Stem variieren
  const noteSymbols = ['♪', '♫', '🎵', '🎶'];
  const randomNote = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
  const endNote = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
  
  notification.innerHTML = `
    <div class="stem-notification-icon"></div>
    ${randomNote} ${stemName} aktiviert ${endNote}
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
