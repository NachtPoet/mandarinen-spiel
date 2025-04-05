// Subtitles module for displaying synchronized lyrics

class SubtitlesManager {
  constructor() {
    this.subtitlesData = {};
    this.currentLanguage = 'de';
    this.enabled = true;
    this.currentSubtitleIndex = -1;
    this.debugMode = true; // Debug-Modus aktivieren
    this.retryCount = 0;
    
    // Verzögere Initialisierung, um sicherzustellen dass DOM vollständig geladen ist
    setTimeout(() => {
      this.initializeElements();
    }, 500);
  }
  
  logDebugInfo() {
    console.log('Subtitles UI elements:');
    console.log('- Container:', this.container, this.container ? this.container.style.display : 'N/A');
    console.log('- Text element:', this.textElement);
    console.log('- Toggle button:', this.toggleButton, this.toggleButton ? window.getComputedStyle(this.toggleButton).visibility : 'N/A');
    console.log('- Current language:', this.currentLanguage);
    console.log('- Enabled:', this.enabled);
    console.log('- Available languages:', Object.keys(this.subtitlesData));
    
    // Setze anfänglich den Text, um zu überprüfen, ob die Untertitel sichtbar sind
    if (this.textElement) {
      this.textElement.textContent = "Subtitles loading...";
    }
    
    // Überprüfe, ob der Container wirklich sichtbar ist
    if (this.container) {
      const computedStyle = window.getComputedStyle(this.container);
      console.log('Container computed styles:', {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex,
        position: computedStyle.position
      });
    }
  }
  
  initializeElements() {
    // Versuche, die Elemente nach dem DOM-Laden zu finden
    this.container = document.getElementById('subtitlesContainer');
    this.textElement = document.getElementById('subtitlesText');
    this.toggleButton = document.getElementById('subtitlesToggle');
    
    if (!this.container || !this.textElement || !this.toggleButton) {
      console.error('Subtitles DOM elements not found after initialization attempt.');
      
      // Versuche es erneut später
      if (this.retryCount < 3) {
        this.retryCount = (this.retryCount || 0) + 1;
        console.log(`Retry attempt ${this.retryCount}/3 to find subtitle elements`);
        setTimeout(() => this.initializeElements(), 1000);
      }
      return false;
    }
    
    console.log('Successfully initialized subtitle elements');
    
    this.setupEventListeners();
    this.loadPreference();
    this.setLanguage(this.currentLanguage);
    
    // Stelle sicher, dass der Container sichtbar ist - WICHTIG: inline Styles, damit diese garantiert angewendet werden
    this.container.style.display = 'flex';
    this.container.style.visibility = 'visible';
    this.container.style.opacity = '1';
    this.container.style.zIndex = '100';
    
    // Force die Darstellung, indem wir kurz einen Test-Text anzeigen
    if (this.textElement && this.enabled) {
      this.textElement.textContent = "Untertitel werden geladen...";
      setTimeout(() => {
        if (this.textElement.textContent === "Untertitel werden geladen...") {
          this.textElement.textContent = "";
        }
      }, 3000);
    }
    
    this.logDebugInfo();
    
    // Füge Event-Listener für Audio-Loop hinzu
    if (window.stemAudioManager) {
      document.addEventListener('audio-looped', this.resetSubtitles.bind(this));
    }
    
    return true;
  }
  
  setupEventListeners() {
    if (!this.toggleButton) return;
    
    // Toggle subtitles on/off
    this.toggleButton.addEventListener('click', () => {
      this.enabled = !this.enabled;
      localStorage.setItem('subtitlesEnabled', this.enabled.toString());
      this.updateToggleButton();
      
      if (!this.enabled) {
        this.textElement.textContent = ''; // Leere den Text
        this.container.classList.add('hidden'); // Nur als 'hidden' markieren, aber sichtbar lassen
      } else {
        this.container.classList.remove('hidden');
        // Aktualisiere sofort mit aktuellem Zeitpunkt
        if (window.stemAudioManager && typeof window.stemAudioManager.getCurrentTime === 'function') {
          const currentTime = window.stemAudioManager.getCurrentTime();
          this.updateSubtitle(currentTime);
        }
      }
      
      console.log('Subtitles toggled:', this.enabled ? 'ON' : 'OFF');
    });
    
    // Listen for language changes
    document.addEventListener('translations-loaded', (event) => {
      if (event.detail && event.detail.lang) {
        console.log('Subtitles language change detected:', event.detail.lang);
        this.setLanguage(event.detail.lang);
      }
    });
  }
  
  loadPreference() {
    if (!this.container || !this.toggleButton) return;
    
    const savedPreference = localStorage.getItem('subtitlesEnabled');
    if (savedPreference !== null) {
      this.enabled = savedPreference === 'true';
    }
    this.updateToggleButton();
    
    if (!this.enabled) {
      // Container als 'hidden' markieren, aber sichtbar halten
      this.container.classList.add('hidden');
      this.textElement.textContent = ''; // Leere den Text
    } else {
      this.container.classList.remove('hidden');
      // Stelle sicher, dass der Container sichtbar ist
      this.container.style.display = 'flex';
      this.container.style.visibility = 'visible';
      this.container.style.opacity = '1';
    }
    
    console.log('Subtitles preference loaded:', this.enabled ? 'ON' : 'OFF');
  }
  
  updateToggleButton() {
    if (!this.toggleButton) return;
    
    if (this.enabled) {
      this.toggleButton.classList.remove('disabled');
      this.toggleButton.setAttribute('aria-label', 'Untertitel ausschalten');
    } else {
      this.toggleButton.classList.add('disabled');
      this.toggleButton.setAttribute('aria-label', 'Untertitel einschalten');
    }
  }
  
  async setLanguage(langCode) {
    if (!langCode) return;
    
    console.log('Setting subtitles language to:', langCode);
    
    if (this.currentLanguage === langCode && this.subtitlesData[langCode]) {
      console.log('Subtitles already loaded for language:', langCode);
      this.showSubtitlesUI(true); // Zeige UI, da Untertitel verfügbar sind
      return; // Already loaded and set to this language
    }
    
    this.currentLanguage = langCode;
    let subtitlesFound = false;
    
    // Load subtitles for this language if not already loaded
    if (!this.subtitlesData[langCode]) {
      try {
        console.log('Fetching subtitles for language:', langCode);
        const response = await fetch(`subtitles/${langCode}.json?v=${Date.now()}`);
        
        if (!response.ok) {
          // If language not available, fallback to English or German
          console.warn(`Subtitles for ${langCode} not found, falling back to default.`);
          
          // Try English as first fallback
          if (langCode !== 'en') {
            try {
              const enResponse = await fetch(`subtitles/en.json?v=${Date.now()}`);
              if (enResponse.ok) {
                this.subtitlesData['en'] = await enResponse.json();
                this.currentLanguage = 'en';
                console.log('Fallback to English subtitles successful');
                subtitlesFound = true;
              }
            } catch (error) {
              console.error('Failed to load English subtitles as fallback:', error);
            }
          }
          
          // German as ultimate fallback
          if (langCode !== 'de' && !subtitlesFound) {
            try {
              const deResponse = await fetch(`subtitles/de.json?v=${Date.now()}`);
              if (deResponse.ok) {
                this.subtitlesData['de'] = await deResponse.json();
                this.currentLanguage = 'de';
                console.log('Fallback to German subtitles successful');
                subtitlesFound = true;
              }
            } catch (error) {
              console.error('Failed to load German subtitles as fallback:', error);
            }
          }
          
          // Keine Untertitel gefunden - UI verstecken
          this.showSubtitlesUI(subtitlesFound);
          return;
        }
        
        this.subtitlesData[langCode] = await response.json();
        console.log(`Subtitles loaded for ${langCode}:`, this.subtitlesData[langCode].subtitles.length, 'entries');
        subtitlesFound = true;
      } catch (error) {
        console.error(`Failed to load subtitles for ${langCode}:`, error);
        this.showSubtitlesUI(false);
      }
    } else {
      subtitlesFound = true;
    }
    
    // UI je nach Verfügbarkeit der Untertitel anzeigen/verstecken
    this.showSubtitlesUI(subtitlesFound);
  }
  
  // Hilfsmethode zum Anzeigen/Verstecken der Untertitel-UI
  showSubtitlesUI(show) {
    if (!this.container || !this.toggleButton) {
      console.error('Cannot show/hide subtitles UI: Elements not found');
      return;
    }
    
    console.log('Showing subtitles UI:', show);
    
    if (show) {
      // Untertitel sind verfügbar, zeige den Button
      this.toggleButton.style.display = 'block';
      this.toggleButton.style.visibility = 'visible';
      
      // Stelle sicher, dass der Container sichtbar ist, wenn aktiviert
      if (this.enabled) {
        this.container.classList.remove('hidden');
        // Direkte Inline-Styles haben Vorrang, nutze diese für maximale Kompatibilität
        this.container.style.display = 'flex';
        this.container.style.visibility = 'visible';
        this.container.style.opacity = '1';
        this.container.style.zIndex = '100';
        
        // Debug-Anzeige, um zu prüfen, ob die Untertitel sichtbar sind
        if (this.debugMode && this.textElement) {
          this.textElement.textContent = "Untertitel bereit... (Diese Meldung verschwindet automatisch)";
          setTimeout(() => {
            if (this.textElement.textContent === "Untertitel bereit... (Diese Meldung verschwindet automatisch)") {
              this.textElement.textContent = "";
            }
          }, 5000);
        }
      }
    } else {
      // Keine Untertitel verfügbar, aber behalte Container für UI-Konsistenz
      // Wir verstecken nur den Toggle-Button, wenn keine Untertitel verfügbar sind
      this.toggleButton.style.display = 'none';
      
      // Zeige eine Info im Container an, anstatt ihn vollständig zu verstecken
      if (this.textElement) {
        this.textElement.textContent = '';
      }
    }
  }
  
  updateSubtitle(currentTime) {
    if (!this.enabled) {
      return; // Untertitel sind deaktiviert
    }
    
    if (!this.container || !this.textElement) {
      if (this.debugMode) console.error('Subtitle UI elements not found in updateSubtitle');
      return;
    }
    
    if (!this.subtitlesData[this.currentLanguage]) {
      if (this.debugMode) console.warn(`No subtitles data available for language: ${this.currentLanguage}`);
      return;
    }
    
    const subtitles = this.subtitlesData[this.currentLanguage].subtitles;
    if (!subtitles || !subtitles.length) {
      if (this.debugMode) console.warn(`Subtitles array is empty or invalid for language: ${this.currentLanguage}`);
      return;
    }
    
    // Stellen wir sicher, dass der Container sichtbar ist
    this.container.style.display = 'flex';
    this.container.style.visibility = 'visible';
    this.container.style.opacity = '1';
    this.container.classList.remove('hidden');
    
    // Für Debug-Zwecke
    const debugTime = currentTime.toFixed(2);
    if (this.debugMode && currentTime < 2) {
      console.log(`updateSubtitle: Aktuelle Zeit = ${debugTime}s`);
    }
    
    // Find the subtitle that matches the current time
    const matchingSubtitle = subtitles.find(
      sub => currentTime >= sub.start && currentTime <= sub.end
    );
    
    if (matchingSubtitle) {
      // Only update if the text changed
      if (this.textElement.textContent !== matchingSubtitle.text) {
        if (this.debugMode) console.log(`Showing subtitle at ${debugTime}s:`, matchingSubtitle.text);
        this.textElement.textContent = matchingSubtitle.text;
        this.container.classList.remove('hidden');
        
        // Stellen wir sicher, dass der Container sichtbar ist und im Vordergrund steht
        this.container.style.display = 'flex';
        this.container.style.visibility = 'visible';
        this.container.style.opacity = '1';
        
        // Füge einen optischen Effekt hinzu, damit die Untertitel besser wahrgenommen werden
        this.textElement.style.animation = 'none';
        setTimeout(() => {
          this.textElement.style.animation = 'fadeIn 0.3s ease-in-out';
        }, 10);
      }
    } else if (this.textElement.textContent) {
      // Clear if no matching subtitle and there was text before
      if (this.debugMode) console.log(`No subtitle for time ${debugTime}s, clearing text`);
      this.textElement.textContent = '';
    } else if (currentTime < 0.5) {
      // Besonderer Fall: Wenn wir nah an 0 sind, versuche den ersten Untertitel zu finden
      const firstSubtitle = subtitles.find(sub => sub.start <= 23); // Erste Untertitel-Zeit prüfen
      if (firstSubtitle && this.debugMode) {
        console.log(`Nahe Anfang (${debugTime}s), erster Untertitel beginnt bei ${firstSubtitle.start}s`);
        
        // Wenn wir sehr nahe am Anfang sind und beim Loop, zeige den ersten Untertitel direkt an
        if (currentTime < 0.1 && firstSubtitle.start < 23) {
          console.log(`Zeit sehr nahe am Anfang, setze Untertitel direkt: ${firstSubtitle.text}`);
          this.textElement.textContent = firstSubtitle.text;
        }
      }
    } else if (this.debugMode && currentTime > 2 && currentTime % 10 < 0.5) {
      // Nur alle 10 Sekunden loggen um die Konsole nicht zu fluten
      console.log(`No subtitle matches current time: ${debugTime}s`);
    }
  }

  // Diese Methode wird aufgerufen, wenn die Musik einen Loop durchführt
  resetSubtitles(event) {
    console.log('Audio geloopt - setze Untertitel zurück', event);
    if (!this.enabled) return;
    
    // Setze den aktuellen Untertitel zurück
    this.currentSubtitleIndex = -1;
    
    // Leere den Text sofort
    if (this.textElement) {
      this.textElement.textContent = '';
    }
    
    // Prüfen, ob der Container sichtbar sein sollte
    if (this.container) {
      // Stelle sicher, dass der Container sichtbar ist, aber der Text leer
      this.container.style.display = 'flex';
      this.container.style.visibility = 'visible';
      this.container.style.opacity = '1';
      this.container.classList.remove('hidden');
    }
    
    // Mit einer kurzen Verzögerung Untertitel für 0-Zeitpunkt zeigen
    setTimeout(() => {
      if (this.enabled && this.textElement) {
        // Aktualisiere mit der 0-Zeit
        this.updateSubtitle(0);
        
        // Nochmal nach einer kurzen Verzögerung versuchen, für bessere Zuverlässigkeit
        setTimeout(() => {
          this.updateSubtitle(0);
        }, 200);
        
        console.log('Untertitel wurden zurückgesetzt und für Zeit 0 aktualisiert');
      }
    }, 50);
  }
}

// Initialize once DOM is fully loaded to ensure all elements exist
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded: Initializing SubtitlesManager...');
  
  // Es gibt einen Timing-Issue mit dem DOM, daher leichte Verzögerung
  setTimeout(() => {
    window.subtitlesManager = new SubtitlesManager();
    
    // Initial language setup based on localization
    const currentLang = window.localization ? window.localization.getCurrentLanguage() : 'de';
    console.log('Setting initial subtitles language from localization:', currentLang);
    window.subtitlesManager.setLanguage(currentLang);
  }, 200);
}); 