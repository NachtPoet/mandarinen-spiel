// Hauptspiellogik - GameManager-Klasse
class GameManager {
  constructor() {
    // Spieldaten
    this.levels = GAME_LEVELS; // Original level data (used as fallback)
    this.audioManager = new AudioManager();
    this.stemAudioManager = new StemAudioManager(); // Neue Stem-Manager-Instanz
    this._currentLevelIndex = 0;  // Geändert zu _currentLevelIndex (private Variable)
    this.currentLevel = null; // Holds potentially translated level data
    this.gridSize = 12;
    this.grid = [];
    this.targetWords = [];
    this.foundWords = new Set();
    this.selectedCells = [];
    this.startCell = null;
    this.isDragging = false;

    this.levelPending = false;

    this.currentDifficulty = "easy";
    this.allowedDirections = [];
    this.hintsUsed = 0;

    this.startTime = 0;
    this.timerInterval = null;

    this.storageKey = 'mandarinenGameProgress';

    // Geräteerkennung für mobile Optimierungen
    this.isMobileDevice = this.detectMobileDevice();

    if (this.isMobileDevice) {
      console.log("Mobiles Gerät erkannt - aktiviere optimierte Audio-Behandlung");
    }

    this.domElements = this.getDomElements();

    this.domElements.musicToggle.innerHTML = musicOnIcon;
    this.domElements.soundToggle.innerHTML = soundOnIcon;

    // document.body.appendChild(this.audioManager.bgMusic); // Entfernt, da bgMusic nicht mehr verwendet wird

    // Minimale Initialisierung im Konstruktor
    // Die Hauptinitialisierung findet in der init() Methode statt
    initStarField();
  }

  detectMobileDevice() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  }

  get currentLevelIndex() {
    return this._currentLevelIndex;
  }

  set currentLevelIndex(value) {
    const oldValue = this._currentLevelIndex;
    this._currentLevelIndex = value;
    if (oldValue !== value) {
      console.log(`currentLevelIndex wurde von ${oldValue} auf ${value} geändert`);
      const event = new CustomEvent('levelChanged', { detail: { levelIndex: value } });
      window.dispatchEvent(event);
    }
  }

  getDomElements() {
    return {
      gameContainer: document.getElementById("gameContainer"),
      grid: document.getElementById("grid"),
      wordList: document.getElementById("wordList"),
      timer: document.getElementById("timer"),
      progressBar: document.getElementById("progressBar"),
      startScreen: document.getElementById("startScreen"),
      levelOverlay: document.getElementById("levelOverlay"),
      endScreen: document.getElementById("endScreen"),
      lyricDisplay: document.getElementById("lyricDisplay"),
      endMessage: document.getElementById("endMessage"),
      difficultySelect: document.getElementById("difficultySelect"),
      startButton: document.getElementById("startButton"),
      startNewButton: document.getElementById("startNewButton"),
      nextLevelButton: document.getElementById("nextLevelButton"),
      restartButton: document.getElementById("restartButton"),
      restartNewButton: document.getElementById("restartNewButton"),
      musicToggle: document.getElementById("musicToggle"),
      soundToggle: document.getElementById("soundToggle"),
      hintButton: document.getElementById("hintButton"),
      levelIndicator: document.getElementById("levelIndicator"),
      helpOverlay: document.getElementById("helpOverlay"),
      helpButton: document.getElementById("helpButton"),
      closeHelpButton: document.getElementById("closeHelpButton"),
      epicBadge: document.getElementById("epicBadge"),
      levelQuote: document.getElementById("levelQuote"),
      rewardBox: document.getElementById("rewardBox"),
      languageSelectLabel: document.querySelector('.language-select-wrapper label'),
      // Neue Elemente für den Ladebildschirm
      loadingScreen: document.getElementById('loadingScreen'),
      loadingProgressBar: document.getElementById('loadingProgressBar'),
      loadingProgressText: document.getElementById('loadingProgressText')
    };
  }

  initEventListeners() {
    if (this.eventListenersInitialized) return;
    this.domElements.startButton.addEventListener("click", () => this.startGame());
    this.domElements.startNewButton.addEventListener("click", () => this.startNewGame());
    this.domElements.nextLevelButton.addEventListener("click", () => this.nextLevel());
    this.domElements.restartButton.addEventListener("click", () => this.restartGame());
    const restartNewButtonEnd = document.getElementById("restartNewButton");
    if (restartNewButtonEnd) {
        restartNewButtonEnd.addEventListener("click", () => this.startNewGame());
    } else {
        console.error("Restart New Button on end screen not found!");
    }
    this.domElements.musicToggle.addEventListener("click", () => this.toggleMusic());
    this.domElements.soundToggle.addEventListener("click", () => this.toggleSound());
    this.domElements.hintButton.addEventListener("click", () => this.giveHint());
    this.domElements.difficultySelect.addEventListener("change", () => this.updateDifficultyVisual());
    this.domElements.helpButton.addEventListener("click", () => this.showHelp());
    this.domElements.closeHelpButton.addEventListener("click", () => this.hideHelp());
    if (this.domElements.rewardBox) {
      this.domElements.rewardBox.addEventListener("click", () => this.openReward());
    }
    if (this.isMobileDevice) {
      this.initMobileAudioListeners();
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "L" && e.shiftKey) {
        e.preventDefault();
        console.log("Debug: Level-Skip aktiviert");
        const remainingWords = this.targetWords.filter(word => !this.foundWords.has(word));
        if (remainingWords.length > 0) {
          console.log("Debug: Markiere alle verbliebenden Wörter als gefunden");
          let delay = 0;
          remainingWords.forEach(word => {
            setTimeout(() => {
              this.foundWords.add(word);
              let wordEl = document.getElementById("word-" + word);
              if (wordEl) {
                wordEl.classList.add("found", "word-just-found");
                setTimeout(() => wordEl.classList.remove("word-just-found"), 700);
                if (this.currentDifficulty === "loose") { wordEl.textContent = word; }
              }
              updateProgressBar(this.foundWords.size, this.targetWords.length, this.domElements.progressBar);
              this.audioManager.playSound('wordFound');
              if (this.foundWords.size === this.targetWords.length) {
                console.log("Debug: Level abgeschlossen durch Debug-Skip");
                this.levelPending = true;
                setTimeout(() => this.showLevelComplete(), 800);
              }
            }, delay);
            delay += 300;
          });
        } else if (this.currentLevelIndex >= this.levels.length - 1) {
          this.showLevelComplete();
        }
      }
    });
    this.eventListenersInitialized = true;
  }

  initMobileAudioListeners() {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.addEventListener('stalled', () => this.handleAudioStall(audio));
      audio.addEventListener('error', (e) => this.handleAudioError(audio, e));
      audio.addEventListener('waiting', () => this.handleAudioWaiting(audio));
      if (typeof audio.mozCacheStream !== 'undefined') { audio.mozPreservesPitch = false; }
      audio.preload = "auto";
    });
    if (this.stemAudioManager.context) {
      this.stemAudioManager.context.onstatechange = () => {
        console.log("Audio-Kontext Statusänderung:", this.stemAudioManager.context.state);
        if (this.stemAudioManager.context.state === 'interrupted' || this.stemAudioManager.context.state === 'suspended') {
          this.stemAudioManager.context.resume().then(() => {
            console.log("Audio-Kontext wieder aktiviert");
            if (this.stemAudioManager.syncAllStems) { setTimeout(() => this.stemAudioManager.syncAllStems(true), 100); }
          }).catch(e => console.warn("Fehler beim Wiederaktivieren des Audio-Kontexts:", e));
        }
      };
    }
  }

  handleAudioStall(audioElement) {
    console.log("Audio-Element verzögert:", audioElement.id);
    if (this.stemAudioManager && this.stemAudioManager.isPlaying) {
      setTimeout(() => {
        try {
          if (this.stemAudioManager.stems && this.stemAudioManager.stems[0] && !this.stemAudioManager.stems[0].paused) {
            audioElement.currentTime = this.stemAudioManager.stems[0].currentTime;
          }
          if (audioElement.paused) { audioElement.play().catch(e => console.warn("Fehler beim Neustart:", e)); }
        } catch (e) { console.warn("Fehler bei der Audio-Wiederherstellung:", e); }
      }, 100);
    }
  }

  handleAudioError(audioElement, error) {
    console.warn("Audio-Fehler aufgetreten:", error, audioElement.id);
    setTimeout(() => {
      try {
        const src = audioElement.src;
        audioElement.src = "";
        audioElement.load();
        audioElement.src = src;
        audioElement.load();
        if (this.stemAudioManager && this.stemAudioManager.isPlaying) {
          audioElement.play().catch(e => console.warn("Fehler beim Neustart nach Fehler:", e));
        }
      } catch (e) { console.warn("Fehler bei der Audio-Wiederherstellung nach Fehler:", e); }
    }, 500);
  }

  handleAudioWaiting(audioElement) {
    console.log("Audio-Element buffert:", audioElement.id);
    const bufferingTimeout = setTimeout(() => {
      if (audioElement.readyState < 3) {
        console.log("Lang anhaltendes Buffering, versuche Wiederherstellung:", audioElement.id);
        if (this.stemAudioManager && this.stemAudioManager.stems && this.stemAudioManager.stems[0] && !this.stemAudioManager.stems[0].paused) {
          try {
            audioElement.currentTime = this.stemAudioManager.stems[0].currentTime;
            if (audioElement.paused) { audioElement.play().catch(e => console.warn("Fehler beim Fortsetzten der Wiedergabe:", e)); }
          } catch (e) { console.warn("Fehler bei der Buffering-Wiederherstellung:", e); }
        }
      }
    }, 3000);
    const playingHandler = () => { clearTimeout(bufferingTimeout); audioElement.removeEventListener('playing', playingHandler); };
    audioElement.addEventListener('playing', playingHandler);
  }

  openReward() {
    openReward(this.domElements.rewardBox, this.audioManager);
  }

  saveGameProgress() {
    const progress = {
      currentLevelIndex: this.currentLevelIndex,
      difficulty: this.currentDifficulty,
      hintsUsed: this.hintsUsed,
      musicEnabled: this.audioManager.musicEnabled,
      soundEnabled: this.audioManager.soundEnabled
    };
    try { localStorage.setItem(this.storageKey, JSON.stringify(progress)); }
    catch (e) { console.warn("Spielstand konnte nicht gespeichert werden:", e); }
  }

  loadGameProgress() {
    try {
      const savedState = localStorage.getItem(this.storageKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        // Lade gespeicherten Fortschritt
        if (parsedState.currentLevelIndex !== undefined) {
          this.currentLevelIndex = parsedState.currentLevelIndex;
        }

        if (parsedState.difficulty) {
          this.currentDifficulty = parsedState.difficulty;
        }

        if (parsedState.hintsUsed !== undefined) {
          this.hintsUsed = parsedState.hintsUsed;
        }

        console.log("Spielfortschritt geladen:", parsedState);

        // Aktualisiere Button-Text basierend auf dem Fortschritt
        if (this.domElements.startButton) {
          let buttonText;
          if (this.currentLevelIndex > 0) {
            buttonText = window.localization.translate('continueButton');
          } else {
            buttonText = window.localization.translate('startButton');
          }

          const buttonSpan = this.domElements.startButton.querySelector('span[data-translate]');
          if (buttonSpan) {
            buttonSpan.textContent = buttonText;
          }
          // Start-Button wird jetzt nach dem Laden der Stems aktiviert
          // if (this.loadingComplete) {
          //   this.domElements.startButton.disabled = false;
          //   this.domElements.startButton.classList.remove('disabled');
          // }
        }

        // Aktualisiere Dropdown für Schwierigkeitsgrade
        this.updateDifficultyDropdown();
      } else {
        console.log("Kein gespeicherter Spielfortschritt gefunden");
        this.updateDifficultyDropdown();
      }
    } catch (error) {
      console.error("Fehler beim Laden des Spielfortschritts:", error);
    }
  }

  updateDifficultyDropdown() {
      const easyOption = this.domElements.difficultySelect.querySelector('option[value="easy"]');
      const hardOption = this.domElements.difficultySelect.querySelector('option[value="hard"]');
      const looseOption = this.domElements.difficultySelect.querySelector('option[value="loose"]');
      const babelOption = this.domElements.difficultySelect.querySelector('option[value="babel"]');
      if (easyOption) easyOption.textContent = localization.translate('difficultyEasy');
      if (hardOption) hardOption.textContent = localization.translate('difficultyHard');
      if (looseOption) looseOption.textContent = localization.translate('difficultyLoose');
      if (babelOption) babelOption.textContent = localization.translate('difficultyBabel');
      const label = document.querySelector('label[for="difficultySelect"]');
      if(label) label.textContent = localization.translate('difficultyLabel');
      if(this.domElements.languageSelectLabel) this.domElements.languageSelectLabel.textContent = localization.translate('languageLabel', { default: 'Sprache:' });
  }

  resetGameProgress() {
    try { localStorage.removeItem(this.storageKey); }
    catch (e) { console.warn("Spielstand konnte nicht zurückgesetzt werden:", e); }
  }

  startGame() {
    this.start();
  }

  startNewGame() {
    this.audioManager.playSound('click');

    // Setze Spielstand zurück
    this.currentLevelIndex = 0;
    this.foundWords = new Set();
    this.saveGameProgress();

    // Schwierigkeit aktualisieren
    this.currentDifficulty = this.domElements.difficultySelect.value;
    this.updateDifficultyVisual();

    // Starte das Spiel
    this.start();
  }

  updateTimerDisplay() {
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - this.startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const secondsFormatted = seconds < 10 ? `0${seconds}` : seconds;

    // Zeige Zeit in Format MM:SS
    if (this.domElements.timer) {
      const timerPrefix = window.localization ? window.localization.translate('timerPrefix') : 'Zeit: ';
      this.domElements.timer.textContent = `${timerPrefix}${minutes}:${secondsFormatted}`;
    }
  }

  updateDifficultyVisual() {
    updateDifficultyVisual(this.domElements.difficultySelect);
  }

  loadLevelData() {
      const levelIndex = this.currentLevelIndex;
      if (levelIndex < 0 || levelIndex >= this.levels.length) { console.error("Invalid level index:", levelIndex); return; }
      const lyric = localization.translate(`level${levelIndex + 1}_lyric`);
      const quote = localization.translate(`level${levelIndex + 1}_quote`);

      // Korrektur: Verwende die neue getTranslationEntry Methode
      let targetWords = localization.getTranslationEntry(`level${levelIndex + 1}_words`);

      // Fallback, wenn keine Übersetzung gefunden wird
      if (!Array.isArray(targetWords)) {
          console.error(`Translated targetWords for level ${levelIndex + 1} is not an array:`, targetWords, `Falling back to original.`);
          targetWords = this.levels[levelIndex].targetWords;
      }

      this.currentLevel = {
          colorScheme: this.levels[levelIndex].colorScheme,
          lyric: lyric,
          quote: quote,
          targetWords: targetWords
      };
      this.targetWords = this.currentLevel.targetWords;
  }

  initLevel() {
    this.levelPending = false;
    this.loadLevelData();
    if (!this.currentLevel) { console.error("Failed to initialize level: currentLevel data is missing."); return; }
    setColorScheme(this.currentLevel.colorScheme);
    this.foundWords = new Set();
    this.selectedCells = [];
    this.startCell = null;
    this.grid = Array.from({length: this.gridSize}, () => Array(this.gridSize).fill(""));
    this.domElements.epicBadge.classList.remove('visible');
    updateProgressBar(0, this.targetWords.length, this.domElements.progressBar);
    this.domElements.levelIndicator.textContent = localization.translate('levelIndicator', { current: this.currentLevelIndex + 1, total: this.levels.length });


// Richtungen basierend auf Schwierigkeitsgrad festlegen
if (this.currentDifficulty === "easy") {
  if (window.localization && window.localization.isRtlLanguage(window.localization.getCurrentLanguage())) {
    // RTL-Sprachen: Horizontale Richtung umkehren
    this.allowedDirections = [
      {dx: -1, dy: 0}, // Rechts nach links (horizontal)
      {dx: 0, dy: 1},  // Oben nach unten (vertikal)
      {dx: -1, dy: 1}  // Diagonal rechts oben nach links unten
    ];
  } else {
    // LTR-Sprachen: Original
    this.allowedDirections = [
      {dx: 1, dy: 0},  // Links nach rechts
      {dx: 0, dy: 1},  // Oben nach unten
      {dx: 1, dy: 1}   // Diagonal links oben nach rechts unten
    ];
  }
} else {
  this.allowedDirections = [ {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}, {dx: 1, dy: 1}, {dx: -1, dy: -1}, {dx: 1, dy: -1}, {dx: -1, dy: 1} ];
}

    // Aktuelle Sprache speichern für mögliche spätere Überprüfung
    this.currentLanguageForGrid = window.localization ? window.localization.getCurrentLanguage() : 'de';

    // Wörter platzieren und leere Zellen füllen
    this.targetWords.forEach(word => { this.placeWord(word); });
    this.fillEmptyCells();

    renderGrid(this.grid, this.gridSize, this.domElements.grid);
    renderWordList(this.targetWords, this.foundWords, this.currentDifficulty, this.domElements.wordList, localization.translate, this.getStemNameKey.bind(this));
    this.addCellListeners();
    if (this.currentLevelIndex > 0) {
      const flash = document.querySelector('.memory-flash');
      flash.style.animation = 'none';
      setTimeout(() => { flash.style.animation = 'flash 1.5s forwards'; this.audioManager.playSound('flash'); }, 10);
    }
    if (this.isMobileDevice && typeof this.stemAudioManager.syncAllStems === 'function') {
      setTimeout(() => this.stemAudioManager.syncAllStems(true), 300);
    }
  }

   refreshLevelUI() {
       if (!this.currentLevel) { console.warn("refreshLevelUI called but currentLevel is not set."); return; }

       // Prüfen, ob sich die Sprache geändert hat und ein kompletter Neuaufbau erforderlich ist
       const currentLang = window.localization ? window.localization.getCurrentLanguage() : 'de';
       if (this.currentLanguageForGrid && this.currentLanguageForGrid !== currentLang) {
           console.log(`Sprache hat sich geändert (${this.currentLanguageForGrid} -> ${currentLang}), baue Spielraster neu auf`);
           // Komplettes Level neu aufbauen
           this.initLevel();
           return; // Früher zurückkehren, da initLevel() bereits alles Nötige tut
       }

       // Normale UI-Aktualisierung, wenn sich die Sprache nicht geändert hat
       this.domElements.levelIndicator.textContent = localization.translate('levelIndicator', { current: this.currentLevelIndex + 1, total: this.levels.length });
       renderWordList(this.targetWords, this.foundWords, this.currentDifficulty, this.domElements.wordList, localization.translate, this.getStemNameKey.bind(this));
       localization.updateUI();
   }

// In der GameManager-Klasse: Überarbeitete placeWord-Methode für RTL-Sprachen

/**
 * Platziert ein Wort im Spielraster und berücksichtigt die Sprachrichtung
 * @param {string} word - Das zu platzierende Wort
 * @returns {boolean} - Erfolgreich platziert oder nicht
 */
placeWord(word) {
  const currentLanguage = window.localization ? window.localization.getCurrentLanguage() : 'de';
  const isRtl = window.localization && typeof window.localization.isRtlLanguage === 'function'
              ? window.localization.isRtlLanguage(currentLanguage)
              : ['ar', 'he', 'fa', 'ur'].includes(currentLanguage);

  const originalUpperWord = typeof word === 'string' ? word.toUpperCase() : '';
  if (!originalUpperWord) { console.error("Invalid word provided for placement:", word); return false; }

  // Hindi-Spezialbehandlung: Wort in Aksharas (Silben) aufteilen
  if (currentLanguage === 'hi') {
    const wordAksharas = this.splitHindiWordIntoAksharas(originalUpperWord);
    if (wordAksharas && wordAksharas.length > 0) {
      return this.placeHindiWord(word, wordAksharas);
    }
    // Fallback: Wenn die Akshara-Aufteilung fehlschlägt, reguläre Platzierungsmethode verwenden
  }

  // Reverse the word for RTL + Easy difficulty before placement
  let wordToPlace = originalUpperWord;
  if (isRtl && this.currentDifficulty === "easy") {
    wordToPlace = originalUpperWord.split('').reverse().join('');
    console.log(`RTL Easy Mode: Reversing word "${originalUpperWord}" to "${wordToPlace}" for grid placement.`);
  }

  const len = wordToPlace.length;
  let maxAttempts = (len > 8) ? 150 : 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const dir = this.allowedDirections[Math.floor(Math.random() * this.allowedDirections.length)];
    let startXMin = (dir.dx < 0) ? (len - 1) : 0;
    let startXMax = (dir.dx > 0) ? (this.gridSize - (dir.dx * (len - 1))) : this.gridSize;
    let startYMin = (dir.dy < 0) ? (len - 1) : 0;
    let startYMax = (dir.dy > 0) ? (this.gridSize - (dir.dy * (len - 1))) : this.gridSize;

    if (startXMax <= startXMin || startYMax <= startYMin) continue;

    const startX = Math.floor(Math.random() * (startXMax - startXMin)) + startXMin;
    const startY = Math.floor(Math.random() * (startYMax - startYMin)) + startYMin;

    let canPlace = true;
    for (let i = 0; i < len; i++) {
      const x = startX + dir.dx * i;
      const y = startY + dir.dy * i;

      if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
        canPlace = false;
        break;
      }

      const current = this.grid[y][x];
      let currentLetter;

      if (typeof current === 'object' && current !== null && current.rtl) {
        currentLetter = current.letter;
      } else {
        currentLetter = current;
      }

      // Use wordToPlace for checking
      if (currentLetter !== "" && currentLetter !== wordToPlace[i]) {
        canPlace = false;
        break;
      }
    }

    if (canPlace) {
      for (let i = 0; i < len; i++) {
        const x = startX + dir.dx * i;
        const y = startY + dir.dy * i;

        // Use wordToPlace for placing
        if (isRtl) {
          // Bei RTL-Sprachen speichern wir ein spezielles Objekt
          this.grid[y][x] = {
            letter: wordToPlace[i],
            rtl: true
          };
        } else {
          // Normaler Fall
          this.grid[y][x] = wordToPlace[i];
        }
      }
      return true;
    }
  }

  // Fallback-Platzierung (wenn keine normale Platzierung möglich war)
  console.warn("Could not place word:", originalUpperWord); // Log original word
  for (let row = 0; row < this.gridSize; row++) {
    let emptyCount = 0;
    for (let col = 0; col < this.gridSize; col++) {
      const current = this.grid[row][col];
      if (current === "" || (typeof current === 'object' && current !== null && current.letter === "")) {
        emptyCount++;
      }
    }

    if (emptyCount >= len) {
      let col = Math.floor(Math.random() * (this.gridSize - len + 1));
      for (let i = 0; i < len; i++) {
        // Use wordToPlace for fallback placement
        if (isRtl) {
          this.grid[row][col + i] = {
            letter: wordToPlace[i],
            rtl: true
          };
        } else {
          this.grid[row][col + i] = wordToPlace[i];
        }
      }
      return true;
    }
  }
  return false;
}

// Neue Hilfsmethode für die Platzierung von Hindi-Wörtern mit Aksharas
placeHindiWord(originalWord, wordAksharas) {
  const len = wordAksharas.length;
  let maxAttempts = (len > 5) ? 150 : 100;

  console.log(`Platziere Hindi-Wort "${originalWord}" mit ${len} Aksharas:`, wordAksharas);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const dir = this.allowedDirections[Math.floor(Math.random() * this.allowedDirections.length)];
    let startXMin = (dir.dx < 0) ? (len - 1) : 0;
    let startXMax = (dir.dx > 0) ? (this.gridSize - (dir.dx * (len - 1))) : this.gridSize;
    let startYMin = (dir.dy < 0) ? (len - 1) : 0;
    let startYMax = (dir.dy > 0) ? (this.gridSize - (dir.dy * (len - 1))) : this.gridSize;

    if (startXMax <= startXMin || startYMax <= startYMin) continue;

    const startX = Math.floor(Math.random() * (startXMax - startXMin)) + startXMin;
    const startY = Math.floor(Math.random() * (startYMax - startYMin)) + startYMin;

    let canPlace = true;
    for (let i = 0; i < len; i++) {
      const x = startX + dir.dx * i;
      const y = startY + dir.dy * i;

      if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
        canPlace = false;
        break;
      }

      // Für Hindi wird jede Zelle mit einer kompletten Silbe (Akshara) gefüllt
      const current = this.grid[y][x];
      if (current !== "" && current !== wordAksharas[i]) {
        canPlace = false;
        break;
      }
    }

    if (canPlace) {
      for (let i = 0; i < len; i++) {
        const x = startX + dir.dx * i;
        const y = startY + dir.dy * i;

        // Akshara in die Zelle setzen
        this.grid[y][x] = wordAksharas[i];
      }
      return true;
    }
  }

  // Fallback-Platzierung für Hindi-Wörter
  console.warn("Could not place Hindi word:", originalWord);
  for (let row = 0; row < this.gridSize; row++) {
    let emptyCount = 0;
    for (let col = 0; col < this.gridSize; col++) {
      if (this.grid[row][col] === "") {
        emptyCount++;
      }
    }

    if (emptyCount >= len) {
      let col = Math.floor(Math.random() * (this.gridSize - len + 1));
      for (let i = 0; i < len; i++) {
        this.grid[row][col + i] = wordAksharas[i];
      }
      return true;
    }
  }
  return false;
}

// Hindi-Hilfsfunktionen
getHindiAksharas() {
  // Sammelt alle einzigartigen Aksharas aus ALLEN Hindi-Level-Wörtern
  const allLevelAksharas = new Set();

  if (window.localization && typeof window.localization.getTranslationEntry === 'function') {
    // Gehe durch alle Level (angenommen 1 bis 10)
    for (let i = 1; i <= 10; i++) {
      const levelKey = `level${i}_words`;
      const words = window.localization.getTranslationEntry(levelKey);

      if (Array.isArray(words)) {
        for (const word of words) {
          if (typeof word === 'string') {
            try {
              // Teile jedes Wort in Aksharas auf
              const aksharas = this.splitHindiWordIntoAksharas(word);
              // Füge jedes Akshara zum Set hinzu (Duplikate werden automatisch ignoriert)
              aksharas.forEach(akshara => {
                if (akshara && akshara.trim().length > 0) { // Nur gültige Aksharas hinzufügen
                   allLevelAksharas.add(akshara);
                }
              });
            } catch (e) {
              console.warn(`Fehler beim Extrahieren von Aksharas aus Wort '${word}' in Level ${i}:`, e);
            }
          }
        }
      } else {
         // Optional: Warnung, wenn für ein Level keine Wörter gefunden wurden
         // console.warn(`Keine Wörter für Level ${i} gefunden (Key: ${levelKey})`);
      }
    }
  } else {
    console.error("Localization-Objekt oder getTranslationEntry-Funktion nicht verfügbar zum Sammeln von Hindi-Aksharas.");
    // Fallback: Nur Aksharas aus dem aktuellen Level verwenden (weniger ideal)
    if (this.targetWords && Array.isArray(this.targetWords)) {
      for (const word of this.targetWords) {
        if (typeof word === 'string') {
          try {
            const aksharas = this.splitHindiWordIntoAksharas(word);
            aksharas.forEach(akshara => {
               if (akshara && akshara.trim().length > 0) {
                  allLevelAksharas.add(akshara);
               }
            });
          } catch (e) { console.warn("Fallback: Fehler beim Extrahieren von Aksharas aus Wort:", word, e); }
        }
      }
    }
  }

  // Konvertiere das Set in ein Array
  const aksharaPool = Array.from(allLevelAksharas);
  console.log("Generierter Hindi Akshara Pool für Füller:", aksharaPool);

  if (aksharaPool.length === 0) {
     console.warn("Hindi Akshara Pool ist leer! Fallback auf Standard-Alphabet.");
     // Fallback auf ein Array von einfachen Zeichen, falls etwas schiefgeht
     return ["क","ख","ग","घ","च","छ","ज","झ","ट","ठ","ड","ढ","त","थ","द","ध","न","प","फ","ब","भ","म","य","र","ल","व","श","ष","स","ह","अ","आ","इ","ई","उ","ऊ","ए","ऐ","ओ","औ"];
  }

  // Gebe das Array der einzigartigen Aksharas zurück
  return aksharaPool;
}

/**
 * Zerlegt ein Hindi-Wort in einzelne Aksharas (Silben) unter Berücksichtigung
 * der komplexen Regeln für Devanagari-Schrift
 * @param {string} word - Ein Hindi-Wort
 * @returns {Array} Ein Array von Aksharas
 */
splitHindiWordIntoAksharas(word) {
  if (!word) return [];

  const aksharas = [];
  let current = '';
  let i = 0;

  while (i < word.length) {
    const char = word[i];

    // Prüfe, ob es sich um einen unabhängigen Vokal handelt (अ आ इ ई usw.)
    if (this.isIndependentVowel(char)) {
      // Wenn wir bereits dabei sind, ein Akshara zu sammeln, speichere es zuerst
      if (current) {
        aksharas.push(current);
        current = '';
      }
      current = char;
      i++;
    }
    // Wenn es ein Konsonant ist (क ख ग usw.)
    else if (this.isConsonant(char)) {
      // Wenn wir bereits dabei sind, ein Akshara zu sammeln, speichere es zuerst
      if (current) {
        aksharas.push(current);
        current = '';
      }

      // Beginne ein neues Akshara mit diesem Konsonanten
      current = char;
      i++;

      // Prüfe auf nachfolgende Komponenten, die zum Akshara gehören (Vokalzeichen, Halant, Nukta, Modifikatoren)
      let foundVowelSign = false;
      while (i < word.length) {
        const nextChar = word[i];

        // 1. Prüfe auf Halant (Virama) für Konjunktbildung
        if (nextChar === '\u094D') { // Halant: ्
          // Schau voraus: Ist der nächste Char ein Konsonant?
          if (i + 1 < word.length && this.isConsonant(word[i + 1])) {
            // Ja, es ist ein Konjunkt. Füge Halant + Konsonant hinzu und setze die Schleife fort
            current += nextChar + word[i + 1];
            i += 2;
            foundVowelSign = false; // Reset, da nach Konjunkt wieder Vokalzeichen kommen kann
            continue;
          } else {
            // Halant ohne folgenden Konsonanten (selten, aber möglich)
            current += nextChar;
            i++;
            break; // Beende Akshara nach isoliertem Halant
          }
        }
        // 2. Prüfe auf abhängiges Vokalzeichen (nur wenn noch keins gefunden wurde in diesem Akshara)
        else if (!foundVowelSign && this.isDependentVowel(nextChar)) {
          current += nextChar;
          i++;
          foundVowelSign = true; // Merken, dass ein Vokalzeichen hinzugefügt wurde
          continue; // Suche weiter nach Modifikatoren (Anusvara etc.)
        }
        // 3. Prüfe auf Nukta (kann nach Konsonant oder Konjunkt kommen)
        else if (nextChar === '\u093C') { // Nukta: ़
          current += nextChar;
          i++;
          continue; // Suche weiter nach Vokalzeichen oder Modifikatoren
        }
        // 4. Prüfe auf Anusvara, Visarga, Chandrabindu (können nach Vokalzeichen kommen)
        else if (nextChar === '\u0902' || nextChar === '\u0903' || nextChar === '\u0901') {
          current += nextChar;
          i++;
          // Diese Modifikatoren beenden normalerweise das Akshara
          break;
        }
        // 5. Wenn keines der obigen Zeichen folgt, ist das Akshara komplett
        else {
          break;
        }
      }
    }
    // Unabhängige Vokale oder andere Zeichen wurden bereits oben behandelt
    // Der Fall für isolierte abhängige Vokalzeichen wird entfernt, da er unwahrscheinlich/fehlerhaft ist.
    // Für alle anderen Zeichen (Sonderzeichen, Ziffern, etc.)
    else {
      if (current) {
        aksharas.push(current);
        current = '';
      }
      current = char;
      i++;
    }
  }

  // Das letzte Akshara hinzufügen, wenn eins übrig ist
  if (current) {
    aksharas.push(current);
  }

  return aksharas;
}

/**
 * Prüft, ob ein Zeichen ein unabhängiger Hindi-Vokal ist
 * @param {string} char - Ein einzelnes Zeichen
 * @returns {boolean} true, wenn es ein unabhängiger Vokal ist
 */
isIndependentVowel(char) {
  // Unabhängige Vokale: अ आ इ ई उ ऊ ऋ ए ऐ ओ औ
  return /^[\u0905-\u0914]$/.test(char);
}

/**
 * Prüft, ob ein Zeichen ein Hindi-Konsonant ist
 * @param {string} char - Ein einzelnes Zeichen
 * @returns {boolean} true, wenn es ein Konsonant ist
 */
isConsonant(char) {
  // Konsonanten: क ख ग घ ... ह
  return /^[\u0915-\u0939]$/.test(char);
}

/**
 * Prüft, ob ein Zeichen ein abhängiges Vokalzeichen ist
 * @param {string} char - Ein einzelnes Zeichen
 * @returns {boolean} true, wenn es ein abhängiges Vokalzeichen ist
 */
isDependentVowel(char) {
  // Abhängige Vokalzeichen: ा ि ी ु ू ृ े ै ो ौ
  return /^[\u093E-\u094C]$/.test(char);
}
  // In der fillEmptyCells() Methode: Komplette Methode mit Hindi-Support
  fillEmptyCells() {
    // Bestimme das passende Alphabet je nach ausgewählter Sprache
    const currentLanguage = window.localization ? window.localization.getCurrentLanguage() : 'de';
    let letters;

    // Auswahl des Alphabets basierend auf der Sprache
    switch(currentLanguage) {
      case 'zh':
        // Zeichen aus allen Chengyu im Spiel sammeln
        letters = this.getChineseCharactersFromChengyu();
        break;
      case 'ja':
        // Zeichen aus allen Yojijukugo im Spiel sammeln
        letters = this.getJapaneseCharactersFromYojijukugo();
        break;
      case 'ko':
        // Silbenblöcke aus allen Sajaseongeo im Spiel sammeln
        letters = this.getKoreanSyllablesFromSajaseongeo();
        break;
      case 'hi':
        // Hindi: Verwende Silben (Aksharas) statt einzelner Buchstaben
        letters = this.getHindiAksharas();
        break;
      case 'ar':
        // Arabisches Alphabet ohne diakritische Zeichen
        letters = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";
        break;
      case 'en':
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Englisch: nur A-Z
        break;
      case 'sv':
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ"; // Schwedisch mit Sonderzeichen
        break;
      case 'ru':
        letters = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"; // Russisch: kyrillisches Alphabet
        break;
      case 'uk':
        letters = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ"; // Ukrainisch: kyrillisches Alphabet (ohne Ъ und Ы)
        break;
      case 'fr':
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ"; // Französisch
        break;
      case 'es':
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÑÓÚÜ"; // Spanisch
        break;
      case 'pt':
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÃÉÊÍÓÔÕÚÇ"; // Portugiesisch mit Sonderzeichen
        break;
      case 'it':
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÈÉÌÎÒÓÙÚ"; // Italienisch
        break;

case 'da':
  letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ"; // Dänisch
  break;

case 'fi':
  letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ"; // Finnisch mit Sonderzeichen
  break;

case 'nl':
  letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÉËÊÈÏÎÔÖÜÛ"; // Niederländisch
  break;

case 'pl':
  letters = "AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŹŻ"; // Polnisch
  break;

case 'tr':
  letters = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"; // Türkisch
  break;

case 'el':
  letters = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ"; // Griechisches Alphabet
  break;

      default: // Deutsch und alle anderen Sprachen als Fallback
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ"; // Deutsch: A-Z plus Umlaute
    }

    // Überprüfen auf RTL-Sprache
    const isRtl = window.localization && typeof window.localization.isRtlLanguage === 'function'
                ? window.localization.isRtlLanguage(currentLanguage)
                : ['ar', 'he', 'fa', 'ur'].includes(currentLanguage);

    // Stelle sicher, dass 'letters' ein Array ist, wenn es sich um Hindi handelt
    const letterPool = (currentLanguage === 'hi' && Array.isArray(letters)) ? letters : letters.split('');

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (this.grid[y][x] === "") {
          // Wähle ein zufälliges Element aus dem Pool (Akshara für Hindi, Zeichen für andere)
          const randomElement = letterPool[Math.floor(Math.random() * letterPool.length)];
          // Bei RTL-Sprachen spezielles Attribut für die Zelle setzen
          if (isRtl) {
            // Merken, dass diese Zelle RTL-Text enthält
            this.grid[y][x] = {
              letter: randomElement,
              rtl: true
            };
          } else {
            this.grid[y][x] = randomElement;
          }
        }
      }
    }
// Spezielle Nachbearbeitung für Hindi, um problematische Zeichen zu ersetzen
if (currentLanguage === 'hi') {
  console.log("Hindi erkannt: Starte Nachbearbeitung des Gitters");

  // Liste sicherer Ersatz-Aksharas (grundlegende Konsonanten und Vokale)
  const safeAksharas = [
    "क", "ख", "ग", "घ", "च", "छ", "ज", "ट", "ठ", "ड",
    "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म",
    "य", "र", "ल", "व", "श", "स", "ह", "अ", "आ", "इ", "ई"
  ];

  // Prüfen Sie alle Zellen und ersetzen Sie problematische
  for (let y = 0; y < this.gridSize; y++) {
    for (let x = 0; x < this.gridSize; x++) {
      const cellContent = this.grid[y][x];

      // Prüfen auf problematische Zeichen
      if (typeof cellContent === 'string') {
        // Prüfe, ob die Zelle eine Ziffer oder ein unerwünschtes Zeichen enthält
        const hasDigit = /[\u0966-\u096F]/.test(cellContent); // Hindi-Ziffern
        const hasLoneVowelMark = /^[\u093E-\u094C\u094D\u0951-\u0954]/.test(cellContent); // Nur diakritische Zeichen

        if (hasDigit || hasLoneVowelMark || cellContent.length === 0) {
          // Ersetze problematische Zelle mit einem sicheren Akshara
          const safeIndex = Math.floor(Math.random() * safeAksharas.length);
          this.grid[y][x] = safeAksharas[safeIndex];
          console.log(`Ersetze problematisches Zeichen '${cellContent}' mit '${safeAksharas[safeIndex]}'`);
        }
      }
    }
  }

  console.log("Hindi Gitter-Nachbearbeitung abgeschlossen");
}
  }


  // Vorhandene Helper-Methode für Chinesisch
  getChineseCharactersFromChengyu() {
    let chengyuCharacters = "";
    let defaultChars = "人生山水天地日月心火木金土风云雨花鸟虫鱼龙春夏秋冬东南西北中一二三四五六七八九十大小多少上下前后里外左右白黑红绿蓝黄长短方圆";

    try {
      // Zunächst Zeichen aus dem aktuellen Level sammeln
      if (this.targetWords && Array.isArray(this.targetWords)) {
        for (const word of this.targetWords) {
          if (typeof word === 'string') {
            chengyuCharacters += word;
          }
        }
      }

      // Wenn möglich, auch Zeichen aus anderen Levels hinzufügen
      if (window.localization && typeof window.localization.getTranslationEntry === 'function') {
        for (let i = 1; i <= 10; i++) {
          const levelKey = `level${i}_words`;
          const words = window.localization.getTranslationEntry(levelKey);
          if (Array.isArray(words)) {
            for (const word of words) {
              if (typeof word === 'string') {
                chengyuCharacters += word;
              }
            }
          }
        }
      }

      // Dupliziere die Chengyu-Zeichen (3x), um ihre Häufigkeit zu erhöhen
      chengyuCharacters = chengyuCharacters.repeat(3);

      // Füge auch einige Standard-Zeichen hinzu für Variation
      const combinedChars = chengyuCharacters + defaultChars;

      // Wenn wir genug Zeichen haben, verwenden wir sie
      if (combinedChars.length > 30) {
        return combinedChars;
      }
    } catch (error) {
      console.warn("Fehler beim Sammeln der chinesischen Zeichen:", error);
    }

    // Fallback auf Standard-Zeichen
    return defaultChars;
  }

  // Neue Helper-Methode für Japanisch
  getJapaneseCharactersFromYojijukugo() {
    let yojijukugoCharacters = "";
    // Häufig verwendete Kanji und Hiragana für das Spiel
    let defaultKanji = "人生山水天地日月心火木金土風雲雨花鳥春夏秋冬東南西北中一二三四五六七八九十大小多少上下前後愛情思記白黒赤緑青黄長短方円";
    let defaultHiragana = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";

    try {
      // Zunächst Zeichen aus dem aktuellen Level sammeln
      if (this.targetWords && Array.isArray(this.targetWords)) {
        for (const word of this.targetWords) {
          if (typeof word === 'string') {
            yojijukugoCharacters += word;
          }
        }
      }

      // Wenn möglich, auch Zeichen aus anderen Levels hinzufügen
      if (window.localization && typeof window.localization.getTranslationEntry === 'function') {
        for (let i = 1; i <= 10; i++) {
          const levelKey = `level${i}_words`;
          const words = window.localization.getTranslationEntry(levelKey);
          if (Array.isArray(words)) {
            for (const word of words) {
              if (typeof word === 'string') {
                yojijukugoCharacters += word;
              }
            }
          }
        }
      }

      // Dupliziere die Yojijukugo-Zeichen (3x), um ihre Häufigkeit zu erhöhen
      yojijukugoCharacters = yojijukugoCharacters.repeat(3);

      // Füge Kanji und etwas Hiragana hinzu für Variation
      const combinedChars = yojijukugoCharacters + defaultKanji + defaultHiragana;

      // Wenn wir genug Zeichen haben, verwenden wir sie
      if (combinedChars.length > 30) {
        return combinedChars;
      }
    } catch (error) {
      console.warn("Fehler beim Sammeln der japanischen Zeichen:", error);
    }

    // Fallback auf Standard-Zeichen
    return defaultKanji + defaultHiragana;
  }

  // Neue Methode für koreanische Silbenblöcke hinzufügen:

  getKoreanSyllablesFromSajaseongeo() {
    let sajaseongeoSyllables = "";
    // Häufig verwendete koreanische Silbenblöcke für das Spiel
    let defaultSyllables = "가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후기니디리미비시이지치키티피히";

    try {
      // Zunächst Silbenblöcke aus dem aktuellen Level sammeln
      if (this.targetWords && Array.isArray(this.targetWords)) {
        for (const word of this.targetWords) {
          if (typeof word === 'string') {
            sajaseongeoSyllables += word;
          }
        }
      }

      // Wenn möglich, auch Silbenblöcke aus anderen Levels hinzufügen
      if (window.localization && typeof window.localization.getTranslationEntry === 'function') {
        for (let i = 1; i <= 10; i++) {
          const levelKey = `level${i}_words`;
          const words = window.localization.getTranslationEntry(levelKey);
          if (Array.isArray(words)) {
            for (const word of words) {
              if (typeof word === 'string') {
                sajaseongeoSyllables += word;
              }
            }
          }
        }
      }

      // Dupliziere die Sajaseongeo-Silbenblöcke (3x), um ihre Häufigkeit zu erhöhen
      sajaseongeoSyllables = sajaseongeoSyllables.repeat(3);

      // Füge auch einige Standard-Silbenblöcke hinzu für Variation
      const combinedSyllables = sajaseongeoSyllables + defaultSyllables;

      // Wenn wir genug Silbenblöcke haben, verwenden wir sie
      if (combinedSyllables.length > 30) {
        return combinedSyllables;
      }
    } catch (error) {
      console.warn("Fehler beim Sammeln der koreanischen Silbenblöcke:", error);
    }

    // Fallback auf Standard-Silbenblöcke
    return defaultSyllables;
  }


  addCellListeners() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
      cell.addEventListener("pointerdown", (e) => this.pointerDown(e));
      cell.addEventListener("pointermove", (e) => this.pointerMove(e));
      cell.addEventListener("pointerup", (e) => this.pointerUp(e));
    });
    this.domElements.grid.addEventListener("pointermove", (e) => this.pointerMove(e));
    document.addEventListener("pointercancel", (e) => this.pointerUp(e));
    document.addEventListener("pointerup", (e) => this.pointerUp(e));
  }

  // Für das pointerDown/pointermove Event handling (wenn eine Zelle ausgewählt wird)
  pointerDown(e) {
    if (this.levelPending) return;
    e.preventDefault();
    if (!e.target.classList.contains("cell")) return;
    this.isDragging = true;
    clearCellSelection();
    let cellEl = e.target;

    // Wir müssen den Buchstaben korrekt aus der Zelle lesen
    let letter = cellEl.textContent;

    this.startCell = {
      row: parseInt(cellEl.dataset.row),
      col: parseInt(cellEl.dataset.col),
      el: cellEl,
      letter: letter
    };

    this.selectedCells = [this.startCell];
    cellEl.classList.add("selected");
  }

  pointerMove(e) {
    if (this.levelPending || !this.isDragging || !this.startCell) return;
    e.preventDefault();
    let cellEl = document.elementFromPoint(e.clientX, e.clientY);
    if (!cellEl || !cellEl.classList.contains("cell")) {
      cellEl = this.getNearestCell(e.clientX, e.clientY, 40);
      if (!cellEl) return;
    }
    let currentRow = parseInt(cellEl.dataset.row);
    let currentCol = parseInt(cellEl.dataset.col);
    let line = bresenhamLine(this.startCell.row, this.startCell.col, currentRow, currentCol);
    clearCellSelection();
    this.selectedCells = [];
    line.forEach(pt => {
      let selCell = document.querySelector(`.cell[data-row='${pt.row}'][data-col='${pt.col}']`);
      if (selCell) {
        this.selectedCells.push({ row: pt.row, col: pt.col, el: selCell, letter: selCell.textContent });
        selCell.classList.add("selected");
      }
    });
  }

  pointerUp(e) {
    if (this.levelPending || !this.isDragging) return;
    e.preventDefault();
    this.isDragging = false;
    this.checkSelectedWord();
    setTimeout(() => { clearCellSelection(); this.selectedCells = []; this.startCell = null; }, 150);
  }

  getNearestCell(x, y, threshold) {
    let cells = document.querySelectorAll(".cell");
    let nearest = null;
    let minDist = Infinity;
    cells.forEach(cell => {
      let rect = cell.getBoundingClientRect();
      let cx = rect.left + rect.width / 2; let cy = rect.top + rect.height / 2;
      let dist = Math.hypot(x - cx, y - cy);
      if (dist < minDist) { minDist = dist; nearest = cell; }
    });
    return (minDist <= threshold) ? nearest : null;
  }

  // In der checkSelectedWord() Methode Unterstützung für RTL-Wörter hinzufügen
  checkSelectedWord() {
    if (this.selectedCells.length === 0 || this.levelPending) return;

    // Für RTL: Korrekten Buchstaben aus Zellen extrahieren
    const selectedWordUpper = this.selectedCells.map(c => {
      let letter = c.letter;
      // Wenn c.letter ein Objekt sein könnte (bei RTL-Zellen)
      // Da wir in pointerDown/pointerMove jetzt immer textContent verwenden, ist dieser Check nicht mehr nötig
      // if (typeof letter === 'object' && letter !== null && letter.rtl) {
      //   letter = letter.letter;
      // }
      return letter;
    }).join("").toUpperCase();

    const targetWordsUpper = Array.isArray(this.targetWords) ?
      this.targetWords.map(w => typeof w === 'string' ? w.toUpperCase() : '') : [];

    let foundWord = null;
    let wordIndex = -1;

    if (targetWordsUpper.includes(selectedWordUpper)) {
      wordIndex = targetWordsUpper.indexOf(selectedWordUpper);
      foundWord = this.targetWords[wordIndex];
    } else {
      const reversedSelectedWordUpper = selectedWordUpper.split('').reverse().join('');
      if (targetWordsUpper.includes(reversedSelectedWordUpper)) {
        wordIndex = targetWordsUpper.indexOf(reversedSelectedWordUpper);
        foundWord = this.targetWords[wordIndex];
      }
    }

    // Der Rest der Funktion bleibt gleich...
    if (foundWord && !this.foundWords.has(foundWord)) {
        this.foundWords.add(foundWord);

        // Verbesserte Stem-Index-Zuordnung für verschiedene Modi
        let stemIndex;
        const mode = window.APP_CONFIG ? window.APP_CONFIG.MODE.toUpperCase() : 'BETA';

        if (mode === 'RELEASE') {
            // Release-Stem-Mapping für: 02R_bass_drums.mp3, 04_guitars.mp3, 05_strings.mp3, 06_synths_fx.mp3, 07_vocals.mp3
            // Hier wird stemIndex auf die entsprechende Position im RELEASE-Stems-Array gesetzt
            switch(wordIndex) {
                case 0: stemIndex = 1; break; // 02R_bass_drums.mp3 (Index 1)
                case 1: stemIndex = 2; break; // 04_guitars.mp3 (Index 2)
                case 2: stemIndex = 3; break; // 05_strings.mp3 (Index 3)
                case 3: stemIndex = 4; break; // 06_synths_fx.mp3 (Index 4)
                case 4: stemIndex = 5; break; // 07_vocals.mp3 (Index 5)
                default: stemIndex = 0;
            }
        } else {
            // Ursprüngliche Berechnung für BETA und PRE_RELEASE
            stemIndex = (wordIndex >= 0 && wordIndex < 5) ? wordIndex + 1 : 0;
        }

        this.selectedCells.forEach(c => {
          c.el.classList.add("found");
          if (stemIndex > 0) {
            c.el.setAttribute('data-stem', stemIndex);
            if (c.el.hasAttribute('data-word')) { c.el.classList.add('multi-word'); }
            c.el.setAttribute('data-word', foundWord);
          }
          c.el.style.animation = "none";
          setTimeout(() => { c.el.style.animation = "pulse 0.6s ease-in-out, cell-glow 1.5s infinite alternate"; }, 5);
        });
        let wordEl = document.getElementById("word-" + foundWord);
        if (wordEl) {
          wordEl.classList.add("found", "word-just-found");
          setTimeout(() => wordEl.classList.remove("word-just-found"), 700);
          if (this.currentDifficulty === "loose") {
            wordEl.textContent = foundWord;
             const iconSpan = wordEl.querySelector('.stem-icon-container');
             if (iconSpan) iconSpan.style.opacity = 1;
             wordEl.classList.add("stem-active");
          }
        } else { console.warn(`Word element not found for ID: word-${foundWord}`); }
        this.audioManager.playSound('wordFound');
        if (stemIndex > 0) {
          this.stemAudioManager.activateStem(stemIndex);
          const stemNameKey = this.getStemNameKey(stemIndex);
          const stemName = localization.translate(stemNameKey);
          showStemActivation(stemName, stemIndex);
          if (this.isMobileDevice && typeof this.stemAudioManager.syncAllStems === 'function') {
            setTimeout(() => { this.stemAudioManager.syncAllStems(false); }, 1000);
          }
        }
        createConfetti(5);
        updateProgressBar(this.foundWords.size, this.targetWords.length, this.domElements.progressBar);
        if (this.foundWords.size === this.targetWords.length) {
          console.log("Alle Wörter gefunden!");
          if (this.hintsUsed === 0) { this.domElements.epicBadge.classList.add('visible'); }
          this.levelPending = true;
          setTimeout(() => this.showLevelComplete(), 800);
        }
      }
  }

  showLevelComplete() {
    console.log("Zeige Level-Abschluss");
    this.audioManager.playSound('levelComplete');
    createConfetti(30);
    this.updateLevelCompleteOverlayContent();
    if (this.currentLevelIndex < this.levels.length - 1) {
       this.domElements.levelOverlay.classList.remove("hidden");
       setTimeout(() => {
        const flash = document.querySelector('.memory-flash');
        flash.style.animation = 'none';
        setTimeout(() => { flash.style.animation = 'flash 1.5s forwards'; this.audioManager.playSound('flash'); }, 10);
      }, 500);
    } else {
      clearInterval(this.timerInterval);
      this.updateEndScreenContent();
      this.domElements.endScreen.classList.remove("hidden");
      this.audioManager.playSound('gameComplete');
      createConfetti(50);
      setTimeout(() => {
        const flash = document.querySelector('.memory-flash');
        flash.style.animation = 'none';
        setTimeout(() => { flash.style.animation = 'flash 1.5s forwards'; this.audioManager.playSound('flash'); }, 10);
      }, 1000);
    }
  }

   updateLevelCompleteOverlayContent() {
       if (!this.currentLevel) { console.warn("updateLevelCompleteOverlayContent called but currentLevel is not set."); return; }
       let lyrics = this.currentLevel.lyric;
       if (Array.isArray(this.targetWords)) {
           // Aktuelle Sprache ermitteln
           const currentLang = window.localization ? window.localization.getCurrentLanguage() : 'de';

           // Spezielle Behandlung für verschiedene Sprachen
           const isGreek = currentLang === 'el';
           const isArabic = currentLang === 'ar';
           const isHindi = currentLang === 'hi';

           // Für Griechisch: Spezielle Behandlung für die Groß-/Kleinschreibung
           if (isGreek) {
               // Manuelles Mapping für griechische Wörter
               const greekWordMap = {
                   "ΚΡΥΒΟΜΑΙ": "Κρύβομαι",
                   "ΠΑΙΔΙΚΟ": "παιδικό",
                   "ΚΟΥΡΤΙΝΕΣ": "κουρτίνες",
                   "ΝΤΟΥΛΑΠΙΑ": "ντουλάπια",
                   "ΕΥΤΥΧΙΣΜΕΝΟΙ": "ευτυχισμένοι",
                   // Level 2
                   "ΚΙΘΑΡΑ": "κιθάρα",
                   "ΚΑΣΤΡΑ": "κάστρα",
                   "ΦΑΝΤΑΣΙΕΣ": "φαντασίες",
                   "ΑΠΟΧΑΙΡΕΤΙΟΜΑΣΤΕ": "αποχαιρετιόμαστε",
                   "ΜΑΝΤΑΡΙΝΙΑ": "μανταρίνια",
                   // Level 3
                   "ΜΕΡΕΣ": "μέρες",
                   "ΧΡΟΝΙΑ": "χρόνια",
                   "ΤΕΙΧΗ": "τείχη",
                   "ΕΛΕΙΨΕΣ": "έλειψες",
                   "ΦΟΡΕΣ": "φορές",
                   // Level 4
                   "ΣΥΝΔΕΔΕΜΕΝΟΙ": "συνδεδεμένοι",
                   "ΧΑΘΟΥΜΕ": "χαθούμε",
                   "ΧΩΡΙΣΤΟΥΜΕ": "χωριστούμε",
                   "ΣΚΟΤΕΙΝΕΣ": "σκοτεινές",
                   "ΕΞΑΦΑΝΙΣΤΕΙ": "εξαφανιστεί",
                   // Level 5
                   "ΣΤΡΟΦΕΣ": "στροφές",
                   "ΣΕΡΠΑΝΤΙΝΕΣ": "σερπαντίνες",
                   "ΒΡΟΧΕΡΕΣ": "βροχερές",
                   "ΛΑΘΗ": "λάθη",
                   "ΜΑΝΤΑΡΙΝΙΑ": "μανταρίνια",
                   // Level 6
                   "ΤΡΕΜΟΥΝ": "τρέμουν",
                   "ΠΟΡΤΑ": "πόρτα",
                   "ΧΑΛΑΡΑ": "χαλαρά",
                   "ΠΑΖΛ": "παζλ",
                   "ΠΛΗΓΕΣ": "πληγές",
                   // Level 7
                   "ΜΑΛΛΙΑ": "μαλλιά",
                   "ΒΛΕΜΜΑ": "βλέμμα",
                   "ΓΕΛΑΜΕ": "γελάμε",
                   "ΦΩΤΟΓΡΑΦΙΕΣ": "φωτογραφίες",
                   "ΒΙΤΡΙΝΕΣ": "βιτρίνες",
                   // Level 8
                   "ΧΡΟΝΙΑ": "χρόνια",
                   "ΜΕΡΕΣ": "μέρες",
                   "ΠΕΤΡΕΣ": "πέτρες",
                   "ΠΡΩΤΕΣ": "πρώτες",
                   "ΠΟΝΑΝΕ": "πονάνε",
                   // Level 9
                   "ΑΝΟΙΞΗ": "άνοιξη",
                   "ΗΛΙΟΣ": "ήλιος",
                   "ΛΑΜΠΕΙ": "λάμπει",
                   "ΜΑΝΤΑΡΙΝΙΑ": "μανταρίνια",
                   "ΑΝΘΙΖΟΥΝ": "ανθίζουν",
                   // Level 10
                   "ΣΤΡΟΦΕΣ": "στροφές",
                   "ΣΕΡΠΑΝΤΙΝΕΣ": "σερπαντίνες",
                   "ΒΡΟΧΕΡΕΣ": "βροχερές",
                   "ΛΑΘΗ": "λάθη",
                   "ΜΑΝΤΑΡΙΝΙΑ": "μανταρίνια"
               };

               // Markiere alle griechischen Wörter basierend auf dem Mapping
               this.targetWords.forEach(word => {
                   if (typeof word === 'string' && word.length > 0) {
                       const lowerCaseWord = greekWordMap[word] || word.toLowerCase();
                       // Suche nach dem Wort im Text
                       const index = lyrics.indexOf(lowerCaseWord);
                       if (index >= 0) {
                           // Markiere das Wort im Text
                           const beforeText = lyrics.substring(0, index);
                           const afterText = lyrics.substring(index + lowerCaseWord.length);
                           lyrics = beforeText + `<span class="highlight">${lowerCaseWord}</span>` + afterText;
                       }
                   }
               });
           } else if (isArabic) {
               // Manuelles Mapping für arabische Wörter
               const arabicWordMap = {
                   // Level 1
                   "اختباء": "أختبئ",
                   "طفولة": "طفولتي",
                   "ستائر": "الستائر",
                   "خزائن": "الخزائن",
                   "سعادة": "سعداء",
                   // Level 2
                   "جيتار": "الجيتار",
                   "قلاع": "قلاعًا",
                   "خيال": "وخيال",
                   "وداع": "نودع",
                   "ماندارين": "الماندارين",
                   // Weitere Level können hier hinzugefügt werden
               };

               // Markiere alle arabischen Wörter basierend auf dem Mapping
               this.targetWords.forEach(word => {
                   if (typeof word === 'string' && word.length > 0) {
                       const mappedWord = arabicWordMap[word] || word;
                       // Suche nach dem Wort im Text
                       const index = lyrics.indexOf(mappedWord);
                       if (index >= 0) {
                           // Markiere das Wort im Text
                           const beforeText = lyrics.substring(0, index);
                           const afterText = lyrics.substring(index + mappedWord.length);
                           lyrics = beforeText + `<span class="highlight">${mappedWord}</span>` + afterText;
                       } else {
                           // Fallback: Suche nach dem Wortstamm
                           const wordRoot = word.substring(0, Math.max(3, Math.floor(word.length * 0.7)));
                           const lyricsWords = lyrics.split(/\s+/);

                           for (let i = 0; i < lyricsWords.length; i++) {
                               if (lyricsWords[i].includes(wordRoot)) {
                                   // Markiere das Wort im Text
                                   lyricsWords[i] = `<span class="highlight">${lyricsWords[i]}</span>`;
                               }
                           }

                           // Setze den Text wieder zusammen
                           lyrics = lyricsWords.join(' ');
                       }
                   }
               });
           } else if (isHindi) {
               // Für Hindi: Wortteile suchen
               this.targetWords.forEach(word => {
                   if (typeof word === 'string' && word.length > 0) {
                       // Suche nach dem Wortstamm
                       const wordRoot = word.substring(0, Math.max(3, Math.floor(word.length * 0.7)));
                       const lyricsWords = lyrics.split(/\s+/);

                       for (let i = 0; i < lyricsWords.length; i++) {
                           if (lyricsWords[i].includes(wordRoot)) {
                               // Markiere das Wort im Text
                               lyricsWords[i] = `<span class="highlight">${lyricsWords[i]}</span>`;
                           }
                       }

                       // Setze den Text wieder zusammen
                       lyrics = lyricsWords.join(' ');
                   }
               });
           } else {
               // Standardverhalten für andere Sprachen
               this.targetWords.forEach(word => {
                   if (typeof word === 'string' && word.length > 0) {
                       const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                       const regex = new RegExp(escapedWord, 'gi');
                       lyrics = lyrics.replace(regex, match => `<span class="highlight">${match}</span>`);
                   }
               });
           }
       }
       this.domElements.lyricDisplay.innerHTML = lyrics;
       this.domElements.levelQuote.textContent = `"${this.currentLevel.quote}"`;
       const levelNumElement = document.getElementById('levelOverlayNumber');
       if(levelNumElement) { levelNumElement.textContent = localization.translate('levelOverlayLevel', { level: this.currentLevelIndex + 1 }); }
       const footerLevelElem = document.getElementById('levelFooterNum');
       if (footerLevelElem) { footerLevelElem.textContent = this.currentLevelIndex + 1; }
   }

   updateEndScreenContent() {
       let minutes = 0, seconds = 0;
       if (this.startTime > 0) {
           let totalTime = Math.floor((Date.now() - this.startTime) / 1000);
           minutes = Math.floor(totalTime / 60);
           seconds = totalTime % 60;
       }
       let qualityKey = (this.hintsUsed === 0) ? 'endQualityPerfect' : (this.hintsUsed <= 3) ? 'endQualityImpressive' : 'endQualityNormal';
       const qualityRating = localization.translate(qualityKey);
       const stats = localization.translate('endMessageStats', {
           quality: qualityRating,
           minutes: minutes,
           seconds: seconds < 10 ? "0" + seconds : seconds,
           hints: this.hintsUsed
       });
       let statsElement = document.getElementById('endStats');
       if (!statsElement) {
           statsElement = document.createElement('p');
           statsElement.id = 'endStats';
           if (this.domElements.endMessage && this.domElements.endMessage.parentNode) {
                this.domElements.endMessage.parentNode.insertBefore(statsElement, this.domElements.rewardBox);
           } else {
               console.error("Could not find parent node of endMessage to insert stats.");
               const endScreenFrame = this.domElements.endScreen.querySelector('.cover-frame');
               if (endScreenFrame) endScreenFrame.appendChild(statsElement);
           }
       }
       statsElement.innerHTML = stats;
       localization.updateUI();
   }

  nextLevel() {
    console.log("nextLevel aufgerufen");
    this.audioManager.playSound('click');
    this.domElements.levelOverlay.classList.add("hidden");
    this.isDragging = false;
    clearCellSelection();
    this.selectedCells = [];
    this.startCell = null;
    this.stemAudioManager.resetToBaseStem();
    if (this.isMobileDevice && typeof this.stemAudioManager.syncAllStems === 'function') {
      setTimeout(() => { this.stemAudioManager.syncAllStems(true); }, 200);
    }
    this.currentLevelIndex++;
    if (this.currentLevelIndex < this.levels.length) {
      this.initLevel();
    } else {
      console.log("Reached end of levels in nextLevel - showing final screen.");
      this.showLevelComplete();
    }
    this.saveGameProgress();
  }

  restartGame() {
    this.audioManager.playSound('click');
    this.domElements.endScreen.classList.add("hidden");
    this.levelPending = false;
    this.startTime = Date.now();
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTimerDisplay(), 1000);
    this.initLevel();
    this.stemAudioManager.resetToBaseStem();
    if (this.isMobileDevice && typeof this.stemAudioManager.syncAllStems === 'function') {
      setTimeout(() => { this.stemAudioManager.syncAllStems(true); }, 200);
    }
    this.saveGameProgress();
  }

  getStemNameKey(stemIndex) {
      const zeroBasedIndex = stemIndex - 1;
      if (zeroBasedIndex < 0) return '';
      const mode = window.APP_CONFIG ? window.APP_CONFIG.MODE.toUpperCase() : 'BETA';
      const stemConfig = window.APP_CONFIG.STEMS[mode];

      // Spezieller Fall für RELEASE-Modus - direkte Zuordnung ohne Dateinamenanalyse
      if (mode === 'RELEASE') {
          // Im Release-Modus haben wir eine feste Reihenfolge:
          // stemIndex 1 -> bassdrums (Index 1 in stemConfig)
          // stemIndex 2 -> guitars (Index 2 in stemConfig)
          // stemIndex 3 -> strings (Index 3 in stemConfig)
          // stemIndex 4 -> synths (Index 4 in stemConfig)
          // stemIndex 5 -> vocals (Index 5 in stemConfig)
          const releaseKeys = [
              '', // Index 0 wird nicht verwendet
              'config_stems_release_bassdrums', // Index 1 (stemConfig[1] = 02R_bass_drums.mp3)
              'config_stems_release_guitars',   // Index 2 (stemConfig[2] = 04_guitars.mp3)
              'config_stems_release_strings',   // Index 3 (stemConfig[3] = 05_strings.mp3)
              'config_stems_release_synths',    // Index 4 (stemConfig[4] = 06_synths_fx.mp3)
              'config_stems_release_vocals'     // Index 5 (stemConfig[5] = 07_vocals.mp3)
          ];

          if (stemIndex >= 0 && stemIndex < releaseKeys.length) {
              return releaseKeys[stemIndex];
          }

          console.warn(`Ungültiger Stem-Index für RELEASE-Mode: ${stemIndex}`);
          return `stemName${stemIndex}`;
      }

      // Für andere Modi die ursprüngliche Logik beibehalten
      if (stemConfig && zeroBasedIndex >= 0 && zeroBasedIndex < stemConfig.length) {
          const fileName = stemConfig[zeroBasedIndex].file;
          let typeName = '';

          // Verbesserte Erkennung der Stem-Typen für BETA und PRE_RELEASE
          if (fileName.includes('bass_drums')) {
              typeName = 'bassdrums';
          } else if (fileName.includes('synths_fx')) {
              typeName = 'synths';
          } else if (fileName.includes('vocals')) {
              typeName = 'vocals';
          } else if (fileName.includes('strings')) {
              typeName = 'strings';
          } else if (fileName.includes('guitars')) {
              typeName = 'guitars';
          } else if (fileName.includes('piano')) {
              typeName = 'piano';
          } else if (fileName.includes('bass')) {
              typeName = 'bass';
          } else if (fileName.includes('drums')) {
              typeName = 'drums';
          } else if (fileName.includes('others')) {
              typeName = 'others';
          }

          if (typeName) {
              return `config_stems_${mode.toLowerCase()}_${typeName}`;
          }
      }

      // Fallback für andere Modi
      const fallbackKeys = [
          '',
          'config_stems_beta_piano',
          'config_stems_beta_bass',
          'config_stems_beta_drums',
          'config_stems_beta_guitars',
          'config_stems_beta_others',
          'config_stems_beta_vocals'
      ];

      console.warn(`Fallback für ${mode}-Mode verwendet: Stem-Index ${stemIndex}`);
      return fallbackKeys[stemIndex] || `stemName${stemIndex}`;
  }

  toggleMusic() {
    const musicEnabled = this.audioManager.toggleMusic();
    this.domElements.musicToggle.innerHTML = musicEnabled ? musicOnIcon : musicOffIcon;
    if (musicEnabled) {
      this.stemAudioManager.play();
      if (this.isMobileDevice && typeof this.stemAudioManager.syncAllStems === 'function') {
        setTimeout(() => { this.stemAudioManager.syncAllStems(true); }, 300);
      }
    } else {
      this.stemAudioManager.pause();
    }
    if (this.audioManager.soundEnabled) { this.audioManager.playSound('click'); }
    this.saveGameProgress();
  }

  toggleSound() {
    const soundEnabled = this.audioManager.toggleSound();
    this.domElements.soundToggle.innerHTML = soundEnabled ? soundOnIcon : soundOffIcon;
    if (this.audioManager.soundEnabled) { this.audioManager.playSound('click'); }
    this.saveGameProgress();
  }

  giveHint() {
    if (this.levelPending || this.foundWords.size >= this.targetWords.length) return;
    const hintsAdded = giveWordHint(this.targetWords, this.foundWords, this.audioManager);
    if (hintsAdded > 0) {
      this.hintsUsed += hintsAdded;
      this.saveGameProgress();
    }
  }

  showHelp() {
    this.audioManager.playSound('click');
    this.domElements.helpOverlay.classList.remove("hidden");
    this.updateHelpOverlayContent();
  }

   updateHelpOverlayContent() {
       localization.updateUI();
   }

  hideHelp() {
    this.audioManager.playSound('click');
    this.domElements.helpOverlay.classList.add("hidden");
  }

  init() {
    console.log("GameManager: Initializing");
    this.loadingComplete = false;

    // Ladebildschirm initial anzeigen (obwohl schon im HTML gesetzt, zur Sicherheit)
    if (this.domElements.loadingScreen) {
      this.domElements.loadingScreen.style.display = 'flex';
    }
    if (this.domElements.startScreen) {
      this.domElements.startScreen.style.display = 'none';
    }
    if (this.domElements.gameContainer) {
      this.domElements.gameContainer.style.display = 'none';
    }

    this.localize(); // Grundlegende Lokalisierung
    this.setupEventListeners(); // Grundlegende Event Listener
    this.loadSavedState(); // Gespeicherten Zustand laden (z.B. Schwierigkeit)

    // Stelle sicher, dass der "Neue Reise beginnen" Button immer aktiv ist (wird nicht vom Laden beeinflusst)
    const startNewButton = this.domElements.startNewButton;
    if (startNewButton) { // Sicherstellen, dass das Element existiert
      startNewButton.disabled = false;
      startNewButton.classList.remove('disabled');
    }

    // Ladefortschritt-Callback für Stems setzen
    if (this.stemAudioManager && this.domElements.loadingProgressBar && this.domElements.loadingProgressText) {
      this.stemAudioManager.setLoadProgressCallback((progress, loadedCount, totalCount) => {
        const percentage = Math.round(progress * 100);
        this.domElements.loadingProgressBar.style.width = percentage + '%';
        this.domElements.loadingProgressBar.textContent = percentage + '%';
        this.domElements.loadingProgressText.textContent = `${loadedCount} / ${totalCount} Stems geladen`;
      });
    } else {
      console.error("Kann Ladefortschritt-Callback nicht setzen. Fehlende Elemente: stemAudioManager, loadingProgressBar oder loadingProgressText");
    }

    // Warte auf das Laden aller Stems
    this.stemAudioManager.loadAllStems()
      .then(() => {
        console.log("Alle Stems erfolgreich geladen. Initialisiere UI.");
        this.loadingComplete = true; // Setze Flag (könnte noch nützlich sein)

        // Verstecke Ladebildschirm
        if (this.domElements.loadingScreen) {
          this.domElements.loadingScreen.style.display = 'none';
        }
        // Zeige Startbildschirm
        if (this.domElements.startScreen) {
          this.domElements.startScreen.style.display = 'flex'; // Oder 'block', je nach Layout
        }

        // Aktiviere Start-Buttons
        if (this.domElements.startButton) {
          this.domElements.startButton.disabled = false;
          this.domElements.startButton.classList.remove('disabled');
        }
        // startNewButton ist bereits aktiviert

        // Lade restliche Daten (z.B. Spielstand, der den Start-Button-Text beeinflusst)
        this.loadGameProgress();
        this.initEventListeners(); // Event-Listener erst jetzt vollständig initialisieren

      })
      .catch(error => {
        console.error("Fehler beim Laden der Stems:", error);
        this.loadingComplete = false; // Laden fehlgeschlagen

        // Zeige Fehlermeldung im Ladebildschirm
        if (this.domElements.loadingProgressText) {
          this.domElements.loadingProgressText.textContent = "Fehler beim Laden der Audio-Dateien.";
          this.domElements.loadingProgressText.style.color = 'red';
        }
        if (this.domElements.loadingProgressBar) {
           this.domElements.loadingProgressBar.style.backgroundColor = 'red';
           this.domElements.loadingProgressBar.textContent = 'Fehler!';
        }
        // Optional: Buttons trotzdem aktivieren, aber mit Warnung? Oder Spiel blockieren?
        // Fürs Erste: Buttons bleiben deaktiviert, außer "Neu starten"
      });


    // Alte Lade-Logik entfernen/auskommentieren:
    // this.trackLoadingProgress(); // Nicht mehr benötigt für Start-Button-Aktivierung
    // const loadingIndicator = document.getElementById('loadingIndicator'); // Alter Indikator im StartScreen
    // if (loadingIndicator) {
    //   loadingIndicator.style.display = 'flex'; // Wird nicht mehr verwendet
    // }
    // this.waitForMusicLoading()... // Wird separat behandelt, beeinflusst nicht den Start-Button

    // Warte auf Lokalisierung (unabhängig vom Stem-Laden)
    document.addEventListener('localization-ready', () => {
      console.log("GameManager: localization-ready event received.");
      this.currentLanguageOnLoad = localization.getCurrentLanguage(); // Store the language used for initial setup
      console.log("GameManager: localization-ready event received (nach Stem-Laden).");
      this.currentLanguageOnLoad = localization.getCurrentLanguage();
      this.loadGameProgress(); // Aktualisiere Button-Texte etc. basierend auf Sprache und Fortschritt
      this.updateDifficultyDropdown(); // Stelle sicher, dass Dropdown übersetzt ist
      // EventListeners sollten bereits durch .then() initialisiert sein, wenn Stems geladen sind
    }, { once: true });

    // Auf Sprachänderungen hören (nach initialem Laden)
    document.addEventListener('translations-loaded', (event) => {
       const newLang = event.detail ? event.detail.lang : localization.getCurrentLanguage();
       // Only react if the language *actually* changed from the one used during the last UI setup
       if (newLang !== this.currentLanguageOnLoad) {
           console.log(`GameManager: Language changed from ${this.currentLanguageOnLoad} to ${newLang}, refreshing UI.`);
           this.currentLanguageOnLoad = newLang; // Update tracked language

           // Update parts of the UI that might not use data-translate or need specific logic
           this.updateDifficultyDropdown();

           // If game is active, reload level data and refresh game UI
           if (this.domElements.gameContainer.style.display === 'flex') {
                // Need to re-initialize level data with new language before refreshing UI
                this.loadLevelData();
                this.refreshLevelUI(); // Refresh game UI if game is active
           }
            // Update help overlay content if visible
           if (!this.domElements.helpOverlay.classList.contains('hidden')) {
               this.updateHelpOverlayContent();
           }
            // Update end screen content if visible
           if (!this.domElements.endScreen.classList.contains('hidden')) {
               this.updateEndScreenContent();
           }
            // Update level complete overlay content if visible
           if (!this.domElements.levelOverlay.classList.contains('hidden')) {
                // Need to re-load level data for the overlay as well
                this.loadLevelData(); // Ensure currentLevel has correct language data
                this.updateLevelCompleteOverlayContent(); // Reaktiviert
           }
       }
    });

    // Die Methoden trackLoadingProgress und waitForMusicLoading sind für die Stems nicht mehr relevant,
    // da loadAllStems() dies übernimmt. Sie könnten noch für die Hintergrundmusik (background.mp3)
    // relevant sein, falls diese separat geladen wird. Wir lassen sie vorerst drin,
    // entfernen aber die Logik, die den Start-Button beeinflusst.
  }

  // Überwacht den Ladefortschritt (hauptsächlich für Hintergrundmusik, falls noch verwendet)
  trackLoadingProgress() {
    // const progressBar = document.getElementById('loadingProgressBar'); // Alter Indikator im StartScreen
    // ... (Restliche Logik für Hintergrundmusik-Fortschritt, falls benötigt) ...

    // Entferne Logik, die Start-Button beeinflusst
    // document.addEventListener('music-loaded', () => {
    //   this.loadingComplete = true; // Wird jetzt durch Stems gesteuert
    //   const startButton = document.getElementById('startButton');
    //   if (startButton) { ... }
    //   const loadingIndicator = document.getElementById('loadingIndicator');
    //   if (loadingIndicator) { ... }
    // });
    // document.addEventListener('music-loading-error', (event) => {
    //   setTimeout(() => {
    //     this.loadingComplete = true; // Wird jetzt durch Stems gesteuert
    //     const startButton = document.getElementById('startButton');
    //     if (startButton) { ... }
    //     const loadingIndicator = document.getElementById('loadingIndicator');
    //     if (loadingIndicator) { ... }
    //   }, 2000);
    // });
  }

  // Wartet, bis die Musik geladen ist (hauptsächlich für Hintergrundmusik, falls noch verwendet)
  waitForMusicLoading() {
    return new Promise((resolve, reject) => {
      // ... (Logik zum Warten auf background.mp3, falls nötig) ...
      // Diese Funktion sollte den Start-Button NICHT mehr beeinflussen.
      // Sie könnte resolve() oder reject() basierend auf dem Laden von background.mp3.
      // Beispiel:
      if (this.audioManager && this.audioManager.isMusicReady()) {
        resolve();
      } else {
         // Event-Listener für background.mp3 hinzufügen
         // ...
         // Timeout hinzufügen
         // ...
         // resolve() oder reject() entsprechend aufrufen
         // Temporär: Sofort auflösen, da wir uns auf Stems konzentrieren
         resolve();
      }
    });
  }

  start() {
    // Prüfe, ob die Stems geladen sind (über das Flag oder Promise-Status)
    if (!this.loadingComplete) {
      console.warn("Versuch, das Spiel zu starten, bevor die Stems geladen sind.");
      // Optional: Kurze Meldung im Ladebildschirm anzeigen, falls dieser noch sichtbar ist
      if (this.domElements.loadingScreen && this.domElements.loadingScreen.style.display !== 'none') {
         if (this.domElements.loadingProgressText) {
             this.domElements.loadingProgressText.textContent = "Bitte warten...";
         }
      }
      return; // Verhindere den Start
    }

    // Wenn Stems geladen sind, starte das Spiel
    this.actuallyStartGame();
  }

  // Tatsächlicher Spielstart nach dem Laden
  actuallyStartGame() {
    console.log("GameManager: Starting game");

    // Blende Startbildschirm aus und Spielbereich ein
    this.domElements.startScreen.style.display = "none";
    this.domElements.gameContainer.style.display = "flex";
    this.domElements.endScreen.classList.add("hidden");

    // Initialisiere Level
    this.initLevel();

    // Starte Timer
    this.startTimer();

    // Starte Musik und Stems
    if (this.audioManager && !this.audioManager.bgMusic.paused) {
      console.log("Musik läuft bereits");
    } else {
      console.log("Starte Musik beim Spielstart...");
      // Starte Hintergrundmusik
      if (this.audioManager && this.audioManager.isMusicReady()) {
        this.audioManager.bgMusic.play().catch(err => {
          console.warn("Fehler beim Starten der Musik:", err);
        });
      }

      // Starte StemAudioManager
      if (this.stemAudioManager) {
        this.stemAudioManager.play();
        // Synchronisiere nach kurzer Verzögerung
        setTimeout(() => {
          if (typeof this.stemAudioManager.syncAllStems === 'function') {
            this.stemAudioManager.syncAllStems(true);
          }
        }, 500);
      }
    }

    // Initialisiere Untertitel
    if (window.subtitlesManager) {
      // Aktualisiere Untertitel für aktuelle Sprache
      const currentLang = window.localization ? window.localization.getCurrentLanguage() : 'de';
      window.subtitlesManager.setLanguage(currentLang);
    }

    // Speichere Spielfortschritt
    this.saveGameProgress();
  }

  // Lädt den gespeicherten Spielstand
  loadSavedState() {
    try {
      const savedState = localStorage.getItem(this.storageKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        // Nur Schwierigkeitsgrad laden, damit die Auswahl im Dropdown korrekt ist
        if (parsedState.difficulty) {
          this.currentDifficulty = parsedState.difficulty;
        }

        console.log("Gespeicherter Spielstand geladen", parsedState);
      }
    } catch (error) {
      console.error("Fehler beim Laden des Spielstands:", error);
    }
  }

  // Lokalisiert Elemente, die nicht über data-translate gesteuert werden
  localize() {
    try {
      if (window.localization) {
        // Aktualisiere den Start-Button-Text basierend auf dem gespeicherten Spielstand
        const savedState = localStorage.getItem(this.storageKey);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          if (parsedState.currentLevelIndex && parsedState.currentLevelIndex > 0) {
            const continueText = localization.translate('continueButton');
            this.domElements.startButton.querySelector('span[data-translate]').textContent = continueText;
          } else {
            const startText = localization.translate('startButton');
            this.domElements.startButton.querySelector('span[data-translate]').textContent = startText;
          }
        } else {
          const startText = localization.translate('startButton');
          this.domElements.startButton.querySelector('span[data-translate]').textContent = startText;
        }
      }
    } catch (error) {
      console.error("Fehler bei der Lokalisierung:", error);
    }
  }

  // Richtet Event-Listener für UI-Elemente ein
  setupEventListeners() {
    // Basic event listeners that don't depend on other initialization
    const fullscreenButton = document.getElementById('fullscreenButton');
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
    }

    // Initialer Status für Musik- und Sound-Buttons
    this.updateAudioButtonStates();
  }

  // Aktualisiert den Zustand der Audio-Buttons basierend auf den Einstellungen
  updateAudioButtonStates() {
    if (this.audioManager) {
      this.domElements.musicToggle.innerHTML = this.audioManager.isMusicMuted ? musicOffIcon : musicOnIcon;
      this.domElements.soundToggle.innerHTML = this.audioManager.isSoundMuted ? soundOffIcon : soundOnIcon;
    }
  }

  // Vollbildmodus umschalten
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Fehler beim Aktivieren des Vollbildmodus: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Startet den Timer für das Spiel
  startTimer() {
    this.startTime = Date.now();
    this.updateTimerDisplay();
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTimerDisplay(), 1000);
  }
} // End of GameManager class
