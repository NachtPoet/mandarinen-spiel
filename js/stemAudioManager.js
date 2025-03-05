/**
 * StemAudioManager - Verwendet HTML-Audio-Elemente mit adaptiven Pfaden
 * In ES5-Syntax für bessere Browser-Kompatibilität
 */
function StemAudioManager() {
  // Anzahl der Stems
  this.numStems = 6;
  
  // Array für Audio-Elemente
  this.stems = [
    document.getElementById('stem-piano'),
    document.getElementById('stem-bass'),
    document.getElementById('stem-drums'),
    document.getElementById('stem-guitars'),
    document.getElementById('stem-others'),
    document.getElementById('stem-vocals')
  ];
  
  // Aktuell aktive Stems (zuerst nur Klavier)
  this.activeStems = 1;
  
  // Flag für den Musikstatus
  this.isPlaying = false;
  
  // Hauptlautstärke
  this.volume = 0.7;
  
  // Stems erfolgreich geladen
  this.stemsLoaded = [false, false, false, false, false, false];
  
  // Stem-Dateinamen
  this.stemFiles = [
    '01_piano.mp3',
    '02_bass.mp3',
    '03_drums.mp3',
    '04_guitars.mp3',
    '05_others.mp3',
    '06_vocals.mp3'
  ];
  
  // Initialisieren
  this.init();
}

/**
 * Versucht, eine Audio-Datei mit verschiedenen Pfadvarianten zu laden
 * @param {HTMLAudioElement} audioElement - Das Audio-Element
 * @param {String} filename - Der Dateiname
 */
StemAudioManager.prototype.tryLoadWithDifferentPaths = function(audioElement, filename, callback) {
  // Verschiedene Pfade versuchen
  var possiblePaths = [
  './01_piano.mp3', // Direkt im Root, relativ zu index.html
  // ... die anderen Pfade erstmal auskommentieren oder löschen ...
];
  
  console.log("Versuche, Stem zu laden mit Pfaden:", possiblePaths);
  
  // Verwende den ersten Pfad und lade die Datei vor
  audioElement.src = possiblePaths[0];
  audioElement.load();
  
  var attemptCount = 0;
  var self = this;
  
  // Bei Erfolg Callback aufrufen
  var successHandler = function() {
    console.log("Erfolg mit Pfad:", possiblePaths[attemptCount]);
    audioElement.removeEventListener('canplaythrough', successHandler);
    if (callback) callback(true);
  };
  
  // Bei Fehler nächsten Pfad versuchen
  var errorHandler = function(e) {
    console.log("Fehler mit Pfad " + possiblePaths[attemptCount] + ":", e);
    audioElement.removeEventListener('error', errorHandler);
    
    attemptCount++;
    if (attemptCount < possiblePaths.length) {
      console.log("Versuche nächsten Pfad:", possiblePaths[attemptCount]);
      audioElement.src = possiblePaths[attemptCount];
      audioElement.load();
      
      // Event-Handler neu hinzufügen
      audioElement.addEventListener('canplaythrough', successHandler);
      audioElement.addEventListener('error', errorHandler);
    } else {
      console.error("Alle Pfade für " + filename + " gescheitert.");
      if (callback) callback(false);
    }
  };
  
  // Event-Handler hinzufügen
  audioElement.addEventListener('canplaythrough', successHandler);
  audioElement.addEventListener('error', errorHandler);
};

/**
 * Initialisiert alle Audio-Elemente
 */
StemAudioManager.prototype.init = function() {
  var self = this;
  
  // Prüfe, ob Audio-Elemente existieren und lade sie
  var allStemsFound = true;
  
  for (var i = 0; i < this.numStems; i++) {
    if (!this.stems[i]) {
      console.error("Audio-Element für Stem " + (i+1) + " konnte nicht gefunden werden");
      allStemsFound = false;
      continue;
    }
    
    // Setze Anfangslautstärke
    this.stems[i].volume = (i === 0) ? this.volume : 0;
    
    // Versuche verschiedene Pfade für jedes Stem
    (function(index, manager) {
      manager.tryLoadWithDifferentPaths(manager.stems[index], manager.stemFiles[index], function(success) {
        manager.stemsLoaded[index] = success;
        console.log("Stem " + (index+1) + " Ladestatus:", success);
      });
    })(i, this);
  }
  
  if (!allStemsFound) {
    console.warn("Einige Stems fehlen. Eingeschränkte Funktionalität.");
  }
  
  // Synchronisierung für Piano-Element
  if (this.stems[0]) {
    this.stems[0].addEventListener('play', function() {
      self.syncAllStems();
    });
  }
  
  console.log("StemAudioManager initialisiert");
};

/**
 * Synchronisiert alle Stems
 */
StemAudioManager.prototype.syncAllStems = function() {
  var primaryStem = this.stems[0];
  if (!primaryStem) return;
  
  var currentTime = primaryStem.currentTime || 0;
  
  // Alle anderen Stems synchronisieren
  for (var i = 1; i < this.stems.length; i++) {
    if (!this.stems[i] || !this.stemsLoaded[i]) continue;
    
    if (this.stems[i].paused && !primaryStem.paused) {
      try {
        this.stems[i].currentTime = currentTime;
        this.stems[i].play().catch(function(e) {
          console.log("Stem konnte nicht synchronisiert werden:", e);
        });
      } catch (e) {
        console.warn("Fehler bei der Synchronisierung:", e);
      }
    }
  }
};

/**
 * Startet die Wiedergabe aller Stems
 */
StemAudioManager.prototype.play = function() {
  if (this.isPlaying || !this.stems[0]) return;
  
  var self = this;
  var playPromise = this.stems[0].play();
  
  if (playPromise !== undefined) {
    playPromise.catch(function(e) {
      console.log("Stem 0 konnte nicht gestartet werden:", e);
      
      if (!document.getElementById('manual-play-button')) {
        var playButton = document.createElement('button');
        playButton.id = 'manual-play-button';
        playButton.textContent = 'Musik starten';
        playButton.className = 'btn primary';
        playButton.style.position = 'fixed';
        playButton.style.top = '20px';
        playButton.style.left = '50%';
        playButton.style.transform = 'translateX(-50%)';
        playButton.style.zIndex = '1000';
        
        playButton.addEventListener('click', function() {
          if (self.stems[0]) {
            self.stems[0].play().then(function() {
              self.syncAllStems();
              playButton.remove();
            }).catch(function(err) {
              console.error("Fehler:", err);
            });
          }
        });
        
        document.body.appendChild(playButton);
      }
    });
  }
  
  this.isPlaying = true;
};

/**
 * Pausiert die Wiedergabe aller Stems
 */
StemAudioManager.prototype.pause = function() {
  for (var i = 0; i < this.stems.length; i++) {
    if (this.stems[i] && !this.stems[i].paused) {
      try {
        this.stems[i].pause();
      } catch (e) {
        console.warn("Konnte Stem nicht pausieren:", e);
      }
    }
  }
  this.isPlaying = false;
};

/**
 * Aktiviert einen bestimmten Stem
 * @param {number} stemIndex - Index des zu aktivierenden Stems (0-5)
 * @returns {boolean} True wenn der Stem aktiviert wurde, sonst False
 */
StemAudioManager.prototype.activateStem = function(stemIndex) {
  if (stemIndex < 0 || stemIndex >= this.numStems) {
    return false; // Ungültiger Index
  }
  
  if (!this.stems[stemIndex] || !this.stemsLoaded[stemIndex]) {
    console.warn("Stem " + stemIndex + " ist nicht verfügbar oder nicht geladen");
    return false;
  }
  
  // Prüfen, ob der Stem bereits aktiv ist
  if (this.stems[stemIndex].volume > 0) {
    return false; // Stem ist bereits aktiv
  }
  
  console.log("Aktiviere Stem " + stemIndex);
  
  // Stem-Lautstärke sanft erhöhen
  var stem = this.stems[stemIndex];
  var self = this;
  
  // Fade-In Funktion
  var startTime = null;
  var duration = 1500; // 1.5 Sekunden
  
  function fadeIn(timestamp) {
    if (!startTime) startTime = timestamp;
    
    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / duration, 1);
    
    // Lautstärke sanft erhöhen
    stem.volume = progress * self.volume;
    
    // Weitermachen, bis fertig
    if (progress < 1) {
      requestAnimationFrame(fadeIn);
    }
  }
  
  requestAnimationFrame(fadeIn);
  
  // Aktive Stems-Zahl aktualisieren
  this.activeStems = Math.max(this.activeStems, stemIndex + 1);
  
  return true;
};

/**
 * Aktiviert den nächsten Stem
 * @returns {boolean} True wenn ein neuer Stem aktiviert wurde, sonst False
 */
StemAudioManager.prototype.activateNextStem = function() {
  if (this.activeStems >= this.numStems) {
    return false; // Alle Stems bereits aktiv
  }
  
  return this.activateStem(this.activeStems);
};

/**
 * Setzt alle Stems außer dem ersten (Klavier) zurück
 */
StemAudioManager.prototype.resetToBaseStem = function() {
  console.log("Setze Stems zurück auf Grundzustand");
  
  // Alle Stems außer Klavier auf 0 setzen
  for (var i = 1; i < this.numStems; i++) {
    if (!this.stems[i]) continue;
    
    (function(index, manager) {
      // Fade-Out Funktion
      var startVolume = manager.stems[index].volume;
      var startTime = null;
      var duration = 1000; // 1 Sekunde
      
      function fadeOut(timestamp) {
        if (!startTime) startTime = timestamp;
        
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        
        // Lautstärke sanft verringern
        manager.stems[index].volume = startVolume * (1 - progress);
        
        // Weitermachen, bis fertig
        if (progress < 1) {
          requestAnimationFrame(fadeOut);
        }
      }
      
      if (startVolume > 0) {
        requestAnimationFrame(fadeOut);
      }
    })(i, this);
  }
  
  // Aktive Stems auf 1 zurücksetzen (nur Klavier)
  this.activeStems = 1;
  
  return true;
};

/**
 * Setzt die Gesamtlautstärke
 * @param {number} volume - Lautstärke zwischen 0 und 1
 */
StemAudioManager.prototype.setVolume = function(volume) {
  if (volume >= 0 && volume <= 1) {
    this.volume = volume;
    
    // Lautstärke für aktive Stems anpassen
    for (var i = 0; i < this.activeStems; i++) {
      if (this.stems[i]) {
        this.stems[i].volume = volume;
      }
    }
  }
};

/**
 * Gibt Ressourcen frei
 */
StemAudioManager.prototype.dispose = function() {
  for (var i = 0; i < this.stems.length; i++) {
    if (this.stems[i]) {
      this.stems[i].pause();
      this.stems[i].src = '';
    }
  }
};
