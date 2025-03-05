setMusicForLevel(levelIndex) {
  let levelNum = (levelIndex + 1).toString().padStart(2, '0');
  
  // Versuche verschiedene Pfade, falls einer nicht funktioniert
  const possiblePaths = [
    `assets/audio/Mandarinen_Game_${levelNum}.mp3`,  // Relativer Pfad
    `./assets/audio/Mandarinen_Game_${levelNum}.mp3`, // Mit führendem ./
    `/assets/audio/Mandarinen_Game_${levelNum}.mp3`,  // Mit führendem /
    `https://mandarinenspiel.alexandrajanzen.de/assets/audio/Mandarinen_Game_${levelNum}.mp3` // Absoluter URL
  ];
  
  // Debug-Info
  console.log("Versuche diese Pfade:", possiblePaths);
  
  // Verwende den ersten Pfad und lade die Datei vor
  this.bgMusic.src = possiblePaths[0];
  this.bgMusic.load();
  
  if (this.musicEnabled) {
    const playPromise = this.bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.error("Musik konnte nicht gestartet werden:", err);
        
        // Versuche alternative Pfade bei Fehler
        let attemptCount = 1;
        const tryNextPath = () => {
          if (attemptCount < possiblePaths.length) {
            console.log(`Versuch ${attemptCount+1}: Versuche ${possiblePaths[attemptCount]}`);
            this.bgMusic.src = possiblePaths[attemptCount];
            this.bgMusic.load();
            attemptCount++;
            
            const retryPromise = this.bgMusic.play();
            retryPromise.catch(tryNextPath);
          } else {
            console.error("Alle Versuche gescheitert. Bitte prüfe die Audiodateien im Repository.");
          }
        };
        
        tryNextPath();
      });
    }
  }
}
