/**
 * Verbesserte StemAudioManager-Implementierung mit Web Audio API
 * für bessere Synchronisation auf allen Geräten (inkl. Mobilgeräte)
 * Mit Ladebildschirm-Unterstützung
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
  
  // Loop-Flag setzen
  this.looping = true;
  
  // Debug-Mode
  this.debugMode = false;
  
  // Hauptlautstärke
  this.volume = 0.7;
  
  // Aktueller Status der Stems (aktiv/inaktiv)
  this.stemVolumes = [this.volume, 0, 0, 0, 0, 0];
  
  // Stems erfolgreich geladen
  this.stemsLoaded = [false, false, false, false, false, false];
  
  // Stem-Dateinamen - Prüfe, ob APP_CONFIG verfügbar ist
  if (window.APP_CONFIG && APP_CONFIG.STEMS && APP_CONFIG.STEMS[APP_CONFIG.MODE]) {
    // Stem-Dateinamen aus der Konfiguration laden
    console.log(`Lade Stems für Modus: ${APP_CONFIG.MODE}`);
    this.stemFiles = APP_CONFIG.STEMS[APP_CONFIG.MODE].map(stem => stem.file);
  } else {
    // Fallback zu den Standard-Dateinamen
    console.warn("APP_CONFIG nicht verfügbar, verwende Standard-Stems");
    this.stemFiles = [
      '01B_piano.mp3',
      '02B_bass.mp3',
      '03B_drums.mp3',
      '04B_guitars.mp3',
      '05B_others.mp3',
      '06B_vocals.mp3'
    ];
  }
  
  // Fade-Status (für Animation)
  this.fadingStems = new Set();
  
  // Startzeit und Dauer für die Synchronisation
  this.startTime = 0;
  this.bufferDuration = 0;
  
  // Neue Eigenschaften für den Ladefortschritt
  this.onLoadProgressCallback = null;
  this.stemsTotalCount = this.numStems;
  this.stemsLoadedCount = 0;
  this._loadAllPromise = null; // Für die neue Ladefunktion
  this._resolveLoadAll = null;
  this._rejectLoadAll = null;
  
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
  
  // Audio-Elemente initialisieren
  this.setupAudioElements();
  
  // Loop-Handler einrichten
  this.setupLoopHandlers();
  
  // Lade Konfiguration für den aktuellen Modus
  this.loadStemConfiguration();
  
  // Visibility Listener einrichten
  this.setupVisibilityListener();
  
  console.log("StemAudioManager mit erweiterter Web Audio API initialisiert");
};

/**
 * Setzt den Callback für Fortschrittsaktualisierungen
 */
StemAudioManager.prototype.setLoadProgressCallback = function(callback) {
  this.onLoadProgressCallback = callback;
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
  
  var self = this;
  var filename = this.stemFiles[index];
  
  // Konstruiere den einzigen korrekten Pfad
  var path = 'assets/audio/stems/' + filename;
  
  console.log("Lade Stem " + (index + 1) + " von Pfad: " + path);
  
  fetch(path)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("HTTP Fehler: " + response.status);
      }
      return response.arrayBuffer();
    })
    .then(function(arrayBuffer) {
      // Dekodiere die Audiodaten
      return self.context.decodeAudioData(arrayBuffer);
    })
    .then(function(audioBuffer) {
      // Erfolgreich geladen und dekodiert
      console.log("Stem " + (index + 1) + " erfolgreich geladen und dekodiert.");
      self.buffers[index] = audioBuffer;
      self.stemsLoaded[index] = true;
      
      // Wenn es der erste Stem ist, die Dauer für alle speichern
      if (index === 0 && audioBuffer) {
        self.bufferDuration = audioBuffer.duration;
        console.log("Audio-Dauer gesetzt: " + self.bufferDuration + " Sekunden");
      }
      
      // GainNode erstellen, falls noch nicht vorhanden
      if (!self.gainNodes[index]) {
        self.gainNodes[index] = self.context.createGain();
        self.gainNodes[index].connect(self.context.destination);
      }
      
      // Lautstärke setzen (nur Piano hat anfangs Lautstärke > 0)
      self.gainNodes[index].gain.value = self.stemVolumes[index];
      
      // Stems-Ladefortschritt aktualisieren
      self.stemsLoadedCount++;
      // self.stemsLoadedCount++; // Entferne doppelte Inkrementierung
      self.updateLoadProgress(); // Fortschritt aktualisieren
    })
    .catch(function(error) {
      // Fehler beim Laden oder Dekodieren
      console.error("Fehler beim Laden/Dekodieren von Stem " + (index + 1) + " (" + path + "):", error);
      self.stemsLoaded[index] = false; // Markieren als nicht geladen
      
      // Stems-Ladefortschritt trotzdem erhöhen, um den Ladevorgang abzuschließen (auch bei Fehler)
      self.stemsLoadedCount++;
      self.updateLoadProgress(); // Fortschritt aktualisieren (wird Fehler im Promise behandeln)
    });
};


/**
 * Aktualisiert den Ladefortschritt und ruft den Callback auf
 */
StemAudioManager.prototype.updateLoadProgress = function() {
  var progress = this.stemsLoadedCount / this.stemsTotalCount;
  var allStemsProcessed = this.stemsLoadedCount >= this.stemsTotalCount;

  // Callback aufrufen, falls vorhanden
  if (this.onLoadProgressCallback) {
    this.onLoadProgressCallback(progress, this.stemsLoadedCount, this.stemsTotalCount);
  }

  // Promise auflösen oder ablehnen, wenn alle Stems verarbeitet wurden
  if (allStemsProcessed && this._loadAllPromise) {
    var successfullyLoaded = this.stemsLoaded.every(loaded => loaded === true);
    if (successfullyLoaded) {
      console.log("Alle Stems erfolgreich geladen.");
      if (this._resolveLoadAll) this._resolveLoadAll();
    } else {
      console.error("Einige Stems konnten nicht geladen werden.");
      if (this._rejectLoadAll) this._rejectLoadAll("Fehler beim Laden einiger Stems.");
    }
    // Promise-Callbacks zurücksetzen
    this._loadAllPromise = null;
    this._resolveLoadAll = null;
    this._rejectLoadAll = null;
  }
};

/**
 * Setzt den Ladefortschritt zurück
 */
StemAudioManager.prototype.resetLoadProgress = function() {
  this.stemsLoadedCount = 0;
  this.updateLoadProgress();
};

/**
 * Prüft, ob alle Stems geladen sind
 */
StemAudioManager.prototype.allStemsLoaded = function() {
  // Prüft, ob *alle* Stems erfolgreich geladen wurden (nicht nur verarbeitet)
  return this.stemsLoaded.every(loaded => loaded === true);
};

/**
 * Lädt alle Stems und gibt ein Promise zurück, das aufgelöst wird, wenn alle geladen sind.
 * @returns {Promise<void>} Ein Promise, das bei Erfolg aufgelöst oder bei Fehler abgelehnt wird.
 */
StemAudioManager.prototype.loadAllStems = function() {
  var self = this;

  // Wenn bereits ein Ladevorgang läuft, das bestehende Promise zurückgeben
  if (this._loadAllPromise) {
    return this._loadAllPromise;
  }

  // Wenn alle Stems bereits geladen sind, sofort auflösen
  if (this.allStemsLoaded()) {
    console.log("Alle Stems waren bereits geladen.");
    return Promise.resolve();
  }

  // Neues Promise erstellen
  this._loadAllPromise = new Promise(function(resolve, reject) {
    self._resolveLoadAll = resolve;
    self._rejectLoadAll = reject;

    // Ladevorgang starten (falls nicht schon geschehen)
    // Die init-Methode startet bereits das Laden, wir müssen hier nichts extra anstoßen.
    // Der Fortschritt wird über updateLoadProgress verfolgt.
    console.log("Starte/Überwache Ladevorgang für alle Stems...");
    
    // Initialen Fortschritt melden, falls schon Stems geladen wurden
    self.updateLoadProgress(); 
  });

  return this._loadAllPromise;
};

/**
 * Startet die Wiedergabe aller Stems synchronisiert
 * Verbesserte Version, die auf das Laden aller Stems wartet
 */
StemAudioManager.prototype.play = function() {
  if (this.isPlaying) return;
  
  console.log("StemAudioManager.play aufgerufen, Context-Status: " + this.context.state + ", Stems geladen: " + this.stemsLoadedCount + "/" + this.stemsTotalCount);
  
  // Sicherstellen, dass die Lautstärke für den Base-Stem (Piano) richtig gesetzt ist
  if (this.gainNodes[0]) {
    this.stemVolumes[0] = this.volume;
    this.gainNodes[0].gain.value = this.volume;
  }
  
  // Prüfen, ob alle Stems geladen sind
  if (this.stemsLoadedCount < this.stemsTotalCount) {
    console.log("Warte auf Laden aller Stems...");
    // Wir kehren zurück und lassen den Ladebildschirm weiterlaufen
    return;
  }
  
  // AudioContext muss aktiv sein
  if (this.context.state === 'suspended') {
    console.log("AudioContext ist suspendiert. Versuche, ihn zu aktivieren...");
    var self = this;
    
    // Versuche mehrmals, den AudioContext zu aktivieren
    const maxAttempts = 3;
    let attempts = 0;
    
    const tryResume = function() {
      attempts++;
      console.log(`Versuch ${attempts}, AudioContext zu aktivieren...`);
      
      self.context.resume().then(function() {
        console.log("AudioContext aktiviert, starte Stems...");
        self.startStems();
        
        // Doppelte Überprüfung, ob die Wiedergabe wirklich gestartet hat
        setTimeout(function() {
          if (!self.isPlaying || !self.sources[0]) {
            console.log("Musik scheint nicht zu spielen, erneuter Versuch...");
            self.startStems();
            
            // Noch ein letzter Versuch nach kurzer Verzögerung
            setTimeout(function() {
              if (!self.isPlaying) {
                console.log("Letzter Versuch, die Stems zu starten...");
                self.startStems();
              }
            }, 1000);
          }
        }, 500);
      }).catch(function(error) {
        console.error("Fehler beim Aktivieren des AudioContext:", error);
        
        // Weitere Versuche, falls noch nicht alle Versuche aufgebraucht sind
        if (attempts < maxAttempts) {
          console.log(`AudioContext-Aktivierung fehlgeschlagen. Versuche erneut (${attempts}/${maxAttempts})...`);
          setTimeout(tryResume, 500);
        } else {
          console.warn("Alle Versuche, den AudioContext zu aktivieren, sind fehlgeschlagen. Versuche trotzdem zu spielen...");
          self.startStems();
        }
      });
    };
    
    // Starte den ersten Versuch
    tryResume();
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
  
  // Starte Untertitel-Updates
  this.startSubtitleUpdates();
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
  
  // Untertitel-Updates stoppen
  this.stopSubtitleUpdates();
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
  
  // Untertitel-Updates stoppen
  this.stopSubtitleUpdates();
  
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

/**
 * Gibt die aktuelle Wiedergabezeit zurück
 * @returns {number} Zeit in Sekunden seit Start der Wiedergabe
 */
StemAudioManager.prototype.getCurrentTime = function() {
  if (!this.isPlaying) return 0;
  
  // Berechne Zeit seit Start der Wiedergabe
  if (this.startTime > 0) {
    return this.context.currentTime - this.startTime;
  }
  
  return 0;
};

/**
 * Aktualisiert die Untertitel basierend auf der aktuellen Wiedergabezeit
 * Wird regelmäßig aufgerufen
 */
StemAudioManager.prototype.updateSubtitles = function() {
  if (!this.isPlaying || !window.subtitlesManager) return;
  
  // Aktuelle Zeit ermitteln
  const currentTime = this.getCurrentTime();
  
  // Untertitel aktualisieren
  if (window.subtitlesManager && typeof window.subtitlesManager.updateSubtitle === 'function') {
    window.subtitlesManager.updateSubtitle(currentTime);
  }
};

/**
 * Startet die regelmäßige Aktualisierung der Untertitel
 */
StemAudioManager.prototype.startSubtitleUpdates = function() {
  // Untertitel-Updates stoppen, falls bereits aktiv
  this.stopSubtitleUpdates();
  
  // Starte regelmäßige Updates
  const self = this;
  this.subtitleInterval = setInterval(() => {
    self.updateSubtitles();
  }, 100); // Alle 100ms aktualisieren für flüssige Anzeige
  
  console.log("Untertitel-Updates gestartet");
};

/**
 * Stoppt die regelmäßige Aktualisierung der Untertitel
 */
StemAudioManager.prototype.stopSubtitleUpdates = function() {
  if (this.subtitleInterval) {
    clearInterval(this.subtitleInterval);
    this.subtitleInterval = null;
    console.log("Untertitel-Updates gestoppt");
  }
};

// Loop-Event feuern und Wiedergabe neu starten
StemAudioManager.prototype.handleAudioLoop = function(stemId) {
  console.log(`Loop erkannt für Stem ${stemId}!`);
  
  // Bei Audio-Loop ein Event auslösen
  const loopEvent = new CustomEvent('audio-looped', {
    detail: { 
      time: 0,
      stemId: stemId
    },
    bubbles: true,
    cancelable: true
  });
  
  try {
    // Event auslösen und sicherstellen, dass es verarbeitet wird
    console.log("Löse audio-looped Event aus");
    document.dispatchEvent(loopEvent);
    
    // WICHTIG: Direkte Untertitel-Aktualisierung erzwingen
    if (window.subtitlesManager) {
      console.log("Setze Untertitel-Manager direkt zurück");
      
      // Erst Text leeren
      if (window.subtitlesManager.textElement) {
        window.subtitlesManager.textElement.textContent = '';
      }
      
      // Dann mit Verzögerung Untertitel für Zeit 0 anzeigen
      setTimeout(() => {
        if (typeof window.subtitlesManager.resetSubtitles === 'function') {
          window.subtitlesManager.resetSubtitles({ 
            detail: { stemId: stemId, time: 0 } 
          });
        }
        
        // Sicherstellen, dass der Untertitel-Container sichtbar ist
        if (window.subtitlesManager.container) {
          window.subtitlesManager.container.classList.remove('hidden');
          window.subtitlesManager.container.style.visibility = 'visible';
          window.subtitlesManager.container.style.display = 'flex';
        }
        
        // Zusätzlich manuell Untertitel an Position 0 setzen
        if (typeof window.subtitlesManager.updateSubtitle === 'function') {
          window.subtitlesManager.updateSubtitle(0);
          // Nochmal nach einer kurzen Verzögerung versuchen, für bessere Zuverlässigkeit
          setTimeout(() => {
            window.subtitlesManager.updateSubtitle(0);
          }, 200);
        }
      }, 50);
    } else {
      console.warn("Kein Untertitel-Manager verfügbar");
    }
    
    // Audio-Zeit überprüfen und bei Bedarf korrigieren
    if (this.isPlaying && this.getCurrentTime() > 1) {
      console.log("Audio scheint nicht richtig zurückgesetzt zu sein, korrigiere...");
      const self = this;
      
      // Kurz pausieren und dann neu starten (falls erforderlich)
      // Vorsichtsmaßnahme für Browser, die mit dem Loop-Attribut Probleme haben
      setTimeout(() => {
        if (self.isPlaying && self.getCurrentTime() > 2) {
          console.log("Starte Audio-Quellen neu, um korrekten Loop zu gewährleisten");
          self.startStems(); // Neu starten
        }
      }, 200);
    }
  } catch (error) {
    console.error("Fehler beim Verarbeiten des Audio-Loops:", error);
  }
};

// Audio-Element Loop-Listener aufbauen
StemAudioManager.prototype.setupLoopHandlers = function() {
  console.log("Richte Loop-Handler ein");
  
  // Klares altes Loop-Timeout, falls vorhanden
  if (this._globalLoopTimeout) {
    clearInterval(this._globalLoopTimeout);
    this._globalLoopTimeout = null;
  }
  
  // Basisdauer ermitteln
  let stemDuration = 0;
  if (this.buffers[0]) {
    stemDuration = this.buffers[0].duration;
    console.log(`Loop-Erkennung: Basisdauer des ersten Stems: ${stemDuration} Sekunden`);
  }
  
  // Initialisiere die Tracking-Variablen
  this._lastTime = 0;
  this._loopDetected = false;
  this._timeJumped = false;
  
  // Globales Timeout zur Erkennung von Loops
  this._globalLoopTimeout = setInterval(() => {
    if (!this.isPlaying || !this.looping) return;
    
    // Aktuelle Zeit im Loop
    const currentTime = this.getCurrentTime();
    
    // Wenn die aktuelle Zeit nahe 0 ist ODER wenn die Zeit zurückgesprungen ist (auf einen kleineren Wert)
    if ((currentTime < 0.5 && this._lastTime > stemDuration * 0.9) || 
        (this._lastTime > 5 && currentTime < this._lastTime - 5)) {
      
      // Loop erkannt - doppelte Erkennung vermeiden
      if (!this._loopDetected) {
        this._loopDetected = true;
        console.log(`Loop erkannt: ${this._lastTime.toFixed(2)} -> ${currentTime.toFixed(2)}`);
        
        // Loop-Event auslösen
        this.handleAudioLoop(0);
        
        // Status nach 1 Sekunde zurücksetzen
        setTimeout(() => {
          this._loopDetected = false;
        }, 1000);
      }
    }
    
    // Zeit für die nächste Prüfung speichern (nur wenn die Zeit nicht zurückgesprungen ist)
    if (currentTime >= this._lastTime || currentTime < 1) {
      this._lastTime = currentTime;
    }
  }, 100); // Alle 100ms prüfen
  
  // Audio-Ende für alle Source-Nodes überwachen (falls vorhanden)
  this.sources.forEach((source, index) => {
    if (source) {
      source.onended = () => {
        console.log(`Source ${index} onended event`);
        // Nur verarbeiten, wenn die Quelle nicht manuell gestoppt wurde
        if (this.isPlaying) {
          this.handleAudioLoop(index);
        }
      };
    }
  });
  
  console.log("Loop-Handler eingerichtet");
};

/**
 * Debugging-Methode zur Überprüfung des Manager-Status
 */
StemAudioManager.prototype.checkStatus = function() {
  console.log("--- StemAudioManager Status ---");
  console.log("Context State:", this.context ? this.context.state : "nicht initialisiert");
  console.log("Is Playing:", this.isPlaying);
  console.log("Looping:", this.looping);
  console.log("Stem Sources:", this.sources.map(s => s ? "aktiv" : "inaktiv"));
  console.log("Stem Volumes:", this.stemVolumes);
  console.log("Stems Loaded:", this.stemsLoaded);
  console.log("Loading Progress:", this.stemsLoadedCount + "/" + this.stemsTotalCount);
  
  // Überprüfe, ob wichtige Methoden als Funktionen verfügbar sind
  const methods = ["play", "pause", "setVolume", "activateStem", "handleAudioLoop", "setupLoopHandlers"];
  const methodStatus = {};
  
  methods.forEach(method => {
    methodStatus[method] = typeof this[method] === "function" ? "verfügbar" : "FEHLT";
  });
  
  console.log("Methoden:", methodStatus);
  
  // Versuche, Audio-Context zu aktivieren, falls suspendiert
  if (this.context && this.context.state === 'suspended') {
    console.log("Versuche, suspendierten Audio-Context zu aktivieren...");
    this.context.resume().then(() => {
      console.log("Audio-Context aktiviert:", this.context.state);
    }).catch(err => {
      console.error("Fehler beim Aktivieren des Audio-Context:", err);
    });
  }
  
  return {
    status: this.context ? this.context.state : "nicht initialisiert",
    ready: this.stemsLoadedCount >= this.stemsTotalCount && this.context && this.context.state === 'running'
  };
};

/**
 * Initialisiert die Audio-Elemente
 */
StemAudioManager.prototype.setupAudioElements = function() {
  console.log("Audio-Elemente werden eingerichtet...");
  
  // Stelle sicher, dass die DOM-Elemente existieren
  this.stems.forEach((stem, index) => {
    if (!stem) {
      console.warn(`Audio-Element für Stem ${index + 1} nicht gefunden`);
    } else {
      // Loop-Eigenschaft für alle Audio-Elemente setzen
      stem.loop = true;
      // Audio-Element leise halten (wir nutzen Web Audio API)
      stem.volume = 0;
      // Stummschalten, um Doppelwiedergabe zu vermeiden
      stem.muted = true;
      // Preload-Hinweis setzen
      stem.preload = "auto";
      
      console.log(`Audio-Element für Stem ${index + 1} konfiguriert`);
    }
  });
  
  // Lade-Status setzen
  this.audioElementsReady = true;
};

/**
 * Lädt die Stem-Konfiguration basierend auf dem aktuellen Modus
 */
StemAudioManager.prototype.loadStemConfiguration = function() {
  console.log("Lade Stem-Konfiguration für aktuellen Modus...");
  
  // Prüfen, ob APP_CONFIG verfügbar ist
  if (window.APP_CONFIG && APP_CONFIG.STEMS && APP_CONFIG.STEMS[APP_CONFIG.MODE]) {
    const stems = APP_CONFIG.STEMS[APP_CONFIG.MODE];
    console.log(`${stems.length} Stems für Modus ${APP_CONFIG.MODE} gefunden`);
    
    // Speichern der Stem-Konfiguration für späteren Zugriff
    this.stemConfig = stems;
    
    // Aktualisiere die Stem-Dateinamen, falls sie sich geändert haben
    this.stemFiles = stems.map(stem => stem.file);
    
    return true;
  } else {
    console.warn("Keine Stem-Konfiguration gefunden oder APP_CONFIG nicht verfügbar");
    return false;
  }
};

/**
 * Richtet einen Listener für die Sichtbarkeit der Seite ein
 * Pausiert die Musik, wenn die Seite unsichtbar wird
 */
StemAudioManager.prototype.setupVisibilityListener = function() {
  const self = this;
  
  // Reagiere auf Sichtbarkeitsänderungen der Seite
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      console.log("Seite ist jetzt unsichtbar, pausiere Musik");
      
      // Speichere aktuellen Wiedergabestatus
      self.wasPlayingBeforeHidden = self.isPlaying;
      
      // Nur pausieren, wenn aktuell abgespielt wird
      if (self.isPlaying) {
        self.pause();
      }
    } else {
      console.log("Seite ist wieder sichtbar");
      
      // Wenn Musik vor dem Verstecken lief, wieder starten
      if (self.wasPlayingBeforeHidden) {
        console.log("Setze Musikwiedergabe fort");
        setTimeout(function() {
          self.play();
        }, 300); // Kurze Verzögerung, um Probleme zu vermeiden
      }
    }
  });
  
  console.log("Visibility-Listener eingerichtet");
};

/**
 * Interne Methode zum Starten aller Stem-Quellen
 */
StemAudioManager.prototype.startStems = function() {
  try {
    // Erst alle Stems stoppen
    this.stopAllSources();
    
    // Aktuelle Zeit im Audio Context
    const currentTime = this.context.currentTime;
    this.startTime = currentTime;
    
    // Erstelle Buffer-Quellen für alle Stems und starte sie
    for (var i = 0; i < this.numStems; i++) {
      if (!this.buffers[i]) {
        console.warn("Buffer für Stem " + (i + 1) + " nicht verfügbar");
        continue;
      }
      
      // Neue Audio-Quelle erstellen
      const source = this.context.createBufferSource();
      source.buffer = this.buffers[i];
      source.loop = this.looping; // Loop-Eigenschaft setzen
      
      // Mit GainNode verbinden (falls bereits erstellt)
      if (!this.gainNodes[i]) {
        this.gainNodes[i] = this.context.createGain();
        this.gainNodes[i].connect(this.context.destination);
      }
      
      // Lautstärke setzen
      this.gainNodes[i].gain.value = this.stemVolumes[i];
      
      // Verbindung herstellen und starten
      source.connect(this.gainNodes[i]);
      source.start(0);
      
      // Quelle speichern
      this.sources[i] = source;
      
      console.log("Stem " + (i + 1) + " gestartet mit Lautstärke " + this.stemVolumes[i]);
    }
    
    this.isPlaying = true;
    
    // Loop-Handler nach dem Starten erneuern
    this.setupLoopHandlers();
    
    // Starte Untertitel sofort mit Zeitpunkt 0
    setTimeout(() => {
      if (window.subtitlesManager && typeof window.subtitlesManager.updateSubtitle === 'function') {
        // Untertitel zurücksetzen und neu initialisieren
        if (typeof window.subtitlesManager.resetSubtitles === 'function') {
          window.subtitlesManager.resetSubtitles({ 
            detail: { stemId: 0, time: 0 } 
          });
        }
        
        // Explizit Untertitel für Zeit 0 aktualisieren
        window.subtitlesManager.updateSubtitle(0);
        
        // Nochmal nach einer kurzen Verzögerung für bessere Zuverlässigkeit
        setTimeout(() => {
          window.subtitlesManager.updateSubtitle(0);
        }, 200);
      }
    }, 50);
    
    console.log("Alle Stems erfolgreich gestartet. Piano-Stem aktiv mit Lautstärke:", this.gainNodes[0]?.gain.value);
  } catch (e) {
    console.error("Kritischer Fehler beim Starten der Stems:", e);
  }
};
