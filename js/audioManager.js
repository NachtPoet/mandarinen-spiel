// AudioManager-Klasse für die Verwaltung von Musik und Soundeffekten
// In ES5-Syntax für bessere Browser-Kompatibilität
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

  // Tatsächlich funktionierende URLs für Soundeffekte
  this.soundEffects.wordFound.src = "https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3";
  this.soundEffects.levelComplete.src = "https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3";
  this.soundEffects.gameComplete.src = "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3";
  this.soundEffects.click.src = "https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3";
  this.soundEffects.hint.src = "https://assets.mixkit.co/sfx/preview/mixkit-magic-sweep-game-trophy-257.mp3";
  this.soundEffects.flash.src = "https://assets.mixkit.co/sfx/preview/mixkit-fast-small-sweep-transition-166.mp3";

  // Preload der Soundeffekte
  var self = this;
  Object.keys(this.soundEffects).forEach(function(key) {
    self.soundEffects[key].volume = 0.3;
    self.soundEffects[key].preload = "auto";
  });

  this.musicEnabled = true;
  this.soundEnabled = true;
}

// Methode zum Setzen der Musik für ein Level
AudioManager.prototype.setMusicForLevel = function(levelIndex) {
  var levelNum = (levelIndex + 1).toString();
  if (levelNum.length < 2) levelNum = "0" + levelNum;
  
  // Verschiedene URL-Varianten versuchen
  var possiblePaths = [
    "assets/audio/Mandarinen_Game_" + levelNum + ".mp3",
    "./assets/audio/Mandarinen_Game_" + levelNum + ".mp3",
    "/assets/audio/Mandarinen_Game_" + levelNum + ".mp3"
  ];
  
  // Debug-Info
  console.log("Versuche diese Pfade:", possiblePaths);
  
  this.bgMusic.src = possiblePaths[0];
  
  if (this.musicEnabled) {
    var self = this;
    var playPromise = this.bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(function(err) {
        console.error("Musik konnte nicht gestartet werden:", err);
      });
    }
  }
};

// Methode zum Abspielen von Soundeffekten
AudioManager.prototype.playSound = function(name) {
  if (this.soundEnabled && this.soundEffects[name]) {
    try {
      // Sound von Anfang abspielen, auch wenn er bereits läuft
      this.soundEffects[name].currentTime = 0;

      // Promise-basierte Wiedergabe mit Fehlerbehandlung
      var playPromise = this.soundEffects[name].play();

      if (playPromise !== undefined) {
        playPromise
          .then(function() {
            // Wiedergabe erfolgreich gestartet
            console.log("Sound " + name + " wird abgespielt");
          })
          .catch(function(err) {
            // Auto-play wurde möglicherweise verhindert
            console.log("Sound " + name + " konnte nicht abgespielt werden:", err);

            // Versuche es erneut nach einer Benutzerinteraktion
            document.addEventListener('click', function() {
              this.soundEffects[name].play().catch(function(e) {
                console.log('Wiedergabeversuch fehlgeschlagen:', e);
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
