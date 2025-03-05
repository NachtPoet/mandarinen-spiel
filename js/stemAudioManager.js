/**
 * Vereinfachter StemAudioManager - Verwendet direkte Audio-Elemente statt Web Audio API
 * Dies umgeht CORS-Probleme, die mit der Web Audio API auftreten können
 */
class StemAudioManager {
  constructor() {
    // Anzahl der Stems
    this.numStems = 6;
    
    // Array für Audio-Elemente
    this.stems = [];
    
    // Aktuell aktive Stems (zuerst nur Klavier)
    this.activeStems = 1;
    
    // Flag für den Musikstatus
    this.isPlaying = false;
    
    // Hauptlautstärke
    this.volume = 0.7;
    
    // Stem-Dateien - korrekter Pfad und Dateinamen
    this.stemFiles = [
      'assets/audio/stems/01_piano.mp3',  // Klavier (immer aktiv)
      'assets/audio/stems/02_bass.mp3',   // Bass
      'assets/audio/stems/03_drums.mp3',  // Schlagzeug
      'assets/audio/stems/04_guitars.mp3', // Gitarren
      'assets/audio/stems/05_others.mp3',  // Andere Instrumente
      'assets/audio/stems/06_vocals.mp3'   // Gesang
    ];
    
    // Initialisieren
    this.init();
  }
  
  /**
   * Initialisiert alle Audio-Elemente
   */
  init() {
    // Stems vorbereiten
    for (let i = 0; i < this.numStems; i++) {
      // Audio-Element erstellen
      const audio = new Audio();
      audio.src = this.stemFiles[i];
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = (i === 0) ? this.volume : 0; // Nur Klavier hörbar
      
      // In Array speichern
      this.stems.push(audio);
      
      // Fehlerbehandlung
      audio.addEventListener('error', (e) => {
        console.warn(`Stem ${i+1} konnte nicht geladen werden:`, e);
      });
    }
    
    // Synchronisierung: Wenn das erste Audio-Element (Klavier) abspielt, 
    // sollen alle anderen auch abspielen
    if (this.stems[0]) {
      this.stems[0].addEventListener('play', () => {
        this.syncAllStems();
      });
    }
  }
  
  /**
   * Synchronisiert alle Stems
   */
  syncAllStems() {
    const primaryStem = this.stems[0];
    const currentTime = primaryStem.currentTime;
    
    // Alle anderen Stems synchronisieren
    for (let i = 1; i < this.stems.length; i++) {
      if (this.stems[i].paused && !primaryStem.paused) {
        this.stems[i].play().catch(e => console.log(`Stem ${i} konnte nicht automatisch gestartet werden:`, e));
      }
      
      // Versuchen, die Zeit zu synchronisieren (mit Toleranz)
      const timeDiff = Math.abs(this.stems[i].currentTime - currentTime);
      if (timeDiff > 0.3) { // Wenn mehr als 300ms Unterschied
        try {
          this.stems[i].currentTime = currentTime;
        } catch (e) {
          console.warn(`Konnte Zeit für Stem ${i} nicht setzen:`, e);
        }
      }
    }
  }
  
  /**
   * Startet die Wiedergabe aller Stems
   */
  play() {
    // Prüfen, ob bereits abgespielt wird
    if (this.isPlaying) return;
    
    // Alle Stems abspielen, beginnend mit dem Hauptstem
    const playPromise = this.stems[0].play();
    
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.log(`Stem 0 konnte nicht gestartet werden:`, e);
        
        // Bei Autoplay-Beschränkungen: Play-Button erstellen
        if (!document.getElementById('manual-play-button')) {
          const playButton = document.createElement('button');
          playButton.id = 'manual-play-button';
          playButton.textContent = 'Musik starten';
          playButton.className = 'btn primary';
          playButton.style.position = 'fixed';
          playButton.style.top = '20px';
          playButton.style.left = '50%';
          playButton.style.transform = 'translateX(-50%)';
          playButton.style.zIndex = '1000';
          
          playButton.addEventListener('click', () => {
            this.stems[0].play().then(() => {
              // Nach Benutzerinteraktion alle Stems starten
              this.syncAllStems();
              playButton.remove();
            }).catch(err => console.error("Fehler beim Starten der Musik:", err));
          });
          
          document.body.appendChild(playButton);
        }
      });
    }
    
    this.isPlaying = true;
  }
  
  /**
   * Pausiert die Wiedergabe aller Stems
   */
  pause() {
    for (const stem of this.stems) {
      stem.pause();
    }
    this.isPlaying = false;
  }
  
  /**
   * Aktiviert einen bestimmten Stem
   * @param {number} stemIndex - Index des zu aktivierenden Stems (0-5)
   * @returns {boolean} True wenn der Stem aktiviert wurde, sonst False
   */
  activateStem(stemIndex) {
    if (stemIndex < 0 || stemIndex >= this.numStems) {
      return false; // Ungültiger Index
    }
    
    // Prüfen, ob der Stem bereits aktiv ist
    if (this.stems[stemIndex].volume > 0) {
      return false; // Stem ist bereits aktiv
    }
    
    // Stem-Lautstärke sanft erhöhen
    const stem = this.stems[stemIndex];
    
    // Fade-In Funktion mit requestAnimationFrame für bessere Performance
    let startTime = null;
    const duration = 1500; // 1.5 Sekunden
    
    const fadeIn = (timestamp) => {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Lautstärke sanft erhöhen
      stem.volume = progress * this.volume;
      
      // Weitermachen, bis fertig
      if (progress < 1) {
        requestAnimationFrame(fadeIn);
      }
    };
    
    requestAnimationFrame(fadeIn);
    
    // Aktive Stems-Zahl aktualisieren
    this.activeStems = Math.max(this.activeStems, stemIndex + 1);
    
    return true;
  }
  
  /**
   * Aktiviert den nächsten Stem
   * @returns {boolean} True wenn ein neuer Stem aktiviert wurde, sonst False
   */
  activateNextStem() {
    if (this.activeStems >= this.numStems) {
      return false; // Alle Stems bereits aktiv
    }
    
    return this.activateStem(this.activeStems);
  }
  
  /**
   * Setzt alle Stems außer dem ersten (Klavier) zurück
   */
  resetToBaseStem() {
    // Alle Stems außer Klavier auf 0 setzen
    for (let i = 1; i < this.numStems; i++) {
      // Fade-Out Funktion
      let startVolume = this.stems[i].volume;
      let startTime = null;
      const duration = 1000; // 1 Sekunde
      
      const fadeOut = (timestamp) => {
        if (!startTime) startTime = timestamp;
        
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Lautstärke sanft verringern
        this.stems[i].volume = startVolume * (1 - progress);
        
        // Weitermachen, bis fertig
        if (progress < 1) {
          requestAnimationFrame(fadeOut);
        }
      };
      
      requestAnimationFrame(fadeOut);
    }
    
    // Aktive Stems auf 1 zurücksetzen (nur Klavier)
    this.activeStems = 1;
    
    return true;
  }
  
  /**
   * Setzt die Gesamtlautstärke
   * @param {number} volume - Lautstärke zwischen 0 und 1
   */
  setVolume(volume) {
    if (volume >= 0 && volume <= 1) {
      this.volume = volume;
      
      // Lautstärke für aktive Stems anpassen
      for (let i = 0; i < this.activeStems; i++) {
        this.stems[i].volume = volume;
      }
    }
  }
  
  /**
   * Gibt Ressourcen frei
   */
  dispose() {
    for (const stem of this.stems) {
      stem.pause();
      stem.src = '';
    }
    
    this.stems = [];
  }
}