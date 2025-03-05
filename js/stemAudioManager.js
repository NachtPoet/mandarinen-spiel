/**
 * StemAudioManager - Vereinfachte Version, die alle Stems gleichzeitig abspielt
 * und nur die Lautstärke regelt
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
  
  // Welche Stems sind aktiv (für Lautstärke-Regelung)
  this.activeStems = 1; // Anfangs nur Piano
  
  // Flag für den Musikstatus
  this.isPlaying = false;
  
  // Hauptlautstärke
  this.volume = 0.7;
  
  // Aktueller Status der Stems (aktiv/inaktiv)
  this.stemVolumes = [this.volume, 0, 0, 0, 0, 0];
  
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
  
  // Fade-Status (für Animation)
  this.fadingStems = new Set();
  
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
    'assets/audio/stems/' + filename,  // Relativer Pfad
    './assets/audio/stems/' + filename, // Mit führendem ./
    '/assets/audio/stems/' + filename,  // Mit führendem /
    'https://mandarinenspiel.alexandrajanzen.de/assets/audio/stems/' + filename // Absoluter URL
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
    
    // Loop-Einstellung für alle Stems
    this.stems[i].loop = true;
    
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
  
  console.log("StemAudioManager initialisiert");
};

/**
 * Startet die Wiedergabe ALLER Stems (inaktive mit Lautstärke 0)
 */
StemAudioManager.prototype.play = function() {
  if (this.isPlaying) return;
  
  var self = this;
  var startPromises = [];
  
  console.log("Starte alle Stems gleichzeitig...");
  
  // Alle Stems starten, egal ob aktiv oder nicht
  for (var i = 0; i < this.numStems; i++) {
    if (!this.stems[i] || !this.stemsLoaded[i]) continue;
    
    // Lautstärke setzen (nur Piano hat Anfangs Lautstärke > 0)
    this.stems[i].volume = this.stemVolumes[i];
    
    // Stem starten
    var playPromise = this.stems[i].play();
    
    if (playPromise !== undefined) {
      startPromises.push(playPromise);
    }
  }
  
  // Warten, bis alle Stems gestartet wurden
  if (startPromises.length > 0) {
    Promise.all(startPromises)
      .then(function() {
        console.log("Alle Stems erfolgreich gestartet");
        self.isPlaying = true;
      })
      .catch(function(error) {
        console.warn("Einige Stems konnten nicht automatisch gestartet werden:", error);
        
        // Bei Fehlern (AutoPlay-Policy) einen manuellen Start-Button anzeigen
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
            var restartPromises = [];
            
            for (var i = 0; i < self.numStems; i++) {
              if (!self.stems[i] || !self.stemsLoaded[i]) continue;
              
              var restartPromise = self.stems[i].play();
              if (restartPromise !== undefined) {
                restartPromises.push(restartPromise);
              }
            }
            
            Promise.all(restartPromises)
              .then(function() {
                console.log("Alle Stems manuell gestartet");
                self.isPlaying = true;
                playButton.remove();
              })
              .catch(function(err) {
                console.error("Fehler beim manuellen Start:", err);
              });
          });
          
          document.body.appendChild(playButton);
        }
      });
  } else {
    this.isPlaying = true;
  }
};

/**
 * Pausiert alle Stems
 */
StemAudioManager.prototype.pause = function() {
  for (var i = 0; i < this.numStems; i++) {
    if (this.stems[i] && !this.stems[i].paused) {
      try {
        this.stems[i].pause();
      } catch (e) {
        console.warn("Konnte Stem nicht pausieren:", e);
      }
    }
  }
  
  this.isPlaying = false;
  console.log("Alle Stems pausiert");
};

/**
 * Aktiviert einen Stem durch Fade-In der Lautstärke
 * @param {number} stemIndex - Index des zu aktivierenden Stems
 * @returns {boolean} True bei Erfolg
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
  if (this.stemVolumes[stemIndex] > 0) {
    return false; // Stem ist bereits aktiv
  }
  
  // Wenn gerade ein Fade läuft, abbrechen
  if (this.fadingStems.has(stemIndex)) {
    return false;
  }
  
  console.log("Aktiviere Stem " + stemIndex + " (Lautstärke hochfahren)");
  
  var stem = this.stems[stemIndex];
  var self = this;
  this.fadingStems.add(stemIndex);
  
  // Sicherstellen, dass der Stem läuft (sollte er bereits, aber zur Sicherheit)
  if (stem.paused && this.isPlaying) {
    try {
      var playPromise = stem.play();
      if (playPromise !== undefined) {
        playPromise.catch(function(e) {
          console.warn("Konnte Stem nicht starten:", e);
          self.fadingStems.delete(stemIndex);
        });
      }
    } catch (e) {
      console.warn("Fehler beim Starten des Stems:", e);
      this.fadingStems.delete(stemIndex);
      return false;
    }
  }
  
  // Fade-In Funktion
  var startTime = null;
  var duration = 1500; // 1.5 Sekunden
  
  function fadeIn(timestamp) {
    if (!startTime) startTime = timestamp;
    
    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / duration, 1);
    
    // Lautstärke sanft erhöhen
    stem.volume = progress * self.volume;
    self.stemVolumes[stemIndex] = stem.volume; 
    
    if (progress < 1) {
      requestAnimationFrame(fadeIn);
    } else {
      console.log("Stem " + stemIndex + " vollständig aktiviert");
      self.fadingStems.delete(stemIndex);
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
  console.log("Setze Stems zurück auf Grundzustand (nur Piano)");
  
  // Alle Stems außer Klavier auf 0 setzen
  for (var i = 1; i < this.numStems; i++) {
    if (!this.stems[i]) continue;
    
    // Bereits laufende Fades für diesen Stem abbrechen
    this.fadingStems.delete(i);
    
    (function(index, manager) {
      // Nur wenn der Stem aktiv ist (Lautstärke > 0)
      if (manager.stems[index].volume <= 0) return;
      
      // Fade-Out Funktion
      var startVolume = manager.stems[index].volume;
      var startTime = null;
      var duration = 1000; // 1 Sekunde
      
      manager.fadingStems.add(index);
      
      function fadeOut(timestamp) {
        if (!startTime) startTime = timestamp;
        
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        
        // Lautstärke sanft verringern
        manager.stems[index].volume = startVolume * (1 - progress);
        manager.stemVolumes[index] = manager.stems[index].volume;
        
        if (progress < 1) {
          requestAnimationFrame(fadeOut);
        } else {
          manager.fadingStems.delete(index);
        }
      }
      
      requestAnimationFrame(fadeOut);
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
    var ratio = volume / this.volume; // Verhältnis der neuen zur alten Lautstärke
    this.volume = volume;
    
    // Lautstärke aller derzeit aktiven Stems proportional anpassen
    for (var i = 0; i < this.numStems; i++) {
      if (this.stems[i] && this.stemVolumes[i] > 0) {
        // Neue Lautstärke: proportional zur bisherigen
        this.stems[i].volume = this.stemVolumes[i] * ratio;
        this.stemVolumes[i] = this.stems[i].volume;
      }
    }
  }
};

/**
 * Gibt Ressourcen frei
 */
StemAudioManager.prototype.dispose = function() {
  this.fadingStems.clear();
  
  for (var i = 0; i < this.numStems; i++) {
    if (this.stems[i]) {
      this.stems[i].pause();
      this.stems[i].src = '';
    }
  }
};