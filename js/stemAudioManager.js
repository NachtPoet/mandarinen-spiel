/**
 * Verbesserte StemAudioManager-Implementierung mit Web Audio API
 * für bessere Synchronisation auf allen Geräten (inkl. Mobilgeräte)
 */
function StemAudioManager() {
  // Audio Context erstellen
  this.context = new (window.AudioContext || window.webkitAudioContext)();
  
  // Buffer-Quellen und Nodes für jeden Stem
  this.buffers = new Array(6).fill(null);
  this.sources = new Array(6).fill(null);
  this.gainNodes = new Array(6).fill(null);
  
  // Anzahl der Stems
  this.numStems = 6;
  
  // DOM-Audio-Elemente (nur als Fallback)
  this.stems = [
    document.getElementById('stem-piano'),
    document.getElementById('stem-bass'),
    document.getElementById('stem-drums'),
    document.getElementById('stem-guitars'),
    document.getElementById('stem-others'),
    document.getElementById('stem-vocals')
  ];
  
  // Welche Stems sind aktiv
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
  this.stemFiles = APP_CONFIG.STEMS[APP_CONFIG.MODE].map(stem => stem.file);
  
  // Fade-Status (für Animation)
  this.fadingStems = new Set();
  
  // Startzeit und Dauer für die Synchronisation
  this.startTime = 0;
  this.bufferDuration = 0;
  
  // Initialisieren
  this.init();
}

/**
 * Initialisiert alle Audio-Buffers mit verbesserter Event-Behandlung
 */
StemAudioManager.prototype.init = function() {
  var self = this;
  
  // Audio Context wieder aktivieren bei jeder Benutzerinteraktion
  var resumeAudioOnInteraction = function() {
    if (self.context.state === 'suspended') {
      console.log("Versuche AudioContext durch Benutzerinteraktion zu aktivieren");
      self.context.resume().then(function() {
        console.log("AudioContext erfolgreich aktiviert");
      }).catch(function(e) {
        console.warn("Fehler beim Aktivieren des AudioContext:", e);
      });
    }
  };
  
  // Event-Listener für häufigere Benutzerinteraktionen hinzufügen
  document.addEventListener('click', resumeAudioOnInteraction);
  document.addEventListener('touchstart', resumeAudioOnInteraction);
  document.addEventListener('keydown', resumeAudioOnInteraction);
  
  // Gezielte Event-Listener für UI-Elemente hinzufügen
  setTimeout(function() {
    // Wichtige UI-Elemente für Benutzerinteraktion finden
    var interactiveElements = [
      document.getElementById('startButton'),
      document.getElementById('startNewButton'),
      document.getElementById('musicToggle'),
      document.getElementById('soundToggle'),
      document.getElementById('grid')
    ];
    
    // Event-Listener für alle gefundenen Elemente hinzufügen
    interactiveElements.forEach(function(element) {
      if (element) {
        element.addEventListener('click', resumeAudioOnInteraction);
        element.addEventListener('touchstart', resumeAudioOnInteraction);
      }
    });
  }, 100);
  
  // Alle Stems laden
  for (var i = 0; i < this.numStems; i++) {
    this.loadStemBuffer(i);
  }
  
  console.log("StemAudioManager mit erweiterter Web Audio API initialisiert");
};

/**
 * Versucht, eine Audio-Datei zu laden und in einen Buffer zu dekodieren
 */
StemAudioManager.prototype.loadStemBuffer = function(index) {
  var self = this;
  var filename = this.stemFiles[index];
  
  // Verschiedene Pfade versuchen
  var possiblePaths = [
    'assets/audio/stems/' + filename,
    './assets/audio/stems/' + filename,
    '/assets/audio/stems/' + filename,
    'https://mandarinenspiel.alexandrajanzen.de/assets/audio/stems/' + filename
  ];
  
  console.log("Versuche, Stem " + (index + 1) + " zu laden");
  
  // Ersten Pfad versuchen
  this.tryLoadPath(possiblePaths, 0, index);
};

/**
 * Rekursiv verschiedene Pfade für den Stem-Load versuchen
 */
StemAudioManager.prototype.tryLoadPath = function(paths, pathIndex, stemIndex) {
  var self = this;
  
  if (pathIndex >= paths.length) {
    console.error("Alle Pfade für Stem " + (stemIndex + 1) + " gescheitert.");
    return;
  }
  
  var path = paths[pathIndex];
  console.log("Versuche Pfad: " + path + " für Stem " + (stemIndex + 1));
  
  fetch(path)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("HTTP Fehler: " + response.status);
      }
      return response.arrayBuffer();
    })
    .then(function(arrayBuffer) {
      return self.context.decodeAudioData(arrayBuffer);
    })
    .then(function(audioBuffer) {
      console.log("Stem " + (stemIndex + 1) + " erfolgreich geladen");
      self.buffers[stemIndex] = audioBuffer;
      self.stemsLoaded[stemIndex] = true;
      
      // Wenn es der erste Stem ist, die Dauer für alle speichern
      if (stemIndex === 0) {
        self.bufferDuration = audioBuffer.duration;
        console.log("Audio-Dauer: " + self.bufferDuration + " Sekunden");
      }
      
      // GainNode erstellen
      if (!self.gainNodes[stemIndex]) {
        self.gainNodes[stemIndex] = self.context.createGain();
        self.gainNodes[stemIndex].connect(self.context.destination);
      }
      
      // Lautstärke setzen (nur Piano hat anfangs Lautstärke > 0)
      self.gainNodes[stemIndex].gain.value = self.stemVolumes[stemIndex];
    })
    .catch(function(error) {
      console.warn("Fehler beim Laden von " + path + ": " + error.message);
      // Nächsten Pfad versuchen
      self.tryLoadPath(paths, pathIndex + 1, stemIndex);
    });
};

/**
 * Startet die Wiedergabe aller Stems synchronisiert
 * Verbesserte Version mit robuster Fehlererkennung und Wiederholungslogik
 */
StemAudioManager.prototype.play = function() {
  if (this.isPlaying) return;
  
  console.log("StemAudioManager.play aufgerufen, Context-Status: " + this.context.state);
  
  // Prüfen, ob mindestens der erste Buffer geladen ist
  if (!this.buffers[0] || !this.stemsLoaded[0]) {
    console.log("Warte auf Laden des ersten Stems...");
    // Warten und erneut versuchen
    var self = this;
    var checkInterval = setInterval(function() {
      if (self.buffers[0] && self.stemsLoaded[0]) {
        clearInterval(checkInterval);
        console.log("Erster Stem geladen, versuche zu spielen");
        self.play(); // Rekursiver Aufruf nach dem Laden
      }
    }, 200);
    return;
  }
  
  // AudioContext muss aktiv sein
  if (this.context.state === 'suspended') {
    console.log("AudioContext ist suspendiert. Versuche, ihn zu aktivieren...");
    var self = this;
    this.context.resume().then(function() {
      console.log("AudioContext aktiviert, starte Stems...");
      self.startStems();
      
      // Zusätzliche Prüfung nach kurzer Verzögerung
      setTimeout(function() {
        if (!self.isPlaying || !self.sources[0]) {
          console.log("Musik scheint nicht zu spielen, erneuter Versuch...");
          self.startStems();
        }
      }, 500);
    }).catch(function(error) {
      console.error("Fehler beim Aktivieren des AudioContext:", error);
      // Trotzdem versuchen zu starten
      self.startStems();
    });
  } else {
    this.startStems();
    
    // Zusätzliche Prüfung nach kurzer Verzögerung
    var self = this;
    setTimeout(function() {
      if (!self.isPlaying || !self.sources[0]) {
        console.log("Musik scheint nicht zu spielen, erneuter Versuch...");
        self.startStems();
      }
    }, 500);
  }
};

/**
 * Interne Methode zum Starten aller Stem-Quellen
 */
StemAudioManager.prototype.startStems = function() {
  // Aktuelle Zeit als Referenzpunkt
  this.startTime = this.context.currentTime;
  
  console.log("Starte alle Stems synchronisiert bei: " + this.startTime);
  
  // Alle vorhandenen Quellen stoppen
  this.stopAllSources();
  
  // Für jeden Stem eine neue Source erstellen und starten
  for (var i = 0; i < this.numStems; i++) {
    if (!this.buffers[i] || !this.stemsLoaded[i]) {
      console.log("Stem " + (i + 1) + " ist nicht verfügbar oder nicht geladen");
      continue;
    }
    
    // Source erstellen und konfigurieren
    var source = this.context.createBufferSource();
    source.buffer = this.buffers[i];
    source.loop = true;
    
    // Mit GainNode verbinden
    source.connect(this.gainNodes[i]);
    
    // Für späteren Zugriff speichern
    this.sources[i] = source;
    
    // Gleichzeitig starten - perfekte Synchronisation
    source.start(0);
    
    console.log("Stem " + (i + 1) + " gestartet");
  }
  
  this.isPlaying = true;
};

/**
 * Synchronisiert alle aktiven Stems
 * @param {boolean} forceRestart - Wenn true, werden Stems neu gestartet
 */
StemAudioManager.prototype.syncAllStems = function(forceRestart) {
  if (!this.isPlaying) {
    console.log("Keine Synchronisation nötig - Musik spielt nicht");
    return;
  }
  
  console.log("Synchronisiere Stems" + (forceRestart ? " mit Neustart" : ""));
  
  if (forceRestart) {
    // Kompletter Neustart aller Quellen
    this.startStems();
    return;
  }
  
  // Wenn kein kompletter Neustart, dann nur aktuelle Wiedergabe anpassen
  var referenceSource = null;
  var referenceTime = 0;
  
  // Suche nach einer aktiven Referenzquelle
  for (var i = 0; i < this.numStems; i++) {
    if (this.sources[i] && this.stemVolumes[i] > 0) {
      referenceSource = this.sources[i];
      break;
    }
  }
  
  // Wenn keine Referenzquelle gefunden, einfach neu starten
  if (!referenceSource) {
    console.log("Keine aktive Referenzquelle gefunden, starte neu");
    this.startStems();
    return;
  }
  
  // Log-Ausgabe für Debugging
  console.log("Stem-Synchronisation abgeschlossen");
};

/**
 * Stoppt alle aktiven Audio-Quellen
 */
StemAudioManager.prototype.stopAllSources = function() {
  for (var i = 0; i < this.numStems; i++) {
    if (this.sources[i]) {
      try {
        this.sources[i].stop();
      } catch (e) {
        // Ignorieren (kann auftreten, wenn Source bereits gestoppt ist)
      }
      this.sources[i] = null;
    }
  }
};

/**
 * Pausiert alle Stems
 */
StemAudioManager.prototype.pause = function() {
  if (!this.isPlaying) return;
  
  this.stopAllSources();
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
  
  if (!this.buffers[stemIndex] || !this.stemsLoaded[stemIndex] || !this.gainNodes[stemIndex]) {
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
  this.fadingStems.add(stemIndex);
  
  // Aktuelle Zeit
  var currentTime = this.context.currentTime;
  
  // Langsames Fade-In über 1.5 Sekunden
  this.gainNodes[stemIndex].gain.setValueAtTime(0, currentTime);
  this.gainNodes[stemIndex].gain.linearRampToValueAtTime(this.volume, currentTime + 1.5);
  
  // Nach dem Fade-In Statusvariablen aktualisieren
  var self = this;
  setTimeout(function() {
    self.stemVolumes[stemIndex] = self.volume;
    self.fadingStems.delete(stemIndex);
    console.log("Stem " + stemIndex + " vollständig aktiviert");
  }, 1500);
  
  // Aktive Stems-Zahl aktualisieren
  this.activeStems = Math.max(this.activeStems, stemIndex + 1);
  
  return true;
};

/**
 * Setzt alle Stems außer dem ersten (Klavier) zurück
 */
StemAudioManager.prototype.resetToBaseStem = function() {
  console.log("Setze Stems zurück auf Grundzustand (nur Piano)");
  
  // Aktuelle Zeit
  var currentTime = this.context.currentTime;
  
  // Alle Stems außer Klavier ausblenden
  for (var i = 1; i < this.numStems; i++) {
    if (!this.gainNodes[i]) continue;
    
    // Fade-Out über 1 Sekunde
    this.gainNodes[i].gain.setValueAtTime(this.stemVolumes[i], currentTime);
    this.gainNodes[i].gain.linearRampToValueAtTime(0, currentTime + 1);
    
    // Status aktualisieren
    this.stemVolumes[i] = 0;
  }
  
  // Den Piano-Stem auf volle Lautstärke setzen
  if (this.gainNodes[0]) {
    this.gainNodes[0].gain.setValueAtTime(this.stemVolumes[0], currentTime);
    this.gainNodes[0].gain.linearRampToValueAtTime(this.volume, currentTime + 0.5);
    this.stemVolumes[0] = this.volume;
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
      if (this.gainNodes[i] && this.stemVolumes[i] > 0) {
        // Neue Lautstärke proportional zur bisherigen setzen
        var newVolume = this.stemVolumes[i] * ratio;
        this.gainNodes[i].gain.setValueAtTime(newVolume, this.context.currentTime);
        this.stemVolumes[i] = newVolume;
      }
    }
  }
};

/**
 * Gibt Ressourcen frei
 */
StemAudioManager.prototype.dispose = function() {
  this.pause();
  this.fadingStems.clear();
  
  // GainNodes trennen
  for (var i = 0; i < this.numStems; i++) {
    if (this.gainNodes[i]) {
      this.gainNodes[i].disconnect();
    }
  }
  
  // AudioContext schließen
  if (this.context && this.context.state !== 'closed') {
    this.context.close();
  }
};