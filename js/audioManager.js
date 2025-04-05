// AudioManager-Klasse für die Verwaltung von Soundeffekten (LOKALE WAV-DATEIEN)
// In ES5-Syntax für Browser-Kompatibilität
function AudioManager() {
  this.bgMusic = document.createElement("audio");
  this.bgMusic.loop = true;
  this.bgMusic.volume = 0.4;
  this.bgMusic.preload = "auto"; // Stelle sicher, dass die Audiodatei vorgeladen wird

  this.soundEffects = {
    wordFound: document.createElement("audio"),
    levelComplete: document.createElement("audio"),
    gameComplete: document.createElement("audio"),
    click: document.createElement("audio"),
    hint: document.createElement("audio"),
    flash: document.createElement("audio")
  };

  // **LOKALE PFADE ZU WAV-DATEIEN IM ORDNER assets/audio/effects/**
  this.soundEffects.wordFound.src = "assets/audio/effects/wordFound.wav";
  this.soundEffects.levelComplete.src = "assets/audio/effects/levelComplete.wav";
  this.soundEffects.gameComplete.src = "assets/audio/effects/gameComplete.wav";
  this.soundEffects.click.src = "assets/audio/effects/click.wav";
  this.soundEffects.hint.src = "assets/audio/effects/hint.wav";
  this.soundEffects.flash.src = "assets/audio/effects/flash.wav";

  // Preload der Soundeffekte
  var self = this;
  Object.keys(this.soundEffects).forEach(function(key) {
    self.soundEffects[key].volume = 0.3;
    self.soundEffects[key].preload = "auto";
  });

  this.musicEnabled = true;
  this.soundEnabled = true;
  this.musicLoaded = false;
  this.musicLoading = false;
  
  // Subtitles Integration (bleibt für Stems relevant?) - Vorerst drin lassen
  // this.setupSubtitlesIntegration(); // Auskommentiert, da bgMusic nicht mehr verwendet wird
  
  // Musik-Ladefortschritt überwachen (nicht mehr für bgMusic nötig)
  // this.setupMusicLoadMonitoring(); // Auskommentiert

  // Rufen wir die Lademethode für die Musik auf, um sie sofort zu laden
  // this.loadMusic(); // Nicht mehr aufrufen, da keine bgMusic geladen wird
}

// Integration der Untertitel-Funktionalität
AudioManager.prototype.setupSubtitlesIntegration = function() {
  var self = this;
  
  // Zeitaktualisierung für Untertitel
  this.subtitleUpdateInterval = null;
  this.musicLoaded = false;
  
  // Prüfe, ob die Musik geladen ist
  this.bgMusic.addEventListener('canplaythrough', function() {
    console.log('Background music loaded and can play through');
    self.musicLoaded = true;
  });
  
  // Überwache den Audio-Zeitpunkt für Untertitel
  this.bgMusic.addEventListener('play', function() {
    console.log('Music playback started, setting up subtitle updates');
    // Starte das Intervall, wenn die Musik abgespielt wird
    if (self.subtitleUpdateInterval) {
      clearInterval(self.subtitleUpdateInterval);
    }
    
    self.subtitleUpdateInterval = setInterval(function() {
      if (window.subtitlesManager && self.musicLoaded) {
        window.subtitlesManager.updateSubtitle(self.bgMusic.currentTime);
      } else if (!window.subtitlesManager) {
        console.warn('Subtitles manager not available');
      }
    }, 100); // 10 Aktualisierungen pro Sekunde
  });
  
  // Stoppe die Überwachung, wenn die Musik pausiert oder endet
  this.bgMusic.addEventListener('pause', function() {
    console.log('Music playback paused, clearing subtitle updates');
    if (self.subtitleUpdateInterval) {
      clearInterval(self.subtitleUpdateInterval);
      self.subtitleUpdateInterval = null;
    }
  });
  
  this.bgMusic.addEventListener('ended', function() {
    console.log('Music playback ended, clearing subtitle updates');
    if (self.subtitleUpdateInterval) {
      clearInterval(self.subtitleUpdateInterval);
      self.subtitleUpdateInterval = null;
    }
  });
  
  // Zusätzlich: Bei manueller Zeitänderung die Untertitel sofort aktualisieren
  this.bgMusic.addEventListener('seeked', function() {
    console.log('Music seeked to:', self.bgMusic.currentTime);
    if (window.subtitlesManager && self.musicLoaded) {
      window.subtitlesManager.updateSubtitle(self.bgMusic.currentTime);
    }
  });
  
  // Fehlerbehandlung für Musik
  this.bgMusic.addEventListener('error', function(e) {
    console.error('Audio error:', e);
    self.musicLoaded = false;
  });
};

// Überwacht den Ladefortschritt der Hintergrundmusik
AudioManager.prototype.setupMusicLoadMonitoring = function() {
  var self = this;
  
  // Beim Laden des Musikfortschritts
  this.bgMusic.addEventListener('progress', function(e) {
    if (self.bgMusic.buffered.length > 0) {
      var percentLoaded = (self.bgMusic.buffered.end(0) / self.bgMusic.duration) * 100;
      console.log('Music loading progress:', percentLoaded.toFixed(2) + '%');
      
      // Event auslösen für UI-Updates
      var event = new CustomEvent('music-loading-progress', { 
        detail: { progress: percentLoaded } 
      });
      document.dispatchEvent(event);
    }
  });
  
  // Wenn Musik vollständig geladen ist
  this.bgMusic.addEventListener('canplaythrough', function() {
    console.log('Background music loaded completely and can play through');
    self.musicLoaded = true;
    self.musicLoading = false;
    
    // Event auslösen, dass die Musik geladen ist
    var event = new CustomEvent('music-loaded');
    document.dispatchEvent(event);
  });
  
  // Wenn Musik zu laden beginnt
  this.bgMusic.addEventListener('loadstart', function() {
    console.log('Background music started loading');
    self.musicLoading = true;
    
    // Event auslösen, dass das Laden begonnen hat
    var event = new CustomEvent('music-loading-started');
    document.dispatchEvent(event);
  });
  
  // Bei Fehler während des Ladens
  this.bgMusic.addEventListener('error', function(e) {
    console.error('Audio loading error:', e);
    self.musicLoaded = false;
    self.musicLoading = false;
    
    // Event auslösen bei Fehler
    var event = new CustomEvent('music-loading-error', { 
      detail: { error: e } 
    });
    document.dispatchEvent(event);
  });
};

// Neue Methode, um explizit zu prüfen, ob die Musik bereit ist
AudioManager.prototype.isMusicReady = function() {
  return this.musicLoaded || this.bgMusic.readyState >= 3;
};

// Neue Methode, um die Musik manuell zu laden
AudioManager.prototype.loadMusic = function(musicUrl) {
  var self = this;
  
  // Setze Ladezustand zurück
  this.musicLoaded = false;
  this.musicLoading = true; // Flag wird gesetzt, aber kein Laden ausgelöst
  
  // Setze neue Quelle mit Standardwert falls nicht angegeben
  // this.bgMusic.src = musicUrl || "assets/audio/background.mp3"; // Entfernt - keine bgMusic Quelle setzen
  
  // Starte Laden
  // this.bgMusic.load(); // Entfernt - kein Laden auslösen
  
  // Gib ein Promise zurück, das erfüllt wird, wenn die Musik geladen ist
  return new Promise(function(resolve, reject) {
    self.bgMusic.addEventListener('canplaythrough', function onCanPlay() {
      self.musicLoaded = true;
      self.musicLoading = false;
      self.bgMusic.removeEventListener('canplaythrough', onCanPlay);
      resolve();
    });
    
    self.bgMusic.addEventListener('error', function onError(e) {
      self.musicLoaded = false;
      self.musicLoading = false;
      self.bgMusic.removeEventListener('error', onError);
      console.error("Error loading music:", e);
      reject(e);
    });
  });
};

// Methode zum Abspielen von Soundeffekten
AudioManager.prototype.playSound = function(name) {
  if (this.soundEnabled && this.soundEffects[name]) {
    try {
      // Sound von Anfang abspielen, auch wenn er bereits läuft
      this.soundEffects[name].currentTime = 0;

      // Promise-basierte Wiedergabe mit Fehlerbehandlung
      var playPromise = this.soundEffects[name].play();
      var self = this;

      if (playPromise !== undefined) {
        playPromise
          .then(function() {
            // Wiedergabe erfolgreich gestartet
            console.log("Sound " + name + " wird abgespielt: " + name); // Debug-Ausgabe hinzugefügt
          })
          .catch(function(err) {
            // Auto-play wurde möglicherweise verhindert
            console.log("Sound " + name + " konnte nicht abgespielt werden (Auto-Play verhindert?):", err);

            // Versuche es erneut nach einer Benutzerinteraktion
            document.addEventListener('click', function() {
              self.soundEffects[name].play().catch(function(e) {
                console.log('Wiedergabeversuch fehlgeschlagen (nach User-Interaktion):', e);
              });
            }, { once: true });
          });
      }
    } catch (err) {
      console.log("Fehler beim Abspielen von Sound " + name + ":", err);
    }
  }
};

// Methode zum Umschalten der Musik
AudioManager.prototype.toggleMusic = function() {
  this.musicEnabled = !this.musicEnabled;

  if (this.musicEnabled) {
    var self = this;
    // Prüfe, ob die Musik geladen ist
    if (this.musicLoaded || this.bgMusic.readyState >= 3) {
      this.bgMusic.play().catch(function(err) {
        console.log("Musik konnte nicht gestartet werden:", err);
      });
    } else {
      console.log("Musik wird geladen, bitte warten...");
      // Warte auf das canplaythrough-Event
      this.bgMusic.addEventListener('canplaythrough', function onCanPlay() {
        if (self.musicEnabled) {
          self.bgMusic.play().catch(function(err) {
            console.log("Musik konnte nicht gestartet werden:", err);
          });
        }
        self.bgMusic.removeEventListener('canplaythrough', onCanPlay);
      });
    }
  } else {
    this.bgMusic.pause();
    // Untertitel ausblenden, wenn Musik aus ist
    if (window.subtitlesManager) {
      var textElement = document.getElementById('subtitlesText');
      if (textElement) textElement.textContent = '';
    }
  }

  return this.musicEnabled;
};

// Methode zum Umschalten der Soundeffekte
AudioManager.prototype.toggleSound = function() {
  this.soundEnabled = !this.soundEnabled;
  return this.soundEnabled;
};
