// Liste der verfügbaren Sprachen
const AVAILABLE_LANGUAGES = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
    { code: 'ru', name: 'Русский' },
    { code: 'uk', name: 'Українська' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'pl', name: 'Polski' },
    { code: 'da', name: 'Dansk' }
];

// Standard-Einstellungen
const DEFAULT_SETTINGS = {
    language: 'de',
    difficulty: 'easy',
    subtitles: true,
    music: true,
    sfx: true,
    debug: false
};

// Klasse für Spiel-Einstellungen
class Settings {
    constructor() {
        this.settings = this.loadSettings() || { ...DEFAULT_SETTINGS };
        this.eventListeners = {};
    }

    // Laden der Einstellungen aus dem LocalStorage
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('mandarinen_settings');
            return savedSettings ? JSON.parse(savedSettings) : null;
        } catch (error) {
            console.error('Fehler beim Laden der Einstellungen:', error);
            return null;
        }
    }

    // Speichern der Einstellungen im LocalStorage
    saveSettings() {
        try {
            localStorage.setItem('mandarinen_settings', JSON.stringify(this.settings));
            this.triggerEvent('settingsChanged', this.settings);
        } catch (error) {
            console.error('Fehler beim Speichern der Einstellungen:', error);
        }
    }

    // Abrufen eines Einstellungswerts
    getSetting(key) {
        return this.settings[key];
    }

    // Festlegen eines Einstellungswerts
    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        return value;
    }

    // Abrufen aller Einstellungen
    getAllSettings() {
        return { ...this.settings };
    }

    // Zurücksetzen auf Standardeinstellungen
    resetSettings() {
        this.settings = { ...DEFAULT_SETTINGS };
        this.saveSettings();
        return this.settings;
    }

    // Abonnieren von Einstellungsänderungen
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    // Abmelden von Einstellungsänderungen
    off(event, callback) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }

    // Auslösen eines Events
    triggerEvent(event, data) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event].forEach(callback => callback(data));
    }

    // Sprachwechsel
    changeLanguage(langCode) {
        if (AVAILABLE_LANGUAGES.some(lang => lang.code === langCode)) {
            return this.setSetting('language', langCode);
        }
        console.error(`Sprache nicht verfügbar: ${langCode}`);
        return this.settings.language;
    }

    // Abrufen der aktuellen Sprache
    getCurrentLanguage() {
        return this.settings.language;
    }

    // Abrufen der Liste aller verfügbaren Sprachen
    getAvailableLanguages() {
        return [...AVAILABLE_LANGUAGES];
    }

    // Schwierigkeitsgrad ändern
    changeDifficulty(difficulty) {
        const validDifficulties = ['easy', 'hard', 'loose', 'babel'];
        if (validDifficulties.includes(difficulty)) {
            return this.setSetting('difficulty', difficulty);
        }
        console.error(`Ungültiger Schwierigkeitsgrad: ${difficulty}`);
        return this.settings.difficulty;
    }

    // Untertitel ein-/ausschalten
    toggleSubtitles(enabled = null) {
        const newValue = enabled !== null ? enabled : !this.settings.subtitles;
        return this.setSetting('subtitles', newValue);
    }

    // Musik ein-/ausschalten
    toggleMusic(enabled = null) {
        const newValue = enabled !== null ? enabled : !this.settings.music;
        return this.setSetting('music', newValue);
    }

    // Soundeffekte ein-/ausschalten
    toggleSFX(enabled = null) {
        const newValue = enabled !== null ? enabled : !this.settings.sfx;
        return this.setSetting('sfx', newValue);
    }

    // Debug-Modus ein-/ausschalten
    toggleDebug(enabled = null) {
        const newValue = enabled !== null ? enabled : !this.settings.debug;
        return this.setSetting('debug', newValue);
    }
}

// Exportiere einen Singleton für die Einstellungen
const gameSettings = new Settings();
export default gameSettings;