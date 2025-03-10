// Credits-Funktionalität
document.addEventListener('DOMContentLoaded', function() {
  // Stern zum Startbildschirm hinzufügen
  const startScreen = document.getElementById('startScreen');
  if (startScreen) {
    const star = document.createElement('div');
    star.className = 'mandarin-star';
    // Expliziten Text hinzufügen, damit der Stern sichtbar ist
    star.innerHTML = "★";
    star.style.position = "absolute";
    star.style.bottom = "15px";
    star.style.left = "15px";
    star.style.color = "#FF8C00";
    star.style.fontSize = "20px";
    star.style.cursor = "pointer";
    star.style.opacity = "0.7";
    star.style.zIndex = "50";
    star.style.textShadow = "0 0 5px rgba(255, 140, 0, 0.4)";
    // Animation hinzufügen
    star.style.animation = "pulse-star 3s infinite alternate ease-in-out";
    
    startScreen.appendChild(star);
    
    // Star-Click-Event
    star.addEventListener('click', function() {
      const creditsModal = document.getElementById('creditsModal');
      if (creditsModal) {
        creditsModal.classList.add('active');
      }
    });
  }
  
  // Modal-Close-Button
  const closeButton = document.getElementById('creditsModalClose');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      const creditsModal = document.getElementById('creditsModal');
      if (creditsModal) {
        creditsModal.classList.remove('active');
      }
    });
  }
  
  // Klick außerhalb des Modals schließt es
  const creditsModal = document.getElementById('creditsModal');
  if (creditsModal) {
    creditsModal.addEventListener('click', function(e) {
      if (e.target === creditsModal) {
        creditsModal.classList.remove('active');
      }
    });
  }
});

// Falls die Animation in CSS noch nicht definiert ist
if (!document.getElementById('pulse-star-animation')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'pulse-star-animation';
  styleEl.textContent = `
  @keyframes pulse-star {
    from { opacity: 0.4; transform: scale(0.9); }
    to { opacity: 0.8; transform: scale(1.1); }
  }`;
  document.head.appendChild(styleEl);
}