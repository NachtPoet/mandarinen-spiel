/**
 * StemAudioManager - Verwendet vordefinierte HTML-Audio-Elemente
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
  
  // Initialisieren
  this.init();
}

/**
 * Initialisiert alle Audio-Elemente
 */
StemAudioManager.prototype.init = function() {
  // Sicherstellen, dass alle Audio-Elemente existieren
  var missingElements = false;
  for (var i = 0; i < this.stems.length; i++) {
    if (!this.stems[i]) {
      missingElements = true;
      break;
    }
  }
  
  if (missingElements) {
    console.error("Einige Audio-Elemente konnten nicht gefunden werden. Bitte überprüfe die HTML-Datei.");
    return;
  }
  
  // Stems vorbereiten
  var self = this;
  for (var i = 0; i < this.numStems; i++) {
    // Lautstärke setzen (nur Klavier hörbar)
    this.stems[i].volume = (i === 0) ? this.volume : 0;
    
    // Fehlerbehandlung
    (function(index) {
      self.stems[index].addEventListener('error', function(e) {
        console.warn("Stem " + (index+1) + " konnte nicht geladen werden:", e);
      });
    })(i);
  }
  
  // Synchronisierung
  if (this.stems[0]) {
    var self = this;
    this.stems[0].addEventListener('play', function() {
      self.syncAllStems();
    });
  }
  
  console.log("StemAudioManager initialisiert mit HTML-Audio-Elementen");
};

/**
 * Synchronisiert alle Stems
 */
StemAudioManager.prototype.syncAllStems = function() {
  var primaryStem = this.stems[0];
  var currentTime = primaryStem.currentTime;
  
  // Alle anderen Stems synchronisieren
  for (var i = 1; i < this.stems.length; i++) {
    (function(index, manager) {
      if (manager.stems[index].paused && !primaryStem.paused) {
        // Erst Zeit setzen, dann abspielen
        try {
          manager.stems[index].currentTime = currentTime;
          manager.stems[index].play().catch(function(e) {
            console.log("Stem " + index + " konnte nicht gestartet werden:", e);
          });
        } catch (e) {
          console.warn("Konnte Stem " + index + " nicht synchronisieren:", e);
        }
      }
    })(i, this);
  }
};

/**
 * Startet die Wiedergabe aller Stems
 */
StemAudioManager.prototype.play = function() {
  // Prüfen, ob bereits abgespielt wird
  if (this.isPlaying) return;
  
  // Versuchen, das erste Element abzuspielen
  var self = this;
  var playPromise = this.stems[0].play();
  
  if (playPromise !== undefined) {
    playPromise.catch(function(e) {
      console.log("Stem 0 konnte nicht gestartet werden:", e);
      
      // Bei Autoplay-Beschränkungen: Play-Button erstellen
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
          self.stems[0].play().then(function() {
            // Nach Benutzerinteraktion alle Stems starten
            self.syncAllStems();
            playButton.remove();
          }).catch(function(err) {
            console.error("Fehler beim Starten der Musik:", err);
          });
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
    this.stems[i].pause();
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
      this.stems[i].volume = volume;
    }
  }
};

/**
 * Gibt Ressourcen frei
 */
StemAudioManager.prototype.dispose = function() {
  for (var i = 0; i < this.stems.length; i++) {
    this.stems[i].pause();
    this.stems[i].src = '';
  }
};
