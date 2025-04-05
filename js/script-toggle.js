// 1. HTML-ELEMENT FÜR DEN TOGGLE HINZUFÜGEN
// Diese Funktion erstellt das Toggle-Element und fügt es ins DOM ein
function createScriptToggle() {
  // Prüfe, ob bereits vorhanden
  if (document.getElementById('scriptToggle')) return;

  // Container für den Toggle erstellen
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'script-toggle-container';
  toggleContainer.id = 'scriptToggleContainer';

  // Label links
  const labelText = document.createElement('label');
  labelText.setAttribute('for', 'scriptToggle');
  labelText.setAttribute('data-translate', 'scriptToggleLabel');
  labelText.textContent = localization.translate('scriptToggleLabel', { default: 'Schriftdarstellung:' });

  // Toggle-Switch
  const toggleSwitch = document.createElement('label');
  toggleSwitch.className = 'toggle-switch';

  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.id = 'scriptToggle';
  toggleInput.checked = getConnectedScriptPreference(); // Standard: Verbundene Schrift

  const toggleSlider = document.createElement('span');
  toggleSlider.className = 'toggle-slider';

  toggleSwitch.appendChild(toggleInput);
  toggleSwitch.appendChild(toggleSlider);

  // Labels für den Toggle (links: getrennt, rechts: verbunden)
  const separatedLabel = document.createElement('span');
  separatedLabel.className = 'toggle-label';
  separatedLabel.setAttribute('data-translate', 'scriptToggleSeparated');
  separatedLabel.textContent = localization.translate('scriptToggleSeparated', { default: 'Einzeln' });

  const connectedLabel = document.createElement('span');
  connectedLabel.className = 'toggle-label';
  connectedLabel.setAttribute('data-translate', 'scriptToggleConnected');
  connectedLabel.textContent = localization.translate('scriptToggleConnected', { default: 'Verbunden' });

  // Alles zusammenfügen
  toggleContainer.appendChild(labelText);
  toggleContainer.appendChild(separatedLabel);
  toggleContainer.appendChild(toggleSwitch);
  toggleContainer.appendChild(connectedLabel);

  // Event-Listener
  toggleInput.addEventListener('change', function() {
    // Speichere Präferenz
    localStorage.setItem('showConnectedScript', this.checked.toString());

    // Aktualisiere Wortliste - mit verbesserter Methode
    console.log("Script Toggle geändert, aktualisiere UI...");

    // Sicherstellen, dass wir auf alle möglichen Arten auf die Spielinstanz zugreifen
    const gameInst = findGameInstance();

    if (gameInst) {
      console.log("Spielinstanz gefunden, versuche UI-Aktualisierung");

      // OPTION 1: Direkte Aktualisierung über die Spielinstanz
      if (typeof gameInst.refreshLevelUI === 'function') {
        gameInst.refreshLevelUI();
        console.log("refreshLevelUI wurde aufgerufen");
      }
      // OPTION 2: Manuelle Aktualisierung der Wortliste über die renderWordList-Funktion
      else if (gameInst.domElements && gameInst.domElements.wordList && window.renderWordList) {
        console.log("Aktualisiere Wortliste manuell über renderWordList");
        window.renderWordList(
          gameInst.targetWords,
          gameInst.foundWords,
          gameInst.currentDifficulty,
          gameInst.domElements.wordList,
          window.localization ? window.localization.translate : null,
          gameInst.getStemNameKey ? gameInst.getStemNameKey.bind(gameInst) : null
        );
      }
    } else {
      console.warn("Spielinstanz nicht gefunden - versuche direkte DOM-Manipulation");
    }

    // OPTION 3: Event-basierte Aktualisierung als zusätzliche Absicherung (immer ausführen)
    document.dispatchEvent(new CustomEvent('script-display-changed', {
      detail: { showConnected: this.checked }
    }));
  });

  // Finde den Container, nach dem der Toggle eingefügt werden soll
  const wordListContainer = document.getElementById('wordList');
  if (wordListContainer && wordListContainer.parentNode) {
    // Immer nach der Wortliste einfügen (wenn der Toggle relevant ist)
    wordListContainer.parentNode.insertBefore(toggleContainer, wordListContainer.nextSibling);

    // Spezielle Anpassungen für RTL-Sprachen und mobile Ansicht
    if (document.documentElement.dir === 'rtl') {
      // Prüfe, ob es sich um ein mobiles Gerät handelt
      const isMobile = window.innerWidth <= 600;

      if (isMobile) {
        // Zusätzliche Klasse für mobile RTL-Ansicht
        toggleContainer.classList.add('rtl-mobile-toggle');

        // Stelle sicher, dass der Toggle-Container nicht mit anderen Elementen überlappt
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
          // Kein zusätzlicher Abstand am unteren Rand der Wortliste nötig
          // Der Toggle-Container soll direkt unter den Suchbegriffen sein
          wordListContainer.style.marginBottom = '10px';

          // Positioniere den Toggle-Container besser
          toggleContainer.style.position = 'relative';
          toggleContainer.style.zIndex = '40';
        }
      }
    }
  }

  return toggleContainer;
}

// Verbesserte Funktion zum Finden der Spielinstanz
function findGameInstance() {
  // Versuche alle möglichen Varianten
  if (window.gameInstance) {
    return window.gameInstance;
  } else if (typeof gameInstance !== 'undefined') {
    return gameInstance;
  } else if (window.gameManager) {
    return window.gameManager;
  }

  // Als Fallback: Suche nach einem DOM-Element, das auf die Spielinstanz hinweisen könnte
  const wordList = document.getElementById('wordList');
  if (wordList && wordList.parentNode) {
    // Suche nach wichtigen Spielelementen
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer && gameContainer.style.display === 'flex') {
      // Das Spiel ist aktiv, also müssen wir manuell die WordList aktualisieren
      console.log("Spiel scheint aktiv zu sein, versuche direkte DOM-Manipulation");
      return null; // Keine Spielinstanz gefunden, aber Spiel läuft
    }
  }

  return null; // Keine Spielinstanz gefunden
}

// 2. HILFSFUNKTIONEN

// Prüft, ob die aktuelle Sprache eine verbundene Schriftart verwendet
function isConnectedScriptLanguage(lang) {
  // Arabisch, Persisch, Urdu haben verbundene Schrift
  return ['ar', 'fa', 'ur'].includes(lang);
}

// Holt die Präferenz aus dem localStorage oder gibt den Standard zurück
function getConnectedScriptPreference() {
  const savedPref = localStorage.getItem('showConnectedScript');
  // Wenn keine Präferenz gespeichert ist, zeige standardmäßig verbundene Schrift
  return savedPref === null ? true : savedPref === 'true';
}

// Konvertiert einen Text in einzelne getrennte Buchstaben (sprachenspezifisch)
function getIndividualLetters(word) {
  if (!word) return '';

  const currentLang = localization.getCurrentLanguage();

  // Für Arabisch: Spezielle Behandlung, um verbundene Zeichen zu trennen
  if (currentLang === 'ar') {
    // Arabische Zeichen einzeln mit Leerzeichen dazwischen
    return word.split('').join(' ');
  }

  // Standard-Trennung für andere Sprachen
  return word.split('').join(' ');
}

// 3. INITIALISIERUNGSFUNKTION
function initScriptToggle() {
  // Prüfe, ob die aktuelle Sprache verbundene Schrift verwendet
  const currentLang = localization ? localization.getCurrentLanguage() : 'de';
  const usesConnectedScript = isConnectedScriptLanguage(currentLang);

  // Toggle nur für relevante Sprachen anzeigen
  const toggleContainer = document.getElementById('scriptToggleContainer');

  if (usesConnectedScript) {
    // Wenn die Sprache verbundene Schrift verwendet, erstelle den Toggle oder zeige ihn
    if (!toggleContainer) {
      createScriptToggle();
    } else {
      toggleContainer.style.display = 'flex';
    }

    // Globale Variable für andere Teile des Spiels bereitstellen
    window.connectedScript = {
      isConnectedScriptLanguage,
      getIndividualLetters
    };
  } else {
    // Verstecke den Toggle für andere Sprachen
    if (toggleContainer) {
      toggleContainer.style.display = 'none';
    }
  }
}

// Funktion zur direkten DOM-Aktualisierung der Wortliste
function updateWordListDisplay(showConnected) {
  console.log("Direktes Update der Wortliste, showConnected=", showConnected);

  // Wortliste-Element finden
  const wordListElement = document.getElementById('wordList');
  if (!wordListElement) {
    console.warn("Wortliste nicht gefunden für direktes Update");
    return;
  }

  // Prüfen, ob aktuelle Sprache verbundene Schrift verwendet
  const currentLang = window.localization ? window.localization.getCurrentLanguage() : 'de';
  const isConnectedScript = isConnectedScriptLanguage(currentLang);

  if (!isConnectedScript) {
    console.log("Aktuelle Sprache verwendet keine verbundene Schrift, kein Update nötig");
    return;
  }

  // Container-Klasse aktualisieren
  if (showConnected) {
    wordListElement.classList.remove('separated-script-view');
  } else {
    wordListElement.classList.add('separated-script-view');
  }

  // Alle Wort-Elemente durchgehen und aktualisieren
  const wordEls = wordListElement.querySelectorAll('.word');

  wordEls.forEach(wordEl => {
    // Original-Wort aus dem data-Attribut oder aus der ID holen
    let originalWord = wordEl.dataset.originalWord;
    if (!originalWord && wordEl.id && wordEl.id.startsWith('word-')) {
      originalWord = wordEl.id.substring(5); // "word-XXXX" -> "XXXX"
    }

    if (!originalWord) {
      console.warn("Konnte Original-Wort nicht ermitteln für:", wordEl);
      return;
    }

    // Prüfen, ob das Wort bereits gefunden wurde
    const isFound = wordEl.classList.contains('found');

    // Speichere das Icon-Element, falls vorhanden
    const iconElement = wordEl.querySelector('.stem-icon-container');

    // Text-Inhalt aktualisieren (Icon bleibt erhalten)
    if (isFound) {
      // Gefundene Wörter immer komplett anzeigen
      if (!wordEl.textContent.includes(originalWord)) {
        wordEl.textContent = originalWord;
        if (iconElement) wordEl.appendChild(iconElement);
      }
    } else if (showConnected) {
      // Verbundene Anzeige (originaler Text)
      if (wordEl.classList.contains('separated-view')) {
        wordEl.textContent = originalWord;
        if (iconElement) wordEl.appendChild(iconElement);
        wordEl.classList.remove('separated-view');
      }
    } else {
      // Getrennte Anzeige
      const separatedText = getIndividualLetters(originalWord);
      if (!wordEl.classList.contains('separated-view') || wordEl.textContent.trim() !== separatedText.trim()) {
        wordEl.textContent = separatedText;
        if (iconElement) wordEl.appendChild(iconElement);
        wordEl.classList.add('separated-view');
      }
    }
  });

  console.log("Wortliste erfolgreich direkt aktualisiert");
}

// 4. EVENT LISTENER FÜR SPRACHWECHSEL UND TOGGLE-ÄNDERUNGEN
// Event-Listener für Sprachwechsel, um den Toggle bei Bedarf anzuzeigen/auszublenden
document.addEventListener('translations-loaded', function(event) {
  // Wenn der Event Details hat und eine Sprache angegeben ist
  if (event.detail && event.detail.lang) {
    initScriptToggle();
  }
});

// Zusätzlicher Event-Listener für Änderungen am Script-Toggle
document.addEventListener('script-display-changed', function(event) {
  console.log("Script-Display-Changed Event empfangen:", event.detail);

  // Direktes Update der Wortliste - möglichst schnell und unabhängig
  updateWordListDisplay(event.detail.showConnected);
});

// Initialisierung beim Laden
document.addEventListener('DOMContentLoaded', function() {
  // Warte einen Moment, bis die Lokalisierung geladen ist
  setTimeout(initScriptToggle, 500);
});
