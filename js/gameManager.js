// Hauptspiellogik - GameManager-Klasse
class GameManager {
  constructor() {
    // Spieldaten
    this.levels = GAME_LEVELS;
    this.audioManager = new AudioManager();
    this.stemAudioManager = new StemAudioManager(); // Neue Stem-Manager-Instanz
    this._currentLevelIndex = 0;  // Geändert zu _currentLevelIndex (private Variable)
    this.currentLevel = null;
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

    this.loadGameProgress();

    this.initEventListeners();

    document.body.appendChild(this.audioManager.bgMusic);

    initStarField();
  }

  // Methode zur Erkennung mobiler Geräte
  detectMobileDevice() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  }

  // Getter für currentLevelIndex
  get currentLevelIndex() {
    return this._currentLevelIndex;
  }

  // Setter für currentLevelIndex
  set currentLevelIndex(value) {
    // Alte Wert speichern
    const oldValue = this._currentLevelIndex;
    
    // Neuen Wert setzen
    this._currentLevelIndex = value;
    
    // Nur ein Event auslösen, wenn sich der Wert tatsächlich geändert hat
    if (oldValue !== value) {
      console.log(`currentLevelIndex wurde von ${oldValue} auf ${value} geändert`);
      
      // Level-Anzeigen aktualisieren
      // Elemente direkt aktualisieren
      const currentLevelElem = document.getElementById('currentLevelNum');
      const footerLevelElem = document.getElementById('levelFooterNum');
      
      if (currentLevelElem) {
        currentLevelElem.textContent = value + 1; // Level-Index + 1 anzeigen
        console.log(`currentLevelNum auf ${value + 1} gesetzt`);
      }
      
      if (footerLevelElem) {
        footerLevelElem.textContent = value + 1; // Level-Index + 1 anzeigen
        console.log(`levelFooterNum auf ${value + 1} gesetzt`);
      }
      
      // Event auslösen
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
      rewardBox: document.getElementById("rewardBox")
    };
  }

  initEventListeners() {
    this.domElements.startButton.addEventListener("click", () => this.startGame());
    this.domElements.startNewButton.addEventListener("click", () => this.startNewGame());
    this.domElements.nextLevelButton.addEventListener("click", () => this.nextLevel());
    this.domElements.restartButton.addEventListener("click", () => this.restartGame());
    this.domElements.restartNewButton.addEventListener("click", () => this.startNewGame());

    this.domElements.musicToggle.addEventListener("click", () => this.toggleMusic());
    this.domElements.soundToggle.addEventListener("click", () => this.toggleSound());
    this.domElements.hintButton.addEventListener("click", () => this.giveHint());
    this.domElements.difficultySelect.addEventListener("change", () => this.updateDifficultyVisual());
    this.domElements.helpButton.addEventListener("click", () => this.showHelp());
    this.domElements.closeHelpButton.addEventListener("click", () => this.hideHelp());

    if (this.domElements.rewardBox) {
      this.domElements.rewardBox.addEventListener("click", () => this.openReward());
    }

    // Event-Listener für Audio-Probleme hinzufügen, wenn es ein mobiles Gerät ist
    if (this.isMobileDevice) {
      this.initMobileAudioListeners();
    }

    // Cheats für Entwicklung und Tests
    document.addEventListener("keydown", (e) => {
      if (e.key === "L" && e.shiftKey) {
        e.preventDefault();
        console.log("Debug: Level-Skip aktiviert");
        
        // Alle Wörter als gefunden markieren und showLevelComplete auslösen
        const remainingWords = this.targetWords.filter(word => !this.foundWords.has(word));
        if (remainingWords.length > 0) {
          console.log("Debug: Markiere alle verbliebenden Wörter als gefunden");
          
          // Workaround: Jedes verbleibende Wort mit geringem Zeitabstand als gefunden markieren
          let delay = 0;
          remainingWords.forEach(word => {
            setTimeout(() => {
              // Simuliere das Finden des Wortes
              this.foundWords.add(word);
              
              // UI aktualisieren
              let wordEl = document.getElementById("word-" + word);
              if (wordEl) {
                wordEl.classList.add("found");
                wordEl.classList.add("word-just-found");
                setTimeout(() => wordEl.classList.remove("word-just-found"), 700);
                
                if (this.currentDifficulty === "loose") {
                  wordEl.textContent = word;
                }
              }
              
              // Fortschrittsbalken aktualisieren
              updateProgressBar(this.foundWords.size, this.targetWords.length, this.domElements.progressBar);
              
              // Sound abspielen
              this.audioManager.playSound('wordFound');
              
              // Level als abgeschlossen markieren, wenn alle Wörter gefunden wurden
              if (this.foundWords.size === this.targetWords.length) {
                console.log("Debug: Level abgeschlossen durch Debug-Skip");
                this.levelPending = true;
                
                // 800ms Verzögerung wie im normalen Spielablauf
                setTimeout(() => this.showLevelComplete(), 800);
              }
            }, delay);
            
            // Verzögere das nächste Wort um 300ms
            delay += 300;
          });
        } else if (this.currentLevelIndex >= this.levels.length - 1) {
          // Wenn wir im letzten Level sind, direkt das Ende anzeigen
          this.showLevelComplete();
        }
      }
    });
  }

  // Neue Methode: Mobile-spezifische Audio-Event-Listener initialisieren
  initMobileAudioListeners() {
    // Alle Audio-Elemente im Dokument abrufen
    const audioElements = document.querySelectorAll('audio');
    
    audioElements.forEach(audio => {
      // Event-Listener für verschiedene Audio-Probleme hinzufügen
      audio.addEventListener('stalled', () => this.handleAudioStall(audio));
      audio.addEventListener('error', (e) => this.handleAudioError(audio, e));
      audio.addEventListener('waiting', () => this.handleAudioWaiting(audio));
      
      // Qualitätsoptimierungen für mobile Browser
      if (typeof audio.mozCacheStream !== 'undefined') {
        // Firefox Mobile-spezifische Einstellungen
        audio.mozPreservesPitch = false;
      }
      
      // Preload-Einstellung auf 'auto' forcieren
      audio.preload = "auto";
    });
    
    // Globaler Listener für Web Audio API, falls verwendet
    if (this.stemAudioManager.context) {
      // Auf Audio-Kontext-Unterbrechungen reagieren
      this.stemAudioManager.context.onstatechange = () => {
        console.log("Audio-Kontext Statusänderung:", this.stemAudioManager.context.state);
        
        if (this.stemAudioManager.context.state === 'interrupted' || 
            this.stemAudioManager.context.state === 'suspended') {
          // Versuchen, den Kontext wieder zu aktivieren
          this.stemAudioManager.context.resume().then(() => {
            console.log("Audio-Kontext wieder aktiviert");
            // Synchronisation erzwingen
            if (this.stemAudioManager.syncAllStems) {
              setTimeout(() => this.stemAudioManager.syncAllStems(true), 100);
            }
          }).catch(e => console.warn("Fehler beim Wiederaktivieren des Audio-Kontexts:", e));
        }
      };
    }
  }

  // Neue Methode: Behandlung von Audio-Verzögerungen (stalled event)
  handleAudioStall(audioElement) {
    console.log("Audio-Element verzögert:", audioElement.id);
    
    // Versuch, das Element neu zu starten
    if (this.stemAudioManager && this.stemAudioManager.isPlaying) {
      // Kurze Verzögerung
      setTimeout(() => {
        try {
          // Zeit neu synchronisieren, wenn möglich
          if (this.stemAudioManager.stems && this.stemAudioManager.stems[0] && 
              !this.stemAudioManager.stems[0].paused) {
            audioElement.currentTime = this.stemAudioManager.stems[0].currentTime;
          }
          
          // Neu starten, wenn pausiert
          if (audioElement.paused) {
            audioElement.play().catch(e => console.warn("Fehler beim Neustart:", e));
          }
        } catch (e) {
          console.warn("Fehler bei der Audio-Wiederherstellung:", e);
        }
      }, 100);
    }
  }

  // Neue Methode: Behandlung von Audio-Fehlern
  handleAudioError(audioElement, error) {
    console.warn("Audio-Fehler aufgetreten:", error, audioElement.id);
    
    // Bei nicht behebbaren Fehlern versuchen, das Audio neu zu laden
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
      } catch (e) {
        console.warn("Fehler bei der Audio-Wiederherstellung nach Fehler:", e);
      }
    }, 500);
  }

  // Neue Methode: Behandlung von Audio-Wartezuständen (buffering)
  handleAudioWaiting(audioElement) {
    console.log("Audio-Element buffert:", audioElement.id);
    
    // Bei lang anhaltendem Buffering versuchen, die Wiedergabe fortzusetzen
    const bufferingTimeout = setTimeout(() => {
      // Wenn das Element immer noch im Wartezustand ist
      if (audioElement.readyState < 3) {
        console.log("Lang anhaltendes Buffering, versuche Wiederherstellung:", audioElement.id);
        
        // Synchronisation mit dem ersten Stem versuchen
        if (this.stemAudioManager && this.stemAudioManager.stems && 
            this.stemAudioManager.stems[0] && !this.stemAudioManager.stems[0].paused) {
          
          try {
            // Aktuelle Zeit vom ersten Stem übernehmen
            audioElement.currentTime = this.stemAudioManager.stems[0].currentTime;
            
            // Wiedergabe erzwingen
            if (audioElement.paused) {
              audioElement.play().catch(e => console.warn("Fehler beim Fortsetzten der Wiedergabe:", e));
            }
          } catch (e) {
            console.warn("Fehler bei der Buffering-Wiederherstellung:", e);
          }
        }
      }
    }, 3000); // 3 Sekunden Wartezeit für Buffering
    
    // Event-Listener für das Ende des Wartezustands
    const playingHandler = () => {
      clearTimeout(bufferingTimeout);
      audioElement.removeEventListener('playing', playingHandler);
    };
    
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

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
    } catch (e) {
      console.warn("Spielstand konnte nicht gespeichert werden:", e);
    }
  }

  loadGameProgress() {
    try {
      const savedProgress = localStorage.getItem(this.storageKey);

      if (savedProgress) {
        const progress = JSON.parse(savedProgress);

        this.currentLevelIndex = Math.min(progress.currentLevelIndex || 0, this.levels.length - 1);
        this.currentDifficulty = progress.difficulty || "easy";
        this.hintsUsed = progress.hintsUsed || 0;

        if (progress.musicEnabled === false) {
          this.audioManager.musicEnabled = false;
          this.domElements.musicToggle.innerHTML = musicOffIcon;
        }

        if (progress.soundEnabled === false) {
          this.audioManager.soundEnabled = false;
          this.domElements.soundToggle.innerHTML = soundOffIcon;
        }

        this.domElements.difficultySelect.value = this.currentDifficulty;
        this.updateDifficultyVisual();
      }
    } catch (e) {
      console.warn("Spielstand konnte nicht geladen werden:", e);
    }
  }

  resetGameProgress() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn("Spielstand konnte nicht zurückgesetzt werden:", e);
    }
  }

  /**
 * Startet das Spiel und initialisiert Audio
 * Verbesserte Version mit robuster Audio-Behandlung
 */
startGame() {
  this.audioManager.playSound('click');
  this.currentDifficulty = this.domElements.difficultySelect.value;
  this.updateDifficultyVisual();
  this.domElements.startScreen.classList.add("hidden");
  this.domElements.gameContainer.style.display = "flex";
  this.startTime = Date.now();
  this.updateTimerDisplay();
  clearInterval(this.timerInterval);
  this.timerInterval = setInterval(() => this.updateTimerDisplay(), 1000);
  this.initLevel();
  
  // Audio Context für alle Geräte aktivieren
  if (this.stemAudioManager.context) {
    console.log("AudioContext Status beim Spielstart:", this.stemAudioManager.context.state);
    this.stemAudioManager.context.resume().then(() => {
      console.log("AudioContext erfolgreich aktiviert durch Benutzerinteraktion");
    }).catch(e => console.warn("Fehler beim Aktivieren des AudioContext:", e));
  }
  
  // Verzögerter Start für alle Geräte (nicht nur mobile)
  // Dies gibt dem Audio-System Zeit, sich zu initialisieren
  setTimeout(() => {
    console.log("Starte Musik mit Verzögerung...");
    this.stemAudioManager.play();
    
    // Nach dem Start eine zusätzliche Synchronisation für alle Geräte erzwingen
    if (typeof this.stemAudioManager.syncAllStems === 'function') {
      setTimeout(() => this.stemAudioManager.syncAllStems(true), 500);
    }
    
    // Erneuter Versuch nach weiterer Verzögerung für den Fall, dass Musik nicht startet
    setTimeout(() => {
      if (!this.stemAudioManager.isPlaying) {
        console.log("Musik scheint nicht zu spielen, erneuter Versuch...");
        this.stemAudioManager.play();
      }
    }, 1000);
  }, 300);
  
  this.saveGameProgress();
}

  startNewGame() {
    this.audioManager.playSound('click');

    this.currentLevelIndex = 0;
    this.hintsUsed = 0;
    this.currentDifficulty = this.domElements.difficultySelect.value;
    this.updateDifficultyVisual();
    this.levelPending = false;

    this.domElements.startScreen.classList.add("hidden");
    this.domElements.endScreen.classList.add("hidden");
    this.domElements.levelOverlay.classList.add("hidden");
    this.domElements.gameContainer.style.display = "flex";

    this.startTime = Date.now();
    this.updateTimerDisplay();
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTimerDisplay(), 1000);

    this.initLevel();
    
    // Stem-Audio zurücksetzen und starten
    this.stemAudioManager.resetToBaseStem();
    
    // Bei Mobilgeräten verzögert starten und Synchronisation erzwingen
    if (this.isMobileDevice) {
      setTimeout(() => {
        this.stemAudioManager.play();
        
        // Nach dem Start eine zusätzliche Synchronisation erzwingen
        if (typeof this.stemAudioManager.syncAllStems === 'function') {
          setTimeout(() => this.stemAudioManager.syncAllStems(true), 500);
        }
      }, 100);
    } else {
      this.stemAudioManager.play();
    }

    this.resetGameProgress();
    this.saveGameProgress();
  }

  updateTimerDisplay() {
    updateTimer(this.startTime, this.domElements.timer);
  }

  updateDifficultyVisual() {
    updateDifficultyVisual(this.domElements.difficultySelect);
  }

  initLevel() {
    this.levelPending = false;

    this.currentLevel = this.levels[this.currentLevelIndex];
    setColorScheme(this.currentLevel.colorScheme);
    this.targetWords = this.currentLevel.targetWords;
    this.foundWords = new Set();
    this.selectedCells = [];
    this.startCell = null;
    this.grid = Array.from({length: this.gridSize}, () => Array(this.gridSize).fill(""));

    this.domElements.epicBadge.classList.remove('visible');

    updateProgressBar(0, this.targetWords.length, this.domElements.progressBar);
    this.domElements.levelIndicator.textContent = `Level: ${this.currentLevelIndex + 1}/${this.levels.length}`;

    // Je nach Schwierigkeitsgrad erlaubte Suchrichtungen festlegen
    if (this.currentDifficulty === "easy") {
      this.allowedDirections = [
        {dx: 1, dy: 0},   // horizontal rechts
        {dx: 0, dy: 1},   // vertikal nach unten
        {dx: 1, dy: 1}    // diagonal nach unten rechts
      ];
    } else {
      this.allowedDirections = [
        {dx: 1, dy: 0},   // horizontal rechts
        {dx: -1, dy: 0},  // horizontal links
        {dx: 0, dy: 1},   // vertikal nach unten
        {dx: 0, dy: -1},  // vertikal nach oben
        {dx: 1, dy: 1},   // diagonal nach unten rechts
        {dx: -1, dy: -1}, // diagonal nach oben links
        {dx: 1, dy: -1},  // diagonal nach oben rechts
        {dx: -1, dy: 1}   // diagonal nach unten links
      ];
    }

    // Wörter platzieren
    this.targetWords.forEach(word => {
      this.placeWord(word);
    });

    // Leere Zellen mit zufälligen Buchstaben füllen
    this.fillEmptyCells();
    
    // Spielfeld rendern
    renderGrid(this.grid, this.gridSize, this.domElements.grid);
    renderWordList(this.targetWords, this.foundWords, this.currentDifficulty, this.domElements.wordList);
    this.addCellListeners();

    if (this.currentLevelIndex > 0) {
      // Flash-Effekt mit nur Sound-Effekt
      const flash = document.querySelector('.memory-flash');
      flash.style.animation = 'none';
      setTimeout(() => {
        flash.style.animation = 'flash 1.5s forwards';
        this.audioManager.playSound('flash');
      }, 10);
    }
    
    // Bei Mobilgeräten eine Synchronisation erzwingen
    if (this.isMobileDevice && typeof this.stemAudioManager.syncAllStems === 'function') {
      setTimeout(() => this.stemAudioManager.syncAllStems(true), 300);
    }
  }

  placeWord(word) {
    const len = word.length;
    let maxAttempts = 100;

    if (len > 8) maxAttempts = 150;

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
        if (current !== "" && current !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < len; i++) {
          const x = startX + dir.dx * i;
          const y = startY + dir.dy * i;
          this.grid[y][x] = word[i];
        }
        return true;
      }
    }

    console.warn("Konnte Wort nicht platzieren:", word);

    // Fallback: Wort horizontal einfügen, wenn möglich
    for (let row = 0; row < this.gridSize; row++) {
      let emptyCount = 0;
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === "") emptyCount++;
      }

      if (emptyCount >= word.length) {
        let col = Math.floor(Math.random() * (this.gridSize - word.length + 1));
        for (let i = 0; i < word.length; i++) {
          this.grid[row][col + i] = word[i];
        }
        return true;
      }
    }

    return false;
  }

  fillEmptyCells() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ";
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (this.grid[y][x] === "") {
          this.grid[y][x] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
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

  pointerDown(e) {
    if (this.levelPending) return;

    e.preventDefault();
    if (!e.target.classList.contains("cell")) return;

    this.isDragging = true;
    clearCellSelection();

    let cellEl = e.target;
    this.startCell = {
      row: parseInt(cellEl.dataset.row),
      col: parseInt(cellEl.dataset.col),
      el: cellEl,
      letter: cellEl.textContent
    };

    this.selectedCells = [this.startCell];
    cellEl.classList.add("selected");
  }

  pointerMove(e) {
    if (this.levelPending) return;

    e.preventDefault();
    if (!this.isDragging || !this.startCell) return;

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
        this.selectedCells.push({
          row: pt.row,
          col: pt.col,
          el: selCell,
          letter: selCell.textContent
        });
        selCell.classList.add("selected");
      }
    });
  }

  pointerUp(e) {
    if (this.levelPending) return;

    e.preventDefault();
    if (!this.isDragging) return;

    this.isDragging = false;
    this.checkSelectedWord();

    setTimeout(() => {
      clearCellSelection();
      this.selectedCells = [];
      this.startCell = null;
    }, 150);
  }

  getNearestCell(x, y, threshold) {
    let cells = document.querySelectorAll(".cell");
    let nearest = null;
    let minDist = Infinity;

    cells.forEach(cell => {
      let rect = cell.getBoundingClientRect();
      let cx = rect.left + rect.width / 2;
      let cy = rect.top + rect.height / 2;
      let dist = Math.hypot(x - cx, y - cy);

      if (dist < minDist) {
        minDist = dist;
        nearest = cell;
      }
    });

    return (minDist <= threshold) ? nearest : null;
  }

  checkSelectedWord() {
    if (this.selectedCells.length === 0 || this.levelPending) return;

    const word = this.selectedCells.map(c => c.letter).join("");
    const reversed = this.selectedCells.map(c => c.letter).reverse().join("");

    if (this.targetWords.includes(word) || this.targetWords.includes(reversed)) {
      const foundWord = this.targetWords.includes(word) ? word : reversed;

      if (!this.foundWords.has(foundWord)) {
        this.foundWords.add(foundWord);
        
        // Stem-Index für das Wort bestimmen
        const wordIndex = this.targetWords.indexOf(foundWord);
        const stemIndex = (wordIndex >= 0 && wordIndex < 5) ? wordIndex + 1 : 0;

        // Jede Zelle markieren
        this.selectedCells.forEach(c => {
          // Standard-Klasse "found" hinzufügen
          c.el.classList.add("found");
          
          // Falls ein Stem-Index existiert, diesen als Datenattribut setzen
          if (stemIndex > 0) {
            c.el.setAttribute('data-stem', stemIndex);
            
            // Prüfen, ob die Zelle bereits Teil eines anderen Wortes ist
            if (c.el.hasAttribute('data-word')) {
              c.el.classList.add('multi-word');
            }
            
            // Aktuelles Wort der Zelle zuordnen
            c.el.setAttribute('data-word', foundWord);
          }
          
          // Pulse-Animation
          c.el.style.animation = "none";
          setTimeout(() => {
            c.el.style.animation = "pulse 0.6s ease-in-out, cell-glow 1.5s infinite alternate";
          }, 5);
        });

        let wordEl = document.getElementById("word-" + foundWord);
        if (wordEl) {
          wordEl.classList.add("found");
          wordEl.classList.add("word-just-found");
          setTimeout(() => wordEl.classList.remove("word-just-found"), 700);
          
          if (this.currentDifficulty === "loose") {
            wordEl.textContent = foundWord;
          }
        }

        this.audioManager.playSound('wordFound');
        
        // Stem-Audio basierend auf Wortposition aktualisieren
        if (wordIndex >= 0 && wordIndex < 5) {
          this.stemAudioManager.activateStem(stemIndex);
          const stemName = getStemName(stemIndex);
          showStemActivation(stemName, stemIndex);
          
          // Bei Mobilgeräten nach Stem-Aktivierung eine Synchronisation erzwingen
          if (this.isMobileDevice && typeof this.stemAudioManager.syncAllStems === 'function') {
            // Kurze Verzögerung für die Animation
            setTimeout(() => {
              this.stemAudioManager.syncAllStems(false);
            }, 1000);
          }
        }

        createConfetti(5);

        updateProgressBar(this.foundWords.size, this.targetWords.length, this.domElements.progressBar);

        if (this.foundWords.size === this.targetWords.length) {
          console.log("Alle Wörter gefunden!");

          if (this.hintsUsed === 0) {
            this.domElements.epicBadge.classList.add('visible');
          }

          this.levelPending = true;

          setTimeout(() => this.showLevelComplete(), 800);
        }
      }
    }
  }

  showLevelComplete() {
    console.log("Zeige Level-Abschluss");
    this.audioManager.playSound('levelComplete');

    createConfetti(30);

    if (this.currentLevelIndex < this.levels.length - 1) {
      let lyrics = this.currentLevel.lyric;

      this.targetWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        lyrics = lyrics.replace(regex, match => `<span class="highlight">${match}</span>`);
      });

      this.domElements.lyricDisplay.innerHTML = lyrics;

      this.domElements.levelQuote.textContent = `"${this.currentLevel.quote}"`;

      // Flash-Effekt mit nur Sound-Effekt
      setTimeout(() => {
        const flash = document.querySelector('.memory-flash');
        flash.style.animation = 'none';
        setTimeout(() => {
          flash.style.animation = 'flash 1.5s forwards';
          this.audioManager.playSound('flash');
        }, 10);
      }, 500);

      this.domElements.levelOverlay.classList.remove("hidden");
    } else {
      clearInterval(this.timerInterval);
      let totalTime = Math.floor((Date.now() - this.startTime) / 1000);
      let minutes = Math.floor(totalTime / 60);
      let seconds = totalTime % 60;

      let qualityRating = "normale";
      if (this.hintsUsed === 0) qualityRating = "perfekte";
      else if (this.hintsUsed <= 3) qualityRating = "beeindruckende";

      this.domElements.endMessage.innerHTML = `
        <p style="margin-bottom: 15px;">In den Mandarinen liegen Erinnerungen und Verbundenheit –
        du hast die Geschichte des Songs Stück für Stück entdeckt.</p>

        <p style="margin-bottom: 25px;">Durch Kindheitserinnerungen, Jahre der Trennung und
        bis zum Wiedersehen hast du den roten Faden der Geschichte verfolgt.</p>

        <p>Deine ${qualityRating} Reise dauerte ${minutes}:${seconds < 10 ? "0" : ""}${seconds} Minuten.<br>
        Du hast ${this.hintsUsed} Tipps genutzt.</p>
      `;

      this.domElements.endScreen.classList.remove("hidden");
      this.audioManager.playSound('gameComplete');
      createConfetti(50);

      // Flash-Effekt mit nur Sound-Effekt
      setTimeout(() => {
        const flash = document.querySelector('.memory-flash');
        flash.style.animation = 'none';
        setTimeout(() => {
          flash.style.animation = 'flash 1.5s forwards';
          this.audioManager.playSound('flash');
        }, 10);
      }, 1000);
    }
  }

  nextLevel() {
    console.log("nextLevel aufgerufen");
    this.audioManager.playSound('click');

    this.domElements.levelOverlay.classList.add("hidden");

    this.isDragging = false;
    clearCellSelection();
    this.selectedCells = [];
    this.startCell = null;

    // Stems auf Grundzustand zurücksetzen (nur Klavier)
    this.stemAudioManager.resetToBaseStem();

    // Bei Mobilgeräten zusätzliche Synchronisation erzwingen
    if (this.isMobileDevice && typeof this.stemAudioManager.syncAllStems === 'function') {
      // Kurze Verzögerung, damit die UI-Änderungen abgeschlossen sind
      setTimeout(() => {
        this.stemAudioManager.syncAllStems(true);
      }, 200);
    }

    this.currentLevelIndex++;  // Hier wird der Setter verwendet, der die DOM-Elemente aktualisiert

    if (this.currentLevelIndex < this.levels.length) {
      this.initLevel();
    } else {
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
    
    // Stems zurücksetzen
    this.stemAudioManager.resetToBaseStem();
    
    // Bei Mobilgeräten zusätzliche Synchronisation erzwingen
    if (this.isMobileDevice && typeof this.stemAudioManager.syncAllStems === 'function') {
      setTimeout(() => {
        this.stemAudioManager.syncAllStems(true);
      }, 200);
    }

    this.saveGameProgress();
  }

  toggleMusic() {
    const musicEnabled = this.audioManager.toggleMusic();
    this.domElements.musicToggle.innerHTML = musicEnabled ? musicOnIcon : musicOffIcon;

    // Auch den Stem-Manager steuern
    if (musicEnabled) {
      this.stemAudioManager.play();
      
      // Bei Mobilgeräten erzwingen wir eine Synchronisation
      if (this.isMobileDevice && typeof this.stemAudioManager.syncAllStems === 'function') {
        setTimeout(() => {
          this.stemAudioManager.syncAllStems(true);
        }, 300);
      }
    } else {
      this.stemAudioManager.pause();
    }

    if (this.audioManager.soundEnabled) {
      this.audioManager.playSound('click');
    }

    this.saveGameProgress();
  }

  toggleSound() {
    const soundEnabled = this.audioManager.toggleSound();
    this.domElements.soundToggle.innerHTML = soundEnabled ? soundOnIcon : soundOffIcon;

    if (this.audioManager.soundEnabled) {
      this.audioManager.playSound('click');
    }

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
  }

  hideHelp() {
    this.audioManager.playSound('click');
    this.domElements.helpOverlay.classList.add("hidden");
  }
}