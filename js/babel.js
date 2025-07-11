/**
 * babel.js - Implementierung des Babel-Schwierigkeitsgrads
 * Bei diesem Schwierigkeitsgrad wird für jedes Level eine zufällige Sprache ausgewählt.
 */

class BabelManager {
    constructor() {
        // Speichert die ursprüngliche Sprache des Spielers
        this.originalLanguage = null;

        // Speichert die aktuelle Sprache für das Level
        this.currentLevelLanguage = null;

        // Flag, ob Babel-Modus aktiv ist
        this.isActive = false;

        // Liste der verfügbaren Sprachen für den Babel-Modus
        this.availableLanguages = [];

        // Speichert den ursprünglichen Schwierigkeitsgrad
        this._originalDifficulty = null;

        // Speichert den ursprünglichen Wert des Dropdown-Menüs
        this._originalSelectValue = null;

        // Flag, ob die Wortliste aktualisiert wurde
        this._wordListUpdated = false;

        // Initialisierung
        this.init();
    }

    /**
     * Initialisiert den Babel-Manager
     */
    init() {
        console.log("Babel-Manager initialisiert");

        // Event-Listener für Levelwechsel
        window.addEventListener('levelChanged', (event) => {
            if (this.isActive) {
                this.handleLevelChange(event.detail.levelIndex);
            }
        });

        // Event-Listener für Rückkehr zum Startbildschirm
        document.getElementById('homeButton')?.addEventListener('click', () => {
            if (this.isActive) {
                this.restoreOriginalLanguage();
            }
        });
    }

    /**
     * Aktiviert den Babel-Modus
     */
    activate() {
        if (this.isActive) return;

        console.log("Babel-Modus aktiviert");
        this.isActive = true;

        // Speichere die ursprüngliche Sprache
        this.saveOriginalLanguage();

        // Lade die verfügbaren Sprachen
        this.loadAvailableLanguages();

        // Wähle eine zufällige Sprache für das aktuelle Level
        const currentLevelIndex = window.gameInstance?.currentLevelIndex || 0;
        this.handleLevelChange(currentLevelIndex);
    }

    /**
     * Deaktiviert den Babel-Modus und stellt die ursprüngliche Sprache wieder her
     */
    deactivate() {
        if (!this.isActive) return;

        console.log("Babel-Modus deaktiviert");
        this.isActive = false;

        // Stelle die ursprüngliche Sprache wieder her
        this.restoreOriginalLanguage();

        // BUGFIX: Stelle den ursprünglichen Schwierigkeitsgrad wieder her
        if (window.gameInstance && this._originalDifficulty) {
            console.log("Stelle ursprünglichen Schwierigkeitsgrad wieder her:", this._originalDifficulty);
            window.gameInstance.currentDifficulty = this._originalDifficulty;
            
            // Wenn das Select-Element existiert, aktualisiere auch dessen Wert
            const difficultySelect = document.getElementById('difficultySelect');
            if (difficultySelect && this._originalSelectValue) {
                console.log("Stelle ursprünglichen Dropdown-Wert wieder her:", this._originalSelectValue);
                difficultySelect.value = this._originalSelectValue;
                
                // Optional: Visuelles Feedback über die Änderung
                if (typeof updateDifficultyVisual === 'function' && difficultySelect) {
                    updateDifficultyVisual(difficultySelect);
                }
            }
        }

        // Zurücksetzen der gespeicherten Werte
        this._originalDifficulty = null;
        this._originalSelectValue = null;
        this._wordListUpdated = false;
    }

    /**
     * Speichert die ursprüngliche Sprache des Spielers
     */
    saveOriginalLanguage() {
        if (window.localization && typeof window.localization.getCurrentLanguage === 'function') {
            this.originalLanguage = window.localization.getCurrentLanguage();
            console.log(`Ursprüngliche Sprache gespeichert: ${this.originalLanguage}`);
        } else {
            // Versuche, die Sprache aus dem localStorage zu lesen
            const savedLanguage = localStorage.getItem('preferredLanguage');
            if (savedLanguage) {
                this.originalLanguage = savedLanguage;
                console.log(`Ursprüngliche Sprache aus localStorage geladen: ${this.originalLanguage}`);
            } else {
                console.warn("Keine Sprachinformation verfügbar, verwende Deutsch als Fallback");
                this.originalLanguage = 'de'; // Fallback auf Deutsch
            }
        }
    }

    /**
     * Stellt die ursprüngliche Sprache des Spielers wieder her
     */
    restoreOriginalLanguage() {
        if (!this.originalLanguage) return;

        console.log(`Stelle ursprüngliche Sprache wieder her: ${this.originalLanguage}`);

        if (window.localization && typeof window.localization.loadTranslations === 'function') {
            window.localization.loadTranslations(this.originalLanguage);
        } else {
            console.warn("Localization.loadTranslations nicht verfügbar, kann Sprache nicht wiederherstellen");
        }
    }

    /**
     * Lädt die Liste der verfügbaren Sprachen
     */
    loadAvailableLanguages() {
        if (window.localization && window.localization.availableLanguages) {
            // Verwende die in localization.js definierten Sprachen
            this.availableLanguages = Object.keys(window.localization.availableLanguages);
            console.log(`Verfügbare Sprachen für Babel-Modus: ${this.availableLanguages.join(', ')}`);
        } else if (window.settings && typeof window.settings.getAvailableLanguages === 'function') {
            // Fallback auf settings.js
            this.availableLanguages = window.settings.getAvailableLanguages().map(lang => lang.code);
            console.log(`Verfügbare Sprachen für Babel-Modus (Fallback): ${this.availableLanguages.join(', ')}`);
        } else {
            // Hardcoded Fallback
            this.availableLanguages = ['de', 'en', 'fr', 'es', 'it', 'nl', 'da', 'sv', 'pl', 'ru', 'uk', 'tr', 'ar', 'hi', 'zh', 'ja', 'ko', 'el'];
            console.warn("Keine Sprachliste verfügbar, verwende Hardcoded-Liste");
        }
    }

    /**
     * Wählt eine zufällige Sprache aus der Liste der verfügbaren Sprachen
     * @returns {string} Der Sprachcode der zufällig ausgewählten Sprache
     */
    getRandomLanguage() {
        if (this.availableLanguages.length === 0) {
            console.warn("Keine Sprachen verfügbar, verwende Deutsch");
            return 'de';
        }

        // Filtere die aktuelle Sprache aus, um Wiederholungen zu vermeiden
        const filteredLanguages = this.availableLanguages.filter(lang =>
            lang !== this.currentLevelLanguage && lang !== 'test');

        if (filteredLanguages.length === 0) {
            console.warn("Keine alternativen Sprachen verfügbar, verwende Deutsch");
            return 'de';
        }

        // Wähle eine zufällige Sprache aus
        const randomIndex = Math.floor(Math.random() * filteredLanguages.length);
        return filteredLanguages[randomIndex];
    }

    /**
     * Behandelt einen Levelwechsel im Babel-Modus
     * @param {number} levelIndex Der Index des neuen Levels
     */
    handleLevelChange(levelIndex) {
        if (!this.isActive) return;

        console.log(`Levelwechsel im Babel-Modus: Level ${levelIndex}`);

        // Stelle sicher, dass der Schwierigkeitsgrad auf "hard" (Schweres Gepäck) gesetzt ist
        if (window.gameInstance) {
            // Speichere den ursprünglichen Schwierigkeitsgrad, wenn noch nicht getan
            if (!this._originalDifficulty) {
                this._originalDifficulty = window.gameInstance.currentDifficulty;
                console.log(`Babel-Modus: Speichere ursprünglichen Schwierigkeitsgrad '${this._originalDifficulty}'`);
                
                // Auch den Dropdown-Wert speichern
                const difficultySelect = document.getElementById('difficultySelect');
                if (difficultySelect) {
                    this._originalSelectValue = difficultySelect.value;
                    console.log(`Babel-Modus: Speichere ursprünglichen Dropdown-Wert '${this._originalSelectValue}'`);
                }
            }

            // Prüfe den aktuellen Schwierigkeitsgrad
            if (window.gameInstance.currentDifficulty !== 'hard') {
                console.log("Babel-Modus: Korrigiere Schwierigkeitsgrad zu 'hard' (Schweres Gepäck)");

                // Setze den Schwierigkeitsgrad auf 'hard'
                window.gameInstance.currentDifficulty = 'hard';
            }

            // Aktualisiere die Wortliste, um sicherzustellen, dass sie den richtigen Schwierigkeitsgrad verwendet
            if (window.gameInstance.domElements && window.gameInstance.domElements.wordList &&
                typeof window.renderWordList === 'function') {
                console.log("Aktualisiere Wortliste für Babel-Modus mit Schwierigkeitsgrad 'hard'");

                // Wichtig: Wir übergeben explizit 'hard' als Schwierigkeitsgrad
                window.renderWordList(
                    window.gameInstance.targetWords,
                    window.gameInstance.foundWords,
                    'hard', // Explizit 'hard' verwenden
                    window.gameInstance.domElements.wordList,
                    window.localization ? window.localization.translate : null,
                    window.gameInstance.getStemNameKey ? window.gameInstance.getStemNameKey.bind(window.gameInstance) : null
                );

                // Setze ein Flag, um zu markieren, dass wir die Wortliste aktualisiert haben
                this._wordListUpdated = true;
            }
        }

        // Wähle eine zufällige Sprache für das neue Level
        const newLanguage = this.getRandomLanguage();
        this.currentLevelLanguage = newLanguage;

        console.log(`Neue Sprache für Level ${levelIndex}: ${newLanguage}`);

        // Setze die neue Sprache
        if (window.localization && typeof window.localization.loadTranslations === 'function') {
            window.localization.loadTranslations(newLanguage);
        } else {
            console.warn("Localization.loadTranslations nicht verfügbar, kann Sprache nicht ändern");
        }
    }
}

// Erstelle eine globale Instanz des Babel-Managers
window.babelManager = new BabelManager();

// Event-Listener für den Start des Spiels
document.addEventListener('DOMContentLoaded', () => {
    // Warte auf die Initialisierung des Spiels
    const checkGameInstance = setInterval(() => {
        if (window.gameInstance) {
            clearInterval(checkGameInstance);

            // Überschreibe die startNewGame-Methode, um den Babel-Modus zu aktivieren/deaktivieren
            const originalStartNewGame = window.gameInstance.startNewGame;
            window.gameInstance.startNewGame = function() {
                // Prüfe, ob der Babel-Modus aktiviert werden soll
                const difficultySelect = document.getElementById('difficultySelect');
                const isBabelMode = difficultySelect && difficultySelect.value === 'babel';

                // Rufe die ursprüngliche Methode ZUERST auf
                // Diese setzt this.currentDifficulty basierend auf dem Dropdown
                originalStartNewGame.call(this);

                // Prüfe NACHHER, ob Babel aktiviert oder deaktiviert werden muss
                if (isBabelMode) {
                    // Babel wurde ausgewählt
                    console.log("Aktiviere Babel-Modus");
                    // Stelle sicher, dass der interne Schwierigkeitsgrad 'hard' ist
                    this.currentDifficulty = 'hard';
                    // Aktiviere den Babel-Manager (dieser speichert die Originalsprache etc.)
                    window.babelManager.activate();
                } else {
                    // Ein anderer Modus wurde ausgewählt
                    // Prüfe, ob Babel vorher aktiv war, um es zu deaktivieren
                    if (window.babelManager.isActive) {
                        console.log("Deaktiviere Babel-Modus, da anderer Schwierigkeitsgrad gewählt wurde.");
                        // Stelle die Originalsprache wieder her
                        window.babelManager.restoreOriginalLanguage();
                        // Deaktiviere den Babel-Manager
                        window.babelManager.deactivate();
                    }
                    // Der Schwierigkeitsgrad wurde bereits korrekt von originalStartNewGame gesetzt
                }
            };

            // Überschreibe die showStartScreen-Methode (vereinfacht, keine Babel-Deaktivierung hier)
            if (typeof window.gameInstance.showStartScreen === 'function') {
                const originalShowStartScreen = window.gameInstance.showStartScreen;
                window.gameInstance.showStartScreen = function() {
                    // Rufe einfach die ursprüngliche Methode auf
                    // Die Aktivierung/Deaktivierung von Babel wird jetzt in startNewGame gehandhabt
                    originalShowStartScreen.call(this);
                };
            }

            // Überschreibe die initLevel-Methode, um sicherzustellen, dass der Schwierigkeitsgrad korrekt ist
            if (typeof window.gameInstance.initLevel === 'function') {
                const originalInitLevel = window.gameInstance.initLevel;
                window.gameInstance.initLevel = function() {
                    // Prüfe, ob der Babel-Modus aktiv ist
                    if (window.babelManager && window.babelManager.isActive) {
                        // Stelle sicher, dass der Schwierigkeitsgrad auf 'hard' gesetzt ist
                        if (this.currentDifficulty !== 'hard') {
                            console.log("Babel-Modus: Korrigiere Schwierigkeitsgrad zu 'hard' (Schweres Gepäck) in initLevel");
                            this.currentDifficulty = 'hard';
                            // Die erlaubten Richtungen werden in initLevel basierend auf dem Schwierigkeitsgrad festgelegt
                        }
                    }

                    // Rufe die ursprüngliche Methode auf
                    originalInitLevel.call(this);

                    // Nach dem Aufruf der ursprünglichen Methode: Aktualisiere die Wortliste, wenn der Babel-Modus aktiv ist
                    if (window.babelManager && window.babelManager.isActive) {
                        // Aktualisiere die Wortliste, um sicherzustellen, dass sie den richtigen Schwierigkeitsgrad verwendet
                        if (this.domElements && this.domElements.wordList && typeof window.renderWordList === 'function') {
                            console.log("Babel-Modus: Aktualisiere Wortliste nach initLevel mit Schwierigkeitsgrad 'hard'");

                            // Wichtig: Wir übergeben explizit 'hard' als Schwierigkeitsgrad
                            window.renderWordList(
                                this.targetWords,
                                this.foundWords,
                                'hard', // Explizit 'hard' verwenden
                                this.domElements.wordList,
                                window.localization ? window.localization.translate : null,
                                this.getStemNameKey ? this.getStemNameKey.bind(this) : null
                            );
                        }
                    }
                };
            }

            console.log("Babel-Modus-Integration abgeschlossen");
        }
    }, 100);
});