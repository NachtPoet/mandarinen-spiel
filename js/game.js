/**
 * Ändert die Sprache des Spiels
 * @param {string} langCode - Der Sprachcode (z.B. 'de', 'en')
 */
changeLanguage: function(langCode) {
  console.log('Changing language to:', langCode);
  
  // Sprache im i18n-Modul ändern
  if (i18n.setLanguage(langCode)) {
    console.log('Language changed to:', langCode);
    
    // UI-Elemente aktualisieren
    this.updateUITranslations();
    
    // Untertitel aktualisieren, falls vorhanden
    if (window.subtitlesManager) {
      window.subtitlesManager.setLanguage(langCode);
      
      // Aktuelle Untertitel neu laden, wenn die Musik läuft
      if (window.stemAudioManager && window.stemAudioManager.isPlaying()) {
        const currentTime = window.stemAudioManager.getCurrentTime();
        console.log('Updating subtitles at current time:', currentTime);
        window.subtitlesManager.updateSubtitle(currentTime);
      }
    }
    
    // Wortliste mit neuen Übersetzungen aktualisieren
    if (this.currentLevel && this.words) {
      this.renderWordList();
    }
    
    // Lokalen Speicher aktualisieren
    localStorage.setItem('mandarinen_language', langCode);
  } else {
    console.error('Failed to change language to:', langCode);
  }
},

/**
 * Aktualisiert die UI-Übersetzungen
 */
updateUITranslations: function() {
  // Titel und Beschreibungen aktualisieren
  document.getElementById('startScreenTitle').textContent = i18n.translate('startScreenTitle');
  document.getElementById('startScreenDescription').innerHTML = i18n.translate('startScreenDescription');
  
  // Schwierigkeitsgrad-Label
  document.getElementById('difficultyLabel').textContent = i18n.translate('difficultyLabel');
  
  // Buttons
  const continueButton = document.getElementById('continueButton');
  if (continueButton) continueButton.textContent = i18n.translate('continueButton');
  
  document.getElementById('startButton').textContent = i18n.translate('startButton');
  document.getElementById('startNewButton').textContent = i18n.translate('startNewButton');
  document.getElementById('helpButton').textContent = i18n.translate('helpButton');
  
  // Schwierigkeiten im Select
  const difficultySelect = document.getElementById('difficultySelect');
  if (difficultySelect) {
    Array.from(difficultySelect.options).forEach(option => {
      const key = 'difficulty' + option.value.charAt(0).toUpperCase() + option.value.slice(1);
      option.textContent = i18n.translate(key);
    });
  }
  
  // Hinweis-Button
  document.getElementById('hintButton').textContent = i18n.translate('hintButton');
  
  // Level-Anzeige aktualisieren
  const levelIndicator = document.getElementById('levelIndicator');
  if (levelIndicator && this.currentLevel) {
    levelIndicator.textContent = i18n.translate('levelIndicator', {
      current: this.currentLevel,
      total: this.maxLevel
    });
  }
  
  // Timer-Prefix aktualisieren
  this.timerPrefix = i18n.translate('timerPrefix');
  
  // Credits und andere Texte aktualisieren
  // Diese werden bei Bedarf geladen, daher keine vorauseilende Übersetzung
}, 