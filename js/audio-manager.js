// AudioManager-Klasse für die Verwaltung von Musik und Soundeffekten
class AudioManager {
  constructor() {
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
    Object.values(this.soundEffects).forEach(audio => {
      audio.volume = 0.3;
      audio.preload = "auto";
    });

    this.musicEnabled = true;
    this.soundEnabled = true;
  }

  setMusicForLevel(levelIndex) {
    let levelNum = (levelIndex + 1).toString().padStart(2, '0');
    // Relativer Pfad für die Musikdateien im assets/audio Verzeichnis
    this.bgMusic.src = `assets/audio/Mandarinen_Game_${levelNum}.mp3`;
    if (this.musicEnabled) {
      this.bgMusic.play().catch(err => console.log("Musik konnte nicht gestartet werden:", err));
    }
  }

  playSound(name) {
    if (this.soundEnabled && this.soundEffects[name]) {
      try {
        // Sound von Anfang abspielen, auch wenn er bereits läuft
        this.soundEffects[name].currentTime = 0;

        // Promise-basierte Wiedergabe mit Fehlerbehandlung
        const playPromise = this.soundEffects[name].play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Wiedergabe erfolgreich gestartet
              console.log(`Sound ${name} wird abgespielt`);
            })
            .catch(err => {
              // Auto-play wurde möglicherweise verhindert
              console.log(`Sound ${name} konnte nicht abgespielt werden:`, err);

              // Versuche es erneut nach einer Benutzerinteraktion
              document.addEventListener('click', () => {
                this.soundEffects[name].play().catch(e => console.log('Wiedergabeversuch fehlgeschlagen:', e));
              }, { once: true });
            });
        }
      } catch (err) {
        console.log(`Fehler beim Abspielen von Sound ${name}:`, err);
      }
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;

    if (this.musicEnabled) {
      this.bgMusic.play().catch(err => console.log("Musik konnte nicht gestartet werden:", err));
    } else {
      this.bgMusic.pause();
    }

    return this.musicEnabled;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }
}
