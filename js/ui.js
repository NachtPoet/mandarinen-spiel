// UI-bezogene Funktionen

/**
 * Aktualisiert die Visualisierung des Schwierigkeitsgrads
 * @param {HTMLElement} selectElement - Das Select-Element für den Schwierigkeitsgrad
 */
function updateDifficultyVisual(selectElement) {
  let difficulty = selectElement.value;

  // Zuerst alle Stile zurücksetzen
  selectElement.style.background = "";
  selectElement.style.backgroundColor = "";
  selectElement.style.color = "";
  selectElement.style.textShadow = "";

  if (difficulty === "easy") {
    selectElement.style.backgroundColor = "rgba(168, 230, 207, 0.8)";
    selectElement.style.color = "#000";
  } else if (difficulty === "hard") {
    selectElement.style.backgroundColor = "rgba(255, 139, 148, 0.8)";
    selectElement.style.color = "#000";
  } else if (difficulty === "loose") {
    selectElement.style.backgroundColor = "rgba(211, 211, 211, 0.8)";
    selectElement.style.color = "#000";
  } else if (difficulty === "babel") {
    // Schwarzer Hintergrund für Babel
    selectElement.style.backgroundColor = "#000000";
    selectElement.style.color = "#fff";
    selectElement.style.fontWeight = "bold";
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
// In der ui.js oder utils.js:
// Diese Funktion muss angepasst werden, um mit dem speziellen RTL-Objektformat umzugehen

function renderGrid(grid, gridSize, gridElement) {
  gridElement.innerHTML = '';
  gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  // Überprüfen, ob wir in einer RTL-Sprache sind
  const currentLanguage = window.localization ? window.localization.getCurrentLanguage() : 'de';
  const isRtl = window.localization && typeof window.localization.isRtlLanguage === 'function'
              ? window.localization.isRtlLanguage(currentLanguage)
              : ['ar', 'he', 'fa', 'ur'].includes(currentLanguage);

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;

      // Buchstabe aus dem Grid holen, entweder als String oder als RTL-Objekt
      const cellContent = grid[row][col];
      let letter;

      if (typeof cellContent === 'object' && cellContent !== null && cellContent.rtl) {
        // RTL-Zelle mit special handling
        letter = cellContent.letter;
        cell.setAttribute('dir', 'rtl');
        cell.classList.add('rtl-cell');
      } else {
        // Normale Zelle
        letter = cellContent;
      }

      cell.textContent = letter;
      gridElement.appendChild(cell);
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
// In der renderWordList() Funktion (oder wo auch immer die Wortliste generiert wird)
function renderWordList(targetWords, foundWords, difficulty, wordListElement, translateFn, getStemNameKey) {
  if (!wordListElement) {
    console.error("WordList Element nicht gefunden!");
    return;
  }

  console.log("renderWordList wird ausgeführt:", {
    wordsCount: targetWords.length,
    foundCount: foundWords.size,
    difficulty: difficulty
  });

  wordListElement.innerHTML = '';
  const currentLang = window.localization ? window.localization.getCurrentLanguage() : 'de';
  const isRtl = window.localization && window.localization.isRtlLanguage &&
                window.localization.isRtlLanguage(currentLang);

  // Prüfen, ob es sich um eine Sprache mit verbundener Schrift handelt
  const isConnectedScript = window.connectedScript &&
                           window.connectedScript.isConnectedScriptLanguage &&
                           window.connectedScript.isConnectedScriptLanguage(currentLang);

  // Toggle-Status ermitteln - explizit aus localStorage lesen, um konsistent zu sein
  const scriptToggle = document.getElementById('scriptToggle');
  // Wenn der Toggle existiert, seinen Status verwenden, sonst aus localStorage oder Standard (true)
  const showConnected = scriptToggle ? scriptToggle.checked :
                       localStorage.getItem('showConnectedScript') !== 'false';

  console.log(`Wortliste wird gerendert: Sprache=${currentLang}, RTL=${isRtl}, VerbundeneSchrift=${isConnectedScript}, ZeigeVerbunden=${showConnected}`);

  // Icons für jeden Stem - dynamisch basierend auf dem Modus
  const stemIcons = typeof getStemIcons === 'function' ? getStemIcons() : [];

  targetWords.forEach((word, index) => {
    if (!word) {
      console.warn(`Ungültiges Wort an Index ${index}:`, word);
      return; // Ungültiges Wort überspringen
    }

    const wordEl = document.createElement('div');
    wordEl.className = 'word';
    wordEl.id = 'word-' + word;
    wordEl.dataset.originalWord = word; // Original-Wort für Referenz speichern

    // Add dir="rtl" for RTL languages
    if (isRtl) {
      wordEl.setAttribute('dir', 'rtl');
    }

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
      wordEl.setAttribute('data-stem', stemIndex);
      const stemNameKey = getStemNameKey(stemIndex);
      wordEl.setAttribute('title', translateFn(stemNameKey));
    }

    // Determine display text based on difficulty, found status, and toggle state
    const isFound = foundWords.has(word);

    // Wichtig: Füge Debug-Ausgabe für verbundene Schriften hinzu
    if (isConnectedScript) {
      console.log(`Wort '${word}': isFound=${isFound}, showConnected=${showConnected}, difficulty=${difficulty}`);
    }

    if (difficulty === "loose" && !isFound) {
        // Loose difficulty, word not found: Show first letter hint
        const firstChar = word.charAt(0);
        if (isConnectedScript && !showConnected) {
            // Separated view for connected scripts (RTL handled)
            if (isRtl) {
                wordEl.textContent = '• '.repeat(word.length - 1) + firstChar;
            } else {
                wordEl.textContent = firstChar + ' •'.repeat(word.length - 1);
            }
            wordEl.classList.add('separated-view');
            console.log(`RTL Wort '${word}' als getrennt dargestellt: ${wordEl.textContent}`);
        } else {
            // Connected view or non-connected script: Standard hint
            wordEl.textContent = firstChar + '•'.repeat(word.length - 1);
            wordEl.classList.remove('separated-view');
        }
    } else if (difficulty === "hard" && !isFound) {
        // Hard difficulty, word not found: Show first letter hint (RIGHTMOST for RTL)
        let hintChar;
        let hintText;
        if (isRtl) {
            hintChar = word.slice(-1); // Get the last character (visually first in RTL)
            hintText = '•'.repeat(word.length - 1) + hintChar;
        } else {
            hintChar = word.charAt(0); // Get the first character (visually first in LTR)
            hintText = hintChar + '•'.repeat(word.length - 1);
        }
        wordEl.textContent = hintText;

        // Apply separated view styling if needed for connected scripts
        if (isConnectedScript && !showConnected) {
             if (isRtl) {
                 // Ensure spacing for separated view in RTL
                 wordEl.textContent = '• '.repeat(word.length - 1) + hintChar;
             } else {
                 // Ensure spacing for separated view in LTR
                 wordEl.textContent = hintChar + ' •'.repeat(word.length - 1);
             }
             wordEl.classList.add('separated-view');
        } else {
             wordEl.classList.remove('separated-view'); // Ensure class is removed if not separated
        }
    } else {
        // Word is found OR difficulty is easy/medium: Show full word
        if (isConnectedScript && !showConnected) {
            // Separated view for connected scripts
            if (window.connectedScript && window.connectedScript.getIndividualLetters) {
                wordEl.textContent = window.connectedScript.getIndividualLetters(word);
                console.log(`Verbundenes Wort '${word}' getrennt: ${wordEl.textContent}`);
            } else {
                // Fallback wenn getIndividualLetters nicht verfügbar ist
                wordEl.textContent = word.split('').join(' ');
                console.log(`Fallback: Wort '${word}' getrennt mit .split().join(): ${wordEl.textContent}`);
            }
            wordEl.classList.add('separated-view');
        } else {
            // Connected view or non-connected script: Show original word
            wordEl.textContent = word;
            wordEl.classList.remove('separated-view');
        }
    }

    // Icon-Container hinzufügen
    if (stemIndex > 0 && stemIcons && stemIcons[stemIndex]) {
      const iconSpan = document.createElement("span");
      iconSpan.classList.add("stem-icon-container");
      iconSpan.innerHTML = stemIcons[stemIndex];
      wordEl.appendChild(iconSpan);
    }

    if (foundWords.has(word)) {
      wordEl.classList.add("found");
      if (difficulty === "loose") {
        wordEl.textContent = word; // Show full word when found
        const iconSpan = wordEl.querySelector('.stem-icon-container');
        if (iconSpan) iconSpan.style.opacity = 1; // Make icon fully visible
      }

      // Bei gefundenen Wörtern volle Transparenz für das Icon
      if (stemIndex > 0) {
        wordEl.classList.add("stem-active");
      }
    }

    wordListElement.appendChild(wordEl);
  });

  // Setze eine Klasse auf den Container, um CSS-Styling für getrennte Ansicht zu ermöglichen
  if (isConnectedScript && !showConnected) {
    wordListElement.classList.add('separated-script-view');
  } else {
    wordListElement.classList.remove('separated-script-view');
  }

  console.log("Wortliste wurde aktualisiert");
}

// Diese Funktion sollte global verfügbar sein
window.renderWordList = renderWordList;

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
// Diese Version ist als Modifikation der bestehenden Funktion in ui.js gedacht

function giveWordHint(targetWords, foundWords, audioManager) {
  // Finde ungelöste Wörter
  const unsolvedWords = targetWords.filter(word => !foundWords.has(word));
  if (unsolvedWords.length === 0) return 0;

  // Wähle ein zufälliges ungelöstes Wort
  const randomWord = unsolvedWords[Math.floor(Math.random() * unsolvedWords.length)];

  // Prüfen, ob es Hindi ist
  const isHindi = window.localization && window.localization.getCurrentLanguage() === 'hi';

  let firstLetterCells = [];
  console.log(`[Hint Debug] Trying hint for word: ${randomWord}`); // Log target word
  if (isHindi) {
    console.log("[Hint Debug] Hindi language detected. Using Akshara logic."); // Log Hindi path entry
    // Für Hindi: Erstes Akshara (Silbe) verwenden
    try {
      // Greife auf die splitHindiWordIntoAksharas-Methode über die globale gameInstance zu
      let splitFunction = null;
      if (window.gameInstance && typeof window.gameInstance.splitHindiWordIntoAksharas === 'function') {
        splitFunction = window.gameInstance.splitHindiWordIntoAksharas.bind(window.gameInstance);
      } else {
         console.error("[Hint Debug] window.gameInstance or its splitHindiWordIntoAksharas method not found!");
      }

      if (splitFunction) {
        const aksharas = splitFunction(randomWord);
        if (aksharas.length > 0) {
          const firstAkshara = aksharas[0];
          console.log(`[Hint Debug] Splitter returned first Akshara: '${firstAkshara}' (Length: ${firstAkshara.length})`); // Log the identified Akshara

          // Suche im gameInstance.grid nach den Koordinaten des Aksharas
          if (window.gameInstance && window.gameInstance.grid) {
            console.log("[Hint Debug] Accessing gameInstance.grid to find cell coordinates."); // Log grid access
            const grid = window.gameInstance.grid;
            const gridSize = window.gameInstance.gridSize;
            const normalizedTargetAkshara = firstAkshara.normalize();
            console.log(`[Hint Debug] Normalized target Akshara: '${normalizedTargetAkshara}'`); // Log normalized target
            let matchFoundInGrid = false; // Flag to track if match found
            for (let r = 0; r < gridSize; r++) {
              for (let c = 0; c < gridSize; c++) {
                const gridContent = grid[r][c];
                // Log content being checked (only if it's a string)
                if (typeof gridContent === 'string') {
                   // console.log(`[Hint Debug] Checking grid[${r}][${c}]: '${gridContent}' (Normalized: '${gridContent.normalize()}')`);
                   if (gridContent.normalize() === normalizedTargetAkshara) {
                     console.log(`[Hint Debug] Match found at grid[${r}][${c}]!`); // Log match
                     matchFoundInGrid = true;
                     // Finde das entsprechende DOM-Element über die Koordinaten
                     const cellElement = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
                     if (cellElement) {
                       console.log("[Hint Debug] Corresponding DOM cell found."); // Log DOM cell found
                       firstLetterCells.push(cellElement);
                     } else {
                       console.warn(`[Hint Debug] Match found in grid data at [${r}][${c}], but corresponding DOM cell not found!`);
                     }
                   }
                 }
              }
            }
            if (!matchFoundInGrid) {
               console.warn("[Hint Debug] Loop finished. No match found in grid data for the target Akshara."); // Log if no match after loop
            }
          } else {
             console.error("Hindi-Hint: gameInstance oder gameInstance.grid nicht verfügbar.");
          }

          // This warning is now covered by the !matchFoundInGrid log above
          // if (firstLetterCells.length === 0) {
          //    console.warn(`Hindi-Hint: Konnte keine Zellen für Akshara '${firstAkshara}' im Grid-Datenmodell finden.`);
          // }
        } else {
           console.warn(`[Hint Debug] Akshara splitting returned empty array for word: ${randomWord}`);
        }
      } else {
        // Fallback: Erstes Zeichen verwenden (Suche im DOM, da kein Grid-Zugriff)
        console.warn("[Hint Debug] Hindi splitting function not available. Falling back to first character DOM search.");
        firstLetterCells = findFirstLetterCellsDOM(randomWord[0]); // Umbenannt zur Klarheit
      }
    } catch (e) {
      console.error("[Hint Debug] Error during Hindi hint processing:", e); // Log error
      // Fallback: Erstes Zeichen verwenden
      console.warn("[Hint Debug] Falling back to first character DOM search due to error.");
      firstLetterCells = findFirstLetterCellsDOM(randomWord[0]); // Use DOM search on error
    }
  } else {
    console.log("[Hint Debug] Not Hindi language. Using standard first letter DOM search."); // Log non-Hindi path
    // Standard-Verhalten für andere Sprachen: Erster Buchstabe
    firstLetterCells = findFirstLetterCellsDOM(randomWord[0]); // Ensure DOM search is used here too
  }

  // Hilfsfunktion zum Finden von Zellen mit einem bestimmten Zeichen im DOM (für nicht-Hindi Sprachen oder Fallback)
  function findFirstLetterCellsDOM(letter) {
    let cells = [];
    const normalizedLetter = letter.normalize();
    document.querySelectorAll(".cell").forEach(cell => {
      if (cell.textContent.normalize() === normalizedLetter) {
        cells.push(cell);
      }
    });
    return cells;
  }

  // Markiere die gefundenen Zellen
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
