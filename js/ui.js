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

  targetWords.forEach(word => {
    const span = document.createElement("span");
    span.classList.add("word");
    span.id = "word-" + word;

    if (difficulty === "loose") {
      span.textContent = word[0] + "-".repeat(word.length - 1);
    } else {
      span.textContent = word;
    }

    if (foundWords.has(word)) {
      span.classList.add("found");
      if (difficulty === "loose") {
        span.textContent = word;
      }
    }

    wordListDiv.appendChild(span);
  });
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
