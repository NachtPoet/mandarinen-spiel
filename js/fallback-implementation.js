// Minimale Implementierung, die nur die direkte DOM-Manipulation verwendet
// Fügen Sie diese Datei vor der ui.js ein, nachdem localization.js geladen wurde

(function() {
  // Globale Variablen
  let scriptToggleContainer = null;
  let scriptToggleInput = null;
  
  // 1. DOM-UTILITY-FUNKTIONEN
  
  // Prüft, ob ein Element existiert
  function elementExists(id) {
    return !!document.getElementById(id);
  }
  
  // Wartet auf ein bestimmtes Element im DOM
  function waitForElement(id, callback, maxAttempts = 20) {
    let attempts = 0;
    
    function checkElement() {
      attempts++;
      const element = document.getElementById(id);
      if (element) {
        callback(element);
        return;
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkElement, 200);
      } else {
        console.warn(`Element mit ID ${id} wurde nicht gefunden nach ${maxAttempts} Versuchen.`);
      }
    }
    
    checkElement();
  }
  
  // 2. HILFSFUNKTIONEN
  
  // Prüft, ob die aktuelle Sprache eine verbundene Schriftart verwendet
  function isConnectedScriptLanguage(lang) {
    return ['ar', 'fa', 'ur'].includes(lang);
  }
  
  // Holt die Präferenz aus dem localStorage oder gibt den Standard zurück
  function getConnectedScriptPreference() {
    const savedPref = localStorage.getItem('showConnectedScript');
    return savedPref === null ? true : savedPref === 'true';
  }
  
  // Speichert die Präferenz im localStorage
  function saveConnectedScriptPreference(value) {
    localStorage.setItem('showConnectedScript', value.toString());
  }
  
  // Konvertiert einen Text in einzelne getrennte Buchstaben
  function getIndividualLetters(word) {
    if (!word) return '';
    
    // Einfache Trennung für alle Sprachen (kann später erweitert werden)
    return word.split('').join(' ');
  }
  
  // 3. DOM-MANIPULATION
  
  // Erstellt den Toggle-Switch
  function createScriptToggle() {
    // Falls bereits vorhanden, nicht neu erstellen
    if (elementExists('scriptToggle')) return;
    
    // Container erstellen
    const container = document.createElement('div');
    container.className = 'script-toggle-container';
    container.id = 'scriptToggleContainer';
    
    // Label links
    const labelText = document.createElement('label');
    labelText.setAttribute('for', 'scriptToggle');
    labelText.textContent = window.localization ? window.localization.translate('scriptToggleLabel', { default: 'Schriftdarstellung:' }) : 'Schriftdarstellung:';
    
    // Toggle-Switch
    const toggleSwitch = document.createElement('label');
    toggleSwitch.className = 'toggle-switch';
    
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = 'scriptToggle';
    toggleInput.checked = getConnectedScriptPreference();
    
    const toggleSlider = document.createElement('span');
    toggleSlider.className = 'toggle-slider';
    
    toggleSwitch.appendChild(toggleInput);
    toggleSwitch.appendChild(toggleSlider);
    
    // Labels für verbunden/getrennt
    const separatedLabel = document.createElement('span');
    separatedLabel.className = 'toggle-label';
    separatedLabel.textContent = window.localization ? window.localization.translate('scriptToggleSeparated', { default: 'Einzeln' }) : 'Einzeln';
    
    const connectedLabel = document.createElement('span');
    connectedLabel.className = 'toggle-label';
    connectedLabel.textContent = window.localization ? window.localization.translate('scriptToggleConnected', { default: 'Verbunden' }) : 'Verbunden';
    
    // Zusammensetzen
    container.appendChild(labelText);
    container.appendChild(separatedLabel);
    container.appendChild(toggleSwitch);
    container.appendChild(connectedLabel);
    
    // Event-Listener für den Toggle
    toggleInput.addEventListener('change', function() {
      // Präferenz speichern
      saveConnectedScriptPreference(this.checked);
      console.log("Toggle geändert auf:", this.checked);
      
      // Direkte DOM-Manipulation ausführen (unabhängig von GameManager)
      updateWordDisplay(this.checked);
    });
    
    scriptToggleContainer = container;
    scriptToggleInput = toggleInput;
    
    return container;
  }
  
  // Aktualisiert die Wort-Anzeige im DOM
  function updateWordDisplay(showConnected) {
    console.log("Aktualisiere Wort-Anzeige, showConnected =", showConnected);
    
    // Wortliste finden
    const wordList = document.getElementById('wordList');
    if (!wordList) {
      console.warn("Wortliste nicht gefunden");
      return;
    }
    
    // Aktualisiere Container-Klasse
    if (showConnected) {
      wordList.classList.remove('separated-script-view');
    } else {
      wordList.classList.add('separated-script-view');
    }
    
    // Alle Wörter durchgehen
    const words = wordList.querySelectorAll('.word');
    console.log(`${words.length} Wörter gefunden zum Aktualisieren`);
    
    words.forEach(word => {
      // Original-Wort aus ID oder data-Attribut ermitteln
      let originalWord = word.dataset.originalWord;
      if (!originalWord && word.id && word.id.startsWith('word-')) {
        originalWord = word.id.substring(5); // "word-XXX" -> "XXX"
      }
      
      if (!originalWord) {
        console.warn("Konnte Original-Wort nicht ermitteln für:", word);
        return;
      }
      
      // Prüfen, ob das Wort bereits gefunden wurde
      const isFound = word.classList.contains('found');
      
      // Icons sichern
      const iconContainer = word.querySelector('.stem-icon-container');
      
      // Text aktualisieren
      if (isFound) {
        // Gefundene Wörter immer im Original anzeigen
        word.textContent = originalWord;
      } else if (showConnected) {
        // Verbundene Darstellung
        word.textContent = originalWord;
        word.classList.remove('separated-view');
      } else {
        // Getrennte Darstellung
        word.textContent = getIndividualLetters(originalWord);
        word.classList.add('separated-view');
      }
      
      // Icons wiederherstellen
      if (iconContainer) {
        word.appendChild(iconContainer);
      }
    });
    
    console.log("Wort-Anzeige erfolgreich aktualisiert");
  }
  
  // Zeigt oder versteckt den Toggle-Switch basierend auf der aktuellen Sprache
  function toggleScriptToggleVisibility() {
    const currentLang = window.localization ? window.localization.getCurrentLanguage() : 'de';
    const shouldShow = isConnectedScriptLanguage(currentLang);
    
    console.log(`Sprache: ${currentLang}, verbundene Schrift: ${shouldShow}`);
    
    // Toggle erstellen, falls noch nicht vorhanden
    if (shouldShow && !scriptToggleContainer) {
      scriptToggleContainer = createScriptToggle();
      
      // Zum DOM hinzufügen (vor der Wortliste)
      waitForElement('wordList', function(wordList) {
        if (wordList.parentNode && scriptToggleContainer) {
          wordList.parentNode.insertBefore(scriptToggleContainer, wordList);
          console.log("Toggle zum DOM hinzugefügt");
          
          // Stelle sicher, dass globale Funktionen für andere Teile des Spiels verfügbar sind
          window.connectedScript = {
            isConnectedScriptLanguage: isConnectedScriptLanguage,
            getIndividualLetters: getIndividualLetters
          };
          
          // Nach dem Hinzufügen direkt aktualisieren
          updateWordDisplay(getConnectedScriptPreference());
        }
      });
    } 
    // Toggle anzeigen/verstecken
    else if (scriptToggleContainer) {
      scriptToggleContainer.style.display = shouldShow ? 'flex' : 'none';
      console.log(shouldShow ? "Toggle wird angezeigt" : "Toggle wird versteckt");
    }
  }
  
  // 4. INITIALISIERUNG UND EVENT-LISTENER
  
  // Warte auf Sprachwechsel
  document.addEventListener('translations-loaded', function(event) {
    console.log("Sprache geladen, prüfe auf verbundene Schrift");
    toggleScriptToggleVisibility();
  });
  
  // Initialisierung
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM geladen, initialisiere Script-Toggle");
    setTimeout(toggleScriptToggleVisibility, 500);
  });
  
  // CSS-Regeln hinzufügen (falls nicht extern geladen)
  function addStyleRules() {
    const style = document.createElement('style');
    style.textContent = `
      /* Script-Toggle Container Styling */
      .script-toggle-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 15px auto;
        padding: 8px 15px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 20px;
        border: 1px solid rgba(255, 140, 0, 0.3);
        box-shadow: 0 0 10px rgba(255, 140, 0, 0.2);
        max-width: fit-content;
      }
      
      .script-toggle-container label {
        margin-right: 10px;
        font-size: 0.75rem;
      }
      
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 24px;
        margin: 0 8px;
      }
      
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        transition: .4s;
        border-radius: 24px;
        border: 1px solid rgba(255, 140, 0, 0.5);
      }
      
      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 2px;
        background-color: rgba(255, 140, 0, 0.8);
        transition: .4s;
        border-radius: 50%;
      }
      
      input:checked + .toggle-slider {
        background-color: rgba(99, 29, 118, 0.5);
      }
      
      input:checked + .toggle-slider:before {
        transform: translateX(24px);
      }
      
      .toggle-label {
        font-size: 0.7rem;
        margin: 0 5px;
      }
      
      /* RTL Anpassungen */
      html[dir="rtl"] .script-toggle-container label {
        margin-right: 0;
        margin-left: 10px;
      }
      
      html[dir="rtl"] .toggle-slider:before {
        left: auto;
        right: 3px;
      }
      
      html[dir="rtl"] input:checked + .toggle-slider:before {
        transform: translateX(-24px);
      }
      
      /* Styling für getrennte Wörter */
      .word.separated-view {
        letter-spacing: 2px;
      }
      
      /* Responsive Design */
      @media (max-width: 600px) {
        .script-toggle-container {
          padding: 5px 10px;
        }
        
        .script-toggle-container label,
        .toggle-label {
          font-size: 0.65rem;
        }
        
        .toggle-switch {
          width: 40px;
          height: 20px;
        }
        
        .toggle-slider:before {
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 2px;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
        
        html[dir="rtl"] input:checked + .toggle-slider:before {
          transform: translateX(-20px);
        }
        
        .word.separated-view {
          letter-spacing: 1px;
        }
      }
    `;
    document.head.appendChild(style);
    console.log("CSS-Regeln für Script-Toggle hinzugefügt");
  }
  
  // Füge CSS-Regeln hinzu, falls nötig (auskommentieren, wenn CSS extern geladen wird)
  // addStyleRules();
  
})(); // Selbstausführende Funktion - kein globaler Scope
