// AudioManager-Klasse für die Verwaltung von Soundeffekten (LOKALE WAV-DATEIEN)
// In ES5-Syntax für Browser-Kompatibilität
function AudioManager() {
  this.bgMusic = document.createElement("audio");
  this.bgMusic.loop = true;
  this.bgMusic.volume = 0.4;

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
}

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
    this.bgMusic.play().catch(function(err) {
      console.log("Musik konnte nicht gestartet werden:", err);
    });
  } else {
    this.bgMusic.pause();
  }

  return this.musicEnabled;
};

// Methode zum Umschalten der Soundeffekte
AudioManager.prototype.toggleSound = function() {
  this.soundEnabled = !this.soundEnabled;
  return this.soundEnabled;
};