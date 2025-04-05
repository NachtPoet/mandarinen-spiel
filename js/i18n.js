// i18n.js - Internationalization module
class I18nManager {
    constructor() {
        this.currentLanguage = 'de'; // Default language
        this.translations = {};
        this.supportedLanguages = {
            'de': 'Deutsch',
            'en': 'English',
            'fr': 'Français',
            'es': 'Español',
            'it': 'Italiano',
            'ru': 'Русский',
            'uk': 'Українська',
            'nl': 'Nederlands',
            'tr': 'Türkçe',
            'pl': 'Polski',
            'da': 'Dansk'
        };
        this.languageChangeCallbacks = [];
        this.loadingPromises = {};
        
        // Lade deutsche Übersetzungen automatisch zum Start
        this.loadTranslations('de');
    }

    // ... Rest des vorhandenen Codes ...
    
    // Register a callback for language changes
    onLanguageChange(callback) {
        this.languageChangeCallbacks.push(callback);
    }

    // Set the current language and notify listeners
    setLanguage(langCode) {
        if (this.supportedLanguages[langCode]) {
            const previousLanguage = this.currentLanguage;
            this.currentLanguage = langCode;
            
            // Automatisch Übersetzungen laden, wenn sie noch nicht geladen sind
            if (!this.translations[langCode]) {
                console.log(`Übersetzungen für ${langCode} werden automatisch geladen`);
                this.loadTranslations(langCode);
            }
            
            // Only trigger callbacks if the language actually changed
            if (previousLanguage !== langCode) {
                this.languageChangeCallbacks.forEach(callback => {
                    try {
                        callback(langCode, previousLanguage);
                    } catch (e) {
                        console.error('Error in language change callback:', e);
                    }
                });
            }
            
            return true;
        }
        return false;
    }

    // Load translations for a specific language
    async loadTranslations(langCode) {
        if (!this.supportedLanguages[langCode]) {
            console.error(`Unsupported language: ${langCode}`);
            return false;
        }

        // If we're already loading this language, return the existing promise
        if (this.loadingPromises[langCode]) {
            return this.loadingPromises[langCode];
        }

        // Create a new loading promise for this language
        this.loadingPromises[langCode] = new Promise((resolve, reject) => {
            fetch(`translations/${langCode}.json?v=${Date.now()}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load translations for ${langCode}`);
                    }
                    return response.json();
                })
                .then(data => {
                    this.translations[langCode] = data;
                    console.log(`Loaded translations for ${langCode}`);
                    resolve(true);
                    // Remove from loading promises after successful load
                    delete this.loadingPromises[langCode];
                })
                .catch(error => {
                    console.error(`Error loading translations for ${langCode}:`, error);
                    reject(error);
                    // Remove from loading promises after failure
                    delete this.loadingPromises[langCode];
                });
        });

        return this.loadingPromises[langCode];
    }

    // Get a translated string by key
    translate(key, params = {}) {
        // Ensure translations for current language are loaded
        if (!this.translations[this.currentLanguage]) {
            console.warn(`Translations for ${this.currentLanguage} not loaded yet`);
            // Versuche, die Übersetzungen zu laden, wenn sie fehlen
            this.loadTranslations(this.currentLanguage);
            return key; // Return the key as fallback
        }

        // Get the translation string
        const translationString = this.translations[this.currentLanguage][key];
        
        if (translationString === undefined) {
            console.warn(`Missing translation for key "${key}" in language "${this.currentLanguage}"`);
            return key; // Return the key as fallback
        }

        // Replace parameters in the translation string if any
        let result = translationString;
        for (const paramKey in params) {
            result = result.replace(new RegExp(`{${paramKey}}`, 'g'), params[paramKey]);
        }

        return result;
    }

    // Get a list of all supported languages
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    // Get the native name of the current language
    getCurrentLanguageName() {
        return this.supportedLanguages[this.currentLanguage];
    }
}

// Create a singleton instance
const i18n = new I18nManager();

// Make the i18n instance global (added for compatibility with non-module usage)
window.i18n = i18n;

// Still export the singleton for ES6 modules if needed
// export default i18n; 