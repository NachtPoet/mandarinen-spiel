// Aktualisierte Version der localization.js mit RTL-Unterstützung

let currentTranslations = {};
let currentLanguage = 'de';
let localizationReady = false; // Flag to track readiness

const availableLanguages = {
  'de': 'Deutsch',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'el': 'Ελληνικά',
  'it': 'Italiano',
  'pt': 'Português',
  'da': 'Dansk',
  'fi': 'Suomi',
  'nl': 'Nederlands',
  'sv': 'Svenska',
  'pl': 'Polski',
  'tr': 'Türkçe',
  'ru': 'Русский',
  'uk': 'Українська',
  'zh': '中文',
  'ja': '日本語',
  'ko': '한국어',
  'hi': 'हिन्दी',
  'ar': 'العربية'
};

// Liste der RTL-Sprachen
const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

// Liste der Sprachen mit komplexen Zeichen, die eine größere Schriftart benötigen
const complexCharLanguages = ['zh', 'ja', 'ko', 'ar', 'hi']; // Added missing comma

async function loadTranslations(lang) {
  if (!availableLanguages[lang]) {
    console.error(`Language '${lang}' not available. Falling back to 'de'.`);
    lang = 'de';
  }
  try {
    const response = await fetch(`translations/${lang}.json?v=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    currentTranslations = await response.json();
    currentLanguage = lang;
    console.log(`Translations loaded for ${lang}`);
    localStorage.setItem('preferredLanguage', lang);

    // Update document direction based on language
    updateDocumentDirection(lang);

    // Update UI only if DOM is ready, otherwise wait for DOMContentLoaded listener
    if (document.readyState !== 'loading') {
      updateUI();
    }
    // Dispatch event for modules listening for language *changes*
    document.dispatchEvent(new CustomEvent('translations-loaded', { detail: { lang } }));
    return true; // Indicate success
  } catch (error) {
    console.error(`Could not load translations for ${lang}:`, error);
    if (lang !== 'de') {
      console.log("Falling back to German translations.");
      return await loadTranslations('de'); // Attempt fallback
    }
    return false; // Indicate failure
  }
}

// Neue Funktion: Aktualisiert die Dokumentenrichtung basierend auf der Sprache
function updateDocumentDirection(lang) {
  const isRtl = rtlLanguages.includes(lang);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('data-direction', isRtl ? 'rtl' : 'ltr');

  // RTL-Klasse zum Body hinzufügen/entfernen für CSS-Selektoren
  if (isRtl) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }

  console.log(`Document direction set to ${isRtl ? 'RTL' : 'LTR'} for language ${lang}`);

  // Klasse für komplexe Zeichensätze hinzufügen/entfernen
  const isComplex = complexCharLanguages.includes(lang);
  console.log(`[Font Debug] Language: ${lang}, Is complex? ${isComplex}`); // Log check result

  // Immer zuerst alle Klassen entfernen, um einen sauberen Zustand zu haben
  document.body.classList.remove('lang-complex-chars');

  // Dann die entsprechenden Klassen hinzufügen
  if (isComplex) {
    document.body.classList.add('lang-complex-chars');
    console.log("[Font Debug] Added 'lang-complex-chars' class to body.");

    // Spezielle Debug-Ausgabe für Arabisch und Hindi
    if (lang === 'ar') {
      console.log("[Font Debug] Arabic language detected - applying special styles.");
    } else if (lang === 'hi') {
      console.log("[Font Debug] Hindi language detected - applying special styles.");
    }
  } else {
    console.log("[Font Debug] No complex character language detected.");
  }

  // Aktualisiere alle Zellen und Wörter im Spiel, falls das Spiel bereits läuft
  setTimeout(function() {
    // Zellen aktualisieren
    const cells = document.querySelectorAll('.cell');
    if (cells.length > 0) {
      console.log(`[Font Debug] Updating ${cells.length} cells for language ${lang}`);
    }

    // Wörter aktualisieren
    const words = document.querySelectorAll('.word');
    if (words.length > 0) {
      console.log(`[Font Debug] Updating ${words.length} words for language ${lang}`);
    }
  }, 100);
}

function translate(key, params = {}) {
  if (!currentTranslations || !key) {
    return (typeof params === 'string') ? params : `[${key}]`;
  }

  // Versuche den Schlüssel in den geladenen Übersetzungen zu finden
  let translation = currentTranslations[key];

  if (translation === undefined) {
    console.log(`Translation key not found: ${key}`);
    // Wenn keine Übersetzung gefunden, gib den Fallback oder den Schlüssel zurück
    return (typeof params === 'string') ? params : `[${key}]`;
  }

  // Parameter ersetzen, wenn es sich um ein Objekt handelt
  try {
    if (typeof params === 'object' && params !== null) {
      for (const paramKey in params) {
        const regex = new RegExp(`\\{${paramKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\}`, 'g');
        translation = translation.replace(regex, params[paramKey]);
      }
    }
  } catch (e) {
    console.error(`Error replacing placeholder in key "${key}" with params:`, params, e);
    return `[ERR:${key}]`;
  }

  return translation;
}

function updateUI() {
  if (Object.keys(currentTranslations).length === 0) {
    console.warn("updateUI called but no translations loaded.");
    return;
  }
  console.log("Updating UI elements based on translations...");

  // HTML-Sprache aktualisieren
  document.documentElement.lang = currentLanguage;
  document.documentElement.setAttribute('data-current-lang', currentLanguage);

  // Achte auf RTL/LTR-Richtung
  updateDocumentDirection(currentLanguage);

  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    const translation = translate(key);
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder ? element.placeholder = translation : element.value = translation;
    } else if (element.tagName === 'OPTION') {
       element.textContent = translation;
    } else if (element.tagName === 'BUTTON' && element.querySelector('span[data-translate]')) {
       const innerSpan = element.querySelector(`span[data-translate="${key}"]`);
       if (innerSpan) innerSpan.innerHTML = translation;
       else element.innerHTML = translation; // Fallback for button without inner span
    } else {
      element.innerHTML = translation;
    }
  });
  document.querySelectorAll('[data-translate-aria]').forEach(element => {
    const key = element.getAttribute('data-translate-aria');
    element.setAttribute('aria-label', translate(key));
  });
  document.title = translate('pageTitle');
}

function getCurrentLanguage() {
  return currentLanguage;
}

function getAvailableLanguages() {
  return availableLanguages;
}

function isRtlLanguage(lang) {
  return rtlLanguages.includes(lang);
}

function populateLanguageSelector() {
  const selector = document.getElementById('languageSelect');
  if (!selector) {
    console.error("Language selector #languageSelect not found.");
    return;
  }
  selector.innerHTML = '';
  for (const langCode in availableLanguages) {
    const option = document.createElement('option');
    option.value = langCode;
    option.textContent = availableLanguages[langCode];
    if (langCode === currentLanguage) {
      option.selected = true;
    }
    selector.appendChild(option);
  }
  selector.removeEventListener('change', handleLanguageChange);
  selector.addEventListener('change', handleLanguageChange);
}

function handleLanguageChange(event) {
    const newLang = event.target.value;
    console.log(`Language selection changed to: ${newLang}`);
    loadTranslations(newLang); // This triggers 'translations-loaded' event
}

async function initLocalization() {
  const preferredLanguage = localStorage.getItem('preferredLanguage');
  const initialLang = availableLanguages[preferredLanguage] ? preferredLanguage : 'de';

  const onDomReady = async () => {
    console.log("DOM Ready. Loading initial translations...");
    const success = await loadTranslations(initialLang);
    if (success) {
        console.log("Initial translations loaded successfully.");
        populateLanguageSelector();
        // updateUI(); // Already called in loadTranslations
        console.log("Dispatching localization-ready event.");
        localizationReady = true;
        document.dispatchEvent(new CustomEvent('localization-ready'));
    } else {
        console.error("Failed to load initial translations. Localization not ready.");
        // Optionally display an error message to the user here
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDomReady);
  } else {
    await onDomReady(); // Execute directly if DOM is already ready
  }
}

window.localization = {
  loadTranslations,
  translate,
  updateUI,
  getCurrentLanguage,
  getAvailableLanguages,
  isRtlLanguage, // Neue Funktion zum Abfragen, ob eine Sprache RTL ist
  isReady: () => localizationReady, // Expose readiness flag
  getTranslationEntry: (key) => {
    return currentTranslations[key];
  }
};

initLocalization(); // Start initialization
