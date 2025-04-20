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

        // Zurücksetzen der gespeicherten Werte (falls sie noch existieren)
        this._originalDifficulty = null;
        this._originalSelectValue = null;
        this._wordListUpdated = false; // Reset flag
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
            // Speichere den ursprünglichen Schwierigkeitsgrad für die spätere Wiederherstellung
            if (!this._originalDifficulty && window.gameInstance.currentDifficulty !== 'hard') {
                this._originalDifficulty = window.gameInstance.currentDifficulty;
                console.log(`Babel-Modus: Speichere ursprünglichen Schwierigkeitsgrad '${this._originalDifficulty}'`);
            }

            // Prüfe den aktuellen Schwierigkeitsgrad
            if (window.gameInstance.currentDifficulty !== 'hard') {
                console.log("Babel-Modus: Korrigiere Schwierigkeitsgrad zu 'hard' (Schweres Gepäck)");

                // Setze den Schwierigkeitsgrad auf 'hard'
                window.gameInstance.currentDifficulty = 'hard';

                // Aktualisiere auch das Dropdown-Menü, falls vorhanden
                const difficultySelect = document.getElementById('difficultySelect');
                if (difficultySelect && difficultySelect.value !== 'babel') {
                    // Speichere den ursprünglichen Wert des Dropdowns
                    this._originalSelectValue = difficultySelect.value;
                    console.log(`Babel-Modus: Speichere ursprünglichen Dropdown-Wert '${this._originalSelectValue}'`);
                }

                // Die erlaubten Richtungen werden in initLevel basierend auf dem Schwierigkeitsgrad festgelegt
            }

            // Aktualisiere die Wortliste, um sicherzustellen, dass sie den richtigen Schwierigkeitsgrad verwendet
            if (window.gameInstance.domElements && window.gameInstance.domElements.wordList &&
                typeof window.renderWordList === 'function') {
                console.log("Aktualisiere Wortliste für Babel-Modus mit Schwierigkeitsgrad 'hard'");

                // Wichtig: Wir übergeben explizit 'hard' als Schwierigkeitsgrad, nicht window.gameInstance.currentDifficulty
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

                if (isBabelMode) {
                    // Setze den Schwierigkeitsgrad auf 'hard' NUR für den Babel-Modus
                    this.currentDifficulty = 'hard';
                    console.log("Babel-Modus: Setze Schwierigkeitsgrad auf 'hard' (Schweres Gepäck) für die Initialisierung");
                }
                // Für andere Modi wird der Schwierigkeitsgrad in der originalen startNewGame Methode gesetzt

                // Rufe die ursprüngliche Methode auf
                originalStartNewGame.call(this);

                // Aktiviere den Babel-Manager NACH dem Aufruf der originalen Methode, falls nötig
                if (isBabelMode) {
                    console.log("Aktiviere Babel-Modus");
                    window.babelManager.activate();
                    // Stelle sicher, dass der Schwierigkeitsgrad auf 'hard' bleibt, falls die originale Methode ihn geändert hat
                    this.currentDifficulty = 'hard';
                }
                // Kein else-Block mehr nötig, Deaktivierung erfolgt über showStartScreen
            };

            // Überschreibe die showStartScreen-Methode, um die ursprüngliche Sprache wiederherzustellen
            if (typeof window.gameInstance.showStartScreen === 'function') {
                const originalShowStartScreen = window.gameInstance.showStartScreen;
                window.gameInstance.showStartScreen = function() {
                    // Stelle die ursprüngliche Sprache wieder her, wenn der Babel-Modus aktiv ist
                    if (window.babelManager && window.babelManager.isActive) {
                        console.log("Babel-Modus: Rückkehr zum Startbildschirm, stelle ursprüngliche Einstellungen wieder her");

                        // Stelle die ursprüngliche Sprache wieder her
                        window.babelManager.restoreOriginalLanguage();

                        // Deaktiviere den Babel-Modus, um sicherzustellen, dass alle Einstellungen zurückgesetzt werden
                        window.babelManager.deactivate();

                        // Stelle sicher, dass der Schwierigkeitsgrad im Dropdown-Menü korrekt angezeigt wird
                        const difficultySelect = document.getElementById('difficultySelect');
                        if (difficultySelect) {
                            // Aktualisiere die visuelle Darstellung des Dropdowns
                            if (typeof updateDifficultyVisual === 'function') {
                                updateDifficultyVisual(difficultySelect);
                            }
                        }
                    }

                    // Rufe die ursprüngliche Methode auf
                    originalShowStartScreen.call(this);

                    // Zusätzliche Prüfung nach dem Aufruf der ursprünglichen Methode
                    if (window.gameInstance && window.gameInstance.currentDifficulty === 'loose' &&
                        window.gameInstance.domElements && window.gameInstance.domElements.difficultySelect &&
                        window.gameInstance.domElements.difficultySelect.value !== 'loose') {

                        console.log("Babel-Modus: Korrigiere Inkonsistenz im Schwierigkeitsgrad");

                        // Setze den Schwierigkeitsgrad auf den Wert des Dropdowns
                        window.gameInstance.currentDifficulty = window.gameInstance.domElements.difficultySelect.value;

                        // Aktualisiere die Wortliste, falls sie existiert
                        if (window.gameInstance.domElements.wordList && typeof window.renderWordList === 'function') {
                            console.log(`Aktualisiere Wortliste mit korrigiertem Schwierigkeitsgrad '${window.gameInstance.currentDifficulty}'`);
                            window.renderWordList(
                                window.gameInstance.targetWords || [],
                                window.gameInstance.foundWords || new Set(),
                                window.gameInstance.currentDifficulty,
                                window.gameInstance.domElements.wordList,
                                window.localization ? window.localization.translate : null,
                                window.gameInstance.getStemNameKey ? window.gameInstance.getStemNameKey.bind(window.gameInstance) : null
                            );
                        }
                    }
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
